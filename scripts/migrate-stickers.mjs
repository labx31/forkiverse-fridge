#!/usr/bin/env node

/**
 * Sticker Migration Script
 * 
 * Migrates PNG stickers from extracted folders to public/stickers/
 * Replaces old SVG stickers with new PNGs
 */

import { copyFileSync, rmSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// PNG source file mapping (extracted folder → sticker ID)
const PNG_SOURCE_MAP = {
  // Gradient Rave Party (10 stickers)
  'magnets/extracted/gradient-rave-party-sticker/stickers/holo-alien-circle.png': 'alien-head',
  'magnets/extracted/gradient-rave-party-sticker/stickers/holo-asterisk-alert.png': 'asterisk-holo',
  'magnets/extracted/gradient-rave-party-sticker/stickers/holo-melting-smiley.png': 'melted-smiley',
  'magnets/extracted/gradient-rave-party-sticker/stickers/holo-money-globes.png': 'money-globes',
  'magnets/extracted/gradient-rave-party-sticker/stickers/holo-rave-on-barbed.png': 'rave-on-badge',
  'magnets/extracted/gradient-rave-party-sticker/stickers/holo-rave-on-smiley.png': 'smiley-rave',
  'magnets/extracted/gradient-rave-party-sticker/stickers/holo-say-yes-spiral.png': 'say-yes',
  'magnets/extracted/gradient-rave-party-sticker/stickers/holo-sparkle-star.png': 'star-burst',
  'magnets/extracted/gradient-rave-party-sticker/stickers/holo-spiral-rings.png': 'rings-loop',
  'magnets/extracted/gradient-rave-party-sticker/stickers/holo-torus-wireframe.png': 'globe-holo',

  // Funny Set Lovely Stickers (9 stickers)
  'magnets/extracted/funny-set-lovely-stickers/stickers/teal-cat-face.png': 'cat-teal',
  'magnets/extracted/funny-set-lovely-stickers/stickers/watermelon-slice.png': 'watermelon',
  'magnets/extracted/funny-set-lovely-stickers/stickers/ok-speech-bubble.png': 'ok-bubble',
  'magnets/extracted/funny-set-lovely-stickers/stickers/pink-heart.png': 'heart-red',
  'magnets/extracted/funny-set-lovely-stickers/stickers/yellow-lightning-bolt.png': 'lightning',
  'magnets/extracted/funny-set-lovely-stickers/stickers/rainbow-with-clouds.png': 'rainbow-clouds',
  'magnets/extracted/funny-set-lovely-stickers/stickers/chocolate-popsicle.png': 'popsicle',
  'magnets/extracted/funny-set-lovely-stickers/stickers/pink-strawberry.png': 'strawberry',
  'magnets/extracted/funny-set-lovely-stickers/stickers/blue-skull.png': 'skull-cute',

  // Pack Modern Stickers (9 stickers)
  'magnets/extracted/pack-modern-stickers/stickers/just-cool-it.png': 'just-cool-it',
  'magnets/extracted/pack-modern-stickers/stickers/what-shakin.png': 'what-shakin',
  'magnets/extracted/pack-modern-stickers/stickers/slightly-censored.png': 'slightly-censored',
  'magnets/extracted/pack-modern-stickers/stickers/sorry-not-sorry.png': 'sorry-not-sorry',
  'magnets/extracted/pack-modern-stickers/stickers/outstanding.png': 'outstanding',
  'magnets/extracted/pack-modern-stickers/stickers/tbt-throwback.png': 'tbt',
  'magnets/extracted/pack-modern-stickers/stickers/get-lost.png': 'get-lost',
  'magnets/extracted/pack-modern-stickers/stickers/what-question.png': 'what-question',
  'magnets/extracted/pack-modern-stickers/stickers/take-a-hike.png': 'take-a-hike',

  // Sticker Icons Hand Drawn Doodle (10 stickers)
  'magnets/extracted/sticker-icons-hand-drawn-doodle/stickers/spray-bottle-heart.png': 'spray-bottle',
  'magnets/extracted/sticker-icons-hand-drawn-doodle/stickers/donut-with-sprinkles.png': 'donut-purple',
  'magnets/extracted/sticker-icons-hand-drawn-doodle/stickers/sunflower.png': 'sunflower',
  'magnets/extracted/sticker-icons-hand-drawn-doodle/stickers/matcha-tea-cup.png': 'tea-cup',
  'magnets/extracted/sticker-icons-hand-drawn-doodle/stickers/low-battery-20-percent.png': 'battery-low',
  'magnets/extracted/sticker-icons-hand-drawn-doodle/stickers/you-are-my-sunshine.png': 'sunshine-text',
  'magnets/extracted/sticker-icons-hand-drawn-doodle/stickers/you-are-worth-it.png': 'worth-it',
  'magnets/extracted/sticker-icons-hand-drawn-doodle/stickers/typewriter-please-stay.png': 'typewriter',
  'magnets/extracted/sticker-icons-hand-drawn-doodle/stickers/cute-pink-pig.png': 'pig-cute',
  'magnets/extracted/sticker-icons-hand-drawn-doodle/stickers/radiation-symbol.png': 'radioactive',

  // Love Fashion Stickers Set (18 stickers)
  'magnets/extracted/love-fashion-stickers-set/stickers/pink-heart-wings.png': 'flying-heart',
  'magnets/extracted/love-fashion-stickers-set/stickers/pink-cherries.png': 'cherries',
  'magnets/extracted/love-fashion-stickers-set/stickers/orange-heart-face.png': 'sleepy-heart',
  'magnets/extracted/love-fashion-stickers-set/stickers/purple-cloud-face.png': 'purple-cloud',
  'magnets/extracted/love-fashion-stickers-set/stickers/green-speech-bubble.png': 'speech-bubble-green',
  'magnets/extracted/love-fashion-stickers-set/stickers/blue-cat-face.png': 'cat-purple',
  'magnets/extracted/love-fashion-stickers-set/stickers/colorful-arrow.png': 'arrow-heart',
  'magnets/extracted/love-fashion-stickers-set/stickers/pink-heart-lollipop.png': 'heart-lollipop',
  'magnets/extracted/love-fashion-stickers-set/stickers/orange-donut-purple-icing.png': 'donut-pink',
  'magnets/extracted/love-fashion-stickers-set/stickers/colorful-eye.png': 'eye-colorful',
  'magnets/extracted/love-fashion-stickers-set/stickers/rainbow-ice-cream-cone.png': 'ice-cream-cone',
  'magnets/extracted/love-fashion-stickers-set/stickers/blue-wing.png': 'wing-purple',
  'magnets/extracted/love-fashion-stickers-set/stickers/purple-candy-wrapper.png': 'candy-wrapper',
  'magnets/extracted/love-fashion-stickers-set/stickers/blue-jellyfish.png': 'jellyfish',
  'magnets/extracted/love-fashion-stickers-set/stickers/purple-music-note.png': 'music-notes',
  'magnets/extracted/love-fashion-stickers-set/stickers/pink-mustache.png': 'mustache',
  'magnets/extracted/love-fashion-stickers-set/stickers/orange-crown.png': 'crown',
  'magnets/extracted/love-fashion-stickers-set/stickers/pink-diamond.png': 'diamond',
  'magnets/extracted/love-fashion-stickers-set/stickers/rainbow-shooting-star.png': 'shooting-star',

  // Set Cute Stickers (8 stickers)
  'magnets/extracted/set-cute-stickers/stickers/eye-with-lashes.png': 'eye-drip',
  'magnets/extracted/set-cute-stickers/stickers/cat-with-sunglasses.png': 'cat-stretching',
  'magnets/extracted/set-cute-stickers/stickers/red-apple.png': 'apple-red',
  'magnets/extracted/set-cute-stickers/stickers/purple-feather.png': 'feather',
  'magnets/extracted/set-cute-stickers/stickers/super-badge.png': 'super-badge',
  'magnets/extracted/set-cute-stickers/stickers/girl-power-text.png': 'girl-power',
  'magnets/extracted/set-cute-stickers/stickers/purple-camera.png': 'camera',
  'magnets/extracted/set-cute-stickers/stickers/planet-with-ring.png': 'planet-ring',

  // Need to add: leaf-branch, flower-simple, do-it (might be missing from PNGs)

  // Retro Stickers with UFO Mushroom Dinosaur (12 stickers)
  'magnets/extracted/retro-stickers-with-ufo-mushroom-dinosaur/stickers/melted-globe.png': 'melted-globe',
  'magnets/extracted/retro-stickers-with-ufo-mushroom-dinosaur/stickers/lost-love-broken-heart.png': 'lost-love',
  'magnets/extracted/retro-stickers-with-ufo-mushroom-dinosaur/stickers/nice-guy-smiley.png': 'cool-shades',
  'magnets/extracted/retro-stickers-with-ufo-mushroom-dinosaur/stickers/you-are-lost-astronaut.png': 'too-far-lost',
  'magnets/extracted/retro-stickers-with-ufo-mushroom-dinosaur/stickers/dont-hurt-me-peach.png': 'skull-retro',
  'magnets/extracted/retro-stickers-with-ufo-mushroom-dinosaur/stickers/good-night-skull.png': 'good-night',
  'magnets/extracted/retro-stickers-with-ufo-mushroom-dinosaur/stickers/big-girls-dont-cry.png': 'hate-you',
  'magnets/extracted/retro-stickers-with-ufo-mushroom-dinosaur/stickers/goodbye-flip-phone.png': 'goodbye-phone',
  'magnets/extracted/retro-stickers-with-ufo-mushroom-dinosaur/stickers/shot-camera.png': 'shot-camera',
  'magnets/extracted/retro-stickers-with-ufo-mushroom-dinosaur/stickers/game-over-gameboy.png': 'game-over',
  'magnets/extracted/retro-stickers-with-ufo-mushroom-dinosaur/stickers/messy-burger.png': 'taco-character',
  'magnets/extracted/retro-stickers-with-ufo-mushroom-dinosaur/stickers/lucky-rainbow-clover.png': 'lucky-rainbow',

  // Hand Drawn Retro Sticker Set (6 stickers)
  'magnets/extracted/hand-drawn-retro-sticker-set (1)/stickers/retro-smile-face.png': 'smile-blob',
  'magnets/extracted/hand-drawn-retro-sticker-set (1)/stickers/retro-omg-rainbow.png': 'omg-rainbow',
  'magnets/extracted/hand-drawn-retro-sticker-set (1)/stickers/retro-happiness-mushroom.png': 'happiness-mushroom',
  'magnets/extracted/hand-drawn-retro-sticker-set (1)/stickers/retro-growing-stronger-flower.png': 'growing-stronger',
  'magnets/extracted/hand-drawn-retro-sticker-set (1)/stickers/retro-chill-out-text.png': 'chill-out',
  'magnets/extracted/hand-drawn-retro-sticker-set (1)/stickers/retro-good-luck-clover.png': 'good-luck',
};

// Missing stickers we need to find or create placeholders for
const MISSING_STICKERS = [
  'leaf-branch',
  'flower-simple',
  'do-it'
];

async function migratePNGStickers() {
  console.log('🎨 Sticker Migration Tool\n');
  console.log('===========================\n');

  const publicStickersDir = join(projectRoot, 'public', 'stickers');
  const backupDir = join(projectRoot, 'public', 'stickers-svg-backup');

  // Step 1: Backup existing SVG stickers
  console.log('📦 Step 1: Backing up existing SVG stickers...');
  if (existsSync(publicStickersDir)) {
    const existingFiles = readdirSync(publicStickersDir).filter(f => f.endsWith('.svg'));
    if (existingFiles.length > 0) {
      mkdirSync(backupDir, { recursive: true });
      existingFiles.forEach(file => {
        const src = join(publicStickersDir, file);
        const dest = join(backupDir, file);
        copyFileSync(src, dest);
      });
      console.log(`   ✓ Backed up ${existingFiles.length} SVG files to public/stickers-svg-backup/\n`);
    }
  } else {
    mkdirSync(publicStickersDir, { recursive: true });
  }

  // Step 2: Clear out old stickers
  console.log('🗑️  Step 2: Removing old SVG stickers from public/stickers/...');
  const files = readdirSync(publicStickersDir);
  files.forEach(file => {
    if (file.endsWith('.svg')) {
      rmSync(join(publicStickersDir, file));
    }
  });
  console.log(`   ✓ Removed ${files.filter(f => f.endsWith('.svg')).length} SVG files\n`);

  // Step 3: Copy PNG stickers with new names
  console.log('📋 Step 3: Copying PNG stickers...');
  let copiedCount = 0;
  let missingCount = 0;
  const missingFiles = [];

  for (const [sourcePath, stickerId] of Object.entries(PNG_SOURCE_MAP)) {
    const fullSourcePath = join(projectRoot, sourcePath);
    const destPath = join(publicStickersDir, `${stickerId}.png`);

    if (existsSync(fullSourcePath)) {
      copyFileSync(fullSourcePath, destPath);
      copiedCount++;
    } else {
      console.log(`   ⚠️  Missing: ${sourcePath}`);
      missingFiles.push({ sourcePath, stickerId });
      missingCount++;
    }
  }

  console.log(`   ✓ Copied ${copiedCount} PNG stickers`);
  if (missingCount > 0) {
    console.log(`   ⚠️  Missing ${missingCount} source files\n`);
  } else {
    console.log('');
  }

  // Step 4: Generate mapping documentation
  console.log('📝 Step 4: Generating mapping documentation...');
  const mappingDoc = generateMappingDoc(PNG_SOURCE_MAP, missingFiles);
  const mappingPath = join(projectRoot, 'docs', 'sticker-mapping.md');
  writeFileSync(mappingPath, mappingDoc);
  console.log(`   ✓ Created docs/sticker-mapping.md\n`);

  // Summary
  console.log('✨ Migration Complete!\n');
  console.log('Summary:');
  console.log(`  • ${copiedCount} PNG stickers migrated`);
  console.log(`  • ${missingCount} stickers need attention`);
  console.log(`  • ${MISSING_STICKERS.length} stickers need sourcing: ${MISSING_STICKERS.join(', ')}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review docs/sticker-mapping.md for complete mapping`);
  console.log(`  2. Source or create missing stickers: ${MISSING_STICKERS.join(', ')}`);
  console.log(`  3. Update sticker-manifest.json to reference .png instead of .svg`);
}

function generateMappingDoc(sourceMap, missingFiles) {
  return `# Sticker Mapping Documentation

Generated: ${new Date().toISOString()}

## Overview

This document maps sticker IDs to their source PNG files and keywords.

## File Mapping

Total stickers: ${Object.keys(sourceMap).length}

### Successfully Migrated (${Object.keys(sourceMap).length - missingFiles.length})

| Sticker ID | Source File | New Location |
|------------|-------------|--------------|
${Object.entries(sourceMap)
  .filter(([src]) => !missingFiles.some(m => m.sourcePath === src))
  .sort((a, b) => a[1].localeCompare(b[1]))
  .map(([src, id]) => `| \`${id}\` | \`${src}\` | \`public/stickers/${id}.png\` |`)
  .join('\n')}

