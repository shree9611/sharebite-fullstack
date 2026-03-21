import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { LanguageProvider } from "./i18n/LanguageContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </LanguageProvider>
);
