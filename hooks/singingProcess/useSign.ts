import { Create_Individual } from "crud/individual";
import { useCallback } from "react";
import { isIndividualExisting, isOrganizationExisting, UploadImageForUser } from "./utils";
import { process } from "uniqid"
import { auth, IIndividual, IOrganization } from "firebaseConfig";
import { Create_Organization } from "crud/organization";
import { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { Get_Account_Ref } from "crud/account";
import { GetTime } from "utils";
import { useDispatch } from "react-redux";
import { setIndividual, setOrganization } from "redux/reducers/storage";
import { setBudgetExercises } from "redux/reducers/budgets";

export default function useSign(address: string, blockchain: BlockchainType) {
    const dispatch = useDispatch()

    const RegisterIndividual = useCallback(async (individual: Omit<IIndividual, "id" | "created_date">) => {
        if (await isIndividualExisting(address)) throw new Error("User already registered");
        if (!auth.currentUser) throw new Error("User not logged in");
        await UploadImageForUser(individual);

        const id = auth.currentUser.uid;
        

        let individualState = {
            ...individual,
            id,
            created_date: Math.floor(new Date().getTime() / 1000),
            members: [address],
        }

        dispatch(setIndividual(individualState))
        
        return await Create_Individual(individualState)
    }, [address, blockchain])

    const RegisterOrganization = useCallback(async (organization: Omit<IOrganization, "id" | "created_date">) => {
        if (await isOrganizationExisting(organization.name, blockchain)) throw new Error("User already registered");

        await UploadImageForUser(organization);

        const id = process(`${organization.name.split(" ").join("-")}-`);
        const response = await Create_Organization({
            ...organization,
            id,
            created_date: GetTime(),
        })
        dispatch(setOrganization(response))
        return response;
    }, [address, blockchain])

    const RegisterIndividualAndOrganization = useCallback(async (individual: Omit<IIndividual, "id" | "created_date">, organization: Omit<IOrganization, "id" | "created_date" | "creator">) => {
        const user = await RegisterIndividual(individual);
        const org = await RegisterOrganization({ ...organization, creator: Get_Account_Ref(user.id) });
    }, [address, blockchain])


    // const getOrganizations = useCallback(async () => {
    //     const organizations = await FirestoreReadMultiple<IOrganization>(organizationCollectionName, [
    //         {
    //             firstQuery: "members",
    //             condition: "array-contains",
    //             secondQuery: Address
    //         }
    //     ]);
    //     return organizations;
    // }, [address, blockchain])


    return {
        RegisterIndividual,
        RegisterOrganization,
        RegisterIndividualAndOrganization
    }
}
