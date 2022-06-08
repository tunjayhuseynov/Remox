import { Create_Individual } from "crud/individual";
import { useMemo } from "react";
import { isIndividualExisting, isIndiviualRegistered, isOrganisationRegistered, isOrganizationExisting, isUserUsingOldVersion, UploadImageForUser } from "./utils";
import { process } from "uniqid"
import { auth, IIndividual, IOrganization } from "firebaseConfig";
import { Create_Organization } from "crud/organization";
import { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { Get_Account_Ref } from "crud/account";

export default function useSign(address: string, blockchain: BlockchainType) {

    const RegisterIndividual = async (individual: Omit<IIndividual, "id" | "created_date" | "addresses" | "blockchain">) => {
        if (await isIndiviualRegistered(address)) throw new Error("User already registered");
        if (!auth.currentUser) throw new Error("User not logged in");
        await UploadImageForUser(individual);

        const id = auth.currentUser.uid;
        return await Create_Individual({
            ...individual,
            id,
            created_date: Math.floor(new Date().getTime() / 1000),
            members: [address],
        })
    }

    const RegisterOrganization = async (organization: Omit<IOrganization, "id" | "created_date" | "blockchain">) => {
        if (await isOrganisationRegistered(organization.name, blockchain)) throw new Error("User already registered");

        await UploadImageForUser(organization);

        const id = process(`${organization.name}-`);
        return await Create_Organization({
            ...organization,
            id,
            created_date: Math.floor(new Date().getTime() / 1000),
        })
    }

    const RegisterIndividualAndOrganization = async (individual: Omit<IIndividual, "id" | "created_date">, organization: Omit<IOrganization, "id" | "created_date" | "creator">) => {
        const user = await RegisterIndividual(individual);
        const org = await RegisterOrganization({ ...organization, creator: Get_Account_Ref(user.id) });
    }


    return { isIndiviualRegistered, isOrganisationRegistered, RegisterIndividual, RegisterOrganization, RegisterIndividualAndOrganization }
}
