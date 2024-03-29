import { GOKI_ADDRESSES, GOKI_IDLS, Programs } from "@gokiprotocol/client";
import { newProgramMap } from "@saberhq/anchor-contrib";
import { SolanaReadonlyProvider } from "@saberhq/solana-contrib";
import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";
import { SolanaSerumEndpoint } from "components/Wallet";
import { Contract, ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import CeloTerminal from 'rpcHooks/ABI/CeloTerminal.json'
import GnosisABI from 'rpcHooks/ABI/Gnosis.json'
import { Blockchains, BlockchainType } from "types/blockchains";


export interface IMultisigOwners {
    owners: string[];
    nonce?: number;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse<IMultisigOwners>) {

    try {
        const { blockchain: blockchainName, address: multisigAddress, providerName } = req.query as { blockchain: BlockchainType["name"], address: string, providerName: string };

        const blockchain = Blockchains.find((blch: BlockchainType) => blch.name === blockchainName);
        if (!blockchain) throw new Error("Blockchain not found")

        if (blockchainName === 'solana') {
            const pb = new PublicKey(multisigAddress)

            const connection = new Connection(SolanaSerumEndpoint, "finalized");
            const provider = new SolanaReadonlyProvider(connection)

            const allAddresses = { ...GOKI_ADDRESSES, SmartWallet: pb };
            const programs = newProgramMap<Programs>(provider, GOKI_IDLS, allAddresses);

            const data = await programs.SmartWallet.account.smartWallet.fetch(pb)

            if (data) {
                return res.status(200).json({ owners: data.owners.map(s => s.toBase58()) })
            }
            throw new Error("Wallet has no data")
        }
        else if (providerName === "Celo Terminal") {
            const provider = new ethers.providers.JsonRpcProvider("https://forno.celo.org", {
                chainId: 42220,
                name: "forno",
            })


            const contract = new Contract(multisigAddress, CeloTerminal.abi, provider)

            const owners = await contract.getOwners();
            return res.status(200).json({ owners: owners })

        } else if (providerName === "GnosisSafe") {
            const { data } = await axios.get(blockchain.multisigProviders.find(p => p.name === providerName)?.txServiceUrl + "/api/v1/safes/" + multisigAddress)
            return res.status(200).json({ owners: data.owners, nonce: data.nonce })
        }
        throw new Error(`Invalid multiSignature`)
    } catch (e: any) {
        console.error(e)
        res.status(500).send({
            message: e.message
        } as any)
    }
}