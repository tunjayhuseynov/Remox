import axios from "axios";
import { accountCollectionName } from "crud/account";
import { IAccount } from "firebaseConfig";
import { adminApp } from "firebaseConfig/admin";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { NextApiRequest, NextApiResponse } from "next";
import { BlockchainType } from "types/blockchains";
import { BASE_URL } from "utils/api";
import { MultisigOwners } from "./owners.api";
import { IMultisigThreshold } from "./sign.api";
import axiosRetry from 'axios-retry';

export interface IAccountMultisig {
    name: string;
    address: string;
    owners: string[];
    threshold: IMultisigThreshold,
    txs: ITransactionMultisig[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<IAccountMultisig>) {
    try {
        const { blockchain, Skip, Take, id, accountId } = req.query as { blockchain: BlockchainType["name"], accountId: string, Skip: string, Take: string, id: string };
      
        const accountRef = await adminApp.firestore().collection(accountCollectionName).doc(id).get()
        const account = accountRef.data() as IAccount

        const name = account.name;
        const provider = account.provider;

        axiosRetry(axios, { retries: 10 });

        const ownersPromise = axios.get<MultisigOwners>(BASE_URL + "/api/multisig/owners", {
            params: {
                blockchain,
                address: account.address,
            }
        })


        const thresholdPromise = axios.get<IMultisigThreshold>(BASE_URL + "/api/multisig/sign", {
            params: {
                blockchain,
                address: account.address,
            }
        })

        const txsPromise = axios.get<ITransactionMultisig[]>(BASE_URL + "/api/multisig/txs", {
            params: {
                blockchain,
                name,
                address: account.address,
                Skip,
                Take,
                id: accountId,
                providerName: provider
            },

        })

        const [owners, threshold, txs] = await Promise.all([ownersPromise, thresholdPromise, txsPromise])
  
        res.status(200).json({
            name,
            address: account.address,
            owners: owners.data.owners,
            threshold: threshold.data,
            txs: txs.data
        })
    } catch (error) {
        console.log(error)
        res.status(500).json(error as any)
    }
}