import { createAsyncThunk } from "@reduxjs/toolkit";
import { IAccount, Image, IOrganization } from "firebaseConfig";
import { RootState } from "redux/store";
import { FirestoreWrite } from "rpcHooks/useFirebase";
import { Update_Account_Member_Email, Update_Account_Member_Image, Update_Account_Member_Name } from "../remoxData";


export const Update_Account_Member_Image_Thunk = createAsyncThunk<void, { accountId: string, memberId: string, image: Image }>("remoxData/update_image_account_member", async ({ accountId, memberId, image }, api) => {
    const state = (api.getState() as RootState)

    const account = state.remoxData.accounts.find(s => s.id === accountId)
    if (!account) throw new Error("No Account Found")

    const currentMember = account.members.find(s => s.id === memberId)
    if (!currentMember) throw new Error("No Member Found")
    currentMember.image = image

    await FirestoreWrite<Pick<IAccount, "members">>().updateDoc("accounts", accountId, {
        members: [...account.members.filter(s => s.id !== memberId), currentMember]
    })

    api.dispatch(Update_Account_Member_Image({
        account,
        image,
        memberId
    }))
})

export const Update_Account_Member_Name_Thunk = createAsyncThunk<void, { accountId: string, memberId: string, name: string }>("remoxData/update_name_account_member", async ({ accountId, memberId, name }, api) => {
    const state = (api.getState() as RootState)

    const account = state.remoxData.accounts.find(s => s.id === accountId)
    if (!account) throw new Error("No Account Found")

    const currentMember = account.members.find(s => s.id === memberId)
    if (!currentMember) throw new Error("No Member Found")
    currentMember.name = name

    await FirestoreWrite<Pick<IAccount, "members">>().updateDoc("accounts", accountId, {
        members: [...account.members.filter(s => s.id !== memberId), currentMember]
    })

    api.dispatch(Update_Account_Member_Name({
        account,
        name,
        memberId
    }))
})

export const Update_Account_Member_Email_Thunk = createAsyncThunk<void, { accountId: string, memberId: string, email: string }>("remoxData/update_email_account_member", async ({ accountId, memberId, email }, api) => {
    const state = (api.getState() as RootState)

    const account = state.remoxData.accounts.find(s => s.id === accountId)
    if (!account) throw new Error("No Account Found")

    const currentMember = account.members.find(s => s.id === memberId)
    if (!currentMember) throw new Error("No Member Found")
    let updatedMember = { ...currentMember, email }

    await FirestoreWrite<Pick<IAccount, "members">>().updateDoc("accounts", accountId, {
        members: [...account.members.filter(s => s.id !== memberId), updatedMember]
    })

    api.dispatch(Update_Account_Member_Email({
        account,
        email,
        memberId
    }))
})