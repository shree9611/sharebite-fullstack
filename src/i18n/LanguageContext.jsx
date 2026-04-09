import React, { createContext, useContext, useMemo, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext({
  language: "English",
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("sharebite_lang") || "English"
  );

  const value = useMemo(() => {
    const dict = translations[language] || translations.English;
    const t = (key) => dict[key] || key;
    return { language, setLanguage, t };
  }, [language]);

  const handleSetLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("sharebite_lang", lang);
  };

  return (
    <LanguageContext.Provider
      value={{ ...value, setLanguage: handleSetLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
