import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { IBudget, IBudgetExercise, ISubBudget } from "firebaseConfig";
import { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { IBudgetExerciseORM, IBudgetORM } from "pages/api/budget";
import { RootState } from "redux/store";

type Init = {
    isDone: boolean;
    budget_exercises: IBudgetExerciseORM[]
}
const initial: Init = {
    budget_exercises: [],
    isDone: false
}
interface ThunkType {
    id: string,
    blockchain: BlockchainType,
    addresses: string[]
}

export const fetchBudgetExercise = createAsyncThunk<IBudgetExerciseORM[], ThunkType>("budgets/fetchBudget", async (props: ThunkType) => {
    const res = await axios.get<IBudgetExerciseORM[]>("/api/budget", {
        params: {
            id: props.id,
            addresses: props.addresses,
            blockchain: props.blockchain
            // id: 
        }
    });
    return res.data;
})

const budgetSlice = createSlice({
    name: "budgets",
    initialState: initial,
    reducers: {
        setBudgetExercises: (state: Init, { payload }: { payload: IBudgetExerciseORM[] }) => {
            state.budget_exercises = payload;
        },
        addBudgetExercise: (state: Init, { payload }: { payload: IBudgetExerciseORM }) => {
            state.budget_exercises.push(payload);
        },
        updateBudgetExercise: (state: Init, { payload }: { payload: IBudgetExerciseORM }) => {
            const index = state.budget_exercises.findIndex((budget) => budget.id === payload.id);
            if (index !== -1) {
                state.budget_exercises[index] = payload;
            }
        },
        deleteBudgetExercise: (state: Init, { payload }: { payload: IBudgetExerciseORM }) => {
            const index = state.budget_exercises.findIndex((budget) => budget.id === payload.id);
            if (index !== -1) {
                state.budget_exercises.splice(index, 1);
            }
        },
        addBudget: (state: Init, { payload }: { payload: IBudgetORM }) => {
            const index = state.budget_exercises.findIndex((budget) => budget.id === payload.parentId);
            if (index !== -1) {
                state.budget_exercises[index].budgets.push(payload as any);
            }
        },
        updateBudget: (state: Init, { payload }: { payload: IBudgetORM }) => {
            const index = state.budget_exercises.findIndex((budget) => budget.id === payload.parentId);
            if (index !== -1) {
                const budgetIndex = state.budget_exercises[index].budgets.findIndex((budget) => budget.id === payload.id);
                if (budgetIndex !== -1) {
                    state.budget_exercises[index].budgets[budgetIndex] = payload;
                }
            }
        },
        deleteBudget: (state: Init, { payload }: { payload: IBudgetORM }) => {
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
        builder.addCase(fetchBudgetExercise.fulfilled, (state, action) => {
            state.budget_exercises = action.payload;
            state.isDone = true;
        })
        builder.addCase(fetchBudgetExercise.pending, (state, action) => {
            state.isDone = false;
        })
        builder.addCase(fetchBudgetExercise.rejected, (state, action) => {
            state.isDone = true;
        })
    }
})

export const SelectBudgetExercise = (state: RootState) => state.budgets.budget_exercises;
export const SelectBudgetExerciseStatus = (state: RootState) => state.budgets.isDone;


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