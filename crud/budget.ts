import { FirestoreRead, FirestoreWrite } from "rpcHooks/useFirebase";
import { doc } from "firebase/firestore";
import { db, IBudget } from "firebaseConfig";

export const budgetCollectionName = "budgets"

export const Get_Budget_Ref = (id: string) => doc(db, budgetCollectionName, id);

export const Get_Budget = async (id: string) => {
    const budget = await FirestoreRead<IBudget>(budgetCollectionName, id)
    if (!budget) throw new Error("Individual not found");
    return budget;
}

export const Create_Budget = async (budget: IBudget) => {
    await FirestoreWrite<IBudget>().createDoc(budgetCollectionName, budget.id, {
        amount: budget.amount,
        name: budget.name,
        parentId: budget.parentId,
        secondAmount: budget.secondAmount,
        secondToken: budget.secondToken,
        token: budget.token,
        txs: budget.txs,
        created_at: budget.created_at,
        customPrice: budget.customPrice,
        fiatMoney: budget.fiatMoney,
        secondCustomPrice: budget.secondCustomPrice,
        id: budget.id,
        secondFiatMoney: budget.secondFiatMoney,
        subbudgets: budget.subbudgets,
    });
    return budget;
}

export const Update_Budget = async (budget: IBudget) => {
    await FirestoreWrite<IBudget>().updateDoc(budgetCollectionName, budget.id, {
        amount: budget.amount,
        name: budget.name,
        parentId: budget.parentId,
        secondAmount: budget.secondAmount,
        secondToken: budget.secondToken,
        token: budget.token,
        txs: budget.txs,
        created_at: budget.created_at,
        customPrice: budget.customPrice,
        fiatMoney: budget.fiatMoney,
        secondCustomPrice: budget.secondCustomPrice,
        id: budget.id,
        secondFiatMoney: budget.secondFiatMoney,
        subbudgets: budget.subbudgets,
    });
    return budget;
}

export const Delete_Budget = async (budget: IBudget) => {
    await FirestoreWrite<IBudget>().deleteDocument(budgetCollectionName, budget.id);
}
