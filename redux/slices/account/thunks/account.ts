import { createAsyncThunk, nanoid } from "@reduxjs/toolkit";
import axios from "axios";
import { Add_Member_To_Account, Create_Account, Get_Account_Ref, Remove_Member_From_Account, Update_Account, Update_Members_In_Account } from "crud/account";
import { Add_New_Individual_Account, Get_Individual_Ref, Remove_Individual_Account } from "crud/individual";
import { Add_New_Organization_Account, Remove_Organization_Account, Update_Organization } from "crud/organization";
import { registeredIndividualCollectionName } from "crud/registeredIndividual";
import { arrayUnion } from "firebase/firestore";
import { IAccount, IIndividual, Image, IMember, IOrganization } from "firebaseConfig";
import { IAccountORM } from "pages/api/account/index.api";
import { RootState } from "redux/store";
import { FirestoreWrite } from "rpcHooks/useFirebase";
import { toChecksumAddress } from "web3-utils";
import { Remove_Tx_From_Budget_Thunk } from "./budgetThunks/budget";
import { RemoveTransactionFromTag } from "./tags";

export const Update_Account_Name = createAsyncThunk<IAccount, { account: IAccount, name: string }>("remoxData/Update_Account_Name", async ({ account, name }) => {
    await Update_Account({ ...account, name });
    return { ...account, name };
})

export const Update_Account_Mail = createAsyncThunk<IAccount, { account: IAccount, mail: string }>("remoxData/Update_Account_Mail", async ({ account, mail }) => {
    await Update_Account({ ...account, mail });

    return { ...account, mail };
})

export const Update_Account_Image = createAsyncThunk<IAccount, { account: IAccount, image: Image }>("remoxData/Update_Account_Image", async ({ account, image }) => {
    const updatedAccount = { ...account, image }
    await Update_Account(updatedAccount);

    return { ...updatedAccount, image };
})


export const Create_Account_For_Individual = createAsyncThunk<IAccountORM, { account: IAccount, individual: IIndividual }>("remoxData/Add_Account_To_Individual", async ({ account, individual }) => {
    await Create_Account(account);
    await Add_New_Individual_Account(individual, account)

    const accountReq = await axios.get<IAccountORM>("/api/account", {
        params: {
            id: account.id,
            accountId: individual.id,
        }
    });

    return accountReq.data;
})


export const Remove_Account_From_Individual = createAsyncThunk<IAccount, { account: IAccount, individual: IIndividual, userId: string }>("remoxData/Remove_Account_From_Individual", async ({ account, individual, userId }, api) => {
    await Remove_Individual_Account(individual, account)
    const state = (api.getState() as RootState)
    const txs = state.remoxData.cumulativeTransactions.filter(transaction => ('tx' in transaction) ? transaction.tx.address === account.address : transaction.address === account.address);
    const budgets = state.remoxData.budgetExercises.map(budget => budget.budgets).flat();

    // Find more fastest way
    for (const tx of txs) {
        const hash = ('tx' in tx) ? tx.tx.hash : tx.hash;
        for (const tag of tx.tags) {
            for (const txTag of tag.transactions) {
                await api.dispatch(RemoveTransactionFromTag({
                    id: userId,
                    tagId: tag.id,
                    transactionId: txTag,
                    txIndex: state.remoxData.cumulativeTransactions.findIndex(
                        transaction =>
                            ('tx' in transaction) ?
                                (transaction.tx.hash === hash && transaction.contractAddress.toLowerCase() === account.address.toLowerCase())
                                :
                                (transaction.hash === hash && transaction.address.toLowerCase() === account.address.toLowerCase())
                    )
                }))
            }
        }
        for (const budget of budgets) {
            const targetTx = budget.txs.filter(s => s.contractAddress.toLowerCase() === account.address.toLowerCase())
            if (targetTx.length > 0) {
                for (const target of targetTx) {
                    await api.dispatch(Remove_Tx_From_Budget_Thunk({
                        budget: budget,
                        isExecuted: 'tx' in tx ? tx.isExecuted : true,
                        tx: target,
                    }))
                }
            }
        }
    }

    return account;
})


export const Create_Account_For_Organization = createAsyncThunk<IAccountORM, { account: IAccount, organization: IOrganization }>("remoxData/Add_Account_To_Organization", async ({ account, organization }, api) => {
    await Create_Account(Object.assign({}, account));
    let org: IOrganization = Object.assign({}, organization)
    const members = Array.from(new Set([...org.members, ...account.members.map(m => toChecksumAddress(m.address))]));
    org.members = members;
    // if ('name' in org.creator) {
    //     org.creator = Get_Individual_Ref(org.creator.id)
    // }
    org.accounts = [...org.accounts, account] as IAccount[];
    await Update_Organization(org)
    // await Add_New_Organization_Account(Object.assign({}, organization), Object.assign({}, account))

    const accountReq = await axios.get<IAccountORM>("/api/account", {
        params: {
            id: account.id,
            accountId: organization.id,
        }
    });

    return accountReq.data;
})

