import React from 'react'
import { useState, useEffect } from "react";
import { useAppSelector } from "redux/hooks";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import Button from "components/button";
import { useRouter } from 'next/router';
import { useFirestoreSearchField } from 'apiHooks/useFirebase';
import { IUser } from 'firebaseConfig';
import { useWalletKit } from 'hooks'
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";

function ChooseType() {
    const selectedAccount = useAppSelector(SelectSelectedAccount)
    const dark = useAppSelector(selectDarkMode)
    const [organisation, setOrganisation] = useState(0)
    const [individual, setIndividual] = useState(false)
    const navigate = useRouter()
    const { search, isLoading } = useFirestoreSearchField<IUser>()
    const { Connect, Address } = useWalletKit();

    const [address, setAddress] = useState<string | null>(null)
    useEffect(() => setAddress(Address), [Address])


    const login = () => {
        if (address) {
            search("users", 'address', address, "array-contains")
                .then(user => {
                    if (user) {
                        navigate.push('/unlock')
                    } else {
                        navigate.push('/create-organisation')
                    }

                })
        }
    }

    const data = [
        {
            id: 0,
            name: 'Ubeswap',
            address: Address,
        },
        {
            id: 1,
            name: 'Solana',
            address: Address,
        }
    ]

    return <div className="h-screen w-full">
        <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
            <div>
                <img src={dark ? "/logo.png" : "/logo_white.png"} alt="" width="135" />
            </div>
        </header>
        <div className="h-full w-full  gap-10 flex flex-col justify-center items-center">
            <div className="text-3xl font-bold">Choose Account</div>
            <div className="w-[80%] ">
                <div className="flex flex-col items-center justify-center gap-8">
                    {data.map((i, id) => {
                        return <div key={id} className={`${organisation === id && "border-2 !border-primary"} cursor-pointer  border dark:border-greylish w-1/2 bg-white dark:bg-darkSecond rounded-lg`} >
                            <div onClick={() => setOrganisation(i.id)}>
                                <div className={`${organisation === id && "border-b-2 !border-primary"} flex gap-2 items-center text-xl  font-bold py-4 px-4 border-b dark:border-greylish`}> <div className="w-9 h-9 bg-greylish bg-opacity-30 rounded-full"></div> {i.name}</div>
                                <div className="p-4 tracking-wider text-greylish text-lg font-bold ">{i.address}</div>
                            </div>
                            {organisation === id && <div className="cursor-pointer bg-primary text-white text-xl text-center p-2" onClick={login}>Enter  &gt;</div>}
                        </div>
                    })}
                </div>
            </div>
        </div>
    </div>

}
ChooseType.disableLayout = true
ChooseType.disableGuard = true

export default ChooseType