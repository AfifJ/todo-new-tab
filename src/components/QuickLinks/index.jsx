import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";

export function QuickLinks() {
  const { quickLinks, addQuickLink, updateQuickLink, deleteQuickLink } = useAppContext();
  
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingLinkIndex, setEditingLinkIndex] = useState(null);
  const [linkInput, setLinkInput] = useState({ name: "", url: "" });

  const handleAddQuickLink = () => {
    if (linkInput.name.trim() && linkInput.url.trim()) {
      addQuickLink(linkInput.name, linkInput.url);
      setLinkInput({ name: "", url: "" });
      setIsAddingLink(false);
    }
  };

  const startEditingLink = (index) => {
    setEditingLinkIndex(index);
    setLinkInput(quickLinks[index]);
  };

  const saveEditLink = () => {
    if (linkInput.name.trim() && linkInput.url.trim() && editingLinkIndex !== null) {
      updateQuickLink(editingLinkIndex, linkInput.name, linkInput.url);
      setLinkInput({ name: "", url: "" });
      setEditingLinkIndex(null);
    }
  };

  const cancelLinkEdit = () => {
    setEditingLinkIndex(null);
    setLinkInput({ name: "", url: "" });
    setIsAddingLink(false);
  };

  // Handle link click for development environment
  const handleQuickLinkClick = (url, e) => {
    // In development, we need to explicitly open the URL
    if (import.meta.env.DEV) {
      e.preventDefault();
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="my-4 QuickLinks ">
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
              onClick={editingLinkIndex !== null ? saveEditLink : handleAddQuickLink}
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
      <div className="QuickLinks__Grid">
        {quickLinks.map((link, index) => (
          <div key={index} className="QuickLinks__Item">
            <a
              href={link.url}
              onClick={(e) => handleQuickLinkClick(link.url, e)}
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
    </div>
  );
}
