import { createContext, useContext, useState } from 'react';

// add or remove currencies here, symbol shows up next to prices everywhere
export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD' },
  { code: 'EUR', symbol: '€', label: 'EUR' },
];

// returns the symbol for a currency code stored on a listing, falls back to the code itself
export function getCurrencySymbol(code) {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? code ?? '';
}

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  // null = no preference (default); saves to localStorage when user picks one
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('currency');
    return saved ? (CURRENCIES.find(c => c.code === saved) ?? null) : null;
  });

  const changeCurrency = (code) => {
    if (!code) {
      localStorage.removeItem('currency');
      setCurrency(null);
      return;
    }
    const found = CURRENCIES.find(c => c.code === code);
    if (found) {
      localStorage.setItem('currency', code);
      setCurrency(found);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

// use this in any component to get current currency: const { currency } = useCurrency()
// currency is null when the user hasn't picked a preference
export const useCurrency = () => useContext(CurrencyContext);
