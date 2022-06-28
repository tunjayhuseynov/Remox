import { GOKI_ADDRESSES, GOKI_IDLS, Programs } from "@gokiprotocol/client";
import { newProgramMap } from "@saberhq/anchor-contrib";
import { SolanaReadonlyProvider } from "@saberhq/solana-contrib";
import { Connection, PublicKey } from "@solana/web3.js";
import { Contract, ethers } from "ethers";
import { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { NextApiRequest, NextApiResponse } from "next";
import Multisig from 'rpcHooks/ABI/Multisig.json'


export interface MultisigOwners{
    owners: string[];
}


export default async function handler(req: NextApiRequest, res: NextApiResponse<MultisigOwners>) {

    try {
        const { blockchain, address: multisigAddress } = req.query as { blockchain: BlockchainType, address: string };

        if (blockchain === 'solana') {
            const pb = new PublicKey(multisigAddress)

            const connection = new Connection("https://solana-api.projectserum.com", "finalized");
            const provider = new SolanaReadonlyProvider(connection)

            const allAddresses = { ...GOKI_ADDRESSES, SmartWallet: pb };
            const programs = newProgramMap<Programs>(provider, GOKI_IDLS, allAddresses);

            const data = await programs.SmartWallet.account.smartWallet.fetch(pb)

            if (data) {
                return res.status(200).json({ owners: data.owners.map(s=>s.toBase58())})
            }
            throw new Error("Wallet has no data")
        }
        else if (blockchain === "celo") {
            const provider = new ethers.providers.JsonRpcProvider("https://forno.celo.org", {
                chainId: 42220,
                name: "forno",
            })

            const contract = new Contract(multisigAddress, Multisig.abi, provider)

            const owners = await contract.getOwners();
            return res.status(200).json({ owners: owners})
        }
        throw new Error(`Invalid multiSignature`)
    } catch (e: any) {
        console.error(e)
        res.status(500).send({
            message: e.message
        } as any)
    }
}