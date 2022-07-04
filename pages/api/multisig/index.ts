import axios from "axios";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { NextApiRequest, NextApiResponse } from "next";
import { IMultisigThreshold } from "./sign";

export interface IAccountMultisig {
    owners: string[];
    threshold: IMultisigThreshold,
    txs: ITransactionMultisig[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<IAccountMultisig>) {
    try {
        const { blockchain, address: multisigAddress, Skip, Take } = req.query as { blockchain: BlockchainType, address: string, Skip: string, Take: string };

        const ownersPromise = axios.get("/api/multisig/owners", {
            params: {
                blockchain,
                address: multisigAddress,
            }
        })

        const thresholdPromise = axios.get("/api/multisig/threshold", {
            params: {
                blockchain,
                address: multisigAddress,
            }
        })

        const txsPromise = axios.get("/api/multisig/txs", {
            params: {
                blockchain,
                address: multisigAddress,
                Skip,
                Take,
            }
        })

        const [owners, threshold, txs] = await Promise.all([ownersPromise, thresholdPromise, txsPromise])

        res.status(200).json({
            owners: owners.data,
            threshold: threshold.data,
            txs: txs.data
        })
    } catch (error) {

    }
}