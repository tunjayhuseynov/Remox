import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Get_Individual_Ref } from "crud/individual";
import { Create_Organization, Get_Organizations } from "crud/organization";
import { auth, IAccount, IIndividual, IOrganization } from "firebaseConfig";
import { UploadNFTorImageForUser } from "hooks/singingProcess/utils";
import { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { IRemoxAccountORM } from "pages/api/account/multiple";
import { generate } from "shortid";
import { IOrganizationORM } from "types/orm";
import { GetTime } from "utils";
import { setAccountType, setProviderID, setStorage } from "../remoxData";
import { CreateTag } from "./tags";


interface ICreateMultisig {
    uploadType: "image" | "nft";
    file: File | null,
    nftAddress: string | null,
    nftTokenId: number | null,
    blockchain: BlockchainType,
    name: string,
    newAccountName: string,
    address: string;
    individual: IIndividual,
}

export const Create_Organization_Thunk = createAsyncThunk<IOrganization, ICreateMultisig>("remoxData/create_organization", async (data, api) => {
    const { file, nftAddress, nftTokenId, blockchain, address, name, uploadType, individual, newAccountName } = data;
    if (!auth.currentUser) throw new Error("User not logged in");

    let image: Parameters<typeof UploadNFTorImageForUser>[0] | undefined;
    if (file || nftAddress) {
        image =
        {
            image: {
                blockchain,
                imageUrl: file ?? nftAddress!,
                nftUrl: nftAddress ?? "",
                tokenId: nftTokenId ?? null,
                type: uploadType
            },
            name: `organizations/${name}`
        }
        await UploadNFTorImageForUser(image)
    }

    const id = generate();
    // const account: IAccount = {
    //     address: address,
    //     blockchain,
    //     created_date: GetTime(),
    //     name: newAccountName,
    //     id: address,
    //     image: null,
    //     members: [
    //         {
    //             address,
    //             id: generate(),
    //             image: null,
    //             mail: null,
    //             name: name,
    //         }
    //     ],
    //     provider: null,
    //     signerType: "single",
    // }
    const response = await Create_Organization({
        blockchain,
        accounts: [
            // account
        ],
        budget_execrises: [],
        image: image?.image ?? null,
        members: [address],
        name: name,
        id,
        creator: Get_Individual_Ref(individual.id),
        created_date: GetTime(),
    })

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
    api.dispatch(setAccountType("organization"));

    api.dispatch(setStorage({
        individual: individual,
        uid: auth.currentUser?.uid,
        lastSignedProviderAddress: address,
        signType: "organization",
        organization: response,
    }))

    return {
        ...response
    }
})



export const Get_Organizations_Thunk = createAsyncThunk<IOrganizationORM[], string>("remoxData/get_organizations", async (id, api) => {
    const response = await Get_Organizations(id);

    let organizations: IOrganizationORM[] = [];

    const accounts = await Promise.all(response.map(s => {
        return axios.get<IRemoxAccountORM>("/api/account/multiple", {
            params: {
                id: s.id,
                type: "organization"
            }
        });
    }))

    accounts.forEach((s, i) => {
        const data = s.data

        organizations.push({
            ...response[i],
            totalBalance: data.totalBalance,
        })
    })

    return organizations;
})