import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { MagnetItem, MagnetPosition } from '../types';
import { getMagnetStyle, findIconForKeywords, type MagnetShape } from '../config/icons';
import './Magnet.css';

interface MagnetProps {
  item: MagnetItem;
  position: MagnetPosition;
  onClick: () => void;
  disabled: boolean;
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
  cloud: 'polygon(25% 60%, 0% 60%, 0% 40%, 10% 20%, 30% 10%, 50% 0%, 70% 10%, 90% 20%, 100% 40%, 100% 60%, 75% 60%, 75% 80%, 60% 100%, 40% 100%, 25% 80%)',
};

export function Magnet({ item, position, onClick, disabled }: MagnetProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Get deterministic style based on item ID
  const { color, shape, iconRotation } = useMemo(
    () => getMagnetStyle(item.id),
    [item.id]
  );

  // Find icon based on keywords in title, url, matched_keyword
  const icon = useMemo(() => {
    const searchText = [
      item.title,
      item.url,
      item.matched_keyword || '',
    ].join(' ');
    return findIconForKeywords(searchText);
  }, [item.title, item.url, item.matched_keyword]);

  const clipPath = SHAPE_PATHS[shape];
  const useClipPath = clipPath !== '';

  return (
    <button
      className={`magnet ${isHovered ? 'hovered' : ''} ${isPressed ? 'pressed' : ''}`}
      style={{
        '--magnet-x': `${position.x}px`,
        '--magnet-y': `${position.y}px`,
        '--magnet-rotation': `${position.rotation}deg`,
        '--magnet-size': `${position.size}px`,
        '--magnet-color': color,
        '--icon-rotation': `${iconRotation}deg`,
      } as React.CSSProperties}
      onClick={onClick}
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
        <FontAwesomeIcon
          icon={icon}
          className="magnet-icon"
        />
      </div>

      {/* Tooltip on hover */}
      {isHovered && (
        <div className="magnet-tooltip">
          <span className="tooltip-title">{item.title}</span>
          <span className="tooltip-author">{item.author}</span>
        </div>
      )}
    </button>
  );
}
