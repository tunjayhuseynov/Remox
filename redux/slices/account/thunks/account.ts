import { createAsyncThunk, nanoid } from "@reduxjs/toolkit";
import axios from "axios";
import { Add_Member_To_Account, Create_Account, Remove_Member_From_Account, Update_Account, Update_Members_In_Account } from "crud/account";
import { Add_New_Individual_Account, Remove_Individual_Account } from "crud/individual";
import { Add_New_Organization_Account, Remove_Organization_Account, Update_Organization } from "crud/organization";
import { IAccount, IIndividual, Image, IOrganization } from "firebaseConfig";
import { IAccountORM } from "pages/api/account/index.api";

export const Update_Account_Name = createAsyncThunk<IAccount, { account: IAccount, name: string }>("remoxData/Update_Account_Name", async ({ account, name }) => {
    await Update_Account({ ...account, name });
    return account;
})

export const Update_Account_Mail = createAsyncThunk<IAccount, { account: IAccount, mail: string }>("remoxData/Update_Account_Mail", async ({ account, mail }) => {
    account.mail = mail;
    await Update_Account(account);

    return account;
})


export const Create_Account_For_Individual = createAsyncThunk<IAccountORM, { account: IAccount, individual: IIndividual }>("remoxData/Add_Account_To_Individual", async ({ account, individual }) => {
    await Create_Account(account);
    await Add_New_Individual_Account(individual, account)

    const accountReq = await axios.get<IAccountORM>("/api/account", {
        params: {
            id: account.id,
        }
    });

    return accountReq.data;
})


export const Remove_Account_From_Individual = createAsyncThunk<IAccount, { account: IAccount, individual: IIndividual }>("remoxData/Remove_Account_From_Individual", async ({ account, individual }) => {
    await Remove_Individual_Account(individual, account)

    return account;
})


export const Create_Account_For_Organization = createAsyncThunk<IAccountORM, { account: IAccount, organization: IOrganization }>("remoxData/Add_Account_To_Organization", async ({ account, organization }, api) => {
    await Create_Account(account);
    const org = organization;
    const members = Array.from(new Set([...org.members, ...account.members.map(m => m.address)]));
    org.members = members;

    await Update_Organization(org)
    await Add_New_Organization_Account(organization, account)

    const accountReq = await axios.get<IAccountORM>("/api/account", {
        params: {
            id: account.id,
        }
    });

    return accountReq.data;
})

export const Remove_Account_From_Organization = createAsyncThunk<IAccount, { account: IAccount, organization: IOrganization }>("remoxData/Remove_Account_From_Organization", async ({ account, organization }) => {
    await Remove_Organization_Account(organization, account)

    return account;
})

interface IRemove {
    remoxAccount: IIndividual | IOrganization,
    accountAddress: string;
    memberAddress: string;
}

export const Remove_Member_From_Account_Thunk = createAsyncThunk<IRemove, IRemove>("remoxData/remove_account_member", async ({ remoxAccount, accountAddress, memberAddress }) => {
    const the_account = (remoxAccount?.accounts as IAccount[]).find(a => a.address.toLowerCase() === accountAddress?.toLowerCase())
    const member = the_account?.members.find(m => m.address.toLowerCase() === memberAddress.toLowerCase())
    if (!member) throw new Error("Member not found")
    if (!the_account) throw new Error("Account not found")
    await Remove_Member_From_Account(the_account, member)

    return {
        accountAddress,
        memberAddress,
        remoxAccount
    }
});

interface IAdd {
    remoxAccount: IIndividual | IOrganization,
    accountAddress: string;
    memberAddress: string;
    name: string,
    image: Image | null,
    mail: string | null
}

export const Add_Member_To_Account_Thunk = createAsyncThunk<IAdd & { id: string }, IAdd>("remoxData/add_account_member", async ({ accountAddress, memberAddress, remoxAccount, image, name, mail }) => {
    const the_account = (remoxAccount?.accounts as IAccount[]).find(a => a.address.toLowerCase() === accountAddress?.toLowerCase())
    if (!the_account) throw new Error("Account not found")
    let id = nanoid();
    await Add_Member_To_Account(the_account,
        {
            address: memberAddress,
            name,
            id,
            image,
            mail
        })

    return {
        accountAddress,
        image,
        mail,
        memberAddress,
        name,
        remoxAccount,
        id
    }
})

interface IReplace {
    remoxAccount: IIndividual | IOrganization,
    accountAddress: string;
    oldMemberAddress: string,
    newMemberAdress: string
}

export const Replace_Member_In_Account_Thunk = createAsyncThunk<IReplace, IReplace>("remoxData/replace_account_member", async ({ accountAddress, newMemberAdress, oldMemberAddress, remoxAccount }) => {
    const the_account = (remoxAccount?.accounts as IAccount[]).find(a => a.address.toLowerCase() === accountAddress.toLowerCase())
    if (!the_account) throw new Error("Account not found")
    const oldMember = the_account.members.find(m => m.address.toLowerCase() === oldMemberAddress.toLowerCase())
    if (!oldMember) throw new Error("Member not found")
    const members = [...the_account.members.filter(m => m.address.toLowerCase() !== oldMemberAddress.toLowerCase())]
    oldMember.address = newMemberAdress;
    members.push(oldMember);
    await Update_Members_In_Account(the_account, members)

    return {
        accountAddress,
        newMemberAdress,
        oldMemberAddress,
        remoxAccount
    }
});