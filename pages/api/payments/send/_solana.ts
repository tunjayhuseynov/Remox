import { Connection, PublicKey } from "@solana/web3.js"
import { SolanaSerumEndpoint } from "components/Wallet"
import { token } from "easy-spl"
import { SolanaCoins } from "types"

export const solanaInstructions = async (publicKey: string, recipient: string, coin: string, amount: number) => {
    const solanaCoin = SolanaCoins[coin]

    const from = new PublicKey(publicKey)
    const to = new PublicKey(recipient)
    const connection = new Connection(SolanaSerumEndpoint)

    return await token.transferTokenInstructions(connection, new PublicKey(solanaCoin.contractAddress), from, to, amount)
}
