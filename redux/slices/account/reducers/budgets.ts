import { IBudget, ISubBudget } from "firebaseConfig";
import { IBudgetExerciseORM, IBudgetORM } from "pages/api/budget";
import { IRemoxData } from "../remoxData";

export default {
    setBudgetExercises: (state: IRemoxData, { payload }: { payload: IBudgetExerciseORM[] }) => {
        state.budgetExercises.budget_exercises = payload;
    },
    addBudgetExercise: (state: IRemoxData, { payload }: { payload: IBudgetExerciseORM }) => {
        state.budgetExercises.budget_exercises.push(payload);
    },
    updateBudgetExercise: (state: IRemoxData, { payload }: { payload: IBudgetExerciseORM }) => {
        const index = state.budgetExercises.budget_exercises.findIndex((budget) => budget.id === payload.id);
        if (index !== -1) {
            state.budgetExercises.budget_exercises[index] = payload;
        }
    },
    deleteBudgetExercise: (state: IRemoxData, { payload }: { payload: IBudgetExerciseORM }) => {
        const index = state.budgetExercises.budget_exercises.findIndex((budget) => budget.id === payload.id);
        if (index !== -1) {
            state.budgetExercises.budget_exercises.splice(index, 1);
        }
    },
    addBudget: (state: IRemoxData, { payload }: { payload: IBudgetORM }) => {
        const index = state.budgetExercises.budget_exercises.findIndex((budget) => budget.id === payload.parentId);
        if (index !== -1) {
            state.budgetExercises.budget_exercises[index].budgets.push(payload as any);
            state.budgetExercises.budget_exercises[index].totalAvailable += payload.totalAvailable;
            state.budgetExercises.budget_exercises[index].totalBudget += payload.totalBudget;
            state.budgetExercises.budget_exercises[index].totalUsed += payload.totalUsed;
        }
    },
    updateBudget: (state: IRemoxData, { payload }: { payload: IBudgetORM }) => {
        const index = state.budgetExercises.budget_exercises.findIndex((budget) => budget.id === payload.parentId);
        if (index !== -1) {
            const budgetIndex = state.budgetExercises.budget_exercises[index].budgets.findIndex((budget) => budget.id === payload.id);
            if (budgetIndex !== -1) {
                const oldBudget = state.budgetExercises.budget_exercises[index].budgets[budgetIndex]
                state.budgetExercises.budget_exercises[index].totalAvailable = - oldBudget.totalAvailable;
                state.budgetExercises.budget_exercises[index].totalBudget = - oldBudget.totalBudget;
                state.budgetExercises.budget_exercises[index].totalUsed = - oldBudget.totalUsed;
                state.budgetExercises.budget_exercises[index].budgets[budgetIndex] = payload;
                state.budgetExercises.budget_exercises[index].totalAvailable += payload.totalAvailable;
                state.budgetExercises.budget_exercises[index].totalBudget += payload.totalBudget;
                state.budgetExercises.budget_exercises[index].totalUsed += payload.totalUsed;
            }
        }
    },
    deleteBudget: (state: IRemoxData, { payload }: { payload: IBudgetORM }) => {
        const index = state.budgetExercises.budget_exercises.findIndex((budget) => budget.id === payload.parentId);
        if (index !== -1) {
            const budgetIndex = state.budgetExercises.budget_exercises[index].budgets.findIndex((budget) => budget.id === payload.id);
            if (budgetIndex !== -1) {
                const oldBudget = state.budgetExercises.budget_exercises[index].budgets[budgetIndex]
                state.budgetExercises.budget_exercises[index].totalAvailable = - oldBudget.totalAvailable;
                state.budgetExercises.budget_exercises[index].totalBudget = - oldBudget.totalBudget;
                state.budgetExercises.budget_exercises[index].totalUsed = - oldBudget.totalUsed;
                state.budgetExercises.budget_exercises[index].budgets.splice(budgetIndex, 1);
            }
        }
    },
    addSubBudget: (state: IRemoxData, { payload }: { payload: ISubBudget }) => {
        const index = state.budgetExercises.budget_exercises.findIndex((budget_exer) => (budget_exer.budgets as IBudget[]).find((budget) => budget.id === payload.parentId));
        if (index !== -1) {
            const budgetIndex = state.budgetExercises.budget_exercises[index].budgets.findIndex((budget) => budget.id === payload.parentId);
            if (budgetIndex !== -1) {
                (state.budgetExercises.budget_exercises[index].budgets[budgetIndex] as IBudget).subbudgets.push(payload);
            }
        }
    },
    updateSubBudget: (state: IRemoxData, { payload }: { payload: ISubBudget }) => {
        const index = state.budgetExercises.budget_exercises.findIndex((budget_exer) => (budget_exer.budgets as IBudget[]).find((budget) => budget.id === payload.parentId));
        if (index !== -1) {
            const budgetIndex = state.budgetExercises.budget_exercises[index].budgets.findIndex((budget) => budget.id === payload.parentId);
            if (budgetIndex !== -1) {
                const subBudgetIndex = (state.budgetExercises.budget_exercises[index].budgets[budgetIndex] as IBudget).subbudgets.findIndex((subBudget) => subBudget.id === payload.id);
                if (subBudgetIndex !== -1) {
                    (state.budgetExercises.budget_exercises[index].budgets[budgetIndex] as IBudget).subbudgets[subBudgetIndex] = payload;
                }
            }
        }
    },
    deleteSubBudget: (state: IRemoxData, { payload }: { payload: ISubBudget }) => {
        const index = state.budgetExercises.budget_exercises.findIndex((budget_exer) => (budget_exer.budgets as IBudget[]).find((budget) => budget.id === payload.parentId));
        if (index !== -1) {
            const budgetIndex = state.budgetExercises.budget_exercises[index].budgets.findIndex((budget) => budget.id === payload.parentId);
            if (budgetIndex !== -1) {
                const subBudgetIndex = (state.budgetExercises.budget_exercises[index].budgets[budgetIndex] as IBudget).subbudgets.findIndex((subBudget) => subBudget.id === payload.id);
                if (subBudgetIndex !== -1) {
                    (state.budgetExercises.budget_exercises[index].budgets[budgetIndex] as IBudget).subbudgets.splice(subBudgetIndex, 1);
                }
            }
        }
    }
}