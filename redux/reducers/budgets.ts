import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { IBudget, IBudgetExercise, ISubBudget } from "firebaseConfig";
import { IBudgetExerciseORM } from "pages/api/budget";
import { RootState } from "redux/store";

type Init = {
    budget_exercises: IBudgetExercise[]
}
const initial: Init = {
    budget_exercises: []
}

const fetchBudgetExercise = createAsyncThunk<IBudgetExerciseORM>("", async ()=>{
    const res = await axios.get<IBudgetExerciseORM>("/api/budget", {
        params: {
            addresses: [],
            // id: 
        }
    });
    return res.data;
})

const budgetSlice = createSlice({
    name: "budgets",
    initialState: initial,
    reducers: {
        setBudgetExercises: (state: Init, { payload }: { payload: IBudgetExercise[] }) => {
            state.budget_exercises = payload;
        },
        addBudgetExercise: (state: Init, { payload }: { payload: IBudgetExercise }) => {
            state.budget_exercises.push(payload);
        },
        updateBudgetExercise: (state: Init, { payload }: { payload: IBudgetExercise }) => {
            const index = state.budget_exercises.findIndex((budget) => budget.id === payload.id);
            if (index !== -1) {
                state.budget_exercises[index] = payload;
            }
        },
        deleteBudgetExercise: (state: Init, { payload }: { payload: IBudgetExercise }) => {
            const index = state.budget_exercises.findIndex((budget) => budget.id === payload.id);
            if (index !== -1) {
                state.budget_exercises.splice(index, 1);
            }
        },
        addBudget: (state: Init, { payload }: { payload: IBudget }) => {
            const index = state.budget_exercises.findIndex((budget) => budget.id === payload.parentId);
            if (index !== -1) {
                state.budget_exercises[index].budgets.push(payload as any);
            }
        },
        updateBudget: (state: Init, { payload }: { payload: IBudget }) => {
            const index = state.budget_exercises.findIndex((budget) => budget.id === payload.parentId);
            if (index !== -1) {
                const budgetIndex = state.budget_exercises[index].budgets.findIndex((budget) => budget.id === payload.id);
                if (budgetIndex !== -1) {
                    state.budget_exercises[index].budgets[budgetIndex] = payload;
                }
            }
        },
        deleteBudget: (state: Init, { payload }: { payload: IBudget }) => {
            const index = state.budget_exercises.findIndex((budget) => budget.id === payload.parentId);
            if (index !== -1) {
                const budgetIndex = state.budget_exercises[index].budgets.findIndex((budget) => budget.id === payload.id);
                if (budgetIndex !== -1) {
                    state.budget_exercises[index].budgets.splice(budgetIndex, 1);
                }
            }
        },
        addSubBudget: (state: Init, { payload }: { payload: ISubBudget }) => {
            const index = state.budget_exercises.findIndex((budget_exer) => (budget_exer.budgets as IBudget[]).find((budget) => budget.id === payload.parentId));
            if (index !== -1) {
                const budgetIndex = state.budget_exercises[index].budgets.findIndex((budget) => budget.id === payload.parentId);
                if (budgetIndex !== -1) {
                    (state.budget_exercises[index].budgets[budgetIndex] as IBudget).subbudgets.push(payload);
                }
            }
        },
        updateSubBudget: (state: Init, { payload }: { payload: ISubBudget }) => {
            const index = state.budget_exercises.findIndex((budget_exer) => (budget_exer.budgets as IBudget[]).find((budget) => budget.id === payload.parentId));
            if (index !== -1) {
                const budgetIndex = state.budget_exercises[index].budgets.findIndex((budget) => budget.id === payload.parentId);
                if (budgetIndex !== -1) {
                    const subBudgetIndex = (state.budget_exercises[index].budgets[budgetIndex] as IBudget).subbudgets.findIndex((subBudget) => subBudget.id === payload.id);
                    if (subBudgetIndex !== -1) {
                        (state.budget_exercises[index].budgets[budgetIndex] as IBudget).subbudgets[subBudgetIndex] = payload;
                    }
                }
            }
        },
        deleteSubBudget: (state: Init, { payload }: { payload: ISubBudget }) => {
            const index = state.budget_exercises.findIndex((budget_exer) => (budget_exer.budgets as IBudget[]).find((budget) => budget.id === payload.parentId));
            if (index !== -1) {
                const budgetIndex = state.budget_exercises[index].budgets.findIndex((budget) => budget.id === payload.parentId);
                if (budgetIndex !== -1) {
                    const subBudgetIndex = (state.budget_exercises[index].budgets[budgetIndex] as IBudget).subbudgets.findIndex((subBudget) => subBudget.id === payload.id);
                    if (subBudgetIndex !== -1) {
                        (state.budget_exercises[index].budgets[budgetIndex] as IBudget).subbudgets.splice(subBudgetIndex, 1);
                    }
                }
            }
        }
    },
    extraReducers: (builder) => {
        // builder.addCase()
    }
})

export const SelectBudgetExercise = (state: RootState) => state.budgets.budget_exercises;


export const {
    addBudget,
    addBudgetExercise,
    addSubBudget,
    deleteBudget,
    deleteBudgetExercise,
    deleteSubBudget,
    setBudgetExercises,
    updateBudget,
    updateBudgetExercise,
    updateSubBudget
} = budgetSlice.actions;

export default budgetSlice.reducer;