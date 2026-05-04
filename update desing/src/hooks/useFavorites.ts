import { useState, useEffect, useCallback } from 'react';
import { Favorite } from '../types';

const STORAGE_KEY = 'olx_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

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

  const saveFavorites = useCallback((newFavorites: Favorite[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
  }, []);

  const addFavorite = useCallback((listingId: string) => {
    const newFavorite: Favorite = {
      listing_id: listingId,
      added_at: new Date().toISOString(),
    };
    saveFavorites([...favorites, newFavorite]);
  }, [favorites, saveFavorites]);

  const removeFavorite = useCallback((listingId: string) => {
    const newFavorites = favorites.filter(f => f.listing_id !== listingId);
    saveFavorites(newFavorites);
  }, [favorites, saveFavorites]);

  const toggleFavorite = useCallback((listingId: string) => {
    if (isFavorite(listingId)) {
      removeFavorite(listingId);
    } else {
      addFavorite(listingId);
    }
  }, [favorites]);

  const isFavorite = useCallback((listingId: string) => {
    return favorites.some(f => f.listing_id === listingId);
  }, [favorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
