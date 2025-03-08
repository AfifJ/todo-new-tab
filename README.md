# Todo New Tab Extension

A powerful and customizable Chrome extension that transforms your new tab into a productive Todo management application.

![Todo New Tab Screenshot](screenshot.png)

## Features

- **Time Display**: Digital clock with date display on every new tab
- **Task Management**: Create, edit, complete, and delete tasks
- **Drag and Drop**: Reorder tasks using drag-and-drop functionality
- **Folder Organization**: Categorize your tasks in different folders
- **Quick Links**: Store and access your favorite websites with one click
- **Badge Notifications**: Shows the number of uncompleted tasks in the extension icon
- **Persistent Storage**: All data is saved to Chrome's local storage
- **Responsive Design**: Works seamlessly on both desktop and mobile devices

## Installation

### Local Development

1. Clone this repository:
```bash
git clone https://github.com/yourusername/todo-new-tab.git
cd todo-new-tab
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Build the extension:
```bash
npm run build
```

5. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click on "Load unpacked"
   - Select the `dist` folder from the project directory

### From Chrome Web Store

*Coming soon*

## Usage

### Task Management

- **Add Task**: Type your task in the input field at the top of the todo list and press Enter
- **Complete Task**: Click the checkbox to the left of any task to mark it as completed
- **Edit Task**: Double-click on any task or click the edit (pencil) icon to modify it
- **Delete Task**: Click the delete (X) icon to remove a task
- **Reorder Tasks**: Drag and drop to reorder tasks within a folder

### Folder Management

- **Create Folder**: Click the "+" button in the sidebar and enter a folder name
- **Switch Folders**: Click on any folder in the sidebar to view tasks in that folder
- **Edit Folder**: Click the edit icon next to a folder name to rename it
- **Delete Folder**: Click the delete icon to remove a folder (and all its tasks)

### Quick Links

- **Add Link**: Click the "+" icon in the Quick Links grid
- **Use Link**: Click on any quick link to open the website in a new tab
- **Edit Link**: Hover over a link and click the edit icon to modify it
- **Delete Link**: Hover over a link and click the delete icon to remove it

## Architecture

The application is built with a modern front-end stack and follows a component-based architecture:

- **App.jsx**: Main component that manages state and renders the UI
- **StrictModeDroppable**: Wrapper for the Droppable component to work with React StrictMode
- **State Management**: React useState and useEffect for managing application state
- **Storage**: Chrome Storage API for persistent data
- **UI Components**: Folders sidebar, Todo list, and Quick Links grid

## Technologies Used

- **React**: UI library for building the interface
- **react-beautiful-dnd**: For drag and drop functionality
- **Chrome Storage API**: For persistent data across sessions
- **TailwindCSS**: For styling and responsive design
- **Vite**: Build tool for fast development and optimized production builds

## Project Structure
