import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { budgetExerciseCollectionName } from 'crud/budget_exercise'
import { IBudget, IBudgetExercise, ISubBudget } from "firebaseConfig";
import { BASE_URL } from "utils/api";
import axios from "axios";
import { IPriceResponse } from "../calculation/price";
import type { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { ISpendingResponse } from "../calculation/spending";

interface IBudgetCoin {
    coin: string,
    totalAmount: number,
    totalUsedAmount: number,
    second: {
        secondCoin: string,
        secondTotalAmount: number
        secondTotalUsedAmount: number,
    } | null
}

export interface IBudgetORM extends IBudget {
    totalBudget: number,
    totalUsed: number,
    totalAvailable: number,
    budgetCoins: IBudgetCoin,
    subbudgets: ISubbudgetORM[],
}

export interface ISubbudgetORM extends ISubBudget {
    totalBudget: number,
    totalUsed: number,
    totalAvailable: number,
    budgetCoins: IBudgetCoin,
}

export interface IBudgetExerciseORM extends IBudgetExercise {
    budgets: IBudgetORM[],
    totalBudget: number,
    totalUsed: number,
    totalAvailable: number,
    budgetCoins: IBudgetCoin[],
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IBudgetExerciseORM[]>
) {
    try {
        const parentId = req.query["id"] as string;
        const blockchain = req.query.blockchain as BlockchainType;
        const addresses = req.query["addresses[]"];
        const parsedAddress = typeof addresses === "string" ? [addresses] : addresses;

        if (!parentId || !blockchain || !parsedAddress) throw new Error("unavailable params")

        const snapshots = await adminApp.firestore().collection(budgetExerciseCollectionName).where("parentId", "==", parentId).get();
        let budget_exercises: IBudgetExercise[] = snapshots.docs.map(snapshot => snapshot.data() as IBudgetExercise);

        const prices = await axios.get<IPriceResponse>(BASE_URL + "/api/calculation/price", {
            params: {
                addresses: parsedAddress,
                blockchain: blockchain
            }
        })


        const exercises: IBudgetExerciseORM[] = []

        for (let budget_exercise of budget_exercises) {
            const orm: IBudgetORM[] = [];
            let totalBudgetCoin: IBudgetCoin[] = []

            const budget_snapshots = await adminApp.firestore().collection("budgets").where("parentId", "==", budget_exercise.id).get();
            budget_exercise.budgets = budget_snapshots.docs.map(snapshot => snapshot.data() as IBudget);


            /*Budget Calculation */
            /*Budget Calculation */
            /*Budget Calculation */
            for (let budget of budget_exercise.budgets) {
                let totalBudget: number = 0, totalUsed: number = 0, totalPending: number = 0, totalAvailable: number = 0;
                const spending = await axios.get<ISpendingResponse>("/api/calculation/spending", {
                    params: {
                        addresses: addresses,
                        blockchain: blockchain,
                        txs: budget.txs.map(s => s.hash)
                    }
                })


                totalBudget += ((budget.amount * prices.data.AllPrices[budget.token].price) + ((budget.secondAmount ?? 1) * (budget.secondToken ? prices.data.AllPrices[budget.secondToken].price : 1)));

                let budgetCoin: IBudgetCoin = {
                    coin: budget.token,
                    totalAmount: budget.amount,
                    totalUsedAmount: spending.data.CoinStats?.[0].totalSpending ?? 0,
                    second: budget.secondToken && budget.secondAmount && spending.data.CoinStats?.[1] ? {
                        secondTotalAmount: budget.secondAmount,
                        secondCoin: budget.secondToken,
                        secondTotalUsedAmount: spending.data.CoinStats[1].totalSpending
                    } : null
                }

                totalBudgetCoin.push(budgetCoin)


                totalUsed += spending.data.TotalSpend;
                totalAvailable += totalBudget - totalUsed;;

                /*Subbudget Calculation */
                /*Subbudget Calculation */
                /*Subbudget Calculation */
                let subbudgets: ISubbudgetORM[] = [];
                for (const subbudget of budget.subbudgets) {
                    let totalBudget: number = 0, totalUsed: number = 0, totalPending: number = 0, totalAvailable: number = 0;
                    const spending = await axios.get<ISpendingResponse>("/api/calculation/spending", {
                        params: {
                            addresses: addresses,
                            blockchain: blockchain,
                            txs: subbudget.txs.map(s => s.hash)
                        }
                    })

                    totalBudget += ((budget.amount * prices.data.AllPrices[budget.token].price) + ((budget.secondAmount ?? 1) * (budget.secondToken ? prices.data.AllPrices[budget.secondToken].price : 1)));

                    let budgetCoin: IBudgetCoin = {
                        coin: subbudget.token,
                        totalAmount: subbudget.amount,
                        totalUsedAmount: spending.data.CoinStats?.[0].totalSpending ?? 0,
                        second: subbudget.secondToken && subbudget.secondAmount && spending.data.CoinStats?.[1] ? {
                            secondTotalAmount: subbudget.secondAmount,
                            secondCoin: subbudget.secondToken,
                            secondTotalUsedAmount: spending.data.CoinStats[1].totalSpending
                        } : null
                    }

                    totalUsed += spending.data.TotalSpend;
                    totalAvailable += totalBudget - totalUsed;;

                    subbudgets.push({
                        ...subbudget,
                        totalBudget: totalBudget,
                        budgetCoins: budgetCoin,
                        totalAvailable: totalAvailable,
                        totalUsed: totalUsed,
                    })
                }
                /*Subbudget Calculation END*/
                /*Subbudget Calculation END*/
                /*Subbudget Calculation END */

                orm.push({
                    ...budget,
                    totalBudget,
                    totalUsed,
                    totalAvailable,
                    budgetCoins: budgetCoin,
                    subbudgets: subbudgets
                })

            }
            /*Budget Calculation END*/
            /*Budget Calculation END*/
            /*Budget Calculation END*/
            

            exercises.push({
                ...budget_exercise,
                budgets: orm,
                totalBudget: orm.reduce((a, c) => c.totalBudget + a, 0),
                totalAvailable: orm.reduce((a, c) => c.totalAvailable + a, 0),
                totalUsed: orm.reduce((a, c) => c.totalUsed + a, 0),
                budgetCoins: totalBudgetCoin.reduce<IBudgetCoin[]>((a, c) => {
                    if (a.some(s => s.coin === c.coin)) {
                        const index = a.findIndex(s => s.coin === c.coin)
                        a[index].totalAmount += c.totalAmount
                        a[index].totalUsedAmount += c.totalUsedAmount
                        if (c.second && a[index].second) {
                            a[index].second!.secondTotalAmount += c.second.secondTotalAmount
                            a[index].second!.secondTotalUsedAmount += c.second.secondTotalUsedAmount
                        }
                    } else {
                        a.push({ ...c })
                    }

                    return a;
                }, [])
            })
        }

        res.status(200).json(exercises)
    } catch (error) {
        res.json(error as any)
        res.status(405).end()
    }
}