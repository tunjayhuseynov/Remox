import { Connection, Keypair, PublicKey } from "@solana/web3.js"
import { WITHDRAW_TOKEN_STRING, ZEBEC_PROGRAM_ID } from "@zebec-protocol/stream"
import { SolanaSerumEndpoint } from "components/Wallet"
import { token } from "easy-spl"
import { SolanaCoins } from "types"
import * as INSTRUCTIONS from "@zebec-protocol/stream/src/instructions";
import { adminApp } from "firebaseConfig/admin"

export const solanaInstructions = async (publicKey: string, recipient: string, coin: string, amount: number, isStreaming: boolean, start_time?: number, end_time?: number) => {
    const solanaCoin = SolanaCoins[coin]

    const from = new PublicKey(publicKey)
    const to = new PublicKey(recipient)
    const connection = new Connection(SolanaSerumEndpoint)

    if (isStreaming && start_time && end_time) {

        const senderAddress = new PublicKey(publicKey);
        const recipientAddress = new PublicKey(recipient);
        const tokenMintAddress = new PublicKey(solanaCoin.contractAddress);

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
            protocol: "zebec"
        })

        return [ix];
    }

    return await token.transferTokenInstructions(connection, new PublicKey(solanaCoin.contractAddress), from, to, amount)
}
