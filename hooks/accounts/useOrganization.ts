import { Get_Individual_Ref } from "crud/individual";
import { Add_New_Organization_Account, Update_Organization } from "crud/organization";
import type { IAccount, Image, IOrganization } from "firebaseConfig";
import useNextSelector from "hooks/useNextSelector";
import { useAppSelector } from "redux/hooks";
import { SelectStorage } from "redux/slices/account/selector";
import { BlockchainType } from "types/blockchains";


export default function useOrganization(address: string, blockchain: BlockchainType) {
    const storage = useAppSelector(SelectStorage)

    const Add_Account_2_Organization = async (account: IAccount) => {
        if (!storage?.organization) throw new Error("organization is not defined")

        const org = storage.organization;
        const members = Array.from(new Set([...org.members, ...account.members.map(m => m.address)]));
        org.members = members;

        await Update_Organization(org)

        await Add_New_Organization_Account(org, account);
    }

    return { Add_Account_2_Organization }
}
