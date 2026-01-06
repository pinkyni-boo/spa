import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable browser's default scroll restoration to avoid conflicts
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Scroll window and potentially scrollable clean containers
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Also try scrolling #root in case it's the scroll container due to height: 100% css
    const root = document.getElementById('root');
    if (root) root.scrollTo({ top: 0, left: 0, behavior: 'instant' });

  }, [pathname]);

  return null;
};

export default ScrollToTop;
