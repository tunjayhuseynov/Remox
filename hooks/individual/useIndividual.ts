import { Get_Individual } from "crud/individual"
import { auth, IIndividual } from "firebaseConfig"
import useSign from "hooks/singingProcess/useSign"
import useAsyncEffect from "hooks/useAsyncEffect"
import { BlockchainType } from "hooks/walletSDK/useWalletKit"
import { useEffect, useState } from "react"

export default function useIndividual(address: string, blockchain: BlockchainType) {
    const [individual, setIndividual] = useState<IIndividual>()

    useAsyncEffect(async () => {
        if (auth.currentUser) {
            const individual = await Get_Individual(auth.currentUser.uid)
            setIndividual(individual)
        }
    }, [auth.currentUser])

    const { RegisterIndividual } = useSign(address ?? "0", blockchain)
    const create = async (individual: Omit<IIndividual, "id" | "created_date">) => {
        return await RegisterIndividual(individual)
    }

    return { create, individual }
}
