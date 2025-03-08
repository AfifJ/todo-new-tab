import React from "react";
import { Sidebar } from "../Sidebar";
import { Clock } from "../Clock";
import { QuickLinks } from "../QuickLinks";
import { TodoList } from "../TodoList";
import { useAppContext } from "../../context/AppContext";
import { useFaviconBadge } from "../../hooks/useFaviconBadge";

export function Layout() {
  const { todos, currentFolder } = useAppContext();
  
  // Count uncompleted todos in current folder for the favicon badge
  const uncompletedCount = todos.filter(
    todo => todo.folderId === currentFolder && !todo.completed
  ).length;
  
  // Use the favicon badge hook
  useFaviconBadge(uncompletedCount);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="max-w-2xl mx-auto">
          <Clock />
          <QuickLinks />
          <TodoList />
        </div>
      </div>
    </div>
  );
}
