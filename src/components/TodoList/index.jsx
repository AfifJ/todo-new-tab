import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useAppContext } from "../../context/AppContext";

// StrictMode compatibility wrapper
const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);
  React.useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) return null;
  return <Droppable {...props}>{children}</Droppable>;
};

export function TodoList() {
  const {
    todos,
    filteredTodos,
    currentFolderName,
    addTodo,
    toggleTodo,
    updateTodo,
    removeTodo,
    setTodos,
    currentFolder
  } = useAppContext();

  const [newTodo, setNewTodo] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");

  const handleAddTodo = () => {
    addTodo(newTodo);
    setNewTodo("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditText(todos[index].text);
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      updateTodo(editingIndex, editText);
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
    
    // Create mapping from visual index to actual todos array index
    const todoIndices = todos
      .map((todo, index) => ({ index, folderId: todo.folderId }))
      .filter(item => item.folderId === currentFolder)
      .map(item => item.index);
      
    // Get the actual source and destination indices
    const sourceIndex = todoIndices[result.source.index];
    const destinationIndex = todoIndices[result.destination.index];
    
    // Create a new array and move the item
    const reorderedTodos = [...todos];
    const [removedTodo] = reorderedTodos.splice(sourceIndex, 1);
    reorderedTodos.splice(destinationIndex, 0, removedTodo);
    
    // Update the state with the new order
    setTodos(reorderedTodos);
  };

  return (
    <div className="Todo__Container">
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Add your tasks to ${currentFolderName}...`}
        className="TextBox"
      />

      {filteredTodos.length === 0 ? (
        <div className="text-center text-base py-8">This folder is empty</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <StrictModeDroppable droppableId="todos">
            {(provided) => (
              <ul
                className="Todolist"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {filteredTodos.map((todo, index) => {
                  // Find the actual index in the todos array
                  const actualIndex = todos.findIndex(t => t === todo);
                  
                  return (
                    <Draggable
                      key={`todo-${index}`}
                      draggableId={`todo-${index}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`Todo text-base ${
                            todo.completed ? "Todo--checked" : ""
                          } ${snapshot.isDragging ? "Todo--dragging" : ""}`}
                        >
                          {editingIndex === actualIndex ? (
                            <div className="Todo__Edit-container">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
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
                                onClick={() => toggleTodo(actualIndex)}
                              >
                                <i className={todo.completed ? "Todo__Check--checked" : ""} />
                              </div>
                              <div
                                {...provided.dragHandleProps}
                                className="Todo__Task"
                                onDoubleClick={() => startEditing(actualIndex)}
                              >
                                {todo.text}
                              </div>
                              <div className="Todo__Actions">
                                <button
                                  onClick={() => startEditing(actualIndex)}
                                  className="Todo__Edit"
                                >
                                  ✎
                                </button>
                                <button
                                  onClick={() => removeTodo(actualIndex)}
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
                  );
                })}
                {provided.placeholder}
              </ul>
            )}
          </StrictModeDroppable>
        </DragDropContext>
      )}
    </div>
  );
}
