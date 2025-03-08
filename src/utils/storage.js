/* eslint-disable no-undef */
/**
 * Storage utility that automatically uses the appropriate storage mechanism
 * based on environment (localStorage for development, chrome.storage for production)
 */

// More robust detection for Chrome extension environment
const isExtension = () => {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
};

// More robust development mode detection
const isDev = () => {
  return import.meta.env.DEV || process.env.NODE_ENV === 'development';
};

// Initialize with some default data for development
const defaultData = {
  todos: [],
  folders: [{ id: "default", name: "Main" }],
  currentFolder: "default",
  quickLinks: []
};

// Initialize localStorage in dev mode if needed
const initLocalStorage = () => {
  if (isDev() && !isExtension() && typeof localStorage !== 'undefined') {
    // Only initialize keys that don't exist
    Object.keys(defaultData).forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(defaultData[key]));
        console.log(`Initialized localStorage with default ${key}`);
      } else {
        // Special handling for folders to ensure the default folder exists
        if (key === 'folders') {
          try {
            const savedFolders = JSON.parse(localStorage.getItem(key));
            if (!savedFolders || savedFolders.length === 0) {
              localStorage.setItem(key, JSON.stringify(defaultData[key]));
              console.log(`Reset empty folders with default`);
            } else if (!savedFolders.some(folder => folder.id === 'default')) {
              savedFolders.push({ id: "default", name: "Main" });
              localStorage.setItem(key, JSON.stringify(savedFolders));
              console.log(`Added missing default folder`);
            }
          } catch (error) {
            console.error('Error checking folders in localStorage:', error);
            localStorage.setItem(key, JSON.stringify(defaultData[key]));
          }
        }
      }
    });
  }
};

// Call initialization
initLocalStorage();

// Log which storage we're using
console.log(`Using ${isDev() ? 'development (localStorage)' : 'production (chrome.storage)'} storage mode`);
console.log(`Is running as extension: ${isExtension() ? 'Yes' : 'No'}`);

/**
 * Get data from storage
 * @param {string|string[]} keys - Keys to retrieve
 * @param {function} callback - Callback function with retrieved data
 */
export const getStorage = (keys, callback) => {
  try {
    // Development mode: use localStorage
    if (isDev() && !isExtension()) {
      const result = {};
      
      // Handle both string and array keys
      const keyList = Array.isArray(keys) ? keys : [keys];
      
      keyList.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          result[key] = value ? JSON.parse(value) : defaultData[key] || null;
        } catch (error) {
          console.error(`Error reading ${key} from localStorage:`, error);
          result[key] = defaultData[key] || null;
        }
      });
      
      // Execute callback asynchronously to mimic Chrome API behavior
      setTimeout(() => callback(result), 0);
      return;
    }
    
    // Production mode: use Chrome storage API
    if (isExtension()) {
      chrome.storage.local.get(keys, result => {
        // Fill in any missing keys with default values
        if (Array.isArray(keys)) {
          keys.forEach(key => {
            if (result[key] === undefined) {
              result[key] = defaultData[key] || null;
            }
          });
        } else if (typeof keys === 'string' && result[keys] === undefined) {
          result[keys] = defaultData[keys] || null;
        }
        
        callback(result);
      });
      return;
    }
    
    // Fallback with default data if neither is available
    console.warn('Neither localStorage nor chrome.storage is available, using in-memory defaults');
    const result = {};
    
    if (Array.isArray(keys)) {
      keys.forEach(key => {
        result[key] = defaultData[key] || null;
      });
    } else if (typeof keys === 'string') {
      result[keys] = defaultData[keys] || null;
    }
    
    setTimeout(() => callback(result), 0);
    
  } catch (error) {
    console.error('Error in getStorage:', error);
    callback({}); // Return empty object on error
  }
};

/**
 * Save data to storage
 * @param {object} data - Data object to save
 * @param {function} callback - Optional callback function
 */
export const setStorage = (data, callback = null) => {
  try {
    // Development mode: use localStorage
    if (isDev() && !isExtension()) {
      Object.keys(data).forEach(key => {
        try {
          localStorage.setItem(key, JSON.stringify(data[key]));
        } catch (error) {
          console.error(`Error writing ${key} to localStorage:`, error);
        }
      });
      
      if (callback) {
        setTimeout(callback, 0);
      }
      return;
    }
    
    // Production mode: use Chrome storage API
    if (isExtension()) {
      chrome.storage.local.set(data, callback || (() => {}));
      return;
    }
    
    // Fallback if neither is available
    console.warn('Neither localStorage nor chrome.storage is available, data will not persist');
    if (callback) {
      setTimeout(callback, 0);
    }
  } catch (error) {
    console.error('Error in setStorage:', error);
    if (callback) {
      setTimeout(callback, 0);
    }
  }
};

// Simple in-memory storage for fallback (when neither localStorage nor chrome.storage is available)
const memoryStorage = { ...defaultData };

/**
 * Memory-only storage implementation for extreme fallback scenario
 * @param {string|string[]} keys - Keys to retrieve
 * @param {function} callback - Callback function
 */
export const memoryStorageGet = (keys, callback) => {
  const result = {};
  const keyList = Array.isArray(keys) ? keys : [keys];
  
  keyList.forEach(key => {
    result[key] = memoryStorage[key] || null;
  });
  
  setTimeout(() => callback(result), 0);
};

/**
 * Memory-only storage setter for extreme fallback scenario
 * @param {object} data - Data to store
 * @param {function} callback - Optional callback
 */
export const memoryStorageSet = (data, callback = null) => {
  Object.keys(data).forEach(key => {
    memoryStorage[key] = data[key];
  });
  
  if (callback) {
    setTimeout(callback, 0);
  }
};
