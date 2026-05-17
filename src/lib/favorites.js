// favorites are stored in localStorage — no login needed, works instantly
// they disappear if the user clears browser data, which is fine for this kind of feature
const KEY = 'app_favorites';

export const getFavorites = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
};

export const isFavorite = (id) => getFavorites().includes(id);

// adds the listing if it's not there, removes it if it already is (toggle)
// fires a custom event so the heart icon and badge update everywhere at once
export const toggleFavorite = (id) => {
  const list = getFavorites();
  const idx = list.indexOf(id);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(id);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('favorites-changed'));
  return idx < 0;
};
