import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import type { IRemoxAccountORM } from "pages/api/account/multiple.api";
import type { IBudgetExerciseORM } from "pages/api/budget/index.api";
import type { ISpendingResponse } from "pages/api/calculation/_spendingType.api";
import type { IContributor } from "types/dashboard/contributors";
import type { IAccountType, IRemoxData } from "../remoxData";
import type { IStorage } from "../storage";
import type { IAccountMultisig } from "pages/api/multisig/index.api";
import type { IRequest } from "rpcHooks/useRequest";
import type { IPriceResponse } from "pages/api/calculation/price.api";
import type { ITag } from "pages/api/tags/index.api";
import { Multisig_Fetch_Thunk } from "./multisig";
import { BlockchainType } from "types/blockchains";
import {
  FirestoreReadAll,
  FirestoreReadMultiple,
} from "rpcHooks/useFirebase";
import { AltCoins } from "types";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";


type LaunchResponse = {
  Coins: AltCoins[];
  Balance: IPriceResponse;
  RemoxAccount: IRemoxAccountORM;
  Budgets: IBudgetExerciseORM[];
  Spending: ISpendingResponse;
  Contributors: IContributor[];
  Blockchain: BlockchainType;
  Storage: IStorage;
  Transactions: IFormattedTransaction[];
  Requests: IRequest[];
  Tags: ITag[];
  RecurringTasks: ITasking[];
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

interface LaunchParams {
  addresses: string[];
  blockchain: BlockchainType;
  accountType: IAccountType;
  id: string;
  storage: IStorage;
}

export const launchApp = createAsyncThunk<LaunchResponse, LaunchParams>(
  "remoxData/launch",
  async ({ addresses, blockchain, id, accountType, storage }, api) => {
    try {
      const spending = axios.get<ISpendingResponse>(
        "/api/calculation/spending",
        {
          params: {
            addresses: addresses,
            blockchain: blockchain.name,
            id: id,
          },
        }
      );

      const balances = axios.get<IPriceResponse>("/api/calculation/price", {
        params: {
          addresses: addresses,
          blockchain: blockchain.name,
        },
      });

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

      const contributors = axios.get<IContributor[]>("/api/contributors", {
        params: {
          id: id,
        },
      });

      const requests = axios.get<IRequest[]>("/api/requests", {
        params: {
          id: id,
        },
      });

      const tags = axios.get<ITag[]>("/api/tags", {
        params: {
          id: id,
        },
      });

      const recurrings = FirestoreReadMultiple<ITasking>("recurring", [
        {
          firstQuery: "accountId",
          secondQuery: id,
          condition: "==",
        },
      ]);

      const coins = FirestoreReadAll<AltCoins>(
        blockchain.currencyCollectionName
      );

      const [
        spendingRes,
        budgetRes,
        accountRes,
        contributorsRes,
        transactionsRes,
        requestRes,
        tagsRes,
        balanceRes,
        recurringsRes,
        coinsRes,
      ] = await Promise.all([
        spending,
        budget,
        accountReq,
        contributors,
        transactions,
        requests,
        tags,
        balances,
        recurrings,
        coins,
      ]);

      const accounts = accountRes.data;
      const multi = accounts.accounts.filter((s) => s.signerType === "multi");

      const {
        approvedRequests,
        multisigRequests,
        pendingRequests,
        rejectedRequests,
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

      const mapping = (s: ITransactionMultisig | IFormattedTransaction) => {
        const budget = allBudgets.find(
          b => b.txs.find(t => t.hashOrIndex.toLowerCase() === ('tx' in s ? s.hashOrIndex : s.hash).toLowerCase() && t.contractAddress.toLowerCase() === ('tx' in s ? s.contractAddress : s.to).toLowerCase())
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
        ...transactionsRes.data.map(mapping),
        ...multisigRequests.map(mapping),
      ].sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));

      const res: LaunchResponse = {
        Balance: balanceRes.data,
        RemoxAccount: accountRes.data,
        Budgets: budgetRes.data,
        Spending: spendingRes.data,
        Contributors: contributorsRes.data,
        Blockchain: blockchain,
        Storage: storage,
        Transactions: transactionsRes.data,
        Requests: requestRes.data,
        Tags: tagsRes.data,
        RecurringTasks: recurringsRes,
        multisigAccounts: {
          all: multisigAccounts,
          multisigTxs: multisigRequests,
          pendingTxs: pendingRequests,
          approvedTxs: approvedRequests,
          rejectedTxs: rejectedRequests,
          signingNeedTxs: signingNeedRequests,
        },
        cumulativeTransactions: allCumulativeTransactions,
        Coins: coinsRes,
      };

      return res;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);
