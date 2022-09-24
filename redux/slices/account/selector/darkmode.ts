import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";

// Dark Mode
export const SelectDarkMode = createDraftSafeSelector(
    (state: RootState) => state.remoxData.darkMode,
    (darkMode) => darkMode
);
