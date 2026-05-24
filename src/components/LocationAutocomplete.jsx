import { useState, useEffect, useRef } from 'react';
import { IconLocation } from './Icons';

// these cities show up instantly when user clicks the field before typing anything
// feel free to change, add or remove cities here
const POPULAR = [
  { label: 'New York, United States', city: 'New York', flag: '🇺🇸' },
  { label: 'Los Angeles, United States', city: 'Los Angeles', flag: '🇺🇸' },
  { label: 'London, United Kingdom', city: 'London', flag: '🇬🇧' },
  { label: 'Paris, France', city: 'Paris', flag: '🇫🇷' },
  { label: 'Berlin, Germany', city: 'Berlin', flag: '🇩🇪' },
  { label: 'Amsterdam, Netherlands', city: 'Amsterdam', flag: '🇳🇱' },
  { label: 'Warsaw, Poland', city: 'Warsaw', flag: '🇵🇱' },
  { label: 'Prague, Czech Republic', city: 'Prague', flag: '🇨🇿' },
  { label: 'Vienna, Austria', city: 'Vienna', flag: '🇦🇹' },
  { label: 'Rome, Italy', city: 'Rome', flag: '🇮🇹' },
  { label: 'Barcelona, Spain', city: 'Barcelona', flag: '🇪🇸' },
  { label: 'Toronto, Canada', city: 'Toronto', flag: '🇨🇦' },
];

// city search input with autocomplete — uses OpenStreetMap, totally free, no API key needed
export function LocationAutocomplete({ value, onChange, placeholder = 'City', className, style }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showPopular, setShowPopular] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const timer = useRef(null);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false); setShowPopular(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = (q) => {
    clearTimeout(timer.current);
    q = q.slice(0, 60);
    setQuery(q);
    setActive(-1);
    if (!q.trim() || q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      setShowPopular(q.length === 0);
      return;
    }
    setShowPopular(false);
    // wait 350ms after user stops typing before sending a request (so we don't spam the API)
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&featuretype=settlement&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        const seen = new Set();

        const popular = POPULAR.filter(p =>
          p.city.toLowerCase().startsWith(q.toLowerCase()) ||
          p.label.toLowerCase().includes(q.toLowerCase())
        );

        const api = data
          .map(d => {
            const city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || d.name;
            const country = d.address?.country || '';
            const label = city ? `${city}, ${country}` : d.display_name.split(',').slice(0, 2).join(',').trim();
            return { label, city, flag: null };
          })
          .filter(d => d.city && !seen.has(d.label) && seen.add(d.label));

        const popularLabels = new Set(popular.map(p => p.label));
        const merged = [
          ...popular,
          ...api.filter(a => !popularLabels.has(a.label)),
        ].slice(0, 7);

        setSuggestions(merged);
        setOpen(merged.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const pick = (item) => {
    setQuery(item.label);
    onChange(item.label);
    setSuggestions([]);
    setOpen(false);
    setShowPopular(false);
    setActive(-1);
  };

  const handleFocus = () => {
    if (!query) setShowPopular(true);
    else if (suggestions.length > 0) setOpen(true);
  };

  const handleKeyDown = (e) => {
    const list = open ? suggestions : showPopular ? POPULAR : [];
    if (!list.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, list.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(list[active]); }
    else if (e.key === 'Escape') { setOpen(false); setShowPopular(false); }
  };

  const isOpen = open || showPopular;
  const displayList = open ? suggestions : POPULAR;

  return (
    <div ref={wrapRef} className={className} style={{ position: 'relative', ...style }}>
      <div className={`location-input-wrap${isOpen ? ' focused' : ''}`}>
        <IconLocation size={14} style={{ color: isOpen ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0, transition: 'color .15s' }}/>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => search(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="location-input"
          autoComplete="off"
          maxLength={60}
        />
        {loading && <span className="location-spinner"/>}
        {query && !loading && (
          <button
            className="location-clear"
            onMouseDown={e => { e.preventDefault(); setQuery(''); onChange(''); setOpen(false); setShowPopular(true); inputRef.current?.focus(); }}
          >✕</button>
        )}
      </div>

      {isOpen && (
        <div className="location-dropdown">
          {showPopular && (
            <div className="location-section-label">Popular cities</div>
          )}
          <ul style={{ listStyle: 'none' }}>
            {displayList.map((s, i) => (
              <li
                key={i}
                className={`location-option${i === active ? ' active' : ''}`}
                onMouseDown={() => pick(s)}
                onMouseEnter={() => setActive(i)}
              >
                {s.flag ? (
                  <span className="location-flag">{s.flag}</span>
                ) : (
                  <IconLocation size={12} style={{ color: 'var(--text-faint)', flexShrink: 0 }}/>
                )}
                <span className="location-city">{s.city}</span>
                <span className="location-country">{s.label.split(', ').slice(1).join(', ')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
