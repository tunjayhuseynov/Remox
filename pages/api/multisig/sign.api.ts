import { GOKI_ADDRESSES, GOKI_IDLS, Programs } from "@gokiprotocol/client";
import { newProgramMap } from "@saberhq/anchor-contrib";
import { SolanaReadonlyProvider } from "@saberhq/solana-contrib";
import { Connection, PublicKey } from "@solana/web3.js";
import { SolanaSerumEndpoint } from "components/Wallet";
import { Contract, ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import Multisig from 'rpcHooks/ABI/CeloTerminal.json'
import { Blockchains, BlockchainType } from "types/blockchains";
import GnosisABI from 'rpcHooks/ABI/Gnosis.json'
import { hexToNumberString } from "web3-utils";
import axios from "axios";

export interface IMultisigThreshold {
    sign: number;
    internalSign?: number;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse<IMultisigThreshold>) {
    try {
        const { blockchain, address: multisigAddress, providerName } = req.query as { blockchain: BlockchainType["name"], address: string, providerName: string };

        const Blockchain = Blockchains.find((b) => b.name === blockchain);
        if (!Blockchain) throw new Error("Blockchain not found")

        if (blockchain === 'solana') {
            const pb = new PublicKey(multisigAddress)

            const connection = new Connection(SolanaSerumEndpoint, "finalized");
            const provider = new SolanaReadonlyProvider(connection)

            const allAddresses = { ...GOKI_ADDRESSES, SmartWallet: pb };
            const programs = newProgramMap<Programs>(provider, GOKI_IDLS, allAddresses);

            const data = await programs.SmartWallet.account.smartWallet.fetch(pb)

            if (data) {
                return res.status(200).json({ sign: data.threshold.toNumber(), internalSign: data.threshold.toNumber() })
            }
            throw new Error("Wallet has no data")
        }
        else if (providerName === "Celo Terminal") {
            const provider = new ethers.providers.JsonRpcProvider("https://forno.celo.org", {
                chainId: 42220,
                name: "forno",
            })

            const contract = new Contract(multisigAddress, Multisig.abi, provider)

            // const multiSig = await kit.contracts.getMultiSig(selectedAccount);
            const sign = (await contract.required()).toNumber();
            const internalSign = (await contract.internalRequired()).toNumber();
            return res.status(200).json({ sign: sign, internalSign: internalSign })
        } else if (providerName === "GnosisSafe") {
            const { data } = await axios.get(Blockchain.multisigProviders.find(p => p.name === providerName)?.txServiceUrl + "/api/v1/safes/" + multisigAddress)

            return res.status(200).json({
                sign: +data.threshold,
                internalSign: +data.threshold
            })
        }
        throw new Error(`Invalid multiSignature`)
    } catch (e: any) {
        console.error(e)
        res.status(500).send({
            message: e.message
        } as any)
    }
}