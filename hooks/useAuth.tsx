import React, { useEffect, useState } from 'react';
import { IUser } from 'firebaseConfig';
import { useFirestoreSearchField } from '../rpcHooks/useFirebase';

export default function useAuth(address: string | null) {
    const { search, isLoading } = useFirestoreSearchField()
    const [user, setUser] = useState<IUser>();

    useEffect(() => {
        if (address) {
            search<IUser>('users', [{
                field: 'address',
                searching: address,
                indicator: "array-contains"
            }])
                .then(user => {
                    if (user) {
                        setUser(user[0])
                    }
                })
        }
    }, [])


    return { isLoading, user };
}
