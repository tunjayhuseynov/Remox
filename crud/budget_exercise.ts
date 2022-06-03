import { FirestoreRead, FirestoreWrite } from "apiHooks/useFirebase";
import { doc } from "firebase/firestore";
import { db, IBudgetExercise } from "firebaseConfig";

export const budgetExerciseCollectionName = "budget_exercises"

export const Get_Budget_Exercise_Ref = (id: string) => doc(db, budgetExerciseCollectionName, id);

export const Get_Budget_Exercise = async (id: string) => {
    const budget_exercise = await FirestoreRead<IBudgetExercise>(budgetExerciseCollectionName, id)
    if (!budget_exercise) throw new Error("Individual not found");
    return budget_exercise;
}

export const Create_Budget_Exercise = async (budget_exercise: IBudgetExercise) => {
    await FirestoreWrite<IBudgetExercise>().createDoc(budgetExerciseCollectionName, budget_exercise.id, budget_exercise);
    return budget_exercise;
}

export const Update_Budget_Exercise = async (budget_exercise: IBudgetExercise) => {
    await FirestoreWrite<IBudgetExercise>().updateDoc(budgetExerciseCollectionName, budget_exercise.id, budget_exercise);
    return budget_exercise;
}

export const Delete_Budget_Exercise = async (budget_exercise: IBudgetExercise) => {
    await FirestoreWrite<IBudgetExercise>().deleteDocument(budgetExerciseCollectionName, budget_exercise.id);
}
