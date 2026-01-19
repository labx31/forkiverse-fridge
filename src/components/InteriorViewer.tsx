import { useState, useEffect, useRef, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { MagnetItem } from '../types';
import { getMagnetStyle, findIconForKeywords } from '../config/icons';
import './InteriorViewer.css';

interface InteriorViewerProps {
  magnet: MagnetItem;
  isVisible: boolean;
  onClose: () => void;
}

// Timeout for cross-origin iframe detection. X-Frame-Options errors are instant,
// but we can't detect them for cross-origin. This gives legitimate sites time to load.
const IFRAME_TIMEOUT = 5000;

export function InteriorViewer({ magnet, isVisible, onClose }: InteriorViewerProps) {
  const [iframeStatus, setIframeStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<number | null>(null);

  // Get magnet style for fallback display
  const { color, shape } = useMemo(() => getMagnetStyle(magnet.id), [magnet.id]);
  const icon = useMemo(() => {
    const searchText = [magnet.title, magnet.url, magnet.matched_keyword || ''].join(' ');
    return findIconForKeywords(searchText);
  }, [magnet.title, magnet.url, magnet.matched_keyword]);

  // Reset state when magnet changes
  useEffect(() => {
    console.log('[Iframe] Loading:', magnet.url);
    setIframeStatus('loading');

    // Set timeout for iframe load - catches X-Frame-Options errors
    timeoutRef.current = window.setTimeout(() => {
      console.log('[Iframe] Timeout reached, current status:', iframeStatus);
      setIframeStatus((current) => {
        if (current === 'loading') {
          console.log('[Iframe] Setting to failed due to timeout');
          return 'failed';
        }
        return current;
      });
    }, IFRAME_TIMEOUT);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [magnet.id]);

  const handleIframeLoad = () => {
    console.log('[Iframe] onLoad fired for:', magnet.url);
    // Only trust onLoad for same-origin iframes where we can verify content
    try {
      const iframe = iframeRef.current;
      // If we can access the location, it's same-origin and actually loaded
      if (iframe?.contentWindow?.location?.href) {
        console.log('[Iframe] Same-origin verified, marking as loaded');
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setIframeStatus('loaded');
      } else {
        console.log('[Iframe] Could not access contentWindow.location');
      }
    } catch (e) {
      // Cross-origin: onLoad fires even for X-Frame-Options blocks
      console.log('[Iframe] Cross-origin detected:', e);
      // For cross-origin, trust onLoad and mark as loaded
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIframeStatus('loaded');
    }
  };

  const handleIframeError = () => {
    console.log('[Iframe] onError fired for:', magnet.url);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIframeStatus('failed');
  };

  const openInNewTab = () => {
    window.open(magnet.url, '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) return null;

  const shapeClass = `fallback-magnet-shape-${shape}`;

  return (
    <div className="interior-viewer">
      {/* Header */}
      <div className="viewer-header">
        <div className="viewer-title-section">
          <h2 className="viewer-title">{magnet.title}</h2>
          <a
            href={magnet.status_url}
            target="_blank"
            rel="noopener noreferrer"
            className="viewer-author"
          >
            {magnet.author}
          </a>
        </div>
        <div className="viewer-actions">
          <button
            className="action-btn open-btn"
            onClick={openInNewTab}
            title="Open in new tab"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Open
          </button>
          <button
            className="action-btn close-btn"
            onClick={onClose}
            title="Close (ESC)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="viewer-content">
        {iframeStatus === 'loading' && (
          <div className="viewer-loading">
            <div className="loading-spinner" />
            <p>Loading project...</p>
          </div>
        )}

        {iframeStatus === 'failed' && (
          <div className="viewer-failed">
            {/* Show magnet artwork */}
            <div
              className={`fallback-magnet ${shapeClass}`}
              style={{ backgroundColor: color }}
            >
              <FontAwesomeIcon icon={icon} className="fallback-magnet-icon" />
            </div>

            <h3 className="fallback-title">{magnet.title}</h3>
            <p className="fallback-message">This site can't be embedded</p>

            <button className="open-project-btn" onClick={openInNewTab}>
              Open Project
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>

            {magnet.preview_image && (
              <img
                src={magnet.preview_image}
                alt={magnet.title}
                className="preview-image"
              />
            )}
          </div>
        )}

        {/* Only render iframe if not failed - prevents it from blocking fallback clicks */}
        {iframeStatus !== 'failed' && (
          <iframe
            ref={iframeRef}
            src={magnet.url}
            title={magnet.title}
            className={`viewer-iframe ${iframeStatus === 'loaded' ? 'visible' : ''}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="lazy"
          />
        )}
      </div>

      {/* View on Forkiverse link */}
      <div className="viewer-footer">
        <a
          href={magnet.status_url}
          target="_blank"
          rel="noopener noreferrer"
          className="forkiverse-link"
        >
          View on Forkiverse
        </a>
      </div>
    </div>
  );
}
