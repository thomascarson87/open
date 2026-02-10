import { useState, useEffect, useCallback } from 'react';

/**
 * Reactive hook for reading URL search params.
 * Re-renders when the URL changes via popstate or pushState.
 */
export function useSearchParams(): [URLSearchParams, (params: URLSearchParams) => void] {
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams(window.location.search));

  useEffect(() => {
    const handleChange = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handleChange);

    // Patch pushState/replaceState to also trigger updates
    const origPush = window.history.pushState.bind(window.history);
    const origReplace = window.history.replaceState.bind(window.history);

    window.history.pushState = (...args: Parameters<typeof origPush>) => {
      origPush(...args);
      handleChange();
    };

    window.history.replaceState = (...args: Parameters<typeof origReplace>) => {
      origReplace(...args);
      handleChange();
    };

    return () => {
      window.removeEventListener('popstate', handleChange);
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
    };
  }, []);

  const updateParams = useCallback((params: URLSearchParams) => {
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    setSearchParams(params);
  }, []);

  return [searchParams, updateParams];
}
