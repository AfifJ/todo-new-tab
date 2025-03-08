import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getStorage, setStorage } from "../utils/storage";

// Create context
const AppContext = createContext();

// Default values
const defaultData = {
  todos: [],
  folders: [{ id: "default", name: "Main" }],
  currentFolder: "default",
  quickLinks: []
};

export function AppProvider({ children }) {
  // States
  const [todos, setTodos] = useState(defaultData.todos);
  const [folders, setFolders] = useState(defaultData.folders);
  const [currentFolder, setCurrentFolder] = useState(defaultData.currentFolder);
  const [quickLinks, setQuickLinks] = useState(defaultData.quickLinks);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data on initial mount
  useEffect(() => {
    try {
      getStorage(
        ["todos", "folders", "currentFolder", "quickLinks"],
        (result) => {
          console.log("Loaded data from storage:", result);

          // Convert old format to new format if needed
          const loadedTodos = result.todos || [];
          const formattedTodos = loadedTodos.map((item) => {
            if (typeof item === "string") {
              return { text: item, completed: false, folderId: "default" };
            }
            return { ...item, folderId: item.folderId || "default" };
          });

          // Initialize folders - ensure we always have at least the default folder
          let loadedFolders = result.folders || [];
          if (!loadedFolders || loadedFolders.length === 0) {
            loadedFolders = [{ id: "default", name: "Main" }];
          }

          // Check if default folder exists
          const hasDefaultFolder = loadedFolders.some(
            (folder) => folder.id === "default"
          );
          if (!hasDefaultFolder) {
            loadedFolders.push({ id: "default", name: "Main" });
          }

          // Set current folder - default to "default" if the saved one doesn't exist
          const savedFolder = result.currentFolder || "default";
          const folderExists = loadedFolders.some(
            (folder) => folder.id === savedFolder
          );
          
          setFolders(loadedFolders);
          setTodos(formattedTodos);
          setCurrentFolder(folderExists ? savedFolder : "default");
          setQuickLinks(result.quickLinks || []);
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.error("Error loading data from storage:", err);
      setError("Failed to load data. Using defaults.");
      setFolders(defaultData.folders);
      setCurrentFolder(defaultData.currentFolder);
      setIsLoading(false);
    }
  }, []);

  // Save data whenever state changes
  useEffect(() => {
    if (isLoading) return;

    try {
      const dataToSave = { todos, folders, currentFolder, quickLinks };
      console.log("Saving data:", dataToSave);
      setStorage(dataToSave);
    } catch (err) {
      console.error("Error saving data:", err);
      setError("Failed to save data.");
    }
  }, [todos, folders, currentFolder, quickLinks, isLoading]);

  // Todo operations
  const addTodo = useCallback((text) => {
    if (!text.trim()) return;
    setTodos(prev => [
      ...prev,
      { text: text.trim(), completed: false, folderId: currentFolder }
    ]);
  }, [currentFolder]);

  const toggleTodo = useCallback((todoIndex) => {
    setTodos(prev => prev.map((todo, index) => 
      index === todoIndex ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);

  const removeTodo = useCallback((todoIndex) => {
    setTodos(prev => prev.filter((_, index) => index !== todoIndex));
  }, []);

  const updateTodo = useCallback((todoIndex, newText) => {
    if (!newText.trim()) return;
    setTodos(prev => prev.map((todo, index) => 
      index === todoIndex ? { ...todo, text: newText.trim() } : todo
    ));
  }, []);

  // Folder operations
  const addFolder = useCallback((name) => {
    if (!name.trim()) return;
    const folderId = `folder-${Date.now()}`;
    setFolders(prev => [...prev, { id: folderId, name: name.trim() }]);
  }, []);

  const updateFolder = useCallback((folderId, newName) => {
    if (!newName.trim()) return;
    setFolders(prev => prev.map(folder => 
      folder.id === folderId ? { ...folder, name: newName.trim() } : folder
    ));
  }, []);

  const deleteFolder = useCallback((folderId) => {
    if (folderId === "default") return; // Prevent deleting default folder
    if (folders.length <= 1) {
      alert("Cannot delete the last folder");
      return;
    }

    setFolders(prev => prev.filter(folder => folder.id !== folderId));
    setTodos(prev => prev.filter(todo => todo.folderId !== folderId));

    // If current folder is deleted, switch to another folder
    if (currentFolder === folderId) {
      const firstAvailableFolder = folders.find(f => f.id !== folderId)?.id || "default";
      setCurrentFolder(firstAvailableFolder);
    }
  }, [folders, currentFolder]);

  // QuickLink operations
  const addQuickLink = useCallback((name, url) => {
    if (!name.trim() || !url.trim()) return;
    
    // Add protocol if not present
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }
    
    setQuickLinks(prev => [...prev, { name: name.trim(), url: formattedUrl }]);
  }, []);

  const updateQuickLink = useCallback((index, name, url) => {
    if (!name.trim() || !url.trim()) return;
    
    // Add protocol if not present
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }
    
    setQuickLinks(prev => prev.map((link, i) => 
      i === index ? { name: name.trim(), url: formattedUrl } : link
    ));
  }, []);

  const deleteQuickLink = useCallback((index) => {
    setQuickLinks(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Get filteredTodos for the current folder
  const filteredTodos = todos.filter(todo => todo.folderId === currentFolder);
  
  // Get current folder name
  const currentFolderName = folders.find(folder => folder.id === currentFolder)?.name || "Main";

  const contextValue = {
    // State
    todos,
    folders,
    currentFolder,
    quickLinks,
    isLoading,
    error,
    filteredTodos,
    currentFolderName,
    
    // State setters
    setTodos,
    setFolders,
    setCurrentFolder,
    setQuickLinks,
    
    // Actions
    addTodo,
    toggleTodo,
    removeTodo,
    updateTodo,
    addFolder,
    updateFolder,
    deleteFolder,
    addQuickLink,
    updateQuickLink,
    deleteQuickLink
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook for using the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
