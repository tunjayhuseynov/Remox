import { GOKI_ADDRESSES, GOKI_IDLS, Programs } from "@gokiprotocol/client";
import { newProgramMap } from "@saberhq/anchor-contrib";
import { SolanaReadonlyProvider } from "@saberhq/solana-contrib";
import { Connection, PublicKey } from "@solana/web3.js";
import { SolanaSerumEndpoint } from "components/Wallet";
import { Contract, ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import CeloTerminal from 'rpcHooks/ABI/CeloTerminal.json'
import GnosisABI from 'rpcHooks/ABI/Gnosis.json'
import { Blockchains, BlockchainType } from "types/blockchains";


export interface MultisigOwners {
    owners: string[];
}


export default async function handler(req: NextApiRequest, res: NextApiResponse<MultisigOwners>) {

    try {
        const { blockchain: blockchainName, address: multisigAddress } = req.query as { blockchain: BlockchainType["name"], address: string };

        const blockchain = Blockchains.find((blch: BlockchainType) => blch.name === blockchainName);

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
        else if (blockchainName === "celo") {
            const provider = new ethers.providers.JsonRpcProvider("https://forno.celo.org", {
                chainId: 42220,
                name: "forno",
            })

            
            const contract = new Contract(multisigAddress, CeloTerminal.abi, provider)

            const owners = await contract.getOwners();
            return res.status(200).json({ owners: owners })
        } else if(blockchainName.includes("evm")){
            const provider = new ethers.providers.JsonRpcProvider(blockchain!.rpcUrl);


            const contract = new Contract(multisigAddress, GnosisABI, provider)

            const owners = await contract.getOwners();
            return res.status(200).json({ owners: owners })
        }
        throw new Error(`Invalid multiSignature`)
    } catch (e: any) {
        console.error(e)
        res.status(500).send({
            message: e.message
        } as any)
    }
}