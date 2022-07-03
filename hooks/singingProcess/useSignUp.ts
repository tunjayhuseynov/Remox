import { Create_Individual, Get_Individual_Ref } from "crud/individual";
import { useCallback } from "react";
import { isIndividualExisting, isOrganizationExisting, UploadImageForUser } from "./utils";
import { process } from "uniqid"
import { auth, IIndividual, Image, IOrganization } from "firebaseConfig";
import { Create_Organization } from "crud/organization";
import { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { Get_Account_Ref } from "crud/account";
import { GetTime } from "utils";
import { useDispatch } from "react-redux";
import { setIndividual, setOrganization } from "redux/slices/account/storage";
import { UploadImage } from "rpcHooks/useFirebase";
import { useSelector } from "react-redux";
import { SelectIndividual } from "redux/slices/account/remoxData";

interface IOrganizationCreate {
    organizationIsUpload: boolean;
    organizationFile?: File;
    organizationNFTAddress?: string;
    organizationNFTTokenId?: number;
    organizationName: string;
}

export default function useSignUp(address: string, blockchain: BlockchainType) {
    const dispatch = useDispatch()
    const individual = useSelector(SelectIndividual)

    const RegisterIndividual = useCallback(async (individual: Omit<IIndividual, "id" | "created_date">) => {
        if (await isIndividualExisting(address)) throw new Error("User already registered");
        if (!auth.currentUser) throw new Error("User not logged in");
        await UploadImageForUser(individual);

        const id = auth.currentUser.uid;

        let individualState: IIndividual = {
            ...individual,
            id,
            created_date: Math.floor(new Date().getTime() / 1000),
            members: [address],
        }

        dispatch(setIndividual(individualState))

        return await Create_Individual(individualState)
    }, [address, blockchain])

    const RegisterOrganization = useCallback(async (organization: Omit<IOrganization, "id" | "created_date">, input: IOrganizationCreate) => {
        if (await isOrganizationExisting(organization.name, blockchain)) throw new Error("User already registered");
        
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

        const id = process(`${organization.name.split(" ").join("-")}-`);
        const response = await Create_Organization({
            ...organization,
            id,
            created_date: GetTime(),
        })
        dispatch(setOrganization(response))
        return response;
    }, [address, blockchain])



    return {
        RegisterIndividual,
        RegisterOrganization
    }
}
