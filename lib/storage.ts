/**
 * LocalStorage wrapper with availability detection.
 * All functions are no-ops when localStorage is not available (e.g. SSR, private mode).
 */

const isSupported = (): boolean => {
  try {
    const key = "__miko_test__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

/** Stores a JSON-serialisable value under the given key. */
export const set = (key: string, value: string): void => {
  if (!isSupported()) return;
  localStorage.setItem(key, value);
};

/** Retrieves the raw string stored under the given key, or null. */
export const get = (key: string): string | null => {
  if (!isSupported()) return null;
  return localStorage.getItem(key);
};

/**
 * Returns all values whose keys start with the given prefix.
 * Useful for loading all sprites, sheets, or packages at once.
 */
export const getAll = (prefix: string): string[] => {
  if (!isSupported()) return [];
  const results: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      const value = localStorage.getItem(key);
      if (value !== null) results.push(value);
    }
  }
  return results;
};

/** Removes the entry with the given key. */
export const remove = (key: string): void => {
  if (!isSupported()) return;
  localStorage.removeItem(key);
};
