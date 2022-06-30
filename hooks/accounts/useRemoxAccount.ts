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

    const Remove_Member = async (memberAddress: string) => {
        const the_account = (remoxAccount?.accounts as IAccount[]).find(a => a.address.toLowerCase() === selectedAddress?.toLowerCase())
        const member = the_account?.members.find(m => m.address.toLowerCase() === memberAddress.toLowerCase())
        if (the_account && member) {
            await Remove_Member_From_Account(the_account, member)
        }
    }

    const Add_Member = async (memberAddress: string, name: string, image: Image | null, mail: string | null) => {
        const the_account = (remoxAccount?.accounts as IAccount[]).find(a => a.address.toLowerCase() === selectedAddress?.toLowerCase())
        if (the_account) {
            await Add_Member_To_Account(the_account,
                {
                    address: memberAddress,
                    name,
                    id: process(),
                    image,
                    mail
                })
        }
    }

    const Replace_Member = async (oldMemberAddress: string, newMemberAdress: string) => {
        const the_account = (remoxAccount?.accounts as IAccount[]).find(a => a.address.toLowerCase() === selectedAddress?.toLowerCase())
        if (the_account) {
            const oldMember = the_account.members.find(m => m.address.toLowerCase() === oldMemberAddress.toLowerCase())
            if (oldMember) {
                const members = [...the_account.members.filter(m => m.address.toLowerCase() !== oldMemberAddress.toLowerCase())]
                oldMember.address = newMemberAdress;
                members.push(oldMember);
                await Update_Members_In_Account(the_account, members)
            }
        }
    }

    return { ...individual, ...organization, remoxAccount, remoxAccountType, Remove_Member, Add_Member, Replace_Member }
}