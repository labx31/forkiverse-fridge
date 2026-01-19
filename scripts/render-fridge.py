#!/usr/bin/env python3
"""
Blender render script for Forkiverse Fridge assets
Run with: blender --background --python scripts/render-fridge.py

This script:
1. Loads the refrigerator OBJ model
2. Sets up lighting and camera
3. Renders the fridge body (with door hidden)
4. Renders the fridge door separately
5. Exports as PNGs with transparency
"""

import bpy
import os
import sys
import math

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
MODEL_PATH = os.path.join(PROJECT_DIR, 'fridge', '11647_Refrigerator_V1_L3.obj')
OUTPUT_DIR = os.path.join(PROJECT_DIR, 'public', 'assets')

# Output settings
RENDER_WIDTH = 840
RENDER_HEIGHT = 1400
RENDER_SAMPLES = 64  # Higher = better quality but slower


def clear_scene():
    """Remove default objects"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()


def import_model():
    """Import the OBJ file"""
    print(f"Importing model from: {MODEL_PATH}")

    # Import OBJ
    bpy.ops.wm.obj_import(filepath=MODEL_PATH)

    # Get imported objects
    imported = [obj for obj in bpy.context.selected_objects]
    print(f"Imported {len(imported)} objects:")
    for obj in imported:
        print(f"  - {obj.name} (type: {obj.type})")

    return imported


def setup_materials():
    """Setup materials for rendering"""
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            for slot in obj.material_slots:
                if slot.material:
                    mat = slot.material
                    mat.use_nodes = True

                    # Make materials slightly more metallic for fridge look
                    principled = mat.node_tree.nodes.get('Principled BSDF')
                    if principled:
                        principled.inputs['Metallic'].default_value = 0.8
                        principled.inputs['Roughness'].default_value = 0.3


def setup_camera():
    """Create and position camera"""
    # Create camera
    bpy.ops.object.camera_add(location=(0, -3, 0.5))
    camera = bpy.context.object
    camera.name = 'RenderCamera'

    # Point at fridge
    camera.rotation_euler = (math.radians(90), 0, 0)

    # Make it the active camera
    bpy.context.scene.camera = camera

    # Adjust to orthographic for cleaner 2D look
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = 2.5

    return camera


def setup_lighting():
    """Create studio-style lighting"""
    # Key light (main)
    bpy.ops.object.light_add(type='AREA', location=(2, -2, 3))
    key_light = bpy.context.object
    key_light.name = 'KeyLight'
    key_light.data.energy = 200
    key_light.data.size = 2
    key_light.rotation_euler = (math.radians(45), 0, math.radians(45))

    # Fill light (softer, opposite side)
    bpy.ops.object.light_add(type='AREA', location=(-2, -2, 2))
    fill_light = bpy.context.object
    fill_light.name = 'FillLight'
    fill_light.data.energy = 100
    fill_light.data.size = 3
    fill_light.rotation_euler = (math.radians(45), 0, math.radians(-45))

    # Rim light (behind, for edge definition)
    bpy.ops.object.light_add(type='AREA', location=(0, 2, 2))
    rim_light = bpy.context.object
    rim_light.name = 'RimLight'
    rim_light.data.energy = 80
    rim_light.data.size = 2


def setup_render_settings():
    """Configure render settings"""
    scene = bpy.context.scene

    # Use Cycles for better quality (or EEVEE for speed)
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = RENDER_SAMPLES
    scene.cycles.use_denoising = True

    # Resolution
    scene.render.resolution_x = RENDER_WIDTH
    scene.render.resolution_y = RENDER_HEIGHT
    scene.render.resolution_percentage = 100

    # Transparent background
    scene.render.film_transparent = True

    # Output format
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.compression = 15


def find_door_objects():
    """Try to identify door objects by name or position"""
    door_keywords = ['door', 'handle', 'hinge']
    door_objects = []
    body_objects = []

    for obj in bpy.data.objects:
        if obj.type != 'MESH':
            continue

        name_lower = obj.name.lower()
        is_door = any(kw in name_lower for kw in door_keywords)

        if is_door:
            door_objects.append(obj)
        else:
            body_objects.append(obj)

    print(f"\nClassified objects:")
    print(f"  Door objects: {[o.name for o in door_objects]}")
    print(f"  Body objects: {[o.name for o in body_objects]}")

    return door_objects, body_objects


def render_pass(filename, visible_objects):
    """Render with only specified objects visible"""
    # Hide all mesh objects
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.hide_render = True
            obj.hide_viewport = True

    # Show only the ones we want
    for obj in visible_objects:
        obj.hide_render = False
        obj.hide_viewport = False

    # Render
    output_path = os.path.join(OUTPUT_DIR, filename)
    bpy.context.scene.render.filepath = output_path
    bpy.ops.render.render(write_still=True)

    print(f"Rendered: {output_path}")


def render_full_fridge(filename):
    """Render the complete fridge"""
    # Show all mesh objects
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.hide_render = False
            obj.hide_viewport = False

    # Render
    output_path = os.path.join(OUTPUT_DIR, filename)
    bpy.context.scene.render.filepath = output_path
    bpy.ops.render.render(write_still=True)

    print(f"Rendered full fridge: {output_path}")


def main():
    print("=" * 50)
    print("Forkiverse Fridge - Blender Render Script")
    print("=" * 50)

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Clear and set up scene
    clear_scene()

    # Import model
    objects = import_model()

    if not objects:
        print("ERROR: No objects imported!")
        sys.exit(1)

    # Setup scene
    setup_materials()
    setup_lighting()
    setup_camera()
    setup_render_settings()

    # First, render the full fridge for reference
    print("\n--- Rendering full fridge ---")
    render_full_fridge('fridge-full.png')

    # Try to separate door from body
    door_objects, body_objects = find_door_objects()

    if door_objects:
        print("\n--- Rendering body (without door) ---")
        render_pass('fridge-body.png', body_objects)

        print("\n--- Rendering door only ---")
        render_pass('fridge-door.png', door_objects)
    else:
        print("\nWARNING: Could not identify door objects automatically.")
        print("The full fridge has been rendered. You may need to manually")
        print("separate the door in Blender's GUI.")

    print("\n" + "=" * 50)
    print("Render complete!")
    print(f"Output saved to: {OUTPUT_DIR}")
    print("=" * 50)


if __name__ == '__main__':
    main()
