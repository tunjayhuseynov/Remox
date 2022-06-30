import { Get_Individual_Ref } from "crud/individual";
import { Add_New_Organization_Account, Update_Organization } from "crud/organization";
import type { IAccount, Image, IOrganization } from "firebaseConfig";
import useIndividual from "hooks/accounts/useIndividual";
import useSign from "hooks/singingProcess/useSign";
import useNextSelector from "hooks/useNextSelector";
import { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { selectStorage } from "redux/slices/account/storage";
import { UploadImage } from "rpcHooks/useFirebase";

interface IOrganizationCreate {
    organizationIsUpload: boolean;

    organizationFile?: File;

    organizationNFTAddress?: string;
    organizationNFTTokenId?: number;
    organizationName: string;
}


export default function useOrganization(address: string, blockchain: BlockchainType) {
    const storage = useNextSelector(selectStorage)
    const individual = storage?.individual;

    const { RegisterOrganization } = useSign(address, blockchain)


    const Add_Account_2_Organization = async (account: IAccount) => {
        if (!storage?.organization) throw new Error("organization is not defined")

        const org = storage.organization;
        const members = Array.from(new Set([...org.members, ...account.members.map(m => m.address)]));
        org.members = members;

        await Update_Organization(org)

        await Add_New_Organization_Account(org, account);
    }

    const Create_Organization = async (input: IOrganizationCreate) => {
        try {
            if (!individual) throw new Error("You must be sign in as an individual beforehand")
            if (!address) throw new Error("No address")
            if (!input.organizationName) throw new Error("No Organization Name")

            let organizationImageObject: Image | null = null;
            let organizationSetup: Omit<IOrganization, "id" | "created_date">;

            if (!input.organizationIsUpload) {
                if (!input.organizationNFTAddress) throw new Error("No Organization NFT Address")
                if (!input.organizationNFTTokenId) throw new Error("No Organization Token Id")
            } else {
                if (!input.organizationFile) throw new Error("No Organization File Upload")
                const organizationURL = await UploadImage(`${input.organizationName}/nft`, input.organizationFile)
                organizationImageObject = {
                    blockchain,
                    imageUrl: organizationURL,
                    type: "image",
                    nftUrl: organizationURL,
                    tokenId: null
                }
            }

            organizationSetup = {
                image: organizationImageObject,
                blockchain,
                accounts: [],
                budget_execrises: [],
                creator: Get_Individual_Ref(individual.id),
                members: [
                    ...individual.members
                ],
                name: input.organizationName
            }


            return await RegisterOrganization(organizationSetup)
        } catch (error) {
            console.error(error)
            throw new Error(error as any)
        }
    }

    return { Create_Organization, Add_Account_2_Organization }
}
