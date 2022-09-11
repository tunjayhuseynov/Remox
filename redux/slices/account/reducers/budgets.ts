import { IBudget, IBudgetTX, ISubBudget } from "firebaseConfig";
import { IBudgetExerciseORM, IBudgetORM, ISubbudgetORM } from "pages/api/budget/index.api";
import { AltCoins } from "types";
import { DecimalConverter } from "utils/api";
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
    addTxToBudget: (state: IRemoxData, { payload }: { payload: { tx: IBudgetTX, budget: IBudgetORM, currency: AltCoins, isTxExecuted: boolean } }) => {
        const index = state.budgetExercises.findIndex((budget) => budget.id === payload.budget.parentId);
        if (index !== -1) {
            const budgetIndex = state.budgetExercises[index].budgets.findIndex((budget) => budget.id === payload.budget.id);
            if (budgetIndex !== -1) {
                state.budgetExercises[index].budgets[budgetIndex].txs = [...state.budgetExercises[index].budgets[budgetIndex].txs, payload.tx];
                // state.budgetExercises[index].budgets[budgetIndex].totalBudget -= (payload.tx.amount * payload.currency.priceUSD);
                state.budgetExercises[index].budgets[budgetIndex].totalUsed += (DecimalConverter(payload.tx.amount, payload.currency.decimals) * payload.currency.priceUSD);
                state.budgetExercises[index].totalAvailable -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals) * payload.currency.priceUSD));
                if (payload.isTxExecuted) {
                    state.budgetExercises[index].totalUsed += ((DecimalConverter(payload.tx.amount, payload.currency.decimals) * payload.currency.priceUSD));
                } else {
                    state.budgetExercises[index].totalPending += ((DecimalConverter(payload.tx.amount, payload.currency.decimals) * payload.currency.priceUSD));
                }

                if (payload.currency.symbol.toLowerCase() === state.budgetExercises[index].budgets[budgetIndex].budgetCoins.coin.toLowerCase()) {
                    state.budgetExercises[index].budgets[budgetIndex].budgetCoins = {
                        ...state.budgetExercises[index].budgets[budgetIndex].budgetCoins,
                        totalAmount: state.budgetExercises[index].budgets[budgetIndex].budgetCoins.totalAmount -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                        totalPending: payload.isTxExecuted ?
                            state.budgetExercises[index].budgets[budgetIndex].budgetCoins.totalPending
                            :
                            state.budgetExercises[index].budgets[budgetIndex].budgetCoins.totalPending += ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                        totalUsedAmount: payload.isTxExecuted ?
                            state.budgetExercises[index].budgets[budgetIndex].budgetCoins.totalUsedAmount += ((DecimalConverter(payload.tx.amount, payload.currency.decimals)))
                            :
                            state.budgetExercises[index].budgets[budgetIndex].budgetCoins.totalUsedAmount,
                    }
                }
                const second = state.budgetExercises[index].budgets[budgetIndex].budgetCoins?.second;
                if (second && payload.currency.symbol.toLowerCase() === second.secondCoin.toLowerCase()) {
                    state.budgetExercises[index].budgets[budgetIndex].budgetCoins = {
                        ...state.budgetExercises[index].budgets[budgetIndex].budgetCoins,
                        second: second ? {
                            ...second,
                            secondTotalAmount: second.secondTotalAmount -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                            secondTotalPending: payload.isTxExecuted ?
                                second.secondTotalPending
                                :
                                second.secondTotalPending += ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                            secondTotalUsedAmount: payload.isTxExecuted ?
                                second.secondTotalUsedAmount += ((DecimalConverter(payload.tx.amount, payload.currency.decimals)))
                                :
                                second.secondTotalUsedAmount,
                        } : null
                    }
                }
            }
        }
    },
    removeTxFromBudget: (state: IRemoxData, { payload }: { payload: { tx: IBudgetTX, budget: IBudgetORM, currency: AltCoins, isTxExecuted: boolean } }) => {
        const index = state.budgetExercises.findIndex((budget) => budget.id === payload.budget.parentId);
        if (index !== -1) {
            const budgetIndex = state.budgetExercises[index].budgets.findIndex((budget) => budget.id === payload.budget.id);
            if (budgetIndex !== -1) {
                state.budgetExercises[index].budgets[budgetIndex].txs = state.budgetExercises[index].budgets[budgetIndex].txs
                    .filter(s => s.contractAddress.toLowerCase() !== payload.tx.contractAddress.toLowerCase() && s.hashOrIndex.toLowerCase() !== payload.tx.hashOrIndex.toLowerCase());

                // state.budgetExercises[index].budgets[budgetIndex].totalBudget -= (payload.tx.amount * payload.currency.priceUSD);
                state.budgetExercises[index].budgets[budgetIndex].totalUsed -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD);
                state.budgetExercises[index].totalAvailable += ((DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD);
                if (payload.isTxExecuted) {
                    state.budgetExercises[index].totalUsed -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD);
                } else {
                    state.budgetExercises[index].totalPending -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD);
                }

                if (payload.currency.symbol.toLowerCase() === state.budgetExercises[index].budgets[budgetIndex].budgetCoins.coin.toLowerCase()) {
                    state.budgetExercises[index].budgets[budgetIndex].budgetCoins = {
                        ...state.budgetExercises[index].budgets[budgetIndex].budgetCoins,
                        totalAmount: state.budgetExercises[index].budgets[budgetIndex].budgetCoins.totalAmount += ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                        totalPending: payload.isTxExecuted ?
                            state.budgetExercises[index].budgets[budgetIndex].budgetCoins.totalPending
                            :
                            state.budgetExercises[index].budgets[budgetIndex].budgetCoins.totalPending -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                        totalUsedAmount: payload.isTxExecuted ?
                            state.budgetExercises[index].budgets[budgetIndex].budgetCoins.totalUsedAmount -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals)))
                            :
                            state.budgetExercises[index].budgets[budgetIndex].budgetCoins.totalUsedAmount,
                    }
                }
                const second = state.budgetExercises[index].budgets[budgetIndex].budgetCoins?.second;
                if (second && payload.currency.symbol.toLowerCase() === second.secondCoin.toLowerCase()) {
                    state.budgetExercises[index].budgets[budgetIndex].budgetCoins = {
                        ...state.budgetExercises[index].budgets[budgetIndex].budgetCoins,
                        second: second ? {
                            ...second,
                            secondTotalAmount: second.secondTotalAmount += ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                            secondTotalPending: payload.isTxExecuted ?
                                second.secondTotalPending
                                :
                                second.secondTotalPending -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                            secondTotalUsedAmount: payload.isTxExecuted ?
                                second.secondTotalUsedAmount -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals)))
                                :
                                second.secondTotalUsedAmount,
                        } : null
                    }
                }
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
    addTxToSubbudget: (state: IRemoxData, { payload }: { payload: { tx: IBudgetTX, subbudget: ISubbudgetORM, currency: AltCoins, isTxExecuted: boolean } }) => {
        const index = state.budgetExercises.findIndex((budget_exer) => (budget_exer.budgets as IBudget[]).find((budget) => budget.id === payload.subbudget.parentId));
        if (index !== -1) {
            const budgetIndex = state.budgetExercises[index].budgets.findIndex((budget) => budget.id === payload.subbudget.parentId);
            if (budgetIndex !== -1) {
                const subBudgetIndex = (state.budgetExercises[index].budgets[budgetIndex] as IBudget).subbudgets.findIndex((subBudget) => subBudget.id === payload.subbudget.id);
                if (subBudgetIndex !== -1) {
                    // state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].totalBudget -= payload.tx.amount * payload.currency.priceUSD;
                    state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].totalUsed += (DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD;

                    state.budgetExercises[index].budgets[budgetIndex].txs = [...state.budgetExercises[index].budgets[budgetIndex].txs, payload.tx];
                    state.budgetExercises[index].budgets[budgetIndex].totalAvailable -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD);
                    if (payload.isTxExecuted) {
                        state.budgetExercises[index].budgets[budgetIndex].totalUsed += ((DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD);
                    } else {
                        state.budgetExercises[index].budgets[budgetIndex].totalPending += ((DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD);
                    }

                    state.budgetExercises[index].totalAvailable -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD);
                    if (payload.isTxExecuted) {
                        state.budgetExercises[index].totalUsed += ((DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD);
                    } else {
                        state.budgetExercises[index].totalPending += ((DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD);
                    }

                    if (payload.currency.symbol.toLowerCase() === state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins.coin.toLowerCase()) {
                        state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins = {
                            ...state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins,
                            totalAmount: state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins.totalAmount -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                            totalPending: payload.isTxExecuted ?
                                state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins.totalPending
                                :
                                state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins.totalPending += ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                            totalUsedAmount: payload.isTxExecuted ?
                                state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins.totalUsedAmount += ((DecimalConverter(payload.tx.amount, payload.currency.decimals)))
                                :
                                state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins.totalUsedAmount,
                        }
                    }
                    const second = state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins?.second;
                    if (second && payload.currency.symbol.toLowerCase() === second.secondCoin.toLowerCase()) {
                        state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins = {
                            ...state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins,
                            second: second ? {
                                ...second,
                                secondTotalAmount: second.secondTotalAmount -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                                secondTotalPending: payload.isTxExecuted ?
                                    second.secondTotalPending
                                    :
                                    second.secondTotalPending += ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                                secondTotalUsedAmount: payload.isTxExecuted ?
                                    second.secondTotalUsedAmount += ((DecimalConverter(payload.tx.amount, payload.currency.decimals)))
                                    :
                                    second.secondTotalUsedAmount,
                            } : null
                        }
                    }
                }
            }
        }
    },
    removeTxFromSubbudget: (state: IRemoxData, { payload }: { payload: { tx: IBudgetTX, subbudget: ISubbudgetORM, currency: AltCoins, isTxExecuted: boolean } }) => {
        const index = state.budgetExercises.findIndex((budget_exer) => (budget_exer.budgets as IBudget[]).find((budget) => budget.id === payload.subbudget.parentId));
        if (index !== -1) {
            const budgetIndex = state.budgetExercises[index].budgets.findIndex((budget) => budget.id === payload.subbudget.parentId);
            if (budgetIndex !== -1) {
                const subBudgetIndex = (state.budgetExercises[index].budgets[budgetIndex] as IBudget).subbudgets.findIndex((subBudget) => subBudget.id === payload.subbudget.id);
                if (subBudgetIndex !== -1) {
                    // state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].totalBudget -= payload.tx.amount * payload.currency.priceUSD;
                    state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].totalUsed -= (DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD;

                    state.budgetExercises[index].budgets[budgetIndex].txs = state.budgetExercises[index].budgets[budgetIndex].txs
                        .filter(s => s.contractAddress.toLowerCase() !== payload.tx.contractAddress.toLowerCase() && s.hashOrIndex.toLowerCase() !== payload.tx.hashOrIndex.toLowerCase());;
                    state.budgetExercises[index].budgets[budgetIndex].totalAvailable += ((DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD);
                    if (payload.isTxExecuted) {
                        state.budgetExercises[index].budgets[budgetIndex].totalUsed -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD);
                    } else {
                        state.budgetExercises[index].budgets[budgetIndex].totalPending -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD);
                    }

                    state.budgetExercises[index].totalAvailable += ((DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD);
                    if (payload.isTxExecuted) {
                        state.budgetExercises[index].totalUsed -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD);
                    } else {
                        state.budgetExercises[index].totalPending -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals)) * payload.currency.priceUSD);
                    }

                    if (payload.currency.symbol.toLowerCase() === state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins.coin.toLowerCase()) {
                        state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins = {
                            ...state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins,
                            totalAmount: state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins.totalAmount += ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                            totalPending: payload.isTxExecuted ?
                                state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins.totalPending
                                :
                                state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins.totalPending -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                            totalUsedAmount: payload.isTxExecuted ?
                                state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins.totalUsedAmount -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals)))
                                :
                                state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins.totalUsedAmount,
                        }
                    }
                    const second = state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins?.second;
                    if (second && payload.currency.symbol.toLowerCase() === second.secondCoin.toLowerCase()) {
                        state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins = {
                            ...state.budgetExercises[index].budgets[budgetIndex].subbudgets[subBudgetIndex].budgetCoins,
                            second: second ? {
                                ...second,
                                secondTotalAmount: second.secondTotalAmount += ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                                secondTotalPending: payload.isTxExecuted ?
                                    second.secondTotalPending
                                    :
                                    second.secondTotalPending -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                                secondTotalUsedAmount: payload.isTxExecuted ?
                                    second.secondTotalUsedAmount -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals)))
                                    :
                                    second.secondTotalUsedAmount,
                            } : null
                        }
                    }
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