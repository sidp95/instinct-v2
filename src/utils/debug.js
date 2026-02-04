// Debug flag - set to true to enable verbose logging
export const DEBUG = false;

// Debug logger that only logs when DEBUG is true
export const debug = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

// Always log errors
export const logError = (...args) => {
  console.error(...args);
};

// Always log warnings
export const logWarn = (...args) => {
  console.warn(...args);
};

// Log important state changes (always visible)
export const logInfo = (...args) => {
  console.log(...args);
};
