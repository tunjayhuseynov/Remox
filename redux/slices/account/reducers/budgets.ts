import { IBudget, IBudgetTX, ISubBudget } from "firebaseConfig";
import { IBudgetExerciseORM, IBudgetORM, ISubbudgetORM } from "pages/api/budget/index.api";
import { AltCoins } from "types";
import { DecimalConverter } from "utils/api";
import { generatePriceCalculation } from "utils/const";
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
            state.budgetExercises[index].budgetCoins.push(payload.budgetCoins)
            state.budgetExercises[index].budgets.push(payload as any);
        }
    },
    updateBudget: (state: IRemoxData, { payload }: { payload: IBudgetORM }) => {
        const index = state.budgetExercises.findIndex((budget) => budget.id === payload.parentId);
        if (index !== -1) {
            state.budgetExercises[index].budgetCoins = state.budgetExercises[index].budgetCoins.map((budgetCoin) => {
                if (budgetCoin.id === payload.budgetCoins.id) {
                    return payload.budgetCoins;
                }
                return budgetCoin;
            })
            const budgetIndex = state.budgetExercises[index].budgets.findIndex((budget) => budget.id === payload.id);
            if (budgetIndex !== -1) {
                state.budgetExercises[index].budgets[budgetIndex] = payload;
            }
        }
    },
    deleteBudget: (state: IRemoxData, { payload }: { payload: IBudgetORM }) => {
        const index = state.budgetExercises.findIndex((budget) => budget.id === payload.parentId);
        if (index !== -1) {
            state.budgetExercises[index].budgetCoins = state.budgetExercises[index].budgetCoins.filter((budgetCoin) => budgetCoin.id !== payload.budgetCoins.id);
            const budgetIndex = state.budgetExercises[index].budgets.findIndex((budget) => budget.id === payload.id);
            if (budgetIndex !== -1) {
                const oldBudget = state.budgetExercises[index].budgets[budgetIndex]
                state.budgetExercises[index].budgets.splice(budgetIndex, 1);
            }
        }
    },
    addTxToBudget: (state: IRemoxData, { payload }: { payload: { tx: IBudgetTX, budget: IBudgetORM, currency: AltCoins, isTxExecuted: boolean, txIndexInCM?: number } }) => {
        const index = state.budgetExercises.findIndex((budget) => budget.id === payload.budget.parentId);
        if (index !== -1) {
            const budgetIndex = state.budgetExercises[index].budgets.findIndex((budget) => budget.id === payload.budget.id);
            if (budgetIndex !== -1) {
                state.budgetExercises[index].budgets[budgetIndex].txs = [...state.budgetExercises[index].budgets[budgetIndex].txs, payload.tx];


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

        if (payload.txIndexInCM != undefined) {

            if (state.cumulativeTransactions[payload.txIndexInCM].budget) {
                state.cumulativeTransactions[payload.txIndexInCM].budget!.txs = [...state.cumulativeTransactions[payload.txIndexInCM].budget!.txs, payload.tx]
            } else {
                state.cumulativeTransactions[payload.txIndexInCM].budget = {
                    ...payload.budget,
                    txs: [payload.tx]
                }
            }
        }
    },
    chageTxToExecutedInBudget: (state: IRemoxData, { payload }: { payload: { tx: IBudgetTX, budget: IBudgetORM, currency: AltCoins } }) => {
        const index = state.budgetExercises.findIndex((budget) => budget.id === payload.budget.parentId);
        if (index !== -1) {
            const budgetIndex = state.budgetExercises[index].budgets.findIndex((budget) => budget.id === payload.budget.id);
            if (budgetIndex !== -1) {
                state.budgetExercises[index].budgets[budgetIndex].txs = [...state.budgetExercises[index].budgets[budgetIndex].txs, payload.tx];


                if (payload.currency.symbol.toLowerCase() === state.budgetExercises[index].budgets[budgetIndex].budgetCoins.coin.toLowerCase()) {
                    state.budgetExercises[index].budgets[budgetIndex].budgetCoins = {
                        ...state.budgetExercises[index].budgets[budgetIndex].budgetCoins,
                        totalAmount: state.budgetExercises[index].budgets[budgetIndex].budgetCoins.totalAmount,
                        totalPending: state.budgetExercises[index].budgets[budgetIndex].budgetCoins.totalPending -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                        totalUsedAmount: state.budgetExercises[index].budgets[budgetIndex].budgetCoins.totalUsedAmount += ((DecimalConverter(payload.tx.amount, payload.currency.decimals)))
                    }
                }
                const second = state.budgetExercises[index].budgets[budgetIndex].budgetCoins?.second;
                if (second && payload.currency.symbol.toLowerCase() === second.secondCoin.toLowerCase()) {
                    state.budgetExercises[index].budgets[budgetIndex].budgetCoins = {
                        ...state.budgetExercises[index].budgets[budgetIndex].budgetCoins,
                        second: second ? {
                            ...second,
                            secondTotalAmount: second.secondTotalAmount,
                            secondTotalPending: second.secondTotalPending -= ((DecimalConverter(payload.tx.amount, payload.currency.decimals))),
                            secondTotalUsedAmount: second.secondTotalUsedAmount += ((DecimalConverter(payload.tx.amount, payload.currency.decimals)))
                        } : null
                    }
                }
            }
        }
    },
    removeTxFromBudget: (state: IRemoxData, { payload }: { payload: { tx: IBudgetTX, budget: IBudgetORM, currency: AltCoins, isTxExecuted: boolean, txIndexInCM?: number } }) => {
        const index = state.budgetExercises.findIndex((budget) => budget.id === payload.budget.parentId);
        if (index !== -1) {
            const budgetIndex = state.budgetExercises[index].budgets.findIndex((budget) => budget.id === payload.budget.id);
            if (budgetIndex !== -1) {
                const budgetCoins = state.budgetExercises[index].budgets[budgetIndex].budgetCoins;
                state.budgetExercises[index].budgets[budgetIndex].txs = state.budgetExercises[index].budgets[budgetIndex].txs
                    .filter(s => s.contractAddress.toLowerCase() !== payload.tx.contractAddress.toLowerCase() && s.hashOrIndex.toLowerCase() !== payload.tx.hashOrIndex.toLowerCase());

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

        if (payload.txIndexInCM != undefined) {
            // console.log("payload.txIndexInCM", payload.txIndexInCM, payload)
            if (state.cumulativeTransactions[payload.txIndexInCM].budget) {
                state.cumulativeTransactions[payload.txIndexInCM].budget!.txs =
                    [...state.cumulativeTransactions[payload.txIndexInCM].budget!.txs.filter(s => s.contractAddress.toLowerCase() !== payload.tx.contractAddress.toLowerCase() && s.hashOrIndex.toLowerCase() !== payload.tx.hashOrIndex.toLowerCase())]
            } else {
                state.cumulativeTransactions[payload.txIndexInCM].budget = {
                    ...payload.budget,
                    txs: []
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

                    state.budgetExercises[index].budgets[budgetIndex].txs = [...state.budgetExercises[index].budgets[budgetIndex].txs, payload.tx];


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

                    state.budgetExercises[index].budgets[budgetIndex].txs = state.budgetExercises[index].budgets[budgetIndex].txs
                        .filter(s => s.contractAddress.toLowerCase() !== payload.tx.contractAddress.toLowerCase() && s.hashOrIndex.toLowerCase() !== payload.tx.hashOrIndex.toLowerCase());;

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