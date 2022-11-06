import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ERCMethodIds, IBatchRequest, IFormattedTransaction, ISwap } from "hooks/useTransactionProcess";
import type { IRemoxAccountORM } from "pages/api/account/multiple.api";
import type { IBudgetExerciseORM } from "pages/api/budget/index.api";
import type { CoinStats, IFlowDetail, ISpendingResponse, ITagFlow } from "pages/api/calculation/_spendingType";
import type { IContributor } from "types/dashboard/contributors";
import type { IAccountType, IRemoxData, ITasking } from "../remoxData";
import type { IStorage } from "../storage";
import type { IAccountMultisig } from "pages/api/multisig/index.api";
import type { IRequest } from "rpcHooks/useRequest";
import type { IPriceResponse } from "pages/api/calculation/price.api";
import type { ITag } from "pages/api/tags/index.api";
import { Multisig_Fetch_Thunk } from "./multisig";
import { Blockchains, BlockchainType } from "types/blockchains";
import {
  FirestoreReadAll,
  FirestoreReadMultiple,
} from "rpcHooks/useFirebase";
import { AltCoins } from "types";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { IHpApiResponse } from "pages/api/calculation/hp.api";
import { RootState } from "redux/store";
import axiosRetry from 'axios-retry';
import { IAccount } from "firebaseConfig";
import { fiatList } from "components/general/PriceInputField";
import { IPrice } from "utils/api";
import BigNumber from "bignumber.js";


