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

export interface IAccountMultisig {
    name: string;
    address: string;
    owners: string[];
    threshold: IMultisigThreshold,
    txs: ITransactionMultisig[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<IAccountMultisig>) {
    try {
        const { blockchain, address: multisigAddress, Skip, Take } = req.query as { blockchain: BlockchainType["name"], address: string, Skip: string, Take: string };

        const accountRef = await adminApp.firestore().collection(accountCollectionName).doc(multisigAddress).get()
        const account = accountRef.data() as IAccount

        const name = account.name;

        const ownersPromise = axios.get<MultisigOwners>(BASE_URL + "/api/multisig/owners", {
            params: {
                blockchain,
                address: multisigAddress,
            }
        })

        const thresholdPromise = axios.get<IMultisigThreshold>(BASE_URL + "/api/multisig/threshold", {
            params: {
                blockchain,
                address: multisigAddress,
            }
        })

        const txsPromise = axios.get<ITransactionMultisig[]>(BASE_URL + "/api/multisig/txs", {
            params: {
                blockchain,
                name,
                address: multisigAddress,
                Skip,
                Take,
            }
        })

        const [owners, threshold, txs] = await Promise.all([ownersPromise, thresholdPromise, txsPromise])

        res.status(200).json({
            name,
            address: multisigAddress,
            owners: owners.data.owners,
            threshold: threshold.data,
            txs: txs.data
        })
    } catch (error) {

    }
}