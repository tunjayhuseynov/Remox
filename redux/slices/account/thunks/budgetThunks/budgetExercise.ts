import { createAsyncThunk } from "@reduxjs/toolkit";
import { Create_Budget_Exercise, Delete_Budget_Exercise, Update_Budget_Exercise } from "crud/budget_exercise";
import { Update_Individual } from "crud/individual";
import { Update_Organization } from "crud/organization";
import { IBudgetExercise, IIndividual, IOrganization } from "firebaseConfig";
import { IBudgetExerciseORM } from "pages/api/budget";
import { addBudgetExercise, deleteBudgetExercise, updateBudgetExercise } from "../../remoxData";

interface IBaseExercise {
    budgetExercise: IBudgetExercise;
}

interface IBaseOrmExercise {
    budgetExercise: IBudgetExerciseORM;
}

interface ICreateExercise extends IBaseExercise {
    remoxAccount: IIndividual | IOrganization;
    remoxAccountType: "individual" | "organization";

}

/* Budget Exercise */

export const Create_Budget_Exercise_Thunk = createAsyncThunk<void, ICreateExercise>("remoxData/create_budget_exercisse", async ({
    budgetExercise, remoxAccount, remoxAccountType
}, api) => {
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

    api.dispatch(addBudgetExercise({
        ...budgetExercise,
        budgets: [],
        totalBudget: 0,
        totalUsed: 0,
        totalAvailable: 0,
        budgetCoins: [],
    }));
})

export const Update_Budget_Exercise_Thunk = createAsyncThunk<void, IBaseOrmExercise>("remoxData/update_budget_exercisse", async ({ budgetExercise }, api) => {
    await Update_Budget_Exercise(budgetExercise);
    api.dispatch(updateBudgetExercise(budgetExercise));
})

export const Delete_Budget_Exercise_Thunk = createAsyncThunk<void, IBaseOrmExercise>("remoxData/delete_budget_exercisse", async ({ budgetExercise }, api) => {
    await Delete_Budget_Exercise(budgetExercise);
    api.dispatch(deleteBudgetExercise(budgetExercise));
})