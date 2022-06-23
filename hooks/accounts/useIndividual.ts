import { Add_New_Individual_Account, Get_Individual } from "crud/individual"
import { auth, IAccount, IIndividual } from "firebaseConfig"
import useSign from "hooks/singingProcess/useSign"
import useAsyncEffect from "hooks/useAsyncEffect"
import { BlockchainType } from "hooks/walletSDK/useWalletKit"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"

export default function useIndividual(address: string, blockchain: BlockchainType) {
    const [individual, setIndividual] = useState<IIndividual | null>()
    const [loading, setLoading] = useState(false)


    useAsyncEffect(async () => {
        if (auth.currentUser) {
            setLoading(true)
            const individual = await Get_Individual(auth.currentUser.uid)
            setIndividual(individual ?? null)
            setLoading(false)
        }
    }, [auth.currentUser, address, blockchain])

    const { RegisterIndividual } = useSign(address ?? "0", blockchain)
    const Create_Individual = async (individual: Omit<IIndividual, "id" | "created_date">) => {
       
        return await RegisterIndividual(individual)
    }

    const Add_Account_2_Individual = async (account: IAccount) => {
        if (!individual) throw new Error("Individual not found")
        await Add_New_Individual_Account(individual, account)
    }

    return { Create_Individual, Add_Account_2_Individual, individual, isIndividualFetched: loading }
}
