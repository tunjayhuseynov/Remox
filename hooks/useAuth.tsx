import React, { useEffect, useState } from 'react';
import { IUser } from 'firebaseConfig';
import { useFirestoreSearchField } from '../apiHooks/useFirebase';

export default function useAuth(address: string | null) {
    const { search, isLoading } = useFirestoreSearchField<IUser>()
    const [user, setUser] = useState<IUser>();

    useEffect(() => {
        if (address) {
            search('users', 'address', address, "array-contains")
                .then(user => {
                    if (user) {
                        setUser(user[0])
                    }
                })
        }
    }, [])


    return { isLoading, user };
}
