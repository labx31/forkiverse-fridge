Perfect. Here’s the PRD updated with those decisions baked in, plus the concrete “how we tackle each step” plan.

---

# PRD: Forkiverse Fridge

## Origin of the idea

On Forkiverse, Casey Newton posted: “Idea: we create a virtual refrigerator to display all the fun vibe-coding projects you all are working on.” The goal is to build that into a real, lightweight web experience that surfaces community projects as sticker magnets on a fridge. Click a magnet, the fridge swings open, a cold puff of smoke drifts out, and the project is revealed inside (iframe when possible, otherwise open in a new tab).

## Core concept

A single-page site that:

* reads a live-ish feed from Forkiverse
* shows the **latest 80** vibe-coding project posts as magnets
* keeps a cohesive sticker style
* has a satisfying “fridge open” interaction

---

## Decisions locked

1. A post must include:

   * hashtag **`#vibecoding`**
   * at least **one URL**
2. The UI displays **exactly the latest 80** items (no sorting, no “top”).
3. No dynamic resizing based on age. We only need a layout that fits 80 cleanly.

---

# Backend PRD: Feed Builder (GitHub Actions)

## Goal

Generate a static JSON feed the frontend can read, updated on a schedule, with no database.

## Data source

* Forkiverse Mastodon instance: `https://theforkiverse.com`
* Hashtag timeline endpoint: `GET /api/v1/timelines/tag/vibecoding?limit=40&max_id=...` (paginate until we collect enough).

## Auth strategy

* Try unauthenticated first.
* If the instance requires auth, use `MASTODON_TOKEN` in GitHub Secrets and send `Authorization: Bearer ...`. Instances can disable unauthenticated “public preview.”

## Build algorithm

### Step 1: Fetch newest posts with #vibecoding

* Pull pages until you have at least 120 raw statuses (buffer for duplicates/bad posts), or you hit a scan cap.
* Always stop early once you can confidently output 80 valid items.

### Step 2: Validate each status (must-pass)

A status is eligible if:

* it contains at least one URL (prefer card url, else first link in content)
* it is not a boost/reblog (skip those)
* it is not a reply (optional skip, recommended for cleanliness)

### Step 3: Extract project URL + metadata

**Primary URL**

* Prefer `status.card.url` if present (best, avoids scraping)
* Else parse first http(s) link from `status.content` HTML

Metadata:

* `title`: `status.card.title` else fallback to a short snippet
* `author`: `status.account.acct`
* `created_at`: `status.created_at`
* `status_url`: `status.url`
* optional `preview_image`: `status.card.image`

### Step 4: Canonicalize + dedupe

* Canonicalize URL (strip tracking params, normalize hostname)
* Dedupe by canonical URL
* Keep newest occurrence

### Step 5: Take latest 80

After dedupe:

* sort by `created_at` descending
* take first 80

### Step 6: Sticker assignment (simple, deterministic)

Each item gets a `sticker_id` using your keyword map:

* Scan tokens from:

  * hashtags + stripped text
  * title/description from preview card
  * URL tokens
* Find all matched keywords
* If multiple matched keywords, choose one via seeded random (seed = canonical URL hash)
* Map keyword → sticker_id
* If none matched, choose fallback sticker via seeded random

Enforce: no duplicate keywords across sticker assignments at build time.

## Output contract

Write to: `public/data/magnets.json`

```json
{
  "generated_at": "2026-01-18T21:12:03Z",
  "source": {
    "instance": "https://theforkiverse.com",
    "required_hashtag": "vibecoding",
    "limit": 80
  },
  "items": [
    {
      "id": "sha1(canonical_url)",
      "url": "https://example.com/project",
      "title": "Project title",
      "author": "@user@theforkiverse.com",
      "created_at": "2026-01-17T18:02:11Z",
      "status_url": "https://theforkiverse.com/@user/123",
      "sticker_id": "wow",
      "matched_keyword": "music",
      "preview_image": "https://...optional..."
    }
  ]
}
```

## Workflow

GitHub Actions:

* schedule: every 30–60 minutes
* manual: workflow_dispatch
* commits updated JSON back into repo (permissions: `contents: write`).

---

# Frontend PRD: React Fridge Experience

## Goal

Render the fridge with 80 magnets, open the fridge on click, reveal the project.

## Inputs

