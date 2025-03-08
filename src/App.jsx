import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./index.css";

// StrictMode compatibility wrapper
const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) {
    return null;
  }
  return <Droppable {...props}>{children}</Droppable>;
};

function TodoList() {
  // Add new states for quick links
  const [quickLinks, setQuickLinks] = useState([]);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingLinkIndex, setEditingLinkIndex] = useState(null);
  const [linkInput, setLinkInput] = useState({ name: "", url: "" });

  // Existing states
  const [todos, setTodos] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("default");
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const [newTodo, setNewTodo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    // eslint-disable-next-line no-undef
    chrome.storage.local.get(
      ["todos", "folders", "currentFolder", "quickLinks"],
      (result) => {
        // Convert old format to new format if needed
        const loadedTodos = result.todos || [];
        const formattedTodos = loadedTodos.map((item) => {
          if (typeof item === "string") {
            return { text: item, completed: false, folderId: "default" };
          }
          return { ...item, folderId: item.folderId || "default" };
        });

        setTodos(formattedTodos);

        // Initialize folders
        const loadedFolders = result.folders || [
          { id: "default", name: "Main" },
        ];
        setFolders(loadedFolders);

        // Set current folder
        setCurrentFolder(result.currentFolder || "default");

        // Set quick links
        setQuickLinks(result.quickLinks || []);
      }
    );

    updateDateTime();
    // Set interval to update time every minute
    const timeInterval = setInterval(updateDateTime, 60000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-undef
    chrome.storage.local.set({ todos, folders, currentFolder, quickLinks });
  }, [todos, folders, currentFolder, quickLinks]);

  // Update this effect to only count todos in the current folder
  useEffect(() => {
    // Only count uncompleted todos in the current folder
    const uncompletedCount = todos
      .filter(todo => todo.folderId === currentFolder && !todo.completed)
      .length;
    
    // Update favicon with badge and document title
    updateFaviconBadge(uncompletedCount);
  }, [todos, currentFolder]); // Added currentFolder as dependency
  const updateFaviconBadge = (count) => {
    // Only show badge if there are uncompleted todos
    if (count <= 0) {
      // Reset to original favicon
      const link = document.querySelector("link[rel='icon']");
      if (link) {
        link.href = "/todo.svg"; // Original favicon path
      }
      document.title = "Todo New Tab"; // Reset title
      return;
    }

    // Update document title for additional notification
    document.title = `(${count}) Todo New Tab`;

    // Create canvas for the badge
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");

    // Load original favicon
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/todo.svg";

    img.onload = () => {
      // Draw original favicon
      ctx.drawImage(img, 0, 0, 32, 32);

      // If the count is too high, show "99+"
      const displayCount = count > 99 ? "99+" : count.toString();
      ctx.fillText(displayCount, 24, 8);

      // Update favicon
      const link = document.querySelector("link[rel='icon']");
      if (link) {
        link.href = canvas.toDataURL("image/png");
      } else {
        // If there's no favicon, create one
        const newLink = document.createElement("link");
        newLink.rel = "icon";
        newLink.href = canvas.toDataURL("image/png");
        document.head.appendChild(newLink);
      }
    };
  };

  const updateDateTime = () => {
    const today = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setDate(today.toLocaleDateString("en-US", options));

    const hours = today.getHours().toString().padStart(2, "0");
    const minutes = today.getMinutes().toString().padStart(2, "0");
    setTime(`${hours}:${minutes}`);
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([
        ...todos,
        { text: newTodo.trim(), completed: false, folderId: currentFolder },
      ]);
      setNewTodo("");
    }
  };

  const toggleTodo = (index) => {
    const newTodos = [...todos];
    newTodos[index].completed = !newTodos[index].completed;
    setTodos(newTodos);
  };

  const removeTodo = (index) => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    setTodos(newTodos);
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditText(todos[index].text);
  };

  const saveEdit = () => {
    if (editText.trim() && editingIndex !== null) {
      const newTodos = [...todos];
      newTodos[editingIndex].text = editText.trim();
      setTodos(newTodos);
      setEditingIndex(null);
      setEditText("");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const filteredTodos = todos.filter(
      (todo) => todo.folderId === currentFolder
    );
    const allTodos = [...todos];

    const [reorderedItem] = filteredTodos.splice(result.source.index, 1);
    filteredTodos.splice(result.destination.index, 0, reorderedItem);

    // Update the main todos array with the reordered items
    const updatedTodos = allTodos.filter(
      (todo) => todo.folderId !== currentFolder
    );
    setTodos([...updatedTodos, ...filteredTodos]);
  };

  // Folder management
  const addFolder = () => {
    if (newFolderName.trim()) {
      const folderId = `folder-${Date.now()}`;
      setFolders([...folders, { id: folderId, name: newFolderName.trim() }]);
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
      const updatedFolders = folders.map((folder) =>
        folder.id === editingFolderId
          ? { ...folder, name: editFolderName.trim() }
          : folder
      );
      setFolders(updatedFolders);
      setEditingFolderId(null);
      setEditFolderName("");
    }
  };

  const cancelEditFolder = () => {
    setEditingFolderId(null);
    setEditFolderName("");
  };

  const deleteFolder = (id) => {
    if (id === "default") return; // Prevent deleting default folder

    const updatedFolders = folders.filter((folder) => folder.id !== id);

    // Delete todos that belong to the deleted folder
    const updatedTodos = todos.filter((todo) => todo.folderId !== id);

    setFolders(updatedFolders);
    setTodos(updatedTodos);

    // If current folder is deleted, switch to default
    if (currentFolder === id) {
      setCurrentFolder("default");
    }
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  // Quick link functions
  const addQuickLink = () => {
    if (linkInput.name.trim() && linkInput.url.trim()) {
      // Add protocol if not present
      let url = linkInput.url;
      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }

      setQuickLinks([...quickLinks, { name: linkInput.name.trim(), url }]);
      setLinkInput({ name: "", url: "" });
      setIsAddingLink(false);
    }
  };

  const startEditingLink = (index) => {
    setEditingLinkIndex(index);
    setLinkInput(quickLinks[index]);
  };

  const saveEditLink = () => {
    if (
      linkInput.name.trim() &&
      linkInput.url.trim() &&
      editingLinkIndex !== null
    ) {
      // Add protocol if not present
      let url = linkInput.url;
      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }

      const updatedLinks = [...quickLinks];
      updatedLinks[editingLinkIndex] = { name: linkInput.name.trim(), url };
      setQuickLinks(updatedLinks);
      setLinkInput({ name: "", url: "" });
      setEditingLinkIndex(null);
    }
  };

  const cancelLinkEdit = () => {
    setEditingLinkIndex(null);
    setLinkInput({ name: "", url: "" });
    setIsAddingLink(false);
  };

  const deleteQuickLink = (index) => {
    const updatedLinks = quickLinks.filter((_, i) => i !== index);
    setQuickLinks(updatedLinks);
  };

  // Filter todos by current folder
  const filteredTodos = todos.filter((todo) => todo.folderId === currentFolder);

  // Get current folder name
  const currentFolderName =
    folders.find((folder) => folder.id === currentFolder)?.name || "Main";

  return (
    <>
      <div className="app-container">
        <div
          className={`sidebar ${sidebarExpanded ? "expanded" : "collapsed"}`}
        >
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
              <ul className="folder-list">
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
                      if (e.key === "Enter") addFolder();
                      if (e.key === "Escape") setIsAddingFolder(false);
                    }}
                    autoFocus
                  />
                  <button onClick={addFolder}>Add</button>
                  <button onClick={() => setIsAddingFolder(false)}>
                    Cancel
                  </button>
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

        <div className="main-content">
          <div className="app">
            <div className="DateTime">
              <span className="block font-bold text-7xl text-center">{time}</span>
              <span className="DateTime__Date">{date}</span>
              {/* Add Quick Links section above date */}
              <div className="mt-4 QuickLinks">
                {/* Form for adding/editing links */}
                {(isAddingLink || editingLinkIndex !== null) && (
                  <div className="QuickLinks__Form">
                    <input
                      type="text"
                      placeholder="Name"
                      value={linkInput.name}
                      onChange={(e) =>
                        setLinkInput({ ...linkInput, name: e.target.value })
                      }
                      className="QuickLinks__Input"
                    />
                    <input
                      type="text"
                      placeholder="URL (e.g. google.com)"
                      value={linkInput.url}
                      onChange={(e) =>
                        setLinkInput({ ...linkInput, url: e.target.value })
                      }
                      className="QuickLinks__Input"
                    />
                    <div className="QuickLinks__FormActions">
                      <button
                        onClick={
                          editingLinkIndex !== null
                            ? saveEditLink
                            : addQuickLink
                        }
                        className="QuickLinks__SaveButton"
                      >
                        {editingLinkIndex !== null ? "Save" : "Add"}
                      </button>
                      <button
                        onClick={cancelLinkEdit}
                        className="QuickLinks__CancelButton"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Display links */}
                {quickLinks.length > 0 && (
                  <div className="QuickLinks__Grid">
                    {quickLinks.map((link, index) => (
                      <div key={index} className="QuickLinks__Item">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="QuickLinks__Link"
                        >
                          {link.name}
                        </a>
                        <div className="QuickLinks__Actions">
                          <button
                            onClick={() => startEditingLink(index)}
                            className="QuickLinks__EditButton"
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => deleteQuickLink(index)}
                            className="QuickLinks__DeleteButton"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    {!isAddingLink && editingLinkIndex === null && (
                      <button
                        className="QuickLinks__Item"
                        onClick={() => setIsAddingLink(true)}
                      >
                        +
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="Todo__Container">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTodo();
                  }
                }}
                placeholder={`Add your tasks to ${currentFolderName}...`}
                className="TextBox"
              />

              {filteredTodos.length === 0 ? (
                <div className="Empty">This folder is empty</div>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  <StrictModeDroppable droppableId="todos">
                    {(provided) => (
                      <ul
                        className="Todolist"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {filteredTodos.map((todo, index) => (
                          <Draggable
                            key={`todo-${index}`}
                            draggableId={`todo-${index}`}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`Todo ${
                                  todo.completed ? "Todo--checked" : ""
                                } ${
                                  snapshot.isDragging ? "Todo--dragging" : ""
                                }`}
                              >
                                {editingIndex === todos.indexOf(todo) ? (
                                  <div className="Todo__Edit-container">
                                    <input
                                      type="text"
                                      value={editText}
                                      onChange={(e) =>
                                        setEditText(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") saveEdit();
                                        if (e.key === "Escape") cancelEdit();
                                      }}
                                      className="Todo__Input"
                                      autoFocus
                                    />
                                    <div className="Todo__Edit-buttons">
                                      <button
                                        onClick={saveEdit}
                                        className="Todo__Save"
                                      >
                                        ✓
                                      </button>
                                      <button
                                        onClick={cancelEdit}
                                        className="Todo__Cancel"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div
                                      className="Todo__Check"
                                      onClick={() =>
                                        toggleTodo(todos.indexOf(todo))
                                      }
                                    >
                                      <i
                                        className={
                                          todo.completed
                                            ? "Todo__Check--checked"
                                            : ""
                                        }
                                      ></i>
                                    </div>
                                    <div
                                      {...provided.dragHandleProps}
                                      className="Todo__Task"
                                      onDoubleClick={() =>
                                        startEditing(todos.indexOf(todo))
                                      }
                                    >
                                      {todo.text}
                                    </div>
                                    <div className="Todo__Actions">
                                      <button
                                        onClick={() =>
                                          startEditing(todos.indexOf(todo))
                                        }
                                        className="Todo__Edit"
                                      >
                                        ✎
                                      </button>
                                      <button
                                        onClick={() =>
                                          removeTodo(todos.indexOf(todo))
                                        }
                                        className="Todo__Delete"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </>
                                )}
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </StrictModeDroppable>
                </DragDropContext>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TodoList;
