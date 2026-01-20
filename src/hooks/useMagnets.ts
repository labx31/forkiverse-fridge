import { useState, useEffect } from 'react';
import type { MagnetsData, MagnetItem, MagnetPosition } from '../types';

const MAGNETS_URL = `${import.meta.env.BASE_URL}data/magnets.json`;

/**
 * Featured magnet - always center, always largest
 *
 * Lab31 (https://lab31.xyz) is an experiment in AI-human collaboration.
 * In 2026, a fully autonomous multi-agent team runs the show - Loop, Spark,
 * Forge, Glitch, and Herald come up with ideas, write code, test, and ship.
 * The humans just give feedback and jump in when the agents get stuck.
 *
 * We're not sure what's going to happen. But we're excited and scared,
 * which must mean we're on the right track.
 *
 * xo Jenny and Allister
 */
const FEATURED_MAGNET: MagnetItem = {
  id: 'featured-lab31',
  url: 'https://lab31.xyz/',
  title: 'Lab31',
  author: '@alimox',
  created_at: new Date().toISOString(),
  status_url: 'https://theforkiverse.com/@alimox/115923976085710052',
  sticker_id: 'lightning',
  matched_keyword: 'fast',
  rank: -1,
};

// Deterministic pseudo-random based on string hash
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
    hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
    hash ^= hash >>> 16;
    return (hash >>> 0) / 4294967296;
  };
}

// Size tiers as percentage of door width (scales with screen size)
// tier 0 (newest) = largest, tier 4 (oldest) = smallest
const SIZE_TIERS_PERCENT = [
  { min: 0.12, max: 0.15 },   // Tier 0: newest, largest
  { min: 0.10, max: 0.12 },   // Tier 1
  { min: 0.08, max: 0.10 },   // Tier 2
  { min: 0.07, max: 0.08 },   // Tier 3
  { min: 0.06, max: 0.07 },   // Tier 4: oldest, smallest
];

function getSizeTier(rank: number, totalItems: number): number {
  const itemsPerTier = Math.ceil(totalItems / SIZE_TIERS_PERCENT.length);
  return Math.min(Math.floor(rank / itemsPerTier), SIZE_TIERS_PERCENT.length - 1);
}

function calculateMagnetSize(rank: number, totalItems: number, random: () => number, doorWidth: number): number {
  const tier = getSizeTier(rank, totalItems);
  const { min, max } = SIZE_TIERS_PERCENT[tier];
  const sizePercent = min + random() * (max - min);
  return doorWidth * sizePercent;
}

// Generate positions using a grid with jitter for organic feel
function generatePositions(
  items: MagnetItem[],
  doorWidth: number,
  doorHeight: number
): Map<string, MagnetPosition> {
  const positions = new Map<string, MagnetPosition>();

  // Featured magnet goes dead center, size scales with door
  const featuredSize = doorWidth * 0.18;
  positions.set(FEATURED_MAGNET.id, {
    x: doorWidth / 2,
    y: doorHeight / 2,
    rotation: -3, // Slight tilt for character
    size: featuredSize,
  });

  // Grid layout: calculate based on item count
  const cols = 8;
  const rows = Math.ceil(items.length / cols);

  // Padding from edges (percentage-based for responsiveness)
  const paddingX = doorWidth * 0.05;
  const paddingY = doorHeight * 0.04;

  const availableWidth = doorWidth - paddingX * 2;
  const availableHeight = doorHeight - paddingY * 2;

  const cellWidth = availableWidth / cols;
  const cellHeight = availableHeight / rows;

  // Shuffle items for random placement (but keep size based on rank)
  const shuffledItems = [...items].sort((a, b) => {
    const randA = seededRandom(a.id + 'shuffle')();
    const randB = seededRandom(b.id + 'shuffle')();
    return randA - randB;
  });

  shuffledItems.forEach((item, index) => {
    const random = seededRandom(item.id);

    const col = index % cols;
    const row = Math.floor(index / cols);

    // Base position (center of cell)
    let baseX = paddingX + col * cellWidth + cellWidth / 2;
    let baseY = paddingY + row * cellHeight + cellHeight / 2;

    // Push items away from center where featured magnet sits
    const centerX = doorWidth / 2;
    const centerY = doorHeight / 2;
    const distFromCenter = Math.sqrt(
      Math.pow(baseX - centerX, 2) + Math.pow(baseY - centerY, 2)
    );
    const minDistFromCenter = featuredSize * 0.6; // Keep items away from featured

    if (distFromCenter < minDistFromCenter) {
      // Push outward
      const angle = Math.atan2(baseY - centerY, baseX - centerX);
      baseX = centerX + Math.cos(angle) * minDistFromCenter;
      baseY = centerY + Math.sin(angle) * minDistFromCenter;
    }

    // Add jitter (up to 30% of cell size)
    const jitterX = (random() - 0.5) * cellWidth * 0.4;
    const jitterY = (random() - 0.5) * cellHeight * 0.4;

    // Rotation: -15 to +15 degrees
    const rotation = (random() - 0.5) * 30;

    // Size based on rank (newest = largest), scales with door width
    const size = calculateMagnetSize(item.rank, items.length, random, doorWidth);

    positions.set(item.id, {
      x: baseX + jitterX,
      y: baseY + jitterY,
      rotation,
      size,
    });
  });

  return positions;
}

export function useMagnets(doorWidth: number, doorHeight: number) {
  const [data, setData] = useState<MagnetsData | null>(null);
  const [positions, setPositions] = useState<Map<string, MagnetPosition>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMagnets() {
      try {
        const response = await fetch(MAGNETS_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch magnets: ${response.status}`);
        }
        const json: MagnetsData = await response.json();

        // Add featured magnet to the front of items
        const itemsWithFeatured = [FEATURED_MAGNET, ...json.items];
        setData({ ...json, items: itemsWithFeatured });

        // Generate positions (featured gets special treatment inside)
        const pos = generatePositions(json.items, doorWidth, doorHeight);
        setPositions(pos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (doorWidth > 0 && doorHeight > 0) {
      fetchMagnets();
    }
  }, [doorWidth, doorHeight]);

  return { data, positions, loading, error, featuredMagnet: FEATURED_MAGNET };
}
