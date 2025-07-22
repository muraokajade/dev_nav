import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/useAuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>

      <AuthProvider>
        <App />
      </AuthProvider>
  </React.StrictMode>
);
