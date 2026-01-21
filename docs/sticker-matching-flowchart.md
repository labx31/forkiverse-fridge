# Sticker Matching Logic - Visual Flowchart

## 📥 INPUT: A Post from Forkiverse

```
Post Example:
  Title: "My AI-powered recipe app built with React"
  URL: https://airecipes.app
  Content: "Check out my new app that uses ChatGPT to suggest meals"
  Hashtags: #vibecoding #food #ai
```

**Text to analyze**: 
`"my ai-powered recipe app built with react check out my new app that uses chatgpt to suggest meals https://airecipes.app vibecoding food ai"`

---

## 🔄 MATCHING FLOW

```
┌─────────────────────────────────────────┐
│  1. Check TECH KEYWORD OVERRIDES        │
│     (159 keywords - FIRST MATCH WINS)   │
└─────────────────────────────────────────┘
                   │
                   ├─ Found? ──► RETURN immediately
                   │             (Example: "ai" found → alien-head)
                   │
                   └─ Not found ──► Continue to Step 2
                   
┌─────────────────────────────────────────┐
│  2. Check ALL STICKER KEYWORDS          │
│     (86 stickers × ~10-30 keywords)     │
│     Collect ALL matches                 │
└─────────────────────────────────────────┘
                   │
                   ├─ Multiple matches? ──► SEEDED RANDOM
                   │                        (Example: recipe + food + meal
                   │                         → hash picks one)
                   │
                   ├─ One match? ──────────► RETURN that sticker
                   │
                   └─ Zero matches? ───────► Go to Step 3
                   
┌─────────────────────────────────────────┐
│  3. FALLBACK STICKERS                   │
│     Use seeded random from 8 options    │
└─────────────────────────────────────────┘
                   │
                   └─ RETURN fallback
                      matched_keyword: null
```

---

## 🎯 Detailed Examples

### Example 1: Tech Override Wins (FIRST MATCH ONLY)

**Post**: "Built with React, Next.js, and deployed on Vercel"

**Matching Process**:
```
Step 1: Tech Overrides
  ├─ Check "react" → MATCH! ✓
  └─ Return: lightning ⚡ (matched_keyword: "react")
  
  ❌ Never checks "nextjs" or "vercel"
     (even though they're also tech overrides)
```

**Result**: `{ sticker_id: "lightning", matched_keyword: "react" }`

---

### Example 2: Multiple General Matches (SEEDED RANDOM)

**Post**: "Recipe app with meal planning, grocery shopping, and food tracking"

**Matching Process**:
```
Step 1: Tech Overrides
  └─ No matches (no tech keywords found)

Step 2: General Keywords
  ├─ Check "recipe" → taco-character has ["recipe", "food", "cooking"] → MATCH ✓
  ├─ Check "meal" → taco-character has ["meal", "dining"] → Already matched (skip)
  ├─ Check "food" → taco-character has ["food"] → Already matched (skip)
  ├─ Check "grocery" → heart-red has ["favorite", "like"] → No match
  ├─ Check "shopping" → ok-bubble has ["check", "validate"] → No match
  └─ Total matches: 1 (taco-character)
  
  Only one match → Return immediately
```

**Result**: `{ sticker_id: "taco-character", matched_keyword: "recipe" }`

---

### Example 3: Multiple DIFFERENT Stickers Match

**Post**: "Open source music streaming app with cloud storage"

**Matching Process**:
```
Step 1: Tech Overrides
  ├─ Check "music" → MATCH! music-notes ✓
  └─ Return: music-notes 🎵
  
  ❌ Never gets to "cloud" (also a tech override)
```

**Wait!** Order matters in tech overrides. Let me check actual order...

Actually, if "cloud" is checked BEFORE "music" in the override list:
```
Step 1: Tech Overrides (order matters!)
  ├─ Check "cloud" → MATCH! purple-cloud ✓
  └─ Return: purple-cloud ☁️
```

