#!/usr/bin/env node

/**
 * Generates placeholder SVG stickers for development
 * Run: node scripts/generate-placeholders.mjs
 */

import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STICKERS_DIR = join(__dirname, '..', 'public', 'stickers');

// Load manifest
const manifest = JSON.parse(
  readFileSync(join(__dirname, 'sticker-manifest.json'), 'utf-8')
);

// Color palette for placeholders
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9',
  '#92A8D1', '#955251', '#B565A7', '#009B77', '#DD4124',
  '#D65076', '#45B8AC', '#EFC050', '#5B5EA6', '#9B2335',
];

// Shape generators
const shapes = {
  circle: (color, id) => `
    <circle cx="50" cy="50" r="40" fill="${color}" />
    <text x="50" y="55" text-anchor="middle" fill="white" font-size="8" font-family="sans-serif">${id.slice(0, 8)}</text>
  `,
  square: (color, id) => `
    <rect x="10" y="10" width="80" height="80" rx="8" fill="${color}" />
    <text x="50" y="55" text-anchor="middle" fill="white" font-size="8" font-family="sans-serif">${id.slice(0, 8)}</text>
  `,
  star: (color, id) => `
    <polygon points="50,10 61,40 95,40 68,60 79,90 50,72 21,90 32,60 5,40 39,40" fill="${color}" />
    <text x="50" y="55" text-anchor="middle" fill="white" font-size="7" font-family="sans-serif">${id.slice(0, 6)}</text>
  `,
  heart: (color, id) => `
    <path d="M50,85 C20,55 10,30 30,20 C45,12 50,25 50,25 C50,25 55,12 70,20 C90,30 80,55 50,85" fill="${color}" />
    <text x="50" y="50" text-anchor="middle" fill="white" font-size="7" font-family="sans-serif">${id.slice(0, 6)}</text>
  `,
  hexagon: (color, id) => `
    <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="${color}" />
    <text x="50" y="55" text-anchor="middle" fill="white" font-size="8" font-family="sans-serif">${id.slice(0, 8)}</text>
  `,
};

const shapeNames = Object.keys(shapes);

function generateSVG(stickerId, index) {
  const color = colors[index % colors.length];
  const shapeName = shapeNames[index % shapeNames.length];
  const shape = shapes[shapeName](color, stickerId);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.3"/>
    </filter>
  </defs>
  <g filter="url(#shadow)">
    ${shape}
  </g>
</svg>`;
}

// Create directory
mkdirSync(STICKERS_DIR, { recursive: true });

// Generate placeholder for each sticker
manifest.stickers.forEach((sticker, index) => {
  const svg = generateSVG(sticker.id, index);
  const filePath = join(STICKERS_DIR, `${sticker.id}.svg`);
  writeFileSync(filePath, svg);
  console.log(`Created: ${sticker.id}.svg`);
});

console.log(`\nGenerated ${manifest.stickers.length} placeholder stickers in public/stickers/`);
