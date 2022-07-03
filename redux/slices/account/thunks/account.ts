import { createAsyncThunk, nanoid } from "@reduxjs/toolkit";
import { Add_Member_To_Account, Remove_Member_From_Account, Update_Members_In_Account } from "crud/account";
import { IAccount, IIndividual, Image, IOrganization } from "firebaseConfig";


interface IRemove {
    remoxAccount: IIndividual | IOrganization,
    accountAddress: string;
    memberAddress: string;
}
export const Remove_Member_From_Account_Thunk = createAsyncThunk<void, IRemove>("remoxData/remove_account_member", async ({ remoxAccount, accountAddress, memberAddress }) => {
    const the_account = (remoxAccount?.accounts as IAccount[]).find(a => a.address.toLowerCase() === accountAddress?.toLowerCase())
    const member = the_account?.members.find(m => m.address.toLowerCase() === memberAddress.toLowerCase())
    if (!member) throw new Error("Member not found")
    if (!the_account) throw new Error("Account not found")
    await Remove_Member_From_Account(the_account, member)
});

interface IAdd {
    remoxAccount: IIndividual | IOrganization,
    accountAddress: string;
    memberAddress: string;
    name: string,
    image: Image | null,
    mail: string | null
}

export const Add_Member_To_Account_Thunk = createAsyncThunk<void, IAdd>("remoxData/add_account_member", async ({ accountAddress, memberAddress, remoxAccount, image, name, mail }) => {
    const the_account = (remoxAccount?.accounts as IAccount[]).find(a => a.address.toLowerCase() === accountAddress?.toLowerCase())
    if (!the_account) throw new Error("Account not found")
    await Add_Member_To_Account(the_account,
        {
            address: memberAddress,
            name,
            id: nanoid(),
            image,
            mail
        })
})

interface IReplace {
    remoxAccount: IIndividual | IOrganization,
    accountAddress: string;
    oldMemberAddress: string,
    newMemberAdress: string
}

export const Replace_Member_In_Account_Thunk = createAsyncThunk<void, IReplace>("remoxData/replace_account_member", async ({ accountAddress, newMemberAdress, oldMemberAddress, remoxAccount }) => {
    const the_account = (remoxAccount?.accounts as IAccount[]).find(a => a.address.toLowerCase() === accountAddress.toLowerCase())
    if (!the_account) throw new Error("Account not found")
    const oldMember = the_account.members.find(m => m.address.toLowerCase() === oldMemberAddress.toLowerCase())
    if (!oldMember) throw new Error("Member not found")
    const members = [...the_account.members.filter(m => m.address.toLowerCase() !== oldMemberAddress.toLowerCase())]
    oldMember.address = newMemberAdress;
    members.push(oldMember);
    await Update_Members_In_Account(the_account, members)
});