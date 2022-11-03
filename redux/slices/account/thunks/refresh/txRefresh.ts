import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { ERCMethodIds, IFormattedTransaction } from "hooks/useTransactionProcess";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { IRemoxAccountORM } from "pages/api/account/multiple.api";
import { IBudgetExerciseORM } from "pages/api/budget/index.api";
import { IAccountMultisig } from "pages/api/multisig/index.api";
import { RootState } from "redux/store";
import { BlockchainType } from "types/blockchains";
import { IAccountType, IRemoxData } from "../../remoxData";
import { Multisig_Fetch_Thunk } from "../multisig";

type TxRefreshResponse = {
    NFTs: IFormattedTransaction[],
    RemoxAccount: IRemoxAccountORM;
    Budgets: IBudgetExerciseORM[];
    Transactions: IFormattedTransaction[];
    RecurringTasks: IRemoxData["cumulativeTransactions"];
    multisigAccounts: {
        all: IAccountMultisig[];
        multisigTxs: IAccountMultisig["txs"];
        pendingTxs: IAccountMultisig["txs"];
        approvedTxs: IAccountMultisig["txs"];
        rejectedTxs: IAccountMultisig["txs"];
        signingNeedTxs: IAccountMultisig["txs"];
    };
    cumulativeTransactions: IRemoxData["cumulativeTransactions"];
};


export const Tx_Refresh_Data_Thunk = createAsyncThunk<TxRefreshResponse>("remoxData/tx_refresh_data", async (
    _, api) => {
    const state = api.getState() as RootState;
    const blockchain = state.remoxData.blockchain;
    const accountType = state.remoxData.accountType
    const addresses = state.remoxData.accounts.map((account) => account.address);
    const id = state.remoxData.storage?.organization ? state.remoxData.storage.organization.id : state.remoxData.storage?.individual.id;
    if (!id) throw new Error("No id found");

    const transactions = axios.get<IFormattedTransaction[]>(
        "/api/transactions",
        {
            params: {
                addresses: addresses,
                blockchain: blockchain.name,
                id: id,
            },
        }
    );

    const budget = axios.get<IBudgetExerciseORM[]>("/api/budget", {
        params: {
            id: id,
            addresses: addresses,
            blockchain: blockchain.name,
        },
    });

    const accountReq = axios.get<IRemoxAccountORM>("/api/account/multiple", {
        params: {
            id: id,
            type: accountType,
        },
    });


    const [
        budgetRes,
        accountRes,
        transactionsRes,
    ] = await Promise.all([
        budget,
        accountReq,
        transactions,
    ]);

    const accounts = accountRes.data;
    const multi = accounts.accounts.filter((s) => s.signerType === "multi");

    const {
        multisigRequests,
        approvedRequests,
        rejectedRequests,
        pendingRequests,
        signingNeedRequests,
        multisigAccounts,
    } = await api
        .dispatch(
            Multisig_Fetch_Thunk({
                accounts: multi,
                blockchain: blockchain.name,
                addresses: multi.map((s) => s.address),
                fetchable: false
            })
        )
        .unwrap();

    const allBudgets = budgetRes.data.map(s => s.budgets).flat();

    const nfts = transactionsRes.data.filter(s => s.rawData.tokenID);

    const mapping = (s: ITransactionMultisig | IFormattedTransaction) => {
        const budget = allBudgets.find(
            b => b.txs.find(t => t.hashOrIndex.toLowerCase() === ('tx' in s ? s.hashOrIndex : s.hash).toLowerCase() && t.contractAddress.toLowerCase() === ('tx' in s ? s.contractAddress : s.address).toLowerCase())
        )

        if (budget) {
            return {
                ...s,
                budget
            }
        }
        return s;
    }


    let allCumulativeTransactions = [
        ...transactionsRes.data.filter(s => !s.rawData.tokenID).map(mapping),
        ...multisigRequests.map(mapping),
    ].sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));

    const recurringList = allCumulativeTransactions
        .filter(s => ('tx' in s) ?
            s.tx.method === ERCMethodIds.automatedTransfer || s.tx.method === ERCMethodIds.automatedCanceled || s.tx.method === ERCMethodIds.automatedBatchRequest
            :
            s.method === ERCMethodIds.automatedTransfer || s.method === ERCMethodIds.automatedCanceled || s.method === ERCMethodIds.automatedBatchRequest
        )

    const res: TxRefreshResponse = {
        NFTs: nfts,
        RemoxAccount: accountRes.data,
        Budgets: budgetRes.data,
        Transactions: transactionsRes.data,
        RecurringTasks: recurringList,
        multisigAccounts: {
            all: multisigAccounts,
            multisigTxs: multisigRequests,
            pendingTxs: pendingRequests,
            approvedTxs: approvedRequests,
            rejectedTxs: rejectedRequests,
            signingNeedTxs: signingNeedRequests,
        },
        cumulativeTransactions: allCumulativeTransactions,
    };

    return res;
})