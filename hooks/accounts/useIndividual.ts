import { Add_New_Individual_Account, Get_Individual } from "crud/individual"
import { auth, IAccount, IIndividual } from "firebaseConfig"
import { useEffect, useState } from "react"
import { useAppDispatch } from "redux/hooks"
import { setIndividual } from "redux/slices/account/storage"
import { BlockchainType } from "types/blockchains"

export default function useIndividual(address: string, blockchain: BlockchainType) {
    const [individual, setIndividualState] = useState<IIndividual | null>()
    const [loading, setLoading] = useState(false)

    // Do not touch
    const dispatch = useAppDispatch()


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setLoading(true)
                const individual = await Get_Individual(user.uid)
                if (individual) {
                    dispatch(setIndividual(individual))
                    setIndividualState(individual ?? null)
                }
                setLoading(false)
            }
        })
        return () => unsubscribe()
    }, [address, blockchain])

    const Add_Account_2_Individual = async (account: IAccount) => {
        if (!individual) throw new Error("Individual not found")
        await Add_New_Individual_Account(individual, account)
    }

    return { Add_Account_2_Individual, individual, isIndividualFetching: loading }
}
