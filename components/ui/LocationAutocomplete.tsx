import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, details?: LocationResult) => void;
  placeholder?: string;
  className?: string;
  focusRegion?: 'europe' | 'uk' | 'global';
}

// Bounding boxes for region focus
const REGION_BOUNDS: Record<string, string | undefined> = {
  europe: '-10.5,35.0,40.0,71.0',  // Western Europe
  uk: '-8.0,49.5,2.0,61.0',         // UK & Ireland
  global: undefined
};

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Search city or town...',
  className = '',
  focusRegion = 'europe'
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync with external value changes
  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        const bounds = REGION_BOUNDS[focusRegion];
        const boundsParam = bounds ? `&viewbox=${bounds}&bounded=1` : '';

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(debouncedQuery)}` +
          `&format=json` +
          `&addressdetails=1` +
          `&limit=8` +
          `&featuretype=city` +
          boundsParam,
          {
            headers: {
              'User-Agent': 'OpenPlatform/1.0'
            }
          }
        );

        const data: LocationResult[] = await response.json();

        // Filter to only show places with city/town/village
        const filtered = data.filter(r =>
          r.address.city || r.address.town || r.address.village
        );

        setResults(filtered);
      } catch (error) {
        console.error('Location search error:', error);
        setResults([]);
      }
      setIsLoading(false);
    };

    fetchLocations();
  }, [debouncedQuery, focusRegion]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: LocationResult) => {
    const city = result.address.city || result.address.town || result.address.village || '';
    const country = result.address.country || '';
    const displayValue = `${city}, ${country}`;

    setQuery(displayValue);
    onChange(displayValue, result);
    setShowDropdown(false);
  };

  const formatResultDisplay = (result: LocationResult) => {
    const city = result.address.city || result.address.town || result.address.village || '';
    const state = result.address.state || '';
    const country = result.address.country || '';
    return { city, secondary: [state, country].filter(Boolean).join(', ') };
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-10 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-accent-coral/20 focus:bg-white dark:bg-surface transition-all outline-none font-bold text-gray-800 dark:text-gray-200"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 animate-spin" />
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-2xl shadow-xl max-h-64 overflow-auto">
          {results.map((result, index) => {
            const { city, secondary } = formatResultDisplay(result);
            return (
              <button
                key={index}
                onClick={() => handleSelect(result)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900 flex items-start gap-3 border-b border-border last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
              >
                <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-primary">{city}</div>
                  <div className="text-sm text-muted">{secondary}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showDropdown && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-2xl shadow-xl p-4 text-sm text-muted">
          No locations found for "{query}"
        </div>
      )}
    </div>
  );
}

export default LocationAutocomplete;
