# Simplified Keyword Strategy v2

## Current State

- **86 stickers** with average **14.7 keywords** each (~1,268 total)
- **151 tech override keywords** that take priority (REMOVING THIS)
- Average ~14 keywords per sticker is **way too few**

## The Problem

Looking at actual Forkiverse posts:
```
"Howdy pet people! Did you ever wonder what if my pet was an RPG character?"
"Writing software while sleeping to predict NFL games"  
"A way to track and reward creators on the fediverse"
"Convert our family recipes and share them"
"Small Distractions for Hard Days"
```

These are **conversational**, **creative**, **playful** posts. They don't always contain obvious tech keywords.

## New Approach: Keyword Saturation

### Goals
1. **Remove tech_keyword_overrides** entirely - no special treatment
2. **50-100+ keywords per sticker** - way more coverage
3. **Broad semantic domains** - emotions, actions, themes, not just nouns
4. **Multiple matches are GOOD** - we pick randomly, giving variety

### Matching Logic (Simplified)

```javascript
function assignSticker(project) {
  const textToSearch = [
    project._content,
    project._card_title, 
    project._card_description,
    project.url.toLowerCase(),
    ...project._hashtags,
  ].join(' ').toLowerCase();

  // Collect ALL matching stickers
  const matches = [];
  for (const sticker of manifest.stickers) {
    for (const keyword of sticker.keywords) {
      if (textToSearch.includes(keyword)) {
        matches.push({ sticker_id: sticker.id, matched_keyword: keyword });
        break; // One match per sticker
      }
    }
  }

  if (matches.length > 0) {
    // Seeded random - same URL always gets same sticker
    const seed = parseInt(project.id, 16);
    return matches[seed % matches.length];
  }

  // Fallback: random from ALL stickers
  const seed = parseInt(project.id, 16);
  return {
    sticker_id: manifest.stickers[seed % manifest.stickers.length].id,
    matched_keyword: null,
  };
}
```

### Key Changes:
1. **No priority system** - all keywords equal
2. **Simple `includes()` match** - catches partial words too
3. **Fallback = any sticker** - not just 8 "positive" ones
4. **More matches = more variety** (deterministic random)

---

## Keyword Categories to Add

Each sticker should have keywords from ALL these categories:

### 1. Primary Theme (what it depicts)
- cat-teal: `cat, kitten, pet, feline, meow, purr, whiskers`

### 2. Emotions/Vibes
- cat-teal: `cute, adorable, cozy, cuddly, lazy, sleepy, relaxed`

### 3. Actions/Verbs  
- cat-teal: `nap, sleep, stretch, lounge, play, pounce`

### 4. Related Concepts
- cat-teal: `home, comfort, companion, furry, animal, internet`

### 5. Tech/Project Types (if applicable)
- cat-teal: `github, git, octocat, repository, clone, fork` (GitHub's logo!)

### 6. Common Words in Context
- cat-teal: `my, favorite, love, look, watching, adorable`

### 7. Hashtag-friendly Terms
- cat-teal: `caturday, catlife, cats, kitty, pets, animals`

---

## Example: Expanded cat-teal Keywords

**Current (11 keywords):**
```
cat, kitten, pet, meow, feline, kitty, purr, whiskers, animal, cute, kawaii
```

**New (60+ keywords):**
```
cat, cats, kitten, kittens, kitty, kitties, feline, pet, pets, meow, purr, 
whiskers, paws, tail, fur, furry, fluffy, animal, animals,

// Emotions
cute, adorable, cuddly, cozy, lazy, sleepy, chill, relaxed, happy, content,
comfort, warm, soft, gentle, sweet,

// Actions  
nap, sleep, stretch, lounge, play, watch, stare, hunt, pounce, cuddle,

// Related concepts
home, house, indoor, companion, friend, buddy, family, favorite,

// Tech (GitHub!)
github, git, octocat, repo, repository, fork, clone, commit, branch,
version, source, code, open-source, oss,

// Internet culture
internet, meme, viral, caturday, catlife, catmom, catdad, rescuecat,

// Descriptors
teal, blue, green, big eyes, cartoon, illustrated, icon
```

---

## Target: 50+ Keywords Per Sticker

| Sticker | Current | Target | Theme Expansion |
|---------|---------|--------|-----------------|
| cat-teal | 11 | 60+ | GitHub, internet cats, cozy vibes |
| lightning | 15 | 70+ | Speed, energy, fast apps, deployment |
| alien-head | 37 | 80+ | AI, bots, future, sci-fi, weird |
| heart-red | 12 | 60+ | Love, health, favorites, passion |
| music-notes | 18 | 70+ | Audio, podcasts, playlists, sound |
| ... | ... | ... | ... |

---

## Implementation Steps

1. **Remove `tech_keyword_overrides` from manifest**
2. **Expand each sticker to 50-80 keywords**
3. **Update build script to use simple matching**
4. **Run build and see distribution**

---

## Multiple Match Behavior

**Before**: First tech keyword wins, overriding everything
**After**: All matches collected, randomly pick one

Example: Post about "Building an AI music app with React"
- Matches: alien-head (ai), music-notes (music), lightning (app, react)
- URL hash picks one → Could be ANY of them
- Different URLs with same content → Different stickers (variety!)

This creates a **more playful, varied fridge** rather than:
- Every AI post = alien-head
- Every React post = lightning
- etc.

---

## No Match Behavior

**Before**: Pick from 8 "positive" fallbacks
**After**: Pick from ALL 86 stickers

Why? 
- With 50+ keywords per sticker, no-matches should be rare
- When they happen, ANY sticker is fine - adds randomness
- Avoid the fridge looking too "samey" with repeated fallbacks
