import { Image } from 'firebaseConfig';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { changeImage } from 'redux/slices/account/remoxData';
import { SelectAccountType, SelectBlockchain, SelectID, SelectRemoxAccount } from 'redux/slices/account/selector';
import { FirestoreWrite } from './useFirebase';

export default function useProfile() {
  const accountType = useAppSelector(SelectAccountType)
  const selectedId = useAppSelector(SelectID)
  const blockchain = useAppSelector(SelectBlockchain)
  const collection = accountType === 'individual' ? 'individuals' : 'organizations'

  const dispatch = useAppDispatch()

  const UpdateImage = async (url: string, type: "image" | "nft", accountType: "individual" | "organization") => {
    try {
      if (!selectedId) throw new Error('Account is not defined')
      await FirestoreWrite<{
        image: Image,
      }>().updateDoc(accountType === "individual" ? "individuals" : "organizations", selectedId, {
        image: {
          blockchain: blockchain.name,
          imageUrl: url,
          nftUrl: url,
          tokenId: null,
          type: type
        },
      })

      dispatch(changeImage({
        image: {
          blockchain: blockchain.name,
          imageUrl: url,
          nftUrl: url,
          tokenId: null,
          type: type
        },
        type: accountType
      }))

    } catch (error) {
      console.log(error)
    }
  }

  const UpdateName = async (name: string) => {
    try {
      if (!selectedId) throw new Error('Account is not defined')
      await FirestoreWrite<{
        name: string,
      }>().updateDoc(collection, selectedId, {
        name: name,
      })
    } catch (error) {
      console.log(error)
    }
  }

  const UpdateOrganizationName = async (company: string) => {
    if (!selectedId) throw new Error('Account is not defined')
    await FirestoreWrite<{
      name: string,
    }>().updateDoc(collection, selectedId, {
      name: company,
    })
  }

  const UpdateSeenTime = async (time: number) => {
    if (!selectedId) throw new Error('Account is not defined')
    await FirestoreWrite<{
      seenTime: number,
    }>().updateDoc(collection, selectedId, {
      seenTime: time,
    })
  }


  return { UpdateOrganizationName, UpdateName, UpdateSeenTime, UpdateImage }
};