export const Remove_Account_From_Organization = createAsyncThunk<IAccount, { account: IAccount, organization: IOrganization, userId: string }>("remoxData/Remove_Account_From_Organization", async ({ account, organization, userId }, api) => {

    await Remove_Organization_Account(organization, account)

    const state = (api.getState() as RootState)

    const txs = state.remoxData.cumulativeTransactions.filter(transaction => ('tx' in transaction) ? transaction.tx.address === account.address : transaction.address === account.address);
    const budgets = state.remoxData.budgetExercises.map(budget => budget.budgets).flat();

    // Find more fastest way
    for (const tx of txs) {
        const hash = ('tx' in tx) ? tx.tx.hash : tx.hash;
        for (const tag of tx.tags) {
            for (const txTag of tag.transactions) {
                await api.dispatch(RemoveTransactionFromTag({
                    id: userId,
                    tagId: tag.id,
                    transactionId: txTag,
                    txIndex: state.remoxData.cumulativeTransactions.findIndex(
                        transaction =>
                            ('tx' in transaction) ?
                                (transaction.tx.hash === hash && transaction.contractAddress.toLowerCase() === account.address.toLowerCase())
                                :
                                (transaction.hash === hash && transaction.address.toLowerCase() === account.address.toLowerCase())
                    )
                }))
            }
        }
        for (const budget of budgets) {
            const targetTx = budget.txs.filter(s => s.contractAddress.toLowerCase() === account.address.toLowerCase())
            if (targetTx.length > 0) {
                for (const target of targetTx) {
                    await api.dispatch(Remove_Tx_From_Budget_Thunk({
                        budget: budget,
                        isExecuted: 'tx' in tx ? tx.isExecuted : true,
                        tx: target,
                    }))
                }
            }
        }
    }

    return account;
})

interface IRemove {
    remoxAccount: IIndividual | IOrganization,
    accountAddress: string;
    memberAddress: string;
}

export const Remove_Member_From_Account_Thunk = createAsyncThunk<IRemove, IRemove>("remoxData/remove_account_member", async ({ remoxAccount, accountAddress, memberAddress }, api) => {
    const accountType = (api.getState() as RootState).remoxData.accountType;
    const the_account = (remoxAccount?.accounts as IAccount[]).find(a => a.address.toLowerCase() === accountAddress?.toLowerCase())
    const member = the_account?.members.find(m => m.address.toLowerCase() === memberAddress.toLowerCase())
    if (!member) throw new Error("Member not found")
    if (!the_account) throw new Error("Account not found")
    // await Remove_Member_From_Account(the_account, member)
    await FirestoreWrite().updateDoc(accountType === "individual" ? "individuals" : "organizations", remoxAccount.id, {
        removableMembers: arrayUnion(toChecksumAddress(memberAddress)),
    })

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
            address: toChecksumAddress(memberAddress),
            name,
            id,
            image,
            mail
        })
    // await FirestoreWrite().updateDoc(accountType === "individual" ? "individuals" : "organizations", remoxAccount.id, {
    //     removableMembers: arrayUnion(memberAddress),
    // })

    return {
        accountAddress,
        image,
        mail,
        memberAddress: toChecksumAddress(memberAddress),
        name,
        remoxAccount,
        id
    }
})

interface IPendingMember {
    memberAddress: string,
    memberObject: IMember,
    accountId: string
}
export const Add_Member_To_Pending_List_Thunk = createAsyncThunk<IPendingMember, IPendingMember>("remoxData/add_pending_list_member", async ({ accountId, memberAddress, memberObject }, api) => {
    // const accountType = (api.getState() as RootState).remoxData.accountType;
    // const remoxAccount = (api.getState() as RootState).remoxData.storage?.organization ?? (api.getState() as RootState).remoxData.storage?.individual;
    // if (!remoxAccount) throw new Error("Account not found")
    await FirestoreWrite().updateDoc("accounts", accountId, {
        pendingMembersObjects: arrayUnion({
            member: toChecksumAddress(memberAddress),
            accountId: accountId,
            memberObject: memberObject
        })
    })

    // await FirestoreWrite().updateDoc(accountType === "individual" ? "individuals" : "organizations", remoxAccount.id, {
    //     pendingMembers: arrayUnion(toChecksumAddress(memberAddress))
    // })

    return {
        accountId,
        memberAddress: toChecksumAddress(memberAddress),
        memberObject
    }
})

// export const Add_Member_To_Removing_List_Thunk = createAsyncThunk<Omit<IPendingMember, "memberObject">, Omit<IPendingMember, "memberObject">>("remoxData/add_removing_list_member", async ({ accountId, memberAddress }, api) => {
//     const accountType = (api.getState() as RootState).remoxData.accountType;
//     const remoxAccount = (api.getState() as RootState).remoxData.storage?.organization ?? (api.getState() as RootState).remoxData.storage?.individual;
//     if (!remoxAccount) throw new Error("Account not found")
//     await FirestoreWrite().updateDoc(accountType === "individual" ? "individuals" : "organizations", remoxAccount.id, {
//         removableMembersObjects: arrayUnion({
//             member: toChecksumAddress(memberAddress),
//             accountId: accountId,
//         })
//     })

//     await FirestoreWrite().updateDoc(accountType === "individual" ? "individuals" : "organizations", remoxAccount.id, {
//         removableMembers: arrayUnion(toChecksumAddress(memberAddress))
//     })

//     return {
//         accountId,
//         memberAddress: toChecksumAddress(memberAddress)
//     }
// })
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