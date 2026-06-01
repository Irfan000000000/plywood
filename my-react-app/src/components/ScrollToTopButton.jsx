import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);
  const [scrollElement, setScrollElement] = useState(null);

  // Debounced scroll detection
  const checkScroll = useCallback(debounce(() => {
    // Check window scroll first
    if (window.scrollY > 300) {
      setVisible(true);
      setScrollElement(window);
      return;
    }

    // Check all scrollable elements
    const scrollableElements = document.querySelectorAll('*[style*="overflow"], *[class*="scroll"]');
    
    let found = false;
    scrollableElements.forEach(el => {
      if (found) return;
      if (el.scrollHeight > el.clientHeight && el.scrollTop > 100) {
        setVisible(true);
        setScrollElement(el);
        found = true;
      }
    });

    if (!found && (!scrollElement || 
        (scrollElement.scrollTop <= 100 && scrollElement !== window))) {
      setVisible(false);
    }
  }, 100), []);

  const scrollToTop = () => {
    if (scrollElement) {
      scrollElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Initial check
    checkScroll();

    // Event listeners
    window.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    
    // Mutation observer for dynamically added content
    const observer = new MutationObserver(checkScroll);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Check periodically in case MutationObserver misses something
    const interval = setInterval(checkScroll, 1000);

    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      observer.disconnect();
      clearInterval(interval);
      checkScroll.cancel();
    };
  }, [checkScroll]);

  if (!visible) return null;

  return (
    <div 
      className="universal-scroll-top-btn"
      onClick={scrollToTop}
      title="Scroll to top"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </div>
  );
};

export default ScrollToTopButton;