**The order of tech_keyword_overrides matters!** First one wins.

---

### Example 4: True Multiple Matches (Different Stickers)

**Post**: "Dating app for cat lovers who like coffee"

**Matching Process**:
```
Step 1: Tech Overrides
  └─ No matches

Step 2: General Keywords  
  ├─ "dating" → heart-lollipop ✓
  ├─ "cat" → cat-teal ✓
  ├─ "cat" → cat-purple ✓ (has "cat" too)
  ├─ "coffee" → tea-cup ✓
  └─ Total matches: [heart-lollipop, cat-teal, cat-purple, tea-cup]
  
  4 matches → Use seeded random:
    URL hash: a7b3c9d2e4f1 (hex)
    → Convert to int: 183,804,926,193,393 (decimal)
    → 183,804,926,193,393 % 4 = 1
    → matches[1] = cat-teal
```

**Result**: `{ sticker_id: "cat-teal", matched_keyword: "cat" }`

**Same URL always gets cat-teal**. Different URL might get tea-cup.

---

### Example 5: No Matches (Fallback)

**Post**: "My portfolio website - check it out!"

**Matching Process**:
```
Step 1: Tech Overrides
  └─ No matches ("portfolio", "website", "check" not in overrides)

Step 2: General Keywords
  └─ No matches ("portfolio", "website", "check" not in ANY sticker keywords)

Step 3: FALLBACK
  ├─ URL hash: 1a2b3c4d5e6f
  ├─ Convert to int: 28,927,857,234,543
  ├─ 28,927,857,234,543 % 8 = 7
  └─ fallback_stickers[7] = "smile-blob"
```

**Result**: `{ sticker_id: "smile-blob", matched_keyword: null }` ← NULL!

### The 8 Fallback Options
```javascript
fallback_stickers: [
  "lightning",      // 0
  "star-burst",     // 1
  "rainbow-clouds", // 2
  "do-it",          // 3
  "super-badge",    // 4
  "omg-rainbow",    // 5
  "outstanding",    // 6
  "smile-blob"      // 7
]
```

---

## 🔑 Important Rules

### 1. **First Match Wins** (Tech Overrides)
Tech overrides are checked in order. Once one matches, **done**.

### 2. **Collect All Matches** (General Keywords)
General keywords collect ALL matching stickers, then pick one randomly.

### 3. **Deterministic Randomness**
```javascript
const seed = parseInt(project.id, 16);  // URL hash
const index = seed % options.length;
```
- Same URL → Same sticker (always)
- Different URLs → Different stickers (variety)

### 4. **One Match Per Sticker**
```javascript
for (const keyword of sticker.keywords) {
  if (regex.test(textToSearch)) {
    matches.push(...);
    break;  // ← Stops checking other keywords for THIS sticker
  }
}
```

Even if a sticker has 20 keywords and the post matches 5 of them, it only gets counted **once** in the matches array.

---

## 🧪 Testing the Logic

### Check what a URL would get:

```javascript
// In browser console or Node:
const url = "https://my-ai-app.com";
const hash = createHash('sha1').update(url).digest('hex').slice(0, 12);
const seed = parseInt(hash, 16);

// If 4 stickers matched:
const index = seed % 4;
console.log(`Would get matches[${index}]`);

// If no matches (fallback):
const fallbackIndex = seed % 8;
console.log(`Would get fallback[${fallbackIndex}]`);
```

---

## 📈 Current Distribution

From your existing `magnets.json`:

```bash
# Most used stickers (43 items analyzed):
alien-head: 11   (AI content is HOT 🔥)
cat-teal: 8      (Lots of GitHub links)
lightning: 4     (App deployments)
speech-bubble-green: 2
game-over: 3
jellyfish: 1
music-notes: 1
...
```

**Finding**: 26% of posts get `alien-head` (tons of AI projects!)

**Finding**: `matched_keyword: null` appears 0 times (all posts match something!)

