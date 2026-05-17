import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'app_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  const saveFavorites = useCallback((newFavorites) => {
    setFavorites(newFavorites);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
  }, []);

  const addFavorite = useCallback((listingId) => {
    const newFavorite = {
      listing_id: listingId,
      added_at: new Date().toISOString(),
    };
    saveFavorites([...favorites, newFavorite]);
  }, [favorites, saveFavorites]);

  const removeFavorite = useCallback((listingId) => {
    saveFavorites(favorites.filter(f => f.listing_id !== listingId));
  }, [favorites, saveFavorites]);

  const isFavorite = useCallback((listingId) => {
    return favorites.some(f => f.listing_id === listingId);
  }, [favorites]);

  const toggleFavorite = useCallback((listingId) => {
    if (isFavorite(listingId)) {
      removeFavorite(listingId);
    } else {
      addFavorite(listingId);
    }
  }, [favorites, isFavorite, removeFavorite, addFavorite]);

  return { favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite };
}
