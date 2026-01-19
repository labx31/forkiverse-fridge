import { useEffect } from 'react';
import './AboutModal.css';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  // Close on ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="about-modal-overlay" onClick={onClose}>
      <div className="about-modal" onClick={e => e.stopPropagation()}>
        <button className="about-close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2>FAQ</h2>

        <div className="faq-item">
          <h3>How do I get my project on the fridge?</h3>
          <p>
            Post on{' '}
            <a href="https://theforkiverse.com" target="_blank" rel="noopener noreferrer">
              The Forkiverse
            </a>
            {' '}with <code>#vibecoding</code> and a link to your project.
          </p>
        </div>

        <div className="faq-item">
          <h3>What are the requirements?</h3>
          <ul>
            <li>Must include <code>#vibecoding</code></li>
            <li>Must include a project URL</li>
            <li>Original posts only (no boosts/replies)</li>
            <li>Add <code>#fridge</code> for priority placement</li>
          </ul>
        </div>

        <div className="faq-item">
          <h3>Why are some magnets bigger?</h3>
          <p>Newer projects = bigger magnets.</p>
        </div>

        <div className="faq-item">
          <h3>How often does it update?</h3>
          <p>Every 5 minutes.</p>
        </div>

        <div className="faq-item">
          <h3>Why can't I preview some projects?</h3>
          <p>Some sites block embedding. Click "Open Project" to view them directly.</p>
        </div>

        <div className="faq-item">
          <h3>Is this open source?</h3>
          <p>
            Yes.{' '}
            <a href="https://github.com/labx31/forkiverse-fridge" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
