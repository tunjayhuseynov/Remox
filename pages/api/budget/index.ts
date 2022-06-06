import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { budgetExerciseCollectionName } from 'crud/budget_exercise'
import { IBudget, IBudgetExercise } from "firebaseConfig";
import { BlockChainTypes } from "redux/reducers/network";
import { AltCoins } from "types";
import { BASE_URL } from "utils/api";
import axios from "axios";
import { IPriceResponse } from "../calculation/price";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    try {
        const parentId = req.query["id"] as string;
        const blockchain = req.query.blockchain as BlockChainTypes;
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

        for (let budget_exercise of budget_exercises) {
            let totalBudget: number = 0, totalUsed: number = 0, totalPending: number = 0, totalAvailable: number = 0;
            let coinStats: {
                coin: AltCoins,
                totalAmount: number,
                usedAmount: number,
                pendingAmount: number,
                availableAmount: number
            }[] = []

            const budget_snapshots = await adminApp.firestore().collection("budgets").where("parentId", "==", budget_exercise.id).get();
            budget_exercise.budgets = budget_snapshots.docs.map(snapshot => snapshot.data() as IBudget);

            for (let budget of budget_exercise.budgets) {


                totalBudget += ((budget.amount * prices.data.AllPrices[budget.token].price) + ((budget.secondAmount ?? 1) * (budget.secondToken ? prices.data.AllPrices[budget.secondToken].price : 1)));
                // totalUsed += users.length;
                // totalPending += budget.pendingAmount;
                // totalAvailable += budget.availableAmount;

                // coinStats.push({
                //     coin: budget.token,
                //     totalAmount: budget.amount,
                //     usedAmount: users.length,
                //     pendingAmount: budget.pendingAmount,
                //     availableAmount: budget.availableAmount
                // })
            }


        }

        res.status(200).json({
            budget_exercises
        })
    } catch (error) {
        res.json(error as any)
        res.status(405).end()
    }
}