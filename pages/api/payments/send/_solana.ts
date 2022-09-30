import { Connection, Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js"
import { WITHDRAW_TOKEN_STRING, ZEBEC_PROGRAM_ID } from "@zebec-protocol/stream/src/constants"
import { SolanaSerumEndpoint } from "components/Wallet"
import { token } from "easy-spl"
import * as INSTRUCTIONS from "@zebec-protocol/stream/src/instructions";
import { adminApp } from "firebaseConfig/admin"
import { ISwap } from "./index.api"
import { Jupiter } from "@jup-ag/core"
import JSBI from "jsbi"
import { Coins } from "types";
import { ITasking } from "redux/slices/account/remoxData";

export async function solanaInstructions(coins: Coins, accountId: string, publicKey: string, recipient: string, coin: string, amount: number, swap: ISwap | null): Promise<TransactionInstruction[]>;
export async function solanaInstructions(coins: Coins, accountId: string, publicKey: string, recipient: string, coin: string, amount: number, swap: ISwap | null, isStreaming?: boolean, start_time?: number, end_time?: number): Promise<TransactionInstruction[]>;
export async function solanaInstructions(coins: Coins, accountId: string, publicKey: string, recipient: string, coin: string, amount: number, swap: ISwap | null, isStreaming: boolean, start_time: number, end_time: number): Promise<TransactionInstruction[]>;
export async function solanaInstructions(coins: Coins, accountId: string, publicKey: string, recipient: string, coin: string, amount: number, swap: ISwap | null, isStreaming?: boolean, start_time?: number, end_time?: number) {
    const connection = new Connection(SolanaSerumEndpoint)
    if (swap) {
        const jupiter = await Jupiter.load({
            connection,
            cluster: "mainnet-beta",
            // user: new PublicKey(account.address), // or public key
            // platformFeeAndAccounts:  NO_PLATFORM_FEE,
            routeCacheDuration: 10_000, // Will not refetch data on computeRoutes for up to 10 seconds
        });
        const routes = await jupiter.computeRoutes({
            inputMint: new PublicKey(swap.inputCoin.address), // Mint address of the input token
            outputMint: new PublicKey(swap.outputCoin.address), // Mint address of the output token
            amount: JSBI.BigInt(parseFloat(swap.amount) * (10 ** swap.inputCoin.decimals!)), // raw input amount of tokens
            slippage: parseFloat(swap.slippage), // The slippage in % terms
            forceFetch: false // false is the default value => will use cache if not older than routeCacheDuration
        })

        const { transactions } = await jupiter.exchange({
            routeInfo: routes.routesInfos[0],
            userPublicKey: new PublicKey(swap.account)
        })

        return transactions.swapTransaction.instructions
    }

    const solanaCoin = coins[coin]

    const from = new PublicKey(publicKey)
    const to = new PublicKey(recipient)

    if (isStreaming && start_time && end_time) {

        const senderAddress = new PublicKey(publicKey);
        const recipientAddress = new PublicKey(recipient);
        const tokenMintAddress = new PublicKey(solanaCoin.address);

        const [withdrawEscrowAddress, _] = await PublicKey.findProgramAddress(
            [Buffer.from(WITHDRAW_TOKEN_STRING), senderAddress.toBuffer(), tokenMintAddress.toBuffer()],
            new PublicKey(ZEBEC_PROGRAM_ID)
        )

        const escrowAddress = new Keypair();

        const ix = await INSTRUCTIONS.createInitMultiTokenStreamInstruction(
            senderAddress,
            recipientAddress,
            escrowAddress.publicKey,
            withdrawEscrowAddress,
            new PublicKey(ZEBEC_PROGRAM_ID),
            tokenMintAddress,
            start_time,
            end_time,
            amount
        )

        await adminApp.firestore().collection("recurring").add({
            taskId: escrowAddress.publicKey.toBase58(),
            sender: senderAddress.toBase58(),
            recipient: recipientAddress.toBase58(),
            blockchain: "solana",
            protocol: "zebec",
            from: start_time,
            to: end_time,
            accountId,
            interval: null,
            inputs: [
                {
                    amount,
                    coin,
                    recipient
                }
            ],

        } as ITasking)

        return [ix];
    }

    return await token.transferTokenInstructions(connection, new PublicKey(solanaCoin.address), from, to, amount)
}
