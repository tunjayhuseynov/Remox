import { auth, IUser } from 'firebaseConfig';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectStorage } from 'redux/reducers/storage';
import { decryptMessage, encryptMessage } from 'utils/hashing';
import { FirestoreWrite, useFirestoreRead } from './useFirebase';

export default function useProfile() {
  const [isLoading, setLoading] = useState(false)
  const storage = useSelector(selectStorage)

  let { data } = useFirestoreRead<IUser>('users', auth.currentUser!.uid)
  let profile: IUser | undefined;
  if (data) {
    profile = {
      address: data!.address,
      id: data!.id,
      multiwallets: data.multiwallets,
      name: decryptMessage(data!.name, storage!.encryptedMessageToken),
      surname: decryptMessage(data!.surname, storage!.encryptedMessageToken),
      companyName: decryptMessage(data!.companyName, storage!.encryptedMessageToken),
      seenTime: data?.seenTime ?? 0,
      timestamp: data!.timestamp
    }
  }

  const UpdateNameSurname = async (name: string, surname: string) => {
    setLoading(true)
    await FirestoreWrite<{
      name: string,
      surname: string,
    }>().updateDoc("users", auth.currentUser!.uid, {
      name: encryptMessage(name, storage?.encryptedMessageToken),
      surname: encryptMessage(surname, storage?.encryptedMessageToken),
    })
    setLoading(false)
  }

  const UpdateCompany = async (company: string) => {
    setLoading(true)
    await FirestoreWrite<{
      companyName: string,
    }>().updateDoc("users", auth.currentUser!.uid, {
      companyName: encryptMessage(company, storage?.encryptedMessageToken),
    })
    setLoading(false)
  }

  const UpdateSeenTime = async (time: number) => {
    setLoading(true)
    await FirestoreWrite<{
      seenTime: number,
    }>().updateDoc("users", auth.currentUser!.uid, {
      seenTime: time,
    })
    setLoading(false)
  }


  return { isLoading, UpdateCompany, UpdateNameSurname, UpdateSeenTime, profile }
};
