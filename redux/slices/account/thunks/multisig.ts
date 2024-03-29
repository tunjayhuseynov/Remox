import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IAccountORM } from "pages/api/account/index.api";
import { IAccountMultisig } from "pages/api/multisig/index.api";
import { RootState } from "redux/store";

interface IReturnType {
    multisigRequests: IAccountMultisig["txs"]
    pendingRequests: IAccountMultisig["txs"]
    approvedRequests: IAccountMultisig["txs"]
    rejectedRequests: IAccountMultisig["txs"]
    signingNeedRequests: IAccountMultisig["txs"]
    multisigAccounts: IAccountMultisig[]
}

export const Multisig_Fetch_Thunk = createAsyncThunk<IReturnType, { accounts: IAccountORM[], blockchain: string, addresses: string[], fetchable: boolean }>("remoxData/multisig/fetch", async ({ accounts, blockchain, addresses, fetchable = false }, api) => {
    let multisigAccountsRef;
    if (fetchable) {
        const promiseMultisigAccounts = accounts.filter(s => s.signerType === "multi").map(s => axios.get<IAccountMultisig>("/api/multisig", {
            params: {
                blockchain: blockchain,
                Skip: 0,
                Take: 100,
                id: s.id,
                accountId: (api.getState() as RootState).remoxData.providerID
            }
        }))
        multisigAccountsRef = (await Promise.all(promiseMultisigAccounts)).map(s => s.data);
    } else {
        multisigAccountsRef = accounts.filter(s => s.signerType === "multi").map(s => s.multidata!)
    }

    const multisigAccounts = multisigAccountsRef;

    let multisigRequests: IAccountMultisig["txs"] = [];
    let pendingRequests: IAccountMultisig["txs"] = [];
    let approvedRequests: IAccountMultisig["txs"] = [];
    let rejectedRequests: IAccountMultisig["txs"] = [];
    let signingNeedRequests: IAccountMultisig["txs"] = [];

    multisigAccounts.forEach(s => {
        const txs = s.txs;
        const Pendings = txs.filter(s => s.isExecuted === false &&(s.rejection == null || (s.rejection && s.rejection?.isExecuted === false)))
        const Approveds = txs.filter(s => s.isExecuted === true)

        pendingRequests = [...pendingRequests, ...Pendings];
        rejectedRequests = [...rejectedRequests, ...Pendings.filter(s => s.confirmations.length === 0)]
        approvedRequests = [...approvedRequests, ...Approveds];
        signingNeedRequests = [...signingNeedRequests, ...Pendings.filter(s => !s.confirmations.some(s => addresses.includes(s)))]
        multisigRequests = [...multisigRequests, ...txs]
    })


    return {
        multisigRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        signingNeedRequests,
        multisigAccounts
    }
})