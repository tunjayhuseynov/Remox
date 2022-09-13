import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Get_Individual_Ref } from "crud/individual";
import { Create_Organization, Get_Organizations } from "crud/organization";
import { auth, IAccount, IIndividual, IOrganization } from "firebaseConfig";
import { DownloadAndSetNFTorImageForUser } from "hooks/singingProcess/utils";
import { IRemoxAccountORM } from "pages/api/account/multiple.api";
import { generate } from "shortid";
import { BlockchainType } from "types/blockchains";
import { IOrganizationORM } from "types/orm";
import { GetTime } from "utils";
import { setAccountType, setProviderID, setStorage } from "../remoxData";
import { CreateTag } from "./tags";


interface ICreateMultisig {
    uploadType: "image" | "nft";
    imageUrl: string | null,
    nftAddress: string | null,
    nftTokenId: number | null,
    blockchain: BlockchainType,
    name: string,
    newAccountName: string,
    address: string;
    individual: IIndividual,
}

export const Create_Organization_Thunk = createAsyncThunk<IOrganization, ICreateMultisig>("remoxData/create_organization", async (data, api) => {
    const { imageUrl, nftAddress, nftTokenId, blockchain, address, name, uploadType, individual, newAccountName } = data;
    if (!auth.currentUser) throw new Error("User not logged in");

    let image: Parameters<typeof DownloadAndSetNFTorImageForUser>[0] | undefined;
    const id = generate();

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
            name: `organizations/${id}/${name}`
        }
    }


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