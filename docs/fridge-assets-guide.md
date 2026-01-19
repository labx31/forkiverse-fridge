# Fridge 3D Model Assets

## Source Files

```
fridge/
├── 11647_Refrigerator_V1_L3.obj    # 3D model geometry
├── 11647_Refrigerator_V1_L3.mtl    # Material definitions
└── Refrigerator_Back.jpg           # Back panel texture (rusty metal)
```

## Model Materials

The 3D model includes these materials:

| Material | Description | Color/Texture |
|----------|-------------|---------------|
| `Refrigerator1` | Main body | Light gray, shiny |
| `Refrigerator_handle` | Door handles | Medium gray, metallic |
| `refrigerator_leg` | Legs | Tan/beige |
| `refrigerator_bacl` | Back panel | Uses `Refrigerator_Back.jpg` |
| `01___Default` | Internal parts | Medium gray |

## Required Renders for Frontend

Per the PRD, render these 2D layers from the 3D model:

### 1. `fridge-body.png`
- The fridge body WITHOUT the door
- Shows interior cavity
- Transparent background
- Suggested size: 800-1200px tall

### 2. `fridge-door.png`
- ONLY the door (with handles)
- Transparent background
- This gets CSS 3D transformed for opening animation
- Must align perfectly with body when positioned

### 3. `fridge-interior.png` (optional)
- Interior frame/shelves detail
- For depth effect when door opens

## Blender Workflow

1. Import OBJ: `File > Import > Wavefront (.obj)`
2. Ensure MTL loads textures
3. Set up orthographic camera (front view)
4. For body render:
   - Hide/delete door mesh
   - Render with transparent background (Film > Transparent)
5. For door render:
   - Hide body, show only door
   - Render with same camera settings
6. Export as PNG

## CSS 3D Door Animation (from PRD)

```css
.fridge-container {
  perspective: 1000px;
}

.fridge-door {
  transform-origin: left center;
  transition: transform 0.6s ease-out;
}

.fridge-door.open {
  transform: rotateY(-70deg);
}
```

## Smoke Effect

Need to create or source:
- Transparent WebM video of cold smoke/mist
- OR animated SVG particles
- Plays during door opening transition

## Output Location

Place rendered assets in:
```
public/assets/
├── fridge-body.png
├── fridge-door.png
├── fridge-interior.png (optional)
└── smoke.webm (or smoke.svg)
```
