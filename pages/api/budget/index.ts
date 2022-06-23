import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { budgetExerciseCollectionName } from 'crud/budget_exercise'
import { IBudget, IBudgetExercise } from "firebaseConfig";
import { AltCoins } from "types";
import { BASE_URL } from "utils/api";
import axios from "axios";
import { IPriceResponse } from "../calculation/price";
import type { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { ISpendingResponse } from "../calculation/spending";


interface IBudgetORM extends IBudget {
    totalBudget: number,
    totalUsed: number,
    totalAvailable: number,
}

export interface IBudgetExerciseORM extends IBudgetExercise {
    budgets: IBudgetORM[]
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
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
            let totalBudget: number = 0, totalUsed: number = 0, totalPending: number = 0, totalAvailable: number = 0;
            let coinStats: {
                coin: string,
                totalAmount: number,
                usedAmount: number,
                pendingAmount: number,
                availableAmount: number
            }[] = []

            const budget_snapshots = await adminApp.firestore().collection("budgets").where("parentId", "==", budget_exercise.id).get();
            budget_exercise.budgets = budget_snapshots.docs.map(snapshot => snapshot.data() as IBudget);


            for (let budget of budget_exercise.budgets) {
                const spending = await axios.get<ISpendingResponse>("/api/calculation/spending", {
                    params: {
                        addresses: "",
                        blockchain: blockchain,
                        txs: budget.txs
                    }
                })


                totalBudget += ((budget.amount * prices.data.AllPrices[budget.token].price) + ((budget.secondAmount ?? 1) * (budget.secondToken ? prices.data.AllPrices[budget.secondToken].price : 1)));
                totalUsed += spending.data.TotalSpend;
                // totalPending += totalBudget - totalUsed;
                totalAvailable += totalBudget - totalUsed;;
                orm.push({
                    ...budget,
                    totalBudget,
                    totalUsed,
                    totalAvailable,
                })
                // coinStats.push({
                //     coin: budget.token,
                //     totalAmount: budget.amount,
                //     usedAmount: budget,
                //     pendingAmount: budget.pendingAmount,
                //     availableAmount: budget.availableAmount
                // })
            }
            exercises.push({
                ...budget_exercise,
                budgets: orm
            })
        }
        
        res.status(200).json({
            exercises
        })
    } catch (error) {
        res.json(error as any)
        res.status(405).end()
    }
}