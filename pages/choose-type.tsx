import React from 'react'
import { useState, useEffect } from "react";
import { useAppSelector } from "redux/hooks";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import Button from "components/button";
import { useRouter } from 'next/router';
import { useFirestoreSearchField } from 'apiHooks/useFirebase';
import { IUser } from 'firebaseConfig';
import { useWalletKit } from 'hooks'


function ChooseType() {
  const dark = useAppSelector(selectDarkMode)
  const [organisation, setOrganisation] = useState(false)
  const [individual, setIndividual] = useState(false)
  const navigate = useRouter()
  const { search, isLoading } = useFirestoreSearchField<IUser>()
  const { Connect, Address } = useWalletKit();

  const [address, setAddress] = useState<string | null>(null)
  useEffect(() => setAddress(Address), [Address])

  const createRouter = () => {
    if (organisation) {
      navigate.push('/create-organisation')
    } else if (individual) {
      navigate.push('/create-account')
    }
  }
  const login = () => {
    if (address) {
      search("users", 'address', address, "array-contains")
        .then(user => {
          if (user) {
            navigate.push('/unlock')
          } else {
            navigate.push('/create-account')
          }

        })
    }
  }

  return <div className="h-screen w-full">
    <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
      <div>
        <img src={!dark ? "/logo.png" : "/logo_white.png"} alt="" width="150" />
      </div>
    </header>
    <div className="h-full w-full  gap-10 flex flex-col justify-center items-center">
      <div className="text-3xl font-bold">Choose Account Type</div>
      <div className="w-[40%] ">
        <div className="flex gap-8">
          <div className={`${organisation && "border-2 !border-primary"} cursor-pointer  border dark:border-greylish w-1/2 bg-white dark:bg-darkSecond rounded-lg`} onClick={() => { setOrganisation(!organisation); setIndividual(false) }}>
            <div className={`${organisation && "border-b-2 !border-primary"} flex items-center text-xl justify-center font-bold py-4 px-4 border-b dark:border-greylish`}>Organisation</div>
            <div className="p-10 tracking-wider text-center text-lg font-bold pb-12">Manage Your organization's crypto finance in one place, from contributor payment to treasury managment</div>
          </div>
          <div className={`${individual && "border-2 !border-primary"}  cursor-pointer border dark:border-greylish w-1/2 bg-white dark:bg-darkSecond rounded-lg`} onClick={() => { setIndividual(!individual); setOrganisation(false) }}>
            <div className={`${individual && "border-b-2 !border-primary"} flex items-center text-xl font-bold  justify-center py-4 px-4 border-b dark:border-greylish`}>individual</div>
            <div className="p-7 tracking-wider text-center text-lg  font-bold pb-12">Manage your personal crypto assets  in one place with ease.</div>
          </div>
        </div>
        <div className="flex gap-5 items-center justify-center  pt-7">
          <Button version="second" className={'!py-2 !px-9 !rounded-xl'} onClick={createRouter}>Sign up</Button>
          <Button version="second" className={'!py-2 !px-11 !rounded-xl'} onClick={login}>Login</Button>
        </div>
      </div>
    </div>
  </div>

}
ChooseType.disableLayout = true
ChooseType.disableGuard = true

export default ChooseType