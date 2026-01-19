# Sticker Extraction Guide

## Recommended Workflow

### Option 1: Manual Extraction (Best Quality)
1. Open each `.ai` or `.eps` file in Adobe Illustrator or Figma
2. Ungroup all elements
3. Select each sticker individually
4. Export as SVG with transparent background to `public/stickers/<sticker_id>.svg`
5. Use the sticker IDs from `scripts/sticker-manifest.json`

### Option 2: Automated with Ghostscript
Install Ghostscript first:
```bash
brew install ghostscript
```

Then you can convert EPS to PNG and crop.

---

## Stickers to Extract (by source file)

### Sheet 1: funny-set-lovely-stickers (9 stickers)
Source: `magnets/extracted/funny-set-lovely-stickers/155136-OUO7UD-909.ai`

| ID | Description | Approx Position |
|----|-------------|-----------------|
| cat-teal | Cute teal cat face | Top-left |
| watermelon | Watermelon slice | Top-center |
| ok-bubble | "OK" speech bubble | Top-right |
| heart-red | Classic red heart | Middle-left |
| lightning | Yellow lightning bolt | Middle-center |
| rainbow-clouds | Rainbow with clouds | Middle-right |
| popsicle | Ice cream popsicle | Bottom-left |
| strawberry | Red strawberry | Bottom-center |
| skull-cute | Cute purple skull | Bottom-right |

### Sheet 2: pack-modern-stickers (9 word stickers)
Source: `magnets/extracted/pack-modern-stickers/155046-OVIRRO-775.ai`

| ID | Description |
|----|-------------|
| just-cool-it | "Just Cool It" text |
| what-shakin | "What Shakin?" text |
| slightly-censored | "Slightly Censored" text |
| sorry-not-sorry | "Sorry Not Sorry" text |
| outstanding | "Outstanding" text |
| tbt | "TBT" text |
| get-lost | "Get Lost" text |
| what-question | "What?" text |
| take-a-hike | "Take a Hike" text |

### Sheet 3: sticker-icons-hand-drawn-doodle (12 stickers)
Source: `magnets/extracted/sticker-icons-hand-drawn-doodle/177.eps`

| ID | Description |
|----|-------------|
| spray-bottle | Spray bottle with heart |
| donut-purple | Purple frosted donut |
| sunflower | Yellow sunflower |
| tea-cup | Tea cup with lime |
| battery-low | 20% battery indicator |
| sunshine-text | "You Are My Sunshine" |
| worth-it | "You Are Worth It" cross |
| typewriter | Vintage typewriter |
| pig-cute | Cute pink pig |
| radioactive | Nuclear/radioactive symbol |

### Sheet 4: love-fashion-stickers-set (22 stickers)
Source: `magnets/extracted/love-fashion-stickers-set/1610.m00.i101.n012.S.c12.Love fashion signs, comic drawing vector patches.eps`

| ID | Description |
|----|-------------|
| flying-heart | Pink heart with wings |
| cherries | Red cherries |
| sleepy-heart | Heart with closed eyes |
| purple-cloud | Smiling purple cloud |
| speech-bubble-green | Green speech bubble |
| cat-purple | Purple grumpy cat |
| arrow-heart | Arrow with heart tip |
| heart-lollipop | Heart-shaped lollipop |
| donut-pink | Pink donut |
| eye-colorful | Colorful eye |
| ice-cream-cone | Ice cream cone |
| wing-purple | Purple wing |
| candy-wrapper | Wrapped candy |
| jellyfish | Blue jellyfish |
| music-notes | Purple music notes |
| mustache | Pink mustache |
| crown | Orange crown |
| diamond | Pink diamond |
| shooting-star | Rainbow shooting star |

### Sheet 5: set-cute-stickers (15 stickers)
Source: `magnets/extracted/set-cute-stickers/3_Feminist_Cute_Sticker_Hand_Drawn_Doodle_Vector.eps`

| ID | Description |
|----|-------------|
| eye-drip | Eye with colorful drips |
| cat-stretching | Teal cat stretching |
| apple-red | Red apple |
| feather | Purple feather |
| super-badge | "Super!" badge |
| girl-power | "Girl Power" text |
| leaf-branch | Blue leaf branch |
| flower-simple | Simple teal flower |
| camera | Purple/orange camera |
| planet-ring | Planet with ring |
| do-it | "Do It" text |

### Sheet 6: retro-stickers-with-ufo-mushroom-dinosaur (14 stickers)
Source: `magnets/extracted/retro-stickers-with-ufo-mushroom-dinosaur/2205_w026_n002_2003b_p1_2003.eps`

| ID | Description |
|----|-------------|
| melted-globe | Melted globe - "MELTED" |
| lost-love | "Lost Love" 90s style |
| cool-shades | Character with sunglasses |
| too-far-lost | "Too Far Lost" text |
| skull-retro | Colorful retro skull |
| good-night | "Good Night" with moon |
| hate-you | "Hate You" angry character |
| goodbye-phone | Phone saying "Goodbye" |
| shot-camera | Camera - "SHOT!" |
| game-over | "Game Over" device |
| taco-character | Happy taco/burger |
| lucky-rainbow | "Lucky" with rainbow |

### Sheet 7: hand-drawn-retro-sticker-set (6 stickers)
Source: `magnets/extracted/hand-drawn-retro-sticker-set (1)/8599957.ai`

| ID | Description |
|----|-------------|
| smile-blob | Purple blob "SMILE" |
| omg-rainbow | "OMG" rainbow letters |
| happiness-mushroom | Mushroom "HAPPINESS" |
| growing-stronger | Flower "Growing Stronger" |
| chill-out | "Chill Out" pink text |
| good-luck | "Good Luck" clover badge |

### Sheet 8: gradient-rave-party-sticker (12 holographic stickers)
Source: `magnets/extracted/gradient-rave-party-sticker/8763106.ai`

| ID | Description |
|----|-------------|
| money-globes | "MONEY" with globes |
| asterisk-holo | Holographic asterisk |
| alien-head | Holographic alien head |
| globe-holo | Holographic globe sphere |
| rings-loop | Interlocking rings |
| rave-on-badge | "RAVE ON" badge |
| smiley-rave | Smiley face "RAVE ON" |
| melted-smiley | Melted smiley face |
| say-yes | "SAY YES" vortex |
| star-burst | 4-point star burst |

---

## Export Settings

When exporting SVGs:
- **Size**: ~100-150px width (will be scaled by frontend)
- **Background**: Transparent
- **Format**: SVG (preferred) or PNG with transparency
- **Naming**: Use exact IDs from above (e.g., `cat-teal.svg`)

## Total Stickers: 88

Place exported files in: `public/stickers/`