* `GET /data/magnets.json`
* `public/stickers/<sticker_id>.svg` (your cohesive sticker pack)
* fridge art assets
* smoke overlay asset (optional but recommended)

## Layout and rendering approach (V1)

### Strong recommendation: 2D layered assets + CSS 3D door swing

* `fridge-body.png` (everything except door)
* `fridge-door.png` (door only, transparent background)
* optional `fridge-interior.png` (frame/cavity)

Door swing:

* `transform-origin: left center`
* `rotateY(0 → -70deg)` with perspective on container
* shadow + interior fade-in for depth

Smoke:

* transparent WebM overlay timed with opening (or animated SVG)

### Using your 3D model (best use)

Use it to:

* render perfect 2D layers (body/door) with consistent lighting
* optionally author keyframes in Blender and export rotation values to CSS keyframes

Do not use it as a real-time 3D scene in V1.

## Magnet field behavior (must be stable)

### 80 must fit without chaos

We’ll treat the door as a bounded canvas:

* define a safe rectangle within the door area
* place magnets in a grid-like “soft packing” system:

  * 8 columns x 10 rows (80 exact) as a baseline
  * add slight jitter + rotation so it feels organic
  * ensure no overlaps and consistent click targets

This avoids complex collision logic entirely and guarantees fit.

### Magnet visuals

Each magnet:

* sticker SVG image
* optional tiny label on hover (title)
* hit area at least 44px on mobile

### Click behavior

* click magnet triggers:

  1. magnet “pop” (80ms)
  2. door begins opening
  3. smoke plays
  4. interior viewer loads selected project

## Interior viewer (project reveal)

Inside the open fridge:

* Title
* “Open in new tab” (always visible)
* iframe region if embedding works

Iframe failure handling (mandatory):

* After 6–8 seconds, if not loaded, show:

  * “This site can’t be embedded”
  * prominent “Open project” button

Close behavior:

* a literal “handle” UI to close
* ESC closes on desktop

## State machine

* `BOOT` → load feed
* `CLOSED` → magnets visible
* `OPENING`
* `OPEN`
* `CLOSING`
* `ERROR`

## Mobile behavior

* Door swing can remain, but the interior viewer becomes more of a panel.
* If iframe too cramped, default to open-in-new-tab prompt with optional embed attempt.

## Accessibility

* respect `prefers-reduced-motion` (skip swing/smoke, use fade)
* keyboard: ESC closes

---

# Build plan: How we tackle it (step-by-step)

## Phase 0: Repo + hosting baseline

1. Create React app (Vite).
2. Configure GitHub Pages deploy.
3. Add placeholder `public/data/magnets.json` and 5 placeholder stickers.
4. Implement fridge layout with dummy magnets.

**Exit criteria:** site loads, fridge renders, magnets clickable (no door yet).

## Phase 1: Backend feed builder in GitHub Actions

1. Implement `scripts/build-magnets.mjs`:

   * fetch hashtag timeline pages
   * extract URL + metadata
   * canonicalize + dedupe
   * take latest 80
   * assign sticker_id
   * write `public/data/magnets.json`
2. Implement `scripts/validate-keywords.mjs` to fail build on duplicates.
3. Add workflow that runs on schedule and commits JSON.

**Exit criteria:** `magnets.json` updates automatically and contains real #vibecoding posts.

## Phase 2: Frontend reads real feed

1. Fetch `/data/magnets.json` in React.
2. Render exactly 80 magnets.
3. Implement stable placement:

   * grid slots (8x10)
   * deterministic jitter per item.id

**Exit criteria:** fridge shows latest 80 from Forkiverse reliably, no layout chaos.

## Phase 3: Door open + smoke + reveal

1. Export fridge body/door layers from your 3D model (Blender).
2. Implement CSS 3D door swing.
3. Add smoke overlay synced to opening.
4. Build interior viewer:

   * iframe + timeout fallback
   * open-in-new-tab always available
   * close controls

**Exit criteria:** click magnet → door opens → project reveals (or fallback).

## Phase 4: Polish and bulletproof

1. Reduced motion mode
2. Mobile layout adjustments
3. Error state for feed load failure
4. Performance check (lazy-load stickers if needed)
5. UI micro-interactions (shadows, depth cues, hover)

**Exit criteria:** shareable V1, feels great, does not break.

---