${missingFiles.length > 0 ? `
### Missing Source Files (${missingFiles.length})

| Sticker ID | Expected Source |
|------------|-----------------|
${missingFiles.map(({ stickerId, sourcePath }) => `| \`${stickerId}\` | \`${sourcePath}\` |`).join('\n')}
` : ''}

### Stickers Needing Source Files (${MISSING_STICKERS.length})

These stickers are referenced in the manifest but don't have PNG sources identified:

${MISSING_STICKERS.map(id => `- \`${id}\``).join('\n')}

## Keyword Mapping

See \`sticker-manifest-v2.json\` for complete keyword mappings.

### Tech Keyword Overrides (Priority Matching)

The following tech keywords have dedicated stickers and take priority:

- **AI/ML**: alien-head
- **Errors**: asterisk-holo
- **Glitch Art**: melted-smiley
- **Crypto/Finance**: money-globes
- **Music Production**: rave-on-badge
- **CI/CD**: say-yes
- **APIs**: rings-loop
- **3D Graphics**: globe-holo
- **Speed**: lightning
- **Cloud**: purple-cloud
- **Docker**: jellyfish
- **Python**: radioactive
- **Gaming**: game-over
- **Maps**: get-lost
- **And more...** (see tech_keyword_overrides in manifest)

## File Format

All stickers are now **PNG** format (migrated from SVG).

## Migration Notes

- Old SVG files backed up to \`public/stickers-svg-backup/\`
- PNG files provide better quality for holographic/gradient effects
- File names standardized to sticker IDs (e.g., \`alien-head.png\`)
`;
}

// Run migration
migratePNGStickers().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
