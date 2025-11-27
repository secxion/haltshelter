import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// ScrollManager: smooth scrolling on navigation, remembers scroll positions for back/forward,
// and intercepts same-page hash links to perform smooth scroll without layout jump.
export default function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positionsRef = useRef({});

  // Save current scroll position before the route changes.
  useEffect(() => {
    const key = location.pathname + location.search + location.hash;
    const store = positionsRef.current; // capture reference for cleanup
    return () => {
      try {
        store[key] = { x: window.scrollX, y: window.scrollY };
      } catch (e) {
        // ignore in non-browser env
      }
    };
  }, [location.pathname, location.search, location.hash]);

  // After navigation, restore or scroll appropriately.
  useEffect(() => {
    const key = location.pathname + location.search + location.hash;

    // If user used back/forward, try to restore previous position.
    if (navigationType === 'POP') {
      const pos = positionsRef.current[key];
      if (pos) {
        window.scrollTo({ left: pos.x, top: pos.y, behavior: 'auto' });
        return;
      }
    }

    // If there's a hash (fragment), scroll that element into view smoothly.
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        // Small timeout to allow layout to settle if needed
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
        return;
      }
    }

    // Default: smooth scroll to top for new navigation
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch (e) {
      if (typeof window !== 'undefined') window.scrollTo(0, 0);
    }
  }, [location.pathname, location.search, location.hash, navigationType]);

  // Intercept same-page anchor clicks (href="#...") to perform smooth scroll
  useEffect(() => {
    function onDocClick(e) {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.length <= 1) return;
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
  window.history.replaceState(null, '', '#' + id);
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return null;
}
