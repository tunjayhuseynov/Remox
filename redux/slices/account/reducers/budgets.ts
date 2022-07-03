import { IBudget, IBudgetTX, ISubBudget } from "firebaseConfig";
import { IBudgetExerciseORM, IBudgetORM, ISubbudgetORM } from "pages/api/budget";
import { IuseCurrency } from "rpcHooks/useCurrency";
import { IRemoxData } from "../remoxData";

export default {
    setBudgetExercises: (state: IRemoxData, { payload }: { payload: IBudgetExerciseORM[] }) => {
        state.budgetExercises = payload;
    },
    addBudgetExercise: (state: IRemoxData, { payload }: { payload: IBudgetExerciseORM }) => {
        state.budgetExercises.push(payload);
    },
    updateBudgetExercise: (state: IRemoxData, { payload }: { payload: IBudgetExerciseORM }) => {
        const index = state.budgetExercises.findIndex((budget) => budget.id === payload.id);
        if (index !== -1) {
            state.budgetExercises[index] = payload;
        }
    },
    deleteBudgetExercise: (state: IRemoxData, { payload }: { payload: IBudgetExerciseORM }) => {
        const index = state.budgetExercises.findIndex((budget) => budget.id === payload.id);
        if (index !== -1) {
            state.budgetExercises.splice(index, 1);
        }
    },
    addBudget: (state: IRemoxData, { payload }: { payload: IBudgetORM }) => {
        const index = state.budgetExercises.findIndex((budget) => budget.id === payload.parentId);
        if (index !== -1) {
            state.budgetExercises[index].budgets.push(payload as any);
            state.budgetExercises[index].totalAvailable += payload.totalAvailable;
            state.budgetExercises[index].totalBudget += payload.totalBudget;
            state.budgetExercises[index].totalUsed += payload.totalUsed;
        }
    },
    updateBudget: (state: IRemoxData, { payload }: { payload: IBudgetORM }) => {
        const index = state.budgetExercises.findIndex((budget) => budget.id === payload.parentId);
        if (index !== -1) {
            const budgetIndex = state.budgetExercises[index].budgets.findIndex((budget) => budget.id === payload.id);
            if (budgetIndex !== -1) {
                const oldBudget = state.budgetExercises[index].budgets[budgetIndex]
                state.budgetExercises[index].totalAvailable = - oldBudget.totalAvailable;
                state.budgetExercises[index].totalBudget = - oldBudget.totalBudget;
                state.budgetExercises[index].totalUsed = - oldBudget.totalUsed;
                state.budgetExercises[index].budgets[budgetIndex] = payload;
                state.budgetExercises[index].totalAvailable += payload.totalAvailable;
                state.budgetExercises[index].totalBudget += payload.totalBudget;
                state.budgetExercises[index].totalUsed += payload.totalUsed;
            }
        }
    },
    deleteBudget: (state: IRemoxData, { payload }: { payload: IBudgetORM }) => {
        const index = state.budgetExercises.findIndex((budget) => budget.id === payload.parentId);
        if (index !== -1) {
            const budgetIndex = state.budgetExercises[index].budgets.findIndex((budget) => budget.id === payload.id);
            if (budgetIndex !== -1) {
                const oldBudget = state.budgetExercises[index].budgets[budgetIndex]
                state.budgetExercises[index].totalAvailable = - oldBudget.totalAvailable;
                state.budgetExercises[index].totalBudget = - oldBudget.totalBudget;
                state.budgetExercises[index].totalUsed = - oldBudget.totalUsed;
                state.budgetExercises[index].budgets.splice(budgetIndex, 1);
            }
        }
    },
    addTxToBudget: (state: IRemoxData, { payload }: { payload: { tx: IBudgetTX, budget: IBudgetORM, currency: IuseCurrency } }) => {
        const index = state.budgetExercises.findIndex((budget) => budget.id === payload.budget.parentId);
        if (index !== -1) {
            const budgetIndex = state.budgetExercises[index].budgets.findIndex((budget) => budget.id === payload.budget.id);
            if (budgetIndex !== -1) {
                state.budgetExercises[index].budgets[budgetIndex].txs = [...state.budgetExercises[index].budgets[budgetIndex].txs, payload.tx];
                state.budgetExercises[index].budgets[budgetIndex].totalAvailable -= (payload.tx.amount * payload.currency.price);
                state.budgetExercises[index].budgets[budgetIndex].totalUsed += (payload.tx.amount * payload.currency.price);
                state.budgetExercises[index].totalAvailable -= (payload.tx.amount * payload.currency.price);
                state.budgetExercises[index].totalUsed += (payload.tx.amount * payload.currency.price);
            }
        }
    },
    addSubBudget: (state: IRemoxData, { payload }: { payload: ISubbudgetORM }) => {
        const index = state.budgetExercises.findIndex((budget_exer) => (budget_exer.budgets as IBudget[]).find((budget) => budget.id === payload.parentId));
        if (index !== -1) {
            const budgetIndex = state.budgetExercises[index].budgets.findIndex((budget) => budget.id === payload.parentId);
            if (budgetIndex !== -1) {
                state.budgetExercises[index].budgets[budgetIndex].subbudgets.push(payload);
            }
        }
    },
    addTxToSubbudget: (state: IRemoxData, { payload }: { payload: { tx: IBudgetTX, subbudget: ISubbudgetORM, currency: IuseCurrency } }) => {
        const index = state.budgetExercises.findIndex((budget_exer) => (budget_exer.budgets as IBudget[]).find((budget) => budget.id === payload.subbudget.parentId));
        if (index !== -1) {
            const budgetIndex = state.budgetExercises[index].budgets.findIndex((budget) => budget.id === payload.subbudget.parentId);
            if (budgetIndex !== -1) {
                const subBudgetIndex = (state.budgetExercises[index].budgets[budgetIndex] as IBudget).subbudgets.findIndex((subBudget) => subBudget.id === payload.subbudget.id);
                if (subBudgetIndex !== -1) {
                    state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].totalAvailable -= payload.tx.amount * payload.currency.price;
                    state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].totalUsed += payload.tx.amount * payload.currency.price;

                    state.budgetExercises[index].budgets[budgetIndex].txs = [...state.budgetExercises[index].budgets[budgetIndex].txs, payload.tx];
                    state.budgetExercises[index].budgets[budgetIndex].totalAvailable -= (payload.tx.amount * payload.currency.price);
                    state.budgetExercises[index].budgets[budgetIndex].totalUsed += (payload.tx.amount * payload.currency.price);

                    state.budgetExercises[index].totalAvailable -= (payload.tx.amount * payload.currency.price);
                    state.budgetExercises[index].totalUsed += (payload.tx.amount * payload.currency.price);
                }
            }
        }
    },
    updateSubBudget: (state: IRemoxData, { payload }: { payload: ISubbudgetORM }) => {
        const index = state.budgetExercises.findIndex((budget_exer) => (budget_exer.budgets as IBudget[]).find((budget) => budget.id === payload.parentId));
        if (index !== -1) {
            const budgetIndex = state.budgetExercises[index].budgets.findIndex((budget) => budget.id === payload.parentId);
            if (budgetIndex !== -1) {
                const subBudgetIndex = (state.budgetExercises[index].budgets[budgetIndex] as IBudget).subbudgets.findIndex((subBudget) => subBudget.id === payload.id);
                if (subBudgetIndex !== -1) {
                    state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex] = payload;
                }
            }
        }
    },
    deleteSubBudget: (state: IRemoxData, { payload }: { payload: ISubbudgetORM }) => {
        const index = state.budgetExercises.findIndex((budget_exer) => (budget_exer.budgets as IBudget[]).find((budget) => budget.id === payload.parentId));
        if (index !== -1) {
            const budgetIndex = state.budgetExercises[index].budgets.findIndex((budget) => budget.id === payload.parentId);
            if (budgetIndex !== -1) {
                const subBudgetIndex = (state.budgetExercises[index].budgets[budgetIndex] as IBudget).subbudgets.findIndex((subBudget) => subBudget.id === payload.id);
                if (subBudgetIndex !== -1) {
                    state.budgetExercises[index].budgets[budgetIndex].subbudgets.splice(subBudgetIndex, 1);
                }
            }
        }
    }
}