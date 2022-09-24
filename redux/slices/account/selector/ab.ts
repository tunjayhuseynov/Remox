import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";

export const SelectSelectedAccountAndBudget = createDraftSafeSelector(
    (state: RootState) => state.remoxData.selectedAccountAndBudget,
    (selectedAccountAndBudget) => selectedAccountAndBudget
);
