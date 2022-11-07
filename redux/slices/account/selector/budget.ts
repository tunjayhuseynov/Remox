import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { IBudgetORM } from "pages/api/budget/index.api";
import { RootState } from "redux/store";
import { GetTime } from "utils";

export const SelectBudgetExercises = createDraftSafeSelector(
  (state: RootState) => state.remoxData.budgetExercises,
  (budgets) => budgets
);

export const SelectAllBudgets = createDraftSafeSelector(
  (state: RootState) => state.remoxData.budgetExercises,
  (budgets) =>
    budgets.reduce<IBudgetORM[]>((a, c) => {
      if (c.from < GetTime() && c.to > GetTime()) {
        a.push(...c.budgets);
      }
      return a;
    }, [])
);
