import { useEffect, useRef, useState } from 'react';

export const PHONE_CODES = [
  { code: '+1',   iso: 'us' }, { code: '+1',   iso: 'ca' },
  { code: '+7',   iso: 'ru' },
  { code: '+20',  iso: 'eg' }, { code: '+27',  iso: 'za' },
  { code: '+30',  iso: 'gr' }, { code: '+31',  iso: 'nl' },
  { code: '+32',  iso: 'be' }, { code: '+33',  iso: 'fr' },
  { code: '+34',  iso: 'es' }, { code: '+36',  iso: 'hu' },
  { code: '+39',  iso: 'it' }, { code: '+40',  iso: 'ro' },
  { code: '+41',  iso: 'ch' }, { code: '+43',  iso: 'at' },
  { code: '+44',  iso: 'gb' }, { code: '+45',  iso: 'dk' },
  { code: '+46',  iso: 'se' }, { code: '+47',  iso: 'no' },
  { code: '+48',  iso: 'pl' }, { code: '+49',  iso: 'de' },
  { code: '+51',  iso: 'pe' }, { code: '+52',  iso: 'mx' },
  { code: '+54',  iso: 'ar' }, { code: '+55',  iso: 'br' },
  { code: '+56',  iso: 'cl' }, { code: '+57',  iso: 'co' },
  { code: '+60',  iso: 'my' }, { code: '+61',  iso: 'au' },
  { code: '+62',  iso: 'id' }, { code: '+63',  iso: 'ph' },
  { code: '+64',  iso: 'nz' }, { code: '+65',  iso: 'sg' },
  { code: '+66',  iso: 'th' }, { code: '+81',  iso: 'jp' },
  { code: '+82',  iso: 'kr' }, { code: '+84',  iso: 'vn' },
  { code: '+86',  iso: 'cn' }, { code: '+90',  iso: 'tr' },
  { code: '+91',  iso: 'in' }, { code: '+92',  iso: 'pk' },
  { code: '+94',  iso: 'lk' }, { code: '+98',  iso: 'ir' },
  { code: '+212', iso: 'ma' }, { code: '+213', iso: 'dz' },
  { code: '+216', iso: 'tn' }, { code: '+234', iso: 'ng' },
  { code: '+254', iso: 'ke' }, { code: '+255', iso: 'tz' },
  { code: '+256', iso: 'ug' }, { code: '+260', iso: 'zm' },
  { code: '+263', iso: 'zw' }, { code: '+351', iso: 'pt' },
  { code: '+352', iso: 'lu' }, { code: '+353', iso: 'ie' },
  { code: '+354', iso: 'is' }, { code: '+358', iso: 'fi' },
  { code: '+359', iso: 'bg' }, { code: '+370', iso: 'lt' },
  { code: '+371', iso: 'lv' }, { code: '+372', iso: 'ee' },
  { code: '+373', iso: 'md' }, { code: '+374', iso: 'am' },
  { code: '+375', iso: 'by' }, { code: '+380', iso: 'ua' },
  { code: '+381', iso: 'rs' }, { code: '+385', iso: 'hr' },
  { code: '+386', iso: 'si' }, { code: '+387', iso: 'ba' },
  { code: '+420', iso: 'cz' }, { code: '+421', iso: 'sk' },
  { code: '+880', iso: 'bd' }, { code: '+961', iso: 'lb' },
  { code: '+962', iso: 'jo' }, { code: '+963', iso: 'sy' },
  { code: '+964', iso: 'iq' }, { code: '+965', iso: 'kw' },
  { code: '+966', iso: 'sa' }, { code: '+968', iso: 'om' },
  { code: '+971', iso: 'ae' }, { code: '+972', iso: 'il' },
  { code: '+974', iso: 'qa' }, { code: '+977', iso: 'np' },
  { code: '+992', iso: 'tj' }, { code: '+993', iso: 'tm' },
  { code: '+994', iso: 'az' }, { code: '+995', iso: 'ge' },
  { code: '+996', iso: 'kg' }, { code: '+998', iso: 'uz' },
];

const FlagImg = ({ iso, size = 20 }) => (
  <img
    src={`https://flagcdn.com/w${size}/${iso}.png`}
    srcSet={`https://flagcdn.com/w${size * 2}/${iso}.png 2x`}
    width={size}
    alt={iso}
    style={{ display: 'block', borderRadius: 2, flexShrink: 0 }}
  />
);

// phoneIso = iso code of selected country (e.g. 'us', 'ca', 'gb')
// onIsoChange receives the new iso — callers derive the dial code via PHONE_CODES.find(c => c.iso === iso)?.code
export function PhoneInput({ phoneIso, phoneNum, onIsoChange, onNumChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = PHONE_CODES.find(c => c.iso === phoneIso) || PHONE_CODES[0];

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, background: '#fff', position: 'relative' }}>
      <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 10px', height: 44, background: 'transparent',
            border: 'none', borderRight: '1px solid var(--border)',
            cursor: 'pointer', whiteSpace: 'nowrap', borderRadius: 0,
          }}
        >
          <FlagImg iso={selected.iso}/>
          <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{selected.code}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▾</span>
        </button>

        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)}/>
            <div style={{
              position: 'absolute', top: '100%', left: 0, zIndex: 100,
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
              maxHeight: 240, overflowY: 'auto', minWidth: 130,
              marginTop: 4,
            }}>
              {PHONE_CODES.map(c => (
                <button
                  key={c.iso}
                  type="button"
                  onClick={() => { onIsoChange(c.iso); setOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '7px 12px', textAlign: 'left',
                    background: c.iso === phoneIso ? 'var(--accent-soft)' : 'transparent',
                    border: 'none', cursor: 'pointer', fontSize: 14,
                    color: 'var(--text)',
                  }}
                >
                  <FlagImg iso={c.iso}/>
                  <span>{c.code}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <input
        value={phoneNum}
        onChange={e => onNumChange(e.target.value)}
        placeholder="123 456 7890"
        style={{
          flex: 1, border: 'none', padding: '10px 12px',
          outline: 'none', fontSize: 14, background: 'transparent',
          color: 'var(--text)', minWidth: 0,
        }}
      />
    </div>
  );
}
