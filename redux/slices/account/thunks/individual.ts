import { createAsyncThunk, nanoid } from "@reduxjs/toolkit";
import { Create_Individual } from "crud/individual";
import { auth, IIndividual } from "firebaseConfig";
import { DownloadAndSetNFTorImageForUser } from "hooks/singingProcess/utils";
import { generate } from "shortid";
import { BlockchainType } from "types/blockchains";
import { GetTime } from "utils";
import { setAccountType, setProviderID, setStorage } from "../remoxData";
import { CreateTag } from "./tags";

interface ICreateIndividual {
    uploadType: "image" | "nft";
    imageUrl: string | null,
    nftAddress: string | null,
    nftTokenId: number | null,
    blockchain: BlockchainType,
    name: string,
    newAccountName: string,
    address: string;
}

export const Create_Individual_Thunk = createAsyncThunk<IIndividual, ICreateIndividual>("remoxData/create_individual", async (data, api) => {
    const { imageUrl, nftAddress, nftTokenId, blockchain, address, name, uploadType, newAccountName } = data;
    if (!auth.currentUser) throw new Error("User not logged in");

    let image: Parameters<typeof DownloadAndSetNFTorImageForUser>[0] | undefined;
    const id = auth.currentUser.uid;

    if (imageUrl || nftAddress) {
        image =
        {
            image: {
                blockchain: blockchain.name,
                imageUrl: imageUrl ?? nftAddress!,
                nftUrl: nftAddress ?? "",
                tokenId: nftTokenId ?? null,
                type: uploadType
            },
            name: `individuals/${id}/${data.name}`
        }
    }



    let individualState: IIndividual = {
        priceCalculation: "current",
        addressBook: [],
        accounts: [
            {
                mail: null,
                address: address,
                blockchain: blockchain.name,
                created_date: GetTime(),
                createdBy: id,
                name: newAccountName,
                id: nanoid(),
                image: null,
                members: [
                    {
                        address,
                        id: generate(),
                        image: null,
                        mail: null,
                        name: name,
                    }
                ],
                provider: null,
                signerType: "single",
            }
        ],
        moderators: [],
        budget_execrises: [],
        image: image?.image ?? null,
        members: [address],
        name: data.name,
        fiatMoneyPreference: "USD",
        seenTime: GetTime(),
        id,
        created_date: GetTime(),
    }

    api.dispatch(CreateTag({
        id,
        color: "#0ffff7",
        name: "Gas Fee"
    }))
    api.dispatch(CreateTag({
        id,
        color: "#ff0ae6",
        name: "Swap"
    }))
    api.dispatch(CreateTag({
        id,
        color: "#23c4ff",
        name: "Payroll"
    }))

    api.dispatch(setProviderID(id));
    api.dispatch(setAccountType("individual"));

    api.dispatch(setStorage({
        individual: individualState,
        uid: auth.currentUser.uid,
        lastSignedProviderAddress: address,
        signType: "individual",
        organization: null
    }))

    return await Create_Individual(individualState)
})