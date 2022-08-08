import { accountInfoToSenchaPoolState } from '@jup-ag/core/dist/lib/sencha/swapLayout';
import { useAppSelector } from 'redux/hooks';
import { SelectAccountType, SelectRemoxAccount } from 'redux/slices/account/selector';
import { FirestoreWrite } from './useFirebase';

export default function useProfile() {
  const accountType = useAppSelector(SelectAccountType)
  const account = useAppSelector(SelectRemoxAccount)
  const collection = accountType === 'individual' ? 'individuals' : 'organizations'


  const UpdateName = async (name: string) => {
    try {
      if (!account?.id) throw new Error('Account is not defined')
      await FirestoreWrite<{
        name: string,
      }>().updateDoc('individuals', account.id, {
        name: name,
      })
    } catch (error) {
      console.log(error)
    }
  }

  const UpdateOrganizationName = async (company: string) => {
    if (!account?.id) throw new Error('Account is not defined')
    await FirestoreWrite<{
      name: string,
    }>().updateDoc('organizations', account.id, {
      name: company,
    })
  }

  const UpdateSeenTime = async (time: number) => {
    if (!account?.id) throw new Error('Account is not defined')
    await FirestoreWrite<{
      seenTime: number,
    }>().updateDoc(collection, account.id, {
      seenTime: time,
    })
  }


  return { UpdateOrganizationName, UpdateName, UpdateSeenTime }
};
