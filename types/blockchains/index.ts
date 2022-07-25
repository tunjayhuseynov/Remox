import { AbiItem } from "rpcHooks/ABI/AbiItem";
import { CoinsURL } from "types/coins";

export type BlockchainType = {
    name: "celo" | "solana" | "polygon_evm",
    displayName: "Celo" | "Solana" | "Polygon",
    rpcUrl: string,
    logoUrl: string,
    swapProtocols: {
        name: string;
        contractAddress: string;
        abi: AbiItem[]
    }[],
    lendingProtocols: {
        name: string;
        contractAddress: string;
        abi: AbiItem[]
    }[],
    streamingProtocols: {
        name: string;
        contractAddress: string;
        abi: AbiItem[]
    }[],
    batchPaymentProtocols: {
        name: string;
        contractAddress: string;
        abi: AbiItem[]
    }[],
    recurringPaymentProtocols: {
        name: string;
        contractAddress: string;
        abi: AbiItem[]
    }[],
};


export const Blockchains: BlockchainType[] = [
    {
        name: "celo",
        displayName: "Celo",
        rpcUrl: "https://celo-rpc.celo.org",
        logoUrl: CoinsURL.CELO,
        swapProtocols: [
            {
                name: "CeloSwap",
                contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
                abi: []
            }
        ],
        lendingProtocols: [
            {
                name: "CeloLending",
                contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
                abi: []
            }
        ],
        streamingProtocols: [
            {
                name: "CeloStreaming",
                contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
                abi: []
            }
        ],
        batchPaymentProtocols: [
            {
                name: "CeloBatchPayment",
                contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
                abi: []
            }
        ],
        recurringPaymentProtocols: [
            {
                name: "CeloRecurringPayment",
                contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
                abi: []
            }
        ]
    }
]