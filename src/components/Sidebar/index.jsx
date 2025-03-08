import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";

export function Sidebar() {
  const {
    folders,
    currentFolder,
    setCurrentFolder,
    addFolder,
    updateFolder,
    deleteFolder
  } = useAppContext();

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editFolderName, setEditFolderName] = useState("");

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName);
      setNewFolderName("");
      setIsAddingFolder(false);
    }
  };

  const startEditingFolder = (id, name) => {
    setEditingFolderId(id);
    setEditFolderName(name);
  };

  const saveEditFolder = () => {
    if (editFolderName.trim() && editingFolderId) {
      updateFolder(editingFolderId, editFolderName);
      setEditingFolderId(null);
      setEditFolderName("");
    }
  };

  const cancelEditFolder = () => {
    setEditingFolderId(null);
    setEditFolderName("");
  };

  return (
    <div className={`sidebar ${sidebarExpanded ? "expanded" : "collapsed"}`}>
      <div className="sidebar-header">
        <button
          className="toggle-sidebar"
          onClick={toggleSidebar}
          title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarExpanded ? "◀" : "▶"}
        </button>
        {sidebarExpanded && <h3>Folders</h3>}
      </div>

      {sidebarExpanded && (
        <div className="sidebar-content">
          <ul className="folder">
            {folders.map((folder) => (
              <li
                key={folder.id}
                className={`folder-item ${
                  currentFolder === folder.id ? "active" : ""
                }`}
              >
                {editingFolderId === folder.id ? (
                  <div className="folder-edit">
                    <input
                      type="text"
                      value={editFolderName}
                      onChange={(e) => setEditFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEditFolder();
                        if (e.key === "Escape") cancelEditFolder();
                      }}
                      autoFocus
                    />
                    <button onClick={saveEditFolder}>✓</button>
                    <button onClick={cancelEditFolder}>✕</button>
                  </div>
                ) : (
                  <>
                    <span
                      className="folder-name"
                      onClick={() => setCurrentFolder(folder.id)}
                    >
                      📁 {folder.name}
                    </span>
                    {folder.id !== "default" && (
                      <div className="folder-actions">
                        <button
                          onClick={() =>
                            startEditingFolder(folder.id, folder.name)
                          }
                          className="folder-edit-btn"
                          title="Edit folder"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => deleteFolder(folder.id)}
                          className="folder-delete-btn"
                          title="Delete folder"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>

          {isAddingFolder ? (
            <div className="add-folder-form">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddFolder();
                  if (e.key === "Escape") setIsAddingFolder(false);
                }}
                autoFocus
              />
              <button onClick={handleAddFolder}>Add</button>
              <button onClick={() => setIsAddingFolder(false)}>Cancel</button>
            </div>
          ) : (
            <button
              className="add-folder-btn"
              onClick={() => setIsAddingFolder(true)}
            >
              + Add Folder
            </button>
          )}
        </div>
      )}
    </div>
  );
}
