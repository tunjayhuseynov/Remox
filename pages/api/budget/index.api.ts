import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { budgetExerciseCollectionName } from 'crud/budget_exercise'
import { IBudget, IBudgetExercise, ISubBudget } from "firebaseConfig";
import { BASE_URL } from "utils/api";
import axios from "axios";
import { IPriceResponse } from "../calculation/price.api";
import { BlockchainType } from "types/blockchains";
import { CalculateBudget } from "./budgetCal";

const CeloTerminal = import("rpcHooks/ABI/CeloTerminal.json")

export interface IBudgetCoin {
    coin: string,
    totalAmount: number,
    totalPending: number,
    totalUsedAmount: number,
    second: {
        secondCoin: string,
        secondTotalPending: number,
        secondTotalAmount: number
        secondTotalUsedAmount: number,
    } | null
}

export interface IBudgetORM extends IBudget {
    totalBudget: number,
    totalUsed: number,
    totalPending: number,
    totalAvailable: number,
    budgetCoins: IBudgetCoin,
    subbudgets: ISubbudgetORM[],
}

export interface ISubbudgetORM extends ISubBudget {
    totalBudget: number,
    totalUsed: number,
    totalPending: number,
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
        const blockchain = req.query.blockchain as BlockchainType['name'];
        const addresses = req.query["addresses[]"];
        const parsedAddress = typeof addresses === "string" ? [addresses] : addresses;

        if (!addresses) return res.status(200).json([]);
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
            let blockchainType = budget_exercise.blockchain;

            const budget_snapshots = await adminApp.firestore().collection("budgets").where("parentId", "==", budget_exercise.id).get();
            budget_exercise.budgets = budget_snapshots.docs.map(snapshot => snapshot.data() as IBudget);

            /*Budget Calculation */
            /*Budget Calculation */
            /*Budget Calculation */
            const budgetResulst = await Promise.all(budget_exercise.budgets.map(budget => CalculateBudget(budget, parentId, parsedAddress, blockchain, blockchainType, prices.data)))
            budgetResulst.forEach(budget => {
                orm.push(budget.orm)
                totalBudgetCoin.push(budget.totalBudgetCoin)
            })
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
        console.log(error)
        res.status(500).json({ message: (error as any).message } as any)
    }
}