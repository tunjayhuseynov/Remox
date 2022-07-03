import { Add_Member_To_Account, Remove_Member_From_Account, Update_Members_In_Account } from 'crud/account'
import { IAccount, Image } from 'firebaseConfig'
import useNextSelector from 'hooks/useNextSelector'
import { BlockchainType } from 'hooks/walletSDK/useWalletKit'
import React, { useMemo } from 'react'
import { SelectSelectedAccount } from 'redux/slices/account/selectedAccount'
import { selectStorage } from 'redux/slices/account/storage'
import useIndividual from './useIndividual'
import useOrganization from './useOrganization'
import { process } from 'uniqid'

export default function useRemoxAccount(address: string, blockchain: BlockchainType) {
    const storage = useNextSelector(selectStorage)
    const selectedAddress = useNextSelector(SelectSelectedAccount)

    const remoxAccount = useMemo(() => {
        if (storage?.organization) {
            return storage.organization
        }
        return storage?.individual
    }, [address, blockchain])

    const remoxAccountType: "organization" | "individual" = useMemo(() => {
        if (storage?.organization) {
            return "organization"
        }
        return "individual"
    }, [address, blockchain])

    const individual = useIndividual(address, blockchain)
    const organization = useOrganization(address, blockchain)


    return { ...individual, ...organization, remoxAccount, remoxAccountType }
}