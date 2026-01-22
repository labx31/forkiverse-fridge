import { useState, useMemo } from 'react';
import type { MagnetItem, MagnetPosition } from '../types';
import './Magnet.css';

interface MagnetProps {
  item: MagnetItem;
  position: MagnetPosition;
  onClick: () => void;
  disabled: boolean;
  isPreviewed: boolean;
  onPreview: () => void;
}

export function Magnet({ item, position, onClick, disabled, isPreviewed, onPreview }: MagnetProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [useSvgFallback, setUseSvgFallback] = useState(false);

  // Detect touch device on first touch
  const handleTouchStart = () => {
    setIsTouchDevice(true);
  };

  // Get sticker image path from sticker_id (PNG first, SVG fallback)
  const stickerPath = useMemo(() => {
    if (!item.sticker_id) return null;
    if (useSvgFallback) {
      return `/forkiverse-fridge/stickers-svg-backup/${item.sticker_id}.svg`;
    }
    return `/forkiverse-fridge/stickers/${item.sticker_id}.png`;
  }, [item.sticker_id, useSvgFallback]);

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
      {stickerPath ? (
        <img
          src={stickerPath}
          alt={item.title}
          className="magnet-sticker"
          loading="lazy"
          onError={() => {
            if (!useSvgFallback) {
              setUseSvgFallback(true);
            }
          }}
        />
      ) : (
        <div className="magnet-sticker magnet-sticker-placeholder">?</div>
      )}

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
