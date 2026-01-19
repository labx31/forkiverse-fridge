#!/usr/bin/env node

/**
 * Forkiverse Fridge - Feed Builder
 * Fetches #vibecoding posts from Forkiverse, processes them, and outputs magnets.json
 *
 * Run: node scripts/build-magnets.mjs
 */

import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration
const CONFIG = {
  instance: 'https://theforkiverse.com',
  hashtag: 'vibecoding',
  targetCount: 80,
  fetchBuffer: 120, // Fetch extra to account for filtering
  maxPages: 10,
  outputPath: join(__dirname, '..', 'public', 'data', 'magnets.json'),
  manifestPath: join(__dirname, 'sticker-manifest.json'),
};

// Load sticker manifest
const manifest = JSON.parse(readFileSync(CONFIG.manifestPath, 'utf-8'));

/**
 * Fetch a page of statuses from the hashtag timeline
 */
async function fetchHashtagPage(maxId = null) {
  const url = new URL(`${CONFIG.instance}/api/v1/timelines/tag/${CONFIG.hashtag}`);
  url.searchParams.set('limit', '40');
  if (maxId) {
    url.searchParams.set('max_id', maxId);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all statuses, paginating until we have enough
 */
async function fetchAllStatuses() {
  const statuses = [];
  let maxId = null;
  let page = 0;

  while (statuses.length < CONFIG.fetchBuffer && page < CONFIG.maxPages) {
    console.log(`Fetching page ${page + 1}...`);
    const pageStatuses = await fetchHashtagPage(maxId);

    if (pageStatuses.length === 0) break;

    statuses.push(...pageStatuses);
    maxId = pageStatuses[pageStatuses.length - 1].id;
    page++;

    // Small delay to be nice to the server
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`Fetched ${statuses.length} total statuses`);
  return statuses;
}

/**
 * Extract the first URL from HTML content
 */
function extractUrlFromContent(html) {
  const match = html.match(/href="(https?:\/\/[^"]+)"/);
  return match ? match[1] : null;
}

/**
 * Check if a status is valid for the fridge
 */
function isValidStatus(status) {
  // Skip reblogs
  if (status.reblog) return false;

  // Skip replies (optional, but keeps it cleaner)
  if (status.in_reply_to_id) return false;

  // Must have a URL (card or in content)
  const hasCard = status.card && status.card.url;
  const hasUrlInContent = extractUrlFromContent(status.content);

  return hasCard || hasUrlInContent;
}

/**
 * Canonicalize a URL for deduplication
 */
function canonicalizeUrl(url) {
  try {
    const parsed = new URL(url);

    // Remove common tracking params
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'source'];
    trackingParams.forEach(param => parsed.searchParams.delete(param));

    // Normalize: lowercase host, remove trailing slash
    parsed.hostname = parsed.hostname.toLowerCase();
    let normalized = parsed.toString();
    if (normalized.endsWith('/') && parsed.pathname === '/') {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  } catch {
    return url;
  }
}

/**
 * Generate a deterministic hash for a URL
 */
function hashUrl(url) {
  return createHash('sha1').update(url).digest('hex').slice(0, 12);
}

/**
 * Extract project data from a status
 */
function extractProject(status) {
  // Get URL - prefer card, fallback to content
  let url = status.card?.url || extractUrlFromContent(status.content);
  if (!url) return null;

  // Skip internal Forkiverse links
  if (url.includes('theforkiverse.com')) {
    const contentUrl = extractUrlFromContent(status.content);
    if (contentUrl && !contentUrl.includes('theforkiverse.com')) {
      url = contentUrl;
    } else {
      return null;
    }
  }

  const canonicalUrl = canonicalizeUrl(url);

  return {
    id: hashUrl(canonicalUrl),
    url: url,
    canonical_url: canonicalUrl,
    title: status.card?.title || extractTitleFromContent(status.content),
    author: `@${status.account.acct}`,
    author_avatar: status.account.avatar,
    created_at: status.created_at,
    status_url: status.url,
    preview_image: status.card?.image || status.media_attachments?.[0]?.preview_url || null,
    // Raw data for sticker matching
    _hashtags: status.tags?.map(t => t.name.toLowerCase()) || [],
    _content: stripHtml(status.content).toLowerCase(),
    _card_title: (status.card?.title || '').toLowerCase(),
    _card_description: (status.card?.description || '').toLowerCase(),
  };
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Extract a title from content if no card title
 */
function extractTitleFromContent(html) {
  const text = stripHtml(html);
  // Take first sentence or first 60 chars
  const firstSentence = text.split(/[.!?]/)[0];
  if (firstSentence.length <= 60) return firstSentence;
  return text.slice(0, 57) + '...';
}

/**
 * Assign a sticker to a project based on keyword matching
 */
function assignSticker(project) {
  const textToSearch = [
    project._content,
    project._card_title,
    project._card_description,
    project.url.toLowerCase(),
    ...project._hashtags,
  ].join(' ');

  // First check tech keyword overrides (higher priority)
  for (const [keyword, stickerId] of Object.entries(manifest.tech_keyword_overrides)) {
    // Match whole word or as part of compound (e.g., "reactjs" matches "react")
    const regex = new RegExp(`\\b${keyword}\\b|${keyword}(?=js|ts|.js|.ts)`, 'i');
    if (regex.test(textToSearch)) {
      return { sticker_id: stickerId, matched_keyword: keyword };
    }
  }

  // Then check sticker keywords
  const matches = [];
  for (const sticker of manifest.stickers) {
    for (const keyword of sticker.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(textToSearch)) {
        matches.push({ sticker_id: sticker.id, matched_keyword: keyword });
        break; // One match per sticker is enough
      }
    }
  }

  if (matches.length > 0) {
    // If multiple matches, use seeded random based on URL hash
    const seed = parseInt(project.id, 16);
    const index = seed % matches.length;
    return matches[index];
  }

  // Fallback: pick from fallback stickers using seeded random
  const seed = parseInt(project.id, 16);
  const fallbackIndex = seed % manifest.fallback_stickers.length;
  return {
    sticker_id: manifest.fallback_stickers[fallbackIndex],
    matched_keyword: null,
  };
}

/**
 * Main build function
 */
async function buildMagnets() {
  console.log('Forkiverse Fridge - Feed Builder');
  console.log('================================\n');

  // Fetch statuses
  const statuses = await fetchAllStatuses();

  // Filter valid statuses
  const validStatuses = statuses.filter(isValidStatus);
  console.log(`Valid statuses after filtering: ${validStatuses.length}`);

  // Extract project data
  const projects = validStatuses
    .map(extractProject)
    .filter(Boolean);
  console.log(`Projects extracted: ${projects.length}`);

  // Dedupe by canonical URL (keep newest)
  const seenUrls = new Map();
  for (const project of projects) {
    if (!seenUrls.has(project.canonical_url)) {
      seenUrls.set(project.canonical_url, project);
    }
  }
  const dedupedProjects = Array.from(seenUrls.values());
  console.log(`After deduplication: ${dedupedProjects.length}`);

  // Sort by created_at descending and take top N
  dedupedProjects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const finalProjects = dedupedProjects.slice(0, CONFIG.targetCount);
  console.log(`Final count: ${finalProjects.length}`);

  // Assign stickers
  const items = finalProjects.map((project, index) => {
    const { sticker_id, matched_keyword } = assignSticker(project);

    // Clean up internal fields
    const { _hashtags, _content, _card_title, _card_description, canonical_url, ...clean } = project;

    return {
      ...clean,
      sticker_id,
      matched_keyword,
      // Add rank for size tiers (0 = newest/largest, higher = older/smaller)
      rank: index,
    };
  });

  // Build output
  const output = {
    generated_at: new Date().toISOString(),
    source: {
      instance: CONFIG.instance,
      required_hashtag: CONFIG.hashtag,
      limit: CONFIG.targetCount,
    },
    items,
  };

  // Write output
  writeFileSync(CONFIG.outputPath, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${items.length} items to ${CONFIG.outputPath}`);

  // Stats
  const stickerCounts = {};
  items.forEach(item => {
    stickerCounts[item.sticker_id] = (stickerCounts[item.sticker_id] || 0) + 1;
  });
  console.log('\nSticker distribution (top 10):');
  Object.entries(stickerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([id, count]) => console.log(`  ${id}: ${count}`));
}

// Run
buildMagnets().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
