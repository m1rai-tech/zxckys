const KEY = 'olxua_favorites';

export const getFavorites = (): string[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
};

export const isFavorite = (id: string) => getFavorites().includes(id);

export const toggleFavorite = (id: string): boolean => {
  const list = getFavorites();
  const idx = list.indexOf(id);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(id);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('favorites-changed'));
  return idx < 0;
};
