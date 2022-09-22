import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { IBudgetORM } from "pages/api/budget/index.api";
import { RootState } from "redux/store";

export const SelectBudgetExercises = createDraftSafeSelector(
    (state: RootState) => state.remoxData.budgetExercises,
    (budgets) => budgets
  );
  
  export const SelectAllBudgets = createDraftSafeSelector(
    (state: RootState) => state.remoxData.budgetExercises,
    (budgets) =>
      budgets.reduce<IBudgetORM[]>((a, c) => {
        a.push(...c.budgets);
        return a;
      }, [])
  );
  