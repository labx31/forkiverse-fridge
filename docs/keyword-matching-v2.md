# Keyword Matching v2

## Overview

The sticker matching system uses **simple keyword matching** with no priority weighting.

## Stats

- **86 stickers**
- **7,279 total keywords** (avg 84.6 per sticker)
- **100% match rate** on current posts

## How It Works

```
┌─────────────────────────────────────────┐
│  1. Gather text from post               │
│     - Content, title, description       │
│     - URL, hashtags                     │
└─────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  2. Match ALL stickers                  │
│     - Short keywords (≤3 chars): word   │
│       boundaries required               │
│     - Long keywords: substring match    │
│     - One match per sticker max         │
└─────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  3. Pick winner                         │
│     - Multiple matches? Seeded random   │
│       (deterministic per URL)           │
│     - No matches? Fallback sticker      │
└─────────────────────────────────────────┘
```

## Key Differences from v1

| Feature | v1 | v2 |
|---------|----|----|
| Tech keyword overrides | Yes (first match wins) | **No** |
| Keywords per sticker | ~15 avg | **~85 avg** |
| Total keywords | ~1,400 | **~7,300** |
| Matching | Regex word boundaries | Substring (long) / Word boundary (short) |
| Match variety | Low (tech override dominates) | **High** (random from matches) |

## Matching Logic

```javascript
function assignSticker(project) {
  const text = getSearchableText(project).toLowerCase();
  
  const matches = [];
  for (const sticker of manifest.stickers) {
    for (const keyword of sticker.keywords) {
      const kw = keyword.toLowerCase();
      let matched = false;
      
      if (kw.length <= 3) {
        // Short keywords: require word boundaries
        // "it" won't match "with" or "twitter"
        matched = new RegExp(`\\b${kw}\\b`, 'i').test(text);
      } else {
        // Long keywords: simple substring
        matched = text.includes(kw);
      }
      
      if (matched) {
        matches.push({ sticker_id: sticker.id, keyword });
        break; // One match per sticker
      }
    }
  }

  if (matches.length > 0) {
    // Deterministic random: same URL = same sticker
    const seed = parseInt(project.id, 16);
    return matches[seed % matches.length];
  }

  // Fallback
  return { sticker_id: fallbackStickers[seed % fallbackStickers.length] };
}
```

## Why Multiple Matches = Variety

With ~85 keywords per sticker, most posts match **many** stickers.

Example: "Built an AI music app with vibe coding"
- Matches: alien-head (ai), music-notes (music), smiley-rave (vibe), lightning (app)...
- URL hash picks one deterministically
- Different URLs with same content → different stickers!

This creates a **more colorful, varied fridge** vs. v1 where "ai" always got alien-head.

## Fallback Stickers (12)

When nothing matches (rare with 7k+ keywords):

```json
[
  "lightning", "star-burst", "rainbow-clouds", "do-it",
  "super-badge", "omg-rainbow", "outstanding", "shooting-star",
  "smile-blob", "lucky-rainbow", "ok-bubble", "smiley-rave"
]
```

## Keyword Categories

Each sticker has keywords from:

1. **Primary theme** - what it depicts
2. **Emotions/vibes** - happy, chill, edgy, cute
3. **Actions** - build, share, create, explore
4. **Tech (if relevant)** - react, github, deploy, api
5. **Common words** - vibe, cool, work, project
6. **Hashtag-friendly** - vibecoding related terms

## Files

- `scripts/sticker-manifest-v3.json` - The expanded manifest
- `scripts/build-magnets.mjs` - Build script with new matching logic
- `public/data/magnets.json` - Generated output

## Testing

```bash
# Run the build
node scripts/build-magnets.mjs

# Check distribution
# Should see ~30-40 unique stickers for ~45 posts
```
