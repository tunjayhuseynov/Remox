import { IIndividual } from "firebaseConfig"
import useSign from "hooks/singingProcess/useSign"
import { BlockchainType } from "hooks/walletSDK/useWalletKit"

export default function useIndividual(address: string, blockchain: BlockchainType) {
    const { RegisterIndividual } = useSign(address ?? "0", blockchain)
    const create = async (individual: Omit<IIndividual, "id" | "created_date">) => {
        return await RegisterIndividual(individual)
    }

    return { create }
}
