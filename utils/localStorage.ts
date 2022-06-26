const isSupported = (): boolean => {
  try {
    localStorage.setItem("test", "");
    localStorage.removeItem("test");
  } catch (e) {
    return false;
  }
  return true;
};

const set = (key: string, value: string): void => {
  if (isSupported()) {
    localStorage.setItem(key, value);
  }
};

const get = (key: string): string | null => {
  if (isSupported()) {
    return localStorage.getItem(key);
  }
  return null;
};

const getAll = (match: string): string[] | null => {
  if (isSupported()) {
    let matches = [];
    for (var key in localStorage) {
      if (key.indexOf(match) === 0) {
        const value = localStorage.getItem(key);
        if (value) {
          matches.push(value);
        }
      }
    }
    return matches;
  }
  return null;
};

const remove = (key: string): void => {
  if (isSupported()) {
    localStorage.removeItem(key);
  }
};

export { isSupported, set, get, getAll, remove };
