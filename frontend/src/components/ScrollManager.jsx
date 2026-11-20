import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scroll behaviour a normal multi-page site gives you for free:
 *  - new page  -> jump to the top
 *  - /#about   -> smooth-scroll to the element with id="about"
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // wait a tick so the target section has rendered
      const timer = setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);

  return null;
}
