import { useState, useCallback, useEffect, useRef } from 'react';
import type { FridgeState, MagnetItem } from '../types';
import { useMagnets } from '../hooks/useMagnets';
import { Magnet } from './Magnet';
import { InteriorViewer } from './InteriorViewer';
import './Fridge.css';

// Base fridge dimensions (aspect ratio 0.6:1)
const BASE_WIDTH = 420;
const BASE_HEIGHT = 700;
const ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT;

function useFridgeDimensions() {
  const [dimensions, setDimensions] = useState({ width: BASE_WIDTH, height: BASE_HEIGHT });

  useEffect(() => {
    function calculateDimensions() {
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      // Max height: 85% of viewport height (leave room for title/footer)
      // Max width: 90% of viewport width on mobile, 50% on desktop
      const maxHeight = vh * 0.75;
      const maxWidth = vw < 600 ? vw * 0.85 : Math.min(vw * 0.4, 420);

      // Calculate dimensions maintaining aspect ratio
      let width = maxWidth;
      let height = width / ASPECT_RATIO;

      // If too tall, constrain by height instead
      if (height > maxHeight) {
        height = maxHeight;
        width = height * ASPECT_RATIO;
      }

      setDimensions({ width: Math.round(width), height: Math.round(height) });
    }

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

  return dimensions;
}

export function Fridge() {
  const [state, setState] = useState<FridgeState>('BOOT');
  const [selectedMagnet, setSelectedMagnet] = useState<MagnetItem | null>(null);
  const doorRef = useRef<HTMLDivElement>(null);

  const { width: FRIDGE_WIDTH, height: FRIDGE_HEIGHT } = useFridgeDimensions();
  const DOOR_WIDTH = FRIDGE_WIDTH - 20;
  const DOOR_HEIGHT = FRIDGE_HEIGHT - 40;

  const { data, positions, loading, error } = useMagnets(DOOR_WIDTH, DOOR_HEIGHT);

  // Handle initial load
  useEffect(() => {
    if (!loading && !error && data) {
      setState('CLOSED');
    } else if (error) {
      setState('ERROR');
    }
  }, [loading, error, data]);

  // Handle keyboard
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && state === 'OPEN') {
        closeDoor();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state]);

  const openDoor = useCallback((magnet: MagnetItem) => {
    if (state !== 'CLOSED') return;

    setSelectedMagnet(magnet);
    setState('OPENING');

    // Transition to OPEN after animation
    setTimeout(() => {
      setState('OPEN');
    }, 600);
  }, [state]);

  const closeDoor = useCallback(() => {
    if (state !== 'OPEN') return;

    setState('CLOSING');

    setTimeout(() => {
      setState('CLOSED');
      setSelectedMagnet(null);
    }, 500);
  }, [state]);

  const isOpen = state === 'OPEN' || state === 'OPENING';
  const isAnimating = state === 'OPENING' || state === 'CLOSING';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (state === 'BOOT' || loading) {
    return (
      <div className="fridge-container">
        <div className="fridge-loading">
          <div className="loading-spinner" />
          <p>Loading magnets...</p>
        </div>
      </div>
    );
  }

  if (state === 'ERROR' || error) {
    return (
      <div className="fridge-container">
        <div className="fridge-error">
          <p>Failed to load magnets</p>
          <p className="error-detail">{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fridge-container ${prefersReducedMotion ? 'reduced-motion' : ''}`}
      style={{
        '--fridge-width': `${FRIDGE_WIDTH}px`,
        '--fridge-height': `${FRIDGE_HEIGHT}px`,
      } as React.CSSProperties}
    >
      {/* Fridge body (back panel, always visible) */}
      <div className="fridge-body">
        <div className="fridge-interior">
          {/* Interior content when door is open */}
          {selectedMagnet && (
            <InteriorViewer
              magnet={selectedMagnet}
              isVisible={isOpen}
              onClose={closeDoor}
            />
          )}
        </div>

        {/* Handle/frame around interior */}
        <div className="fridge-frame" />
      </div>

      {/* Fridge door (swings open) */}
      <div
        ref={doorRef}
        className={`fridge-door ${isOpen ? 'open' : ''} ${isAnimating ? 'animating' : ''}`}
      >
        {/* Door surface */}
        <div className="door-surface">
          {/* Magnets */}
          <div className="magnets-container">
            {data?.items.map((item) => {
              const position = positions.get(item.id);
              if (!position) return null;

              return (
                <Magnet
                  key={item.id}
                  item={item}
                  position={position}
                  onClick={() => openDoor(item)}
                  disabled={state !== 'CLOSED'}
                />
              );
            })}
          </div>

          {/* Door handle */}
          <div className="door-handle" />
        </div>

        {/* Door edge (visible when opening) */}
        <div className="door-edge" />

        {/* Door back face (visible when open wide) */}
        <div className="door-back" />
      </div>

      {/* Smoke effect overlay */}
      {isAnimating && state === 'OPENING' && !prefersReducedMotion && (
        <div className="smoke-overlay" />
      )}
    </div>
  );
}
