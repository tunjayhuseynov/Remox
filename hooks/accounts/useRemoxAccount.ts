import { useMemo } from 'react'
import useIndividual from './useIndividual'
import useOrganization from './useOrganization'
import { useAppSelector } from 'redux/hooks'
import { SelectStorage } from 'redux/slices/account/remoxData'
import { BlockchainType } from 'types/blockchains'

export default function useRemoxAccount(address: string, blockchain: BlockchainType) {
    const storage = useAppSelector(SelectStorage)

    const remoxAccount = useMemo(() => {
        if (storage?.organization) {
            return storage.organization
        }
        return storage?.individual
    }, [address, blockchain, storage])

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