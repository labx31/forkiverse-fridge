#!/bin/bash

# PNG Optimization Script
# Compresses PNGs while maintaining quality
# Requires: pngquant and optipng
#
# Install on macOS: brew install pngquant optipng
# Install on Ubuntu: sudo apt install pngquant optipng

STICKERS_DIR="public/stickers"
BACKUP_DIR="public/stickers-png-original"

echo "🎨 PNG Optimization Tool"
echo "========================"
echo ""

# Check if tools are installed
if ! command -v pngquant &> /dev/null; then
    echo "❌ pngquant not found. Install with: brew install pngquant"
    exit 1
fi

if ! command -v optipng &> /dev/null; then
    echo "❌ optipng not found. Install with: brew install optipng"
    exit 1
fi

# Backup originals
echo "📦 Creating backup..."
mkdir -p "$BACKUP_DIR"
cp "$STICKERS_DIR"/*.png "$BACKUP_DIR/"
echo "   ✓ Backed up to $BACKUP_DIR"
echo ""

# Get original size
ORIGINAL_SIZE=$(du -sh "$STICKERS_DIR" | cut -f1)
echo "📊 Original size: $ORIGINAL_SIZE"
echo ""

# Optimize with pngquant (lossy but high quality)
echo "🔧 Step 1: Compressing with pngquant..."
pngquant --quality=70-90 --speed 1 --force --ext .png "$STICKERS_DIR"/*.png
echo "   ✓ Compression complete"
echo ""

# Further optimize with optipng (lossless)
echo "🔧 Step 2: Optimizing with optipng..."
optipng -o2 -strip all "$STICKERS_DIR"/*.png
echo "   ✓ Optimization complete"
echo ""

# Show results
NEW_SIZE=$(du -sh "$STICKERS_DIR" | cut -f1)
echo "✨ Results:"
echo "   Original: $ORIGINAL_SIZE"
echo "   Optimized: $NEW_SIZE"
echo ""
echo "   Backups saved to: $BACKUP_DIR"
