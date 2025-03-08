import React from "react";
import { AppProvider } from "./context/AppContext";
import { Layout } from "./components/Layout";
import "./index.css";

function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}

export default App;
