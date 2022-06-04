import React from 'react'
import { useState, useEffect } from "react";
import { useAppSelector } from "redux/hooks";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import Button from "components/button";
import { useRouter } from 'next/router';
import { useFirestoreSearchField } from 'apiHooks/useFirebase';
import { auth, IUser } from 'firebaseConfig';
import { useWalletKit } from 'hooks'
import { useSelector } from 'react-redux';
import { SelectExisting } from 'redux/reducers/selectedAccount';
import { useDispatch } from 'react-redux';
import { setStorage } from 'redux/reducers/storage';
import { Get_Individual } from 'crud/individual';


function ChooseType() {
  const [isOrganisation, setOrganisation] = useState(false)
  const [isIndividual, setIndividual] = useState(false)
  const dark = useAppSelector(selectDarkMode)
  const navigate = useRouter()
  const { search } = useFirestoreSearchField()
  const { Address } = useWalletKit();

  const isUserExist = useSelector(SelectExisting)
  const dispatch = useDispatch()

  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    if (Address) {
      setAddress(Address)
    } else navigate.push("/")
  }, [Address])


  const login = async () => {
    if (isUserExist) {
      const individual = await Get_Individual(auth.currentUser?.uid!)
      if (isOrganisation) {


      } else if (isIndividual) {
        dispatch(setStorage({
          ...individual,
          uid: auth.currentUser?.uid!,
          lastSignedProviderAddress: Address!,
          signType: "individual",
          organization: null
        }))
        navigate.push("/dashboard")
      }
    }
  }

  return <div className="h-screen w-full">
    <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
      <div>
        <img src={!dark ? "/logo.png" : "/logo_white.png"} alt="" width="135" />
      </div>
    </header>
    <div className="h-full w-full  gap-10 flex flex-col justify-center items-center">
      <div className="text-3xl font-bold">Choose Account Type</div>
      <div className="w-[40%] ">
        <div className="flex gap-8">
          <div className={`${isOrganisation && "border-2 !border-primary"} cursor-pointer  border dark:border-greylish w-1/2 bg-white dark:bg-darkSecond rounded-lg`} onClick={() => { setOrganisation(!isOrganisation); setIndividual(false) }}>
            <div className={`${isOrganisation && "border-b-2 !border-primary"} flex items-center text-xl justify-center font-bold py-4 px-4 border-b dark:border-greylish`}>Organisation</div>
            <div className="p-10 tracking-wider text-center text-lg font-bold pb-12">Manage Your organization's crypto finance in one place, from contributor payment to treasury managment</div>
          </div>
          <div className={`${isIndividual && "border-2 !border-primary"}  cursor-pointer border dark:border-greylish w-1/2 bg-white dark:bg-darkSecond rounded-lg`} onClick={() => { setIndividual(!isIndividual); setOrganisation(false) }}>
            <div className={`${isIndividual && "border-b-2 !border-primary"} flex items-center text-xl font-bold  justify-center py-4 px-4 border-b dark:border-greylish`}>individual</div>
            <div className="p-7 tracking-wider text-center text-lg  font-bold pb-12">Manage your personal crypto assets  in one place with ease.</div>
          </div>
        </div>
        <div className="flex gap-5 items-center justify-center  pt-7">
          {!isUserExist && <Button version="second" className={'!py-2 !px-9 !rounded-xl'} onClick={() => navigate.push(isOrganisation ? '/create-organisation' : '/create-account')}>Sign up</Button>}
          {isUserExist && <Button version="second" className={'!py-2 !px-11 !rounded-xl'} onClick={login}>Login</Button>}
        </div>
      </div>
    </div>
  </div>

}
ChooseType.disableLayout = true
ChooseType.disableGuard = true

export default ChooseType