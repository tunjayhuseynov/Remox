import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { IAccountORM } from "pages/api/account";
import { IMultisigThreshold } from "pages/api/multisig/sign";
import { IRemoxData } from "../remoxData";

export default {
    setAccounts: (state: IRemoxData, action: { payload: IAccountORM[] }) => {
        state.accounts = action.payload;
    },
    removeAccount: (state: IRemoxData, action: { payload: string }) => {
        state.accounts = state.accounts.filter(account => account.id !== action.payload);
    },
    addAccount: (state: IRemoxData, action: { payload: IAccountORM }) => {
        state.accounts.push(action.payload);
    },
    addOwner: (state: IRemoxData, action: { payload: { accountId: string, owner: string } }) => {
        const account = state.accounts.find(s => s.id === action.payload.accountId)
        if (account && account.multidata) {
            account.multidata.owners.push(action.payload.owner);
        }
    },
    removeOwner: (state: IRemoxData, action: { payload: { accountId: string, owner: string } }) => {
        const account = state.accounts.find(s => s.id === action.payload.accountId)
        if (account && account.multidata) {
            account.multidata.owners = account.multidata.owners.filter(owner => owner !== action.payload.owner);
        }
    },
    setThreshold: (state: IRemoxData, action: { payload: { accountId: string, threshold: IMultisigThreshold } }) => {
        const account = state.accounts.find(s => s.id === action.payload.accountId)
        if (account && account.multidata) {
            account.multidata.threshold = action.payload.threshold;
        }
    },
    addTx: (state: IRemoxData, action: { payload: { accountId: string, tx: ITransactionMultisig, usdValue: number } }) => {
        const account = state.accounts.find(s => s.id === action.payload.accountId)
        if (account && account.multidata) {
            account.multidata.txs.push(action.payload.tx);
            account.totalValue += action.payload.usdValue
        }
    }
}