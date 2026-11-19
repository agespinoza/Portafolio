import { createContext, useContext } from "react";

export const LanguageContext = createContext("en");

export function useLanguage() {
  return useContext(LanguageContext);
}
