import { createAsyncThunk, nanoid } from "@reduxjs/toolkit";
import axios from "axios";
import { Get_Individual_Ref } from "crud/individual";
import { Create_Organization, Get_Organizations } from "crud/organization";
import { auth, IAccount, IIndividual, Image, IOrganization } from "firebaseConfig";
import { DownloadAndSetNFTorImageForUser } from "hooks/singingProcess/utils";
import { IRemoxAccountORM } from "pages/api/account/multiple.api";
import { generate } from "shortid";
import { BlockchainType } from "types/blockchains";
import { IOrganizationORM } from "types/orm";
import { GetTime } from "utils";
import { toChecksumAddress } from "web3-utils";
import { setAccountType, setProviderID, setStorage } from "../remoxData";
import { CreateTag } from "./tags";


interface ICreateMultisig {
    uploadType: "image" | "nft";
    image: Image | null,
    name: string,
    newAccountName: string,
    address: string;
    individual: IIndividual,
}

export const Create_Organization_Thunk = createAsyncThunk<IOrganization, ICreateMultisig>("remoxData/create_organization", async (data, api) => {
    const { image, address, name, uploadType, individual, newAccountName } = data;
    if (!auth.currentUser) throw new Error("User not logged in");

    const id = `${nanoid()}-${nanoid()}`;

    const response = await Create_Organization({
        accounts: [
            // account
        ],
        notes: [],
        payTransactions: [],
        priceCalculation: "current",
        moderators: [],
        budget_execrises: [],
        image: image,
        members: [toChecksumAddress(address)],
        fiatMoneyPreference: "USD",
        name: name,
        id,
        // creator: Get_Individual_Ref(individual.id),
        created_date: GetTime(),
    })

    await api.dispatch(CreateTag({
        id,
        color: "#0ffff7",
        name: "Gas Fee",
        createdDate: GetTime(),
    }))
    await api.dispatch(CreateTag({
        id,
        color: "#ff0ae6",
        name: "Swap",
        createdDate: GetTime(),
    }))
    await api.dispatch(CreateTag({
        id,
        color: "#23c4ff",
        name: "Payroll",
        createdDate: GetTime(),
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



export const Get_Organizations_Thunk = createAsyncThunk<IOrganization[], [string, AbortController]>("remoxData/get_organizations", async ([id, controller], api) => {
    // const response = await Get_Organizations(id);
    const { data: response } = await axios.get<IOrganization[]>("/api/organization/all", {
        params: {
            address: id
        },
        signal: controller.signal
    })
    // let organizations: IOrganization[] = [];

    // const accounts = await Promise.all(response.map(s => {
    //     return axios.get<IRemoxAccountORM>("/api/account/multiple", {
    //         params: {
    //             id: s.id,
    //             type: "organization"
    //         }
    //     });
    // }))

    // accounts.forEach((s, i) => {
    //     const data = s.data

    //     organizations.push({
    //         ...response[i],
    //     })
    // })

    return response
})