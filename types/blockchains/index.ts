import { AbiItem } from "rpcHooks/ABI/AbiItem";
import { CoinsURL } from "types/coins";

export type BlockchainType = {
    name: "celo" | "solana" | "polygon_evm" | "",
    displayName: "Celo" | "Solana" | "Polygon" | "",
    rpcUrl: string,
    explorerUrl: string,
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
        explorerUrl: "https://explorer.celo.org",
        logoUrl: CoinsURL.CELO,
        swapProtocols: [
            {
                name: "Ubeswap",
                contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
                abi: []
            }
        ],
        lendingProtocols: [
            {
                name: "Moola",
                contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
                abi: []
            }
        ],
        streamingProtocols: [],
        batchPaymentProtocols: [
            {
                name: "Remox Batch Payment",
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
    },
    {
        name: "solana",
        displayName: "Solana",
        rpcUrl: "https://solana-api.projectserum.com",
        explorerUrl: "https://explorer-api.mainnet-beta.solana.com/",
        logoUrl: CoinsURL.SOL,
        swapProtocols: [
            {
                name: "Jupiter",
                contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
                abi: []
            }
        ],
        lendingProtocols: [
            {
                name: "Castle Finance",
                contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
                abi: []
            }
        ],
        streamingProtocols: [
            {
                name: "Zebec",
                contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
                abi: []
            }
        ],
        batchPaymentProtocols: [
            {
                name: "Solana",
                contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
                abi: []
            }
        ],
        recurringPaymentProtocols: [
 
        ]
    }
]