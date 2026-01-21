import { useState, useMemo } from 'react';
import type { MagnetItem, MagnetPosition } from '../types';
import { getMagnetStyle, type MagnetShape } from '../config/icons';
import './Magnet.css';

interface MagnetProps {
  item: MagnetItem;
  position: MagnetPosition;
  onClick: () => void;
  disabled: boolean;
  isPreviewed: boolean;
  onPreview: () => void;
}

// SVG clip paths for different shapes (empty string = use CSS border-radius)
const SHAPE_PATHS: Record<MagnetShape, string> = {
  circle: '',
  'rounded-square': '',
  hexagon: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  blob: '',
  diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  oval: '',
  pill: '',
  shield: 'polygon(50% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%, 0% 0%)',
  arrow: 'polygon(50% 0%, 100% 40%, 70% 40%, 70% 100%, 30% 100%, 30% 40%, 0% 40%)',
};

export function Magnet({ item, position, onClick, disabled, isPreviewed, onPreview }: MagnetProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device on first touch
  const handleTouchStart = () => {
    setIsTouchDevice(true);
  };

  // Get deterministic style based on item ID
  const { color, shape, iconRotation } = useMemo(
    () => getMagnetStyle(item.id),
    [item.id]
  );

  // Get sticker image path from sticker_id
  const stickerPath = useMemo(() => {
    if (!item.sticker_id) return null;
    return `/forkiverse-fridge/stickers/${item.sticker_id}.png`;
  }, [item.sticker_id]);

  const clipPath = SHAPE_PATHS[shape];
  const useClipPath = clipPath !== '';

  const isFeatured = item.id === 'featured-lab31';

  const handleClick = () => {
    // On touch devices: first tap previews, second tap opens
    if (isTouchDevice && !isPreviewed) {
      onPreview();
      return;
    }
    onClick();
  };

  const showTooltip = isHovered || isPreviewed;

  return (
    <button
      className={`magnet ${isHovered ? 'hovered' : ''} ${isPressed ? 'pressed' : ''} ${isFeatured ? 'featured' : ''} ${isPreviewed ? 'previewed' : ''}`}
      style={{
        '--magnet-x': `${position.x}px`,
        '--magnet-y': `${position.y}px`,
        '--magnet-rotation': `${position.rotation}deg`,
        '--magnet-size': `${position.size}px`,
        '--magnet-color': color,
        '--icon-rotation': `${iconRotation}deg`,
      } as React.CSSProperties}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={disabled}
      title={item.title}
      aria-label={`Open ${item.title} by ${item.author}`}
    >
      <div
        className={`magnet-body magnet-shape-${shape}`}
        style={useClipPath ? { clipPath } : undefined}
      >
        {stickerPath ? (
          <img
            src={stickerPath}
            alt={item.title}
            className="magnet-icon"
            loading="lazy"
          />
        ) : (
          <div className="magnet-icon magnet-icon-placeholder">?</div>
        )}
      </div>

      {/* Tooltip on hover or preview (mobile) */}
      {showTooltip && (
        <div className="magnet-tooltip">
          <span className="tooltip-title">{item.title}</span>
          <span className="tooltip-author">{item.author}</span>
        </div>
      )}
    </button>
  );
}