type LaunchResponse = {
  Coins: AltCoins[];
  HistoryPriceList: IHpApiResponse,
  NFTs: IFormattedTransaction[],
  // Balance: IPriceResponse;
  RemoxAccount: IRemoxAccountORM;
  Budgets: IBudgetExerciseORM[];
  Spending: ISpendingResponse;
  Contributors: IContributor[];
  Blockchain: BlockchainType;
  Storage: IStorage;
  Transactions: IFormattedTransaction[];
  Requests: IRequest[];
  Tags: ITag[];
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

interface LaunchParams {
  addresses: IAccount[];
  blockchain: BlockchainType;
  accountType: IAccountType;
  id: string;
  storage: IStorage;
  isProgressivScreen?: boolean;
}

export const launchApp = createAsyncThunk<LaunchResponse, LaunchParams>(
  "remoxData/launch",
  async ({ addresses, blockchain, id, accountType, storage }, api) => {
    try {
      axiosRetry(axios, { retries: 3 });

      let parsedAddresses = addresses.reduce<{ [blockchain: string]: IAccount[] }>((acc, address) => {
        if (acc[address.blockchain]) {
          acc[address.blockchain].push(address)
        } else {
          acc[address.blockchain] = [address]
        }
        return acc;
      }, {})

      let formattedTransactions: IFormattedTransaction[] = [];
      let MultisigRequests: ITransactionMultisig[] = []
      let AllBudgets: IBudgetExerciseORM[] = [];
      let Balance: IPriceResponse[] = [];
      let RemoxAccounts: IRemoxAccountORM[] = [];
      let Spending: ISpendingResponse[] = [];
      let Contributors: IContributor[] = [];
      let Tags: ITag[] = [];
      let Requests: IRequest[] = [];
      let AllCoins: AltCoins[] = [];
      let MultisigAccounts: IAccountMultisig[] = [];
      let ApprovedRequests: ITransactionMultisig[] = [];
      let RejectedRequests: ITransactionMultisig[] = [];
      let PendingRequests: ITransactionMultisig[] = [];
      let SigningNeedRequests: ITransactionMultisig[] = [];


      for (const [bc, accountAll] of Object.entries(parsedAddresses)) {
        const spending = axios.get<ISpendingResponse>(
          "/api/calculation/spending",
          {
            params: {
              addresses: accountAll.map(s => s.address),
              blockchain: bc,
              addressTypes: accountAll.map(s => s.provider ?? "0"),
              id: id,
            },
          }
        );

        const balances = axios.get<IPriceResponse>("/api/calculation/price", {
          params: {
            addresses: accountAll.map(s => s.address),
            blockchain: bc,
          },
        });

        const transactions = axios.get<IFormattedTransaction[]>(
          "/api/transactions",
          {
            params: {
              addresses: accountAll.map(s => s.address),
              blockchain: bc,
              id: id,
            },
          }
        );

        const budget = axios.get<IBudgetExerciseORM[]>("/api/budget", {
          params: {
            id: id,
            addresses: accountAll.map(s => s.address),
            blockchain: bc,
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

        // const recurrings = FirestoreReadMultiple<ITasking>("recurring", [
        //   {
        //     firstQuery: "accountId",
        //     secondQuery: id,
        //     condition: "==",
        //   },
        // ]);

        const blockchain = Blockchains.find(s => s.name === bc)
        if (!blockchain) continue;

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
          // recurringsRes,
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
          // recurrings,
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
              blockchain: bc,
              addresses: multi.map((s) => s.address),
              fetchable: false
            })
          )
          .unwrap();


        formattedTransactions.push(...transactionsRes.data)
        AllBudgets = [...AllBudgets, ...budgetRes.data];
        MultisigRequests = [...MultisigRequests, ...multisigRequests]
        Balance = [...Balance, balanceRes.data];
        RemoxAccounts = [...RemoxAccounts, accounts];
        Spending = [...Spending, spendingRes.data];
        Contributors = [...Contributors, ...contributorsRes.data];
        Requests = [...Requests, ...requestRes.data];
        Tags = [...Tags, ...tagsRes.data];
        AllCoins = [...AllCoins, ...coinsRes];
        MultisigAccounts = [...MultisigAccounts, ...multisigAccounts]
        ApprovedRequests = [...ApprovedRequests, ...approvedRequests]
        RejectedRequests = [...RejectedRequests, ...rejectedRequests]
        PendingRequests = [...PendingRequests, ...pendingRequests]
        SigningNeedRequests = [...SigningNeedRequests, ...signingNeedRequests]
      }



      const allBudgets = AllBudgets.map(s => s.budgets).flat();
      let mapIndex = 0;
      const mapping = (s: ITransactionMultisig | IFormattedTransaction) => {
        const budget = allBudgets.find(
          b => b.txs.find(t => t.hashOrIndex.toLowerCase() === ('tx' in s ? s.hashOrIndex : s.hash).toLowerCase() && t.contractAddress.toLowerCase() === ('tx' in s ? s.contractAddress : s.address).toLowerCase())
        )

        if (budget) {
          return {
            ...s,
            budget,
          }
        }
        return {
          ...s,
        };
      }

      // const singleAddresses = state.remoxData.accounts.filter(s => s.signerType === "single").map(s => s.address)
      let allCumulativeTransactions = [
        ...formattedTransactions.filter(s => !s.rawData.tokenID).map(mapping), //&& !singleAddresses.find(d => d.toLowerCase() === s.rawData.from.toLowerCase())
        ...MultisigRequests.map(mapping),
      ].sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1)).map((s, i) => ({ ...s, indexPlace: mapIndex++ }));

      const hpList = await axios.post<IHpApiResponse>('/api/calculation/hp', {
        // coinList: Object.keys(Balance.map(s => s.AllPrices).flat()), //Array.from(new Set(allCoins.filter(s => s))),
        lastTxDate: allCumulativeTransactions.at(-1)?.timestamp,
        blockchains: Blockchains.map(s => s.name),
        fiatMoney: fiatList.map(s => s.name)
      })

      const nfts = formattedTransactions.filter(s => s.rawData.tokenID);

      const recurringList = allCumulativeTransactions
        .filter(s => ('tx' in s) ?
          s.tx.method === ERCMethodIds.automatedTransfer || s.tx.method === ERCMethodIds.automatedCanceled || s.tx.method === ERCMethodIds.automatedBatchRequest
          :
          s.method === ERCMethodIds.automatedTransfer || s.method === ERCMethodIds.automatedCanceled || s.method === ERCMethodIds.automatedBatchRequest
        )

      const res: LaunchResponse = {
        NFTs: nfts,
        HistoryPriceList: hpList.data,
        // Balance: Balance.map(s => s.AllPrices)
        RemoxAccount: { accounts: RemoxAccounts.map(s => s.accounts).flat() },
        Budgets: AllBudgets,
        Spending: {
          Account: Spending.reduce<IFlowDetail>((a, b) => {
            Object.entries(b.Account).forEach(([key, value]) => {
              if (a[key]) {
                a[key].push(...value)
              } else {
                a[key] = value
              }
            })
            return a;
          }, {}),
          AccountAge: Spending.reduce<number>((a, b) => {
            if (b.AccountAge > a) {
              return b.AccountAge;
            }
            return a;
          }, 0),
          AccountInTag: Spending.reduce<ITagFlow>((a, b) => {
            a.currentMonth.push(...b.AccountInTag.currentMonth)
            a.month.push(...b.AccountInTag.month)
            a.year.push(...b.AccountInTag.year)
            a.quart.push(...b.AccountInTag.quart)
            a.week.push(...b.AccountInTag.week)
            return a;
          },
            {
              week: [],
              month: [],
              quart: [],
              year: [],
              currentMonth: []
            }),
          AccountOutTag: Spending.reduce<ITagFlow>((a, b) => {
            a.currentMonth.push(...b.AccountOutTag.currentMonth)
            a.month.push(...b.AccountOutTag.month)
            a.year.push(...b.AccountOutTag.year)
            a.quart.push(...b.AccountOutTag.quart)
            a.week.push(...b.AccountOutTag.week)
            return a;
          },
            {
              week: [],
              month: [],
              quart: [],
              year: [],
              currentMonth: []
            }),
          CoinStats: Spending.reduce<CoinStats[]>((a, c) => {
            c.CoinStats.forEach(s => {
              const index = a.findIndex(d => d.coin === s.coin)
              if (index > -1) {
                a[index].totalSpending += s.totalSpending;
              } else {
                a.push(s)
              }
            })
            return a;
          }, []),
          TotalBalance: Spending.reduce<IPrice>((a, b) => {
            Object.entries(b.TotalBalance).forEach(([key, value]) => {
              if (a[key]) {
              } else {
                a[key] = value
              }
            })
            return a;
          }, {}),
          Fee: Spending.reduce<{ [key: string]: { name: AltCoins, amount: string }[] }>((a, b) => {
            Object.entries(b.Fee).forEach(([key, value]) => {
              if (a[key]) {
                a[key] = [...a[key], ...value];
              } else {
                a[key] = value
              }
            })
            return a;
          }, {})
        },
        Contributors: Contributors,
        Blockchain: blockchain,
        Storage: storage,
        Transactions: formattedTransactions,
        Requests: Requests,
        Tags: Tags,
        RecurringTasks: recurringList,
        multisigAccounts: {
          all: MultisigAccounts,
          multisigTxs: MultisigRequests,
          pendingTxs: PendingRequests,
          approvedTxs: ApprovedRequests,
          rejectedTxs: RejectedRequests,
          signingNeedTxs: SigningNeedRequests,
        },
        cumulativeTransactions: allCumulativeTransactions,
        Coins: AllCoins,
      };

      return res;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);
