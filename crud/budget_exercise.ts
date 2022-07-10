import { FirestoreRead, FirestoreWrite } from "rpcHooks/useFirebase";
import { doc } from "firebase/firestore";
import { db, IBudgetExercise } from "firebaseConfig";
import { Get_Budget, Get_Budget_Ref } from "./budget";
import { Get_Organization, Update_Organization } from "./organization";

export const budgetExerciseCollectionName = "budget_exercises"

export const Get_Budget_Exercise_Ref = (id: string) => doc(db, budgetExerciseCollectionName, id);

export const Get_Budget_Exercise = async (id: string) => {
    const budget_exercise = await FirestoreRead<IBudgetExercise>(budgetExerciseCollectionName, id)
    if (!budget_exercise) throw new Error("Budget Exercise not found");
    const budgets = budget_exercise.budgets.map(async (budget) => await Get_Budget(budget.id))
    budget_exercise.budgets = await Promise.all(budgets)
    return budget_exercise;
}

export const Create_Budget_Exercise = async (budget_exercise: IBudgetExercise) => {
    for (let budget of budget_exercise.budgets) {
        budget = Get_Budget_Ref(budget.id);
    }
    await FirestoreWrite<IBudgetExercise>().createDoc(budgetExerciseCollectionName, budget_exercise.id, budget_exercise);
    if (budget_exercise.parentType === "organization") {
        const parent = await Get_Organization(budget_exercise.parentId);
        (parent.budget_execrises as IBudgetExercise[]).push(budget_exercise);
        await Update_Organization(parent)
    }
    return budget_exercise;
}

export const Update_Budget_Exercise = async (budget_exercise: IBudgetExercise) => {
    let refs = []
    for (let budget of budget_exercise.budgets) {
        refs.push(Get_Budget_Ref(budget.id))
    }
    budget_exercise.budgets = refs;
    await FirestoreWrite<IBudgetExercise>().updateDoc(budgetExerciseCollectionName, budget_exercise.id, budget_exercise);
    return budget_exercise;
}

export const Delete_Budget_Exercise = async (budget_exercise: IBudgetExercise) => {
    await FirestoreWrite<IBudgetExercise>().deleteDocument(budgetExerciseCollectionName, budget_exercise.id);
}
