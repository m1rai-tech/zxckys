import { createContext, useContext, useState } from 'react';

// add or remove currencies here, symbol shows up next to prices everywhere
export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD' },
  { code: 'EUR', symbol: '€', label: 'EUR' },
];

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  // remembers the last selected currency even after page refresh
  const [currency, setCurrency] = useState(
    () => CURRENCIES.find(c => c.code === localStorage.getItem('currency')) || CURRENCIES[0]
  );

  const changeCurrency = (code) => {
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
export const useCurrency = () => useContext(CurrencyContext);
