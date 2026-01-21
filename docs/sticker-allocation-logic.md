# Sticker Allocation Logic

## 🔍 How Projects Get Stickers

### Step 1: Gather All Text
The system analyzes EVERYTHING about a post:
```javascript
const textToSearch = [
  project._content,           // Post text
  project._card_title,        // Link preview title
  project._card_description,  // Link preview description
  project.url.toLowerCase(),  // The actual URL
  ...project._hashtags        // All hashtags
].join(' ');
```

**Example**: Post saying "Built an AI chatbot with React and deployed on Vercel #vibecoding"
- **Text to search**: "built an ai chatbot with react and deployed on vercel vibecoding https://my-bot.vercel.app"

---

### Step 2: Match Keywords (Priority Order)

## 🥇 Priority 1: Tech Keyword Overrides

**HIGHEST PRIORITY** - These win if they match:

```javascript
// Check tech keywords FIRST
for (const [keyword, stickerId] of tech_keyword_overrides) {
  if (regex.test(textToSearch)) {
    return { sticker_id: stickerId, matched_keyword: keyword };
  }
}
```

**Example continued**: 
- Finds `"ai"` in text → **Returns alien-head immediately** 👽
- Never checks `"react"` or `"vercel"` (even though they're also tech keywords)
- **First match wins!**

### Tech Override Keywords (159 total)

| Keyword | Sticker | Example Projects |
|---------|---------|------------------|
| `ai`, `chatgpt`, `claude` | alien-head 👽 | AI chatbots, ML tools |
| `react`, `nextjs` | lightning ⚡ | React apps, Next.js sites |
| `github` | cat-teal 🐱 | GitHub repos, code portfolios |
| `crypto`, `bitcoin` | money-globes 💰 | Crypto wallets, DeFi apps |
| `docker`, `kubernetes` | jellyfish 🪼 | Containerized apps |
| `api`, `graphql` | rings-loop 🔗 | API services, integrations |
| `3d`, `threejs` | globe-holo 🌐 | 3D visualizations, WebGL |
| `game`, `unity` | game-over 🎮 | Games, game engines |
| `map`, `gps` | get-lost 🗺️ | Map apps, location services |
| `blog`, `cms` | typewriter ⌨️ | Blogging platforms |

[See full list in keyword-to-sticker-mapping.md]

---

## 🥈 Priority 2: General Sticker Keywords

If NO tech override matches, check all 86 stickers' keyword lists:

```javascript
const matches = [];
for (const sticker of manifest.stickers) {
  for (const keyword of sticker.keywords) {
    if (regex.test(textToSearch)) {
      matches.push({ sticker_id: sticker.id, matched_keyword: keyword });
      break; // Only one match per sticker
    }
  }
}
```

**Example**: Post about "My recipe app for meal planning"
- No tech overrides match
- Finds `"recipe"` → taco-character has keywords: `["recipe", "food", "cooking"]`
- Finds `"meal"` → taco-character has keywords: `["meal", "dining"]`
- **One match per sticker, keeps going through all stickers**

---

## 🎲 What Happens with Multiple Matches?

### Scenario: Post matches MULTIPLE stickers

**Example**: "Built a recipe app with meal planning and grocery shopping"
- Matches `"recipe"` → taco-character 🌮
- Matches `"shopping"` → cart-icon (if we had one)
- Matches `"plan"` → calendar-icon (if we had one)

```javascript
if (matches.length > 0) {
  // Use SEEDED RANDOM based on URL hash
  const seed = parseInt(project.id, 16);  // URL hash as number
  const index = seed % matches.length;     // Pick deterministically
  return matches[index];
}
```

**Key Points**:
- ✅ **Deterministic** - Same URL always gets same sticker
- ✅ **Random-ish** - Different URLs with same keywords get variety
- ✅ **Fair distribution** - Each matching sticker has equal chance

**Example**:
- Project A (recipe + shopping) → URL hash = 12345 → `12345 % 2 = 1` → shopping sticker
- Project B (recipe + shopping) → URL hash = 67890 → `67890 % 2 = 0` → recipe sticker
- Project A again → Still gets shopping sticker (deterministic!)

---

## 🎰 What Happens with NO Matches?

### Scenario: No keywords match at all

**Example**: "Check out my portfolio website"
- No tech keywords match
- No general keywords match ("portfolio" and "website" aren't in any keyword list)

```javascript
// Fallback: pick from fallback stickers using seeded random
const seed = parseInt(project.id, 16);
const fallbackIndex = seed % fallback_stickers.length;
return {
  sticker_id: fallback_stickers[fallbackIndex],
  matched_keyword: null  // <-- Note: null for fallbacks
};
```

### The 8 Fallback Stickers

Positive, generic "good vibes" stickers:
1. **lightning** ⚡ - Fast, energy
2. **star-burst** ✨ - Sparkle, new
3. **rainbow-clouds** 🌈 - Colorful, hope
4. **do-it** 💪 - Action, motivation
5. **super-badge** 🏆 - Achievement
6. **omg-rainbow** 😲 - Excitement
7. **outstanding** 🌟 - Excellence
8. **smile-blob** 😊 - Happiness

**Distribution**: Projects with no matches get randomly (but deterministically) assigned one of these 8.

---

## 📊 Real Examples from Current Data

Looking at your `magnets.json`:

### ✅ Tech Override Matches
```json
{
  "url": "https://github.com/liamhowell4/budget-master",
  "title": "GitHub - liamhowell4/budget-master",
  "sticker_id": "cat-teal",
  "matched_keyword": "github"
}
```
**Logic**: Found `"github"` in URL → cat-teal (tech override)

---

```json
{
  "url": "https://mynegotiator.ai/",
  "title": "Type it In, Argue to Win",
  "sticker_id": "alien-head",
  "matched_keyword": "ai"
}
```
**Logic**: Found `"ai"` in URL → alien-head (tech override)

---

### ✅ General Keyword Match
```json
{
  "url": "http://listen.kevindolan.ie/",
  "title": "WTLT",
  "sticker_id": "music-notes",
  "matched_keyword": "music"
}
```
**Logic**: No tech overrides → Found `"music"` in content → music-notes

---

### ✅ Multiple Matches (Deterministic Random)
```json
{
  "url": "https://test.larderlore.com/",
  "title": "LarderLore", 
  "sticker_id": "heart-lollipop",
  "matched_keyword": "love"
}
```
**Logic**: 
- Found `"love"` in content (multiple stickers have "love" in keywords)
- URL hash: `e38e276c9f55` → converts to number
- Picks one of the matching stickers deterministically
- Chose heart-lollipop

---

### ✅ Fallback (No Matches)
```json
{
  "url": "https://example.com/my-portfolio",
  "title": "John's Portfolio",
  "sticker_id": "lightning",
  "matched_keyword": null  ← NULL indicates fallback
}
```
**Logic**: No keywords matched → Fallback → URL hash picks one of 8 fallback stickers

---

## 🎯 Key Takeaways

### Priority Order (Important!)
1. **Tech overrides** checked first (stops at first match)
2. **General keywords** checked if no tech match (collects ALL matches)
3. **Fallback** if nothing matches (random from 8 options)

### Multiple Match Resolution
- Collects all matching stickers
- Uses **URL hash % match_count** to pick one
- Same URL = same sticker (deterministic)
- Different URLs = variety (pseudo-random)

### No Match Resolution  
- Uses same **URL hash % 8** to pick fallback
- Ensures every project gets a sticker
- `matched_keyword: null` indicates fallback was used

---

## 🔧 Tuning the System

### To reduce "fallback" assignments:
- Add more keywords to existing stickers
- Add more tech overrides for common terms

### To fix "wrong" sticker assignments:
- Check if a tech override is stealing the match
- Reorder tech overrides (first match wins!)
- Add more specific keywords to preferred sticker

### To track effectiveness:
```bash
# See sticker distribution
node scripts/build-magnets.mjs

# Look for null matched_keywords (fallbacks)
cat public/data/magnets.json | grep '"matched_keyword": null'
```

