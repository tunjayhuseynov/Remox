import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { IBudget, IBudgetExercise, ISubBudget } from "firebaseConfig";
import { IBudgetExerciseORM, IBudgetORM } from "pages/api/budget/index.api";
import { RootState } from "redux/store";
import { BlockchainType } from "types/blockchains";

export type IBudgetState = {
    isFetched: boolean;
    budget_exercises: IBudgetExerciseORM[]
}
const initial: IBudgetState = {
    budget_exercises: [],
    isFetched: false
}
interface ThunkType {
    id: string,
    blockchain: BlockchainType["name"],
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
        setBudgetExercises: (state: IBudgetState, { payload }: { payload: IBudgetExerciseORM[] }) => {
            state.budget_exercises = payload;
        },
        addBudgetExercise: (state: IBudgetState, { payload }: { payload: IBudgetExerciseORM }) => {
            state.budget_exercises.push(payload);
        },
        updateBudgetExercise: (state: IBudgetState, { payload }: { payload: IBudgetExerciseORM }) => {
            const index = state.budget_exercises.findIndex((budget) => budget.id === payload.id);
            if (index !== -1) {
                state.budget_exercises[index] = payload;
            }
        },
        deleteBudgetExercise: (state: IBudgetState, { payload }: { payload: IBudgetExerciseORM }) => {
            const index = state.budget_exercises.findIndex((budget) => budget.id === payload.id);
            if (index !== -1) {
                state.budget_exercises.splice(index, 1);
            }
        },
        addBudget: (state: IBudgetState, { payload }: { payload: IBudgetORM }) => {
            const index = state.budget_exercises.findIndex((budget) => budget.id === payload.parentId);
            if (index !== -1) {
                state.budget_exercises[index].budgets.push(payload as any);
                state.budget_exercises[index].totalAvailable += payload.totalAvailable;
                state.budget_exercises[index].totalBudget += payload.totalBudget;
                state.budget_exercises[index].totalUsed += payload.totalUsed;
            }
        },
        updateBudget: (state: IBudgetState, { payload }: { payload: IBudgetORM }) => {
            const index = state.budget_exercises.findIndex((budget) => budget.id === payload.parentId);
            if (index !== -1) {
                const budgetIndex = state.budget_exercises[index].budgets.findIndex((budget) => budget.id === payload.id);
                if (budgetIndex !== -1) {
                    const oldBudget = state.budget_exercises[index].budgets[budgetIndex]
                    state.budget_exercises[index].totalAvailable = - oldBudget.totalAvailable;
                    state.budget_exercises[index].totalBudget = - oldBudget.totalBudget;
                    state.budget_exercises[index].totalUsed = - oldBudget.totalUsed;
                    state.budget_exercises[index].budgets[budgetIndex] = payload;
                    state.budget_exercises[index].totalAvailable += payload.totalAvailable;
                    state.budget_exercises[index].totalBudget += payload.totalBudget;
                    state.budget_exercises[index].totalUsed += payload.totalUsed;
                }
            }
        },
        deleteBudget: (state: IBudgetState, { payload }: { payload: IBudgetORM }) => {
            const index = state.budget_exercises.findIndex((budget) => budget.id === payload.parentId);
            if (index !== -1) {
                const budgetIndex = state.budget_exercises[index].budgets.findIndex((budget) => budget.id === payload.id);
                if (budgetIndex !== -1) {
                    const oldBudget = state.budget_exercises[index].budgets[budgetIndex]
                    state.budget_exercises[index].totalAvailable = - oldBudget.totalAvailable;
                    state.budget_exercises[index].totalBudget = - oldBudget.totalBudget;
                    state.budget_exercises[index].totalUsed = - oldBudget.totalUsed;
                    state.budget_exercises[index].budgets.splice(budgetIndex, 1);
                }
            }
        },
        addSubBudget: (state: IBudgetState, { payload }: { payload: ISubBudget }) => {
            const index = state.budget_exercises.findIndex((budget_exer) => (budget_exer.budgets as IBudget[]).find((budget) => budget.id === payload.parentId));
            if (index !== -1) {
                const budgetIndex = state.budget_exercises[index].budgets.findIndex((budget) => budget.id === payload.parentId);
                if (budgetIndex !== -1) {
                    (state.budget_exercises[index].budgets[budgetIndex] as IBudget).subbudgets.push(payload);
                }
            }
        },
        updateSubBudget: (state: IBudgetState, { payload }: { payload: ISubBudget }) => {
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
        deleteSubBudget: (state: IBudgetState, { payload }: { payload: ISubBudget }) => {
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
            state.isFetched = true;
        })
        builder.addCase(fetchBudgetExercise.pending, (state, action) => {
            state.isFetched = false;
        })
        builder.addCase(fetchBudgetExercise.rejected, (state, action) => {
            state.isFetched = true;
        })
    }
})

export const SelectBudgetExercise = (state: RootState) => state.budgets.budget_exercises;
export const SelectBudgetExerciseStatus = (state: RootState) => state.budgets.isFetched;


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