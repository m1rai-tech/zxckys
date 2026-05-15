import { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD' },
  { code: 'EUR', symbol: '€', label: 'EUR' },
];

export function CurrencyProvider({ children }) {
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

export const useCurrency = () => useContext(CurrencyContext);
