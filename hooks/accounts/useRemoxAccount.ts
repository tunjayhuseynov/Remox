import { BlockchainType } from 'hooks/walletSDK/useWalletKit'
import { useMemo } from 'react'
import useIndividual from './useIndividual'
import useOrganization from './useOrganization'
import { useAppSelector } from 'redux/hooks'
import { SelectStorage } from 'redux/slices/account/remoxData'
import { Add_Member_To_Account, Remove_Member_From_Account, Update_Members_In_Account } from 'crud/account'
import { IAccount, Image } from 'firebaseConfig'
import { nanoid } from '@reduxjs/toolkit'
import { SelectProviderAddress } from 'redux/slices/account/remoxData'

export default function useRemoxAccount(address: string, blockchain: BlockchainType) {
    const storage = useAppSelector(SelectStorage)
    const selectedAddress = useAppSelector(SelectProviderAddress)

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