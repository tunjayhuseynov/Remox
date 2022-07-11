import { Create_Budget_Exercise, Delete_Budget_Exercise, Update_Budget_Exercise } from "crud/budget_exercise";
import { Update_Individual } from "crud/individual";
import { Update_Organization } from "crud/organization";
import { IBudgetExercise, IIndividual, IOrganization } from "firebaseConfig";
import { useWalletKit } from "hooks";
import useRemoxAccount from "hooks/accounts/useRemoxAccount";
import { IBudgetExerciseORM } from "pages/api/budget";
import { useDispatch } from "react-redux";
import { useAppSelector } from "redux/hooks";
import { addBudgetExercise, deleteBudgetExercise, SelectBudgetExercises, updateBudgetExercise } from "redux/slices/account/remoxData";
import useBudgets from "./useBudgets";
import useSubbudgets from "./useSubbudgets";

export default function useBudgetExercise() {
    const dispatch = useDispatch()
    const { Address, blockchain } = useWalletKit()

    const budget = useBudgets()
    const subbudget = useSubbudgets()

    const budgetState = useAppSelector(SelectBudgetExercises)

    const { remoxAccountType, remoxAccount } = useRemoxAccount(Address ?? "0x", blockchain)

    const create_exercise = async (budgetExercise: IBudgetExercise) => {
        if (remoxAccount) {
            await Create_Budget_Exercise(budgetExercise);
            if (remoxAccountType === "organization") {
                const organization = { ...remoxAccount } as IOrganization;
                organization.budget_execrises = [...organization.budget_execrises, budgetExercise] as IBudgetExercise[];
                await Update_Organization(organization)
            } else {
                const individual = { ...remoxAccount } as IIndividual;
                individual.budget_execrises = [...individual.budget_execrises, budgetExercise] as IBudgetExercise[]
                await Update_Individual(individual)
            }
            dispatch(addBudgetExercise({
                ...budgetExercise,
                budgets: [],
                totalBudget: 0,
                totalUsed: 0,
                totalAvailable: 0,
                budgetCoins: [],
            }));
        }
    }

    const update_exercise = async (budget: IBudgetExerciseORM) => {
        await Update_Budget_Exercise(budget);
        dispatch(updateBudgetExercise(budget));
    }

    const delete_exercise = async (budget: IBudgetExerciseORM) => {
        await Delete_Budget_Exercise(budget);
        dispatch(deleteBudgetExercise(budget));

    }

    return { create_exercise, update_exercise, delete_exercise, ...budget, ...subbudget }

}
