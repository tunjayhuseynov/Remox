import React from 'react'
import { useState, useEffect } from "react";
import { useAppSelector } from "redux/hooks";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import Button from "components/button";
import { useRouter } from 'next/router';
import { useFirestoreSearchField } from 'apiHooks/useFirebase';
<<<<<<< HEAD
import { auth, IUser } from 'firebaseConfig';
import { useWalletKit } from 'hooks'
import { useSelector } from 'react-redux';
import { SelectExisting } from 'redux/reducers/selectedAccount';
import { useDispatch } from 'react-redux';
import { setStorage } from 'redux/reducers/storage';
import { Get_Individual } from 'crud/individual';

=======
import { IUser } from 'firebaseConfig';
import { useWalletKit, useAuth } from 'hooks'
import { AddressReducer } from "utils";
>>>>>>> 2a050805132671985966ba78319c775b8debbe44

function ChooseType() {
  const [isOrganisation, setOrganisation] = useState(false)
  const [isIndividual, setIndividual] = useState(false)
  const dark = useAppSelector(selectDarkMode)
<<<<<<< HEAD
=======
  const [organisation, setOrganisation] = useState(false)
  const [individual, setIndividual] = useState(false)
  const [organisation2, setOrganisation2] = useState(false)
  const [individual2, setIndividual2] = useState(false)
>>>>>>> 2a050805132671985966ba78319c775b8debbe44
  const navigate = useRouter()
  const { search } = useFirestoreSearchField()
  const { Address } = useWalletKit();

  const isUserExist = useSelector(SelectExisting)
  const dispatch = useDispatch()

  const [address, setAddress] = useState<string | null>(null)

<<<<<<< HEAD
  useEffect(() => {
    if (Address) {
      setAddress(Address)
    } else navigate.push("/")
  }, [Address])


  const login = async () => {
    if (isUserExist) {
      const individual = await Get_Individual(auth.currentUser?.uid!)
      if (isOrganisation) {

=======
  const createRouter = () => {
    if (organisation2) {
      navigate.push('/create-organisation')
    } else if (individual2) {
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
>>>>>>> 2a050805132671985966ba78319c775b8debbe44

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
  createRouter()

const data = [
  {
    name:"UbeSwap",
    address: address  && AddressReducer(address),
  },
  {
    name:"AriSwap",
    address: address  && AddressReducer(address),
  },
  {
    name:"Saber",
    address: address  && AddressReducer(address),
  },
  {
    name:"Zebec",
    address: address  && AddressReducer(address),
  },
]



  return <div className="h-screen w-full">
    <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
      <div>
        <img src={dark ? "/logo.png" : "/logo_white.png"} alt="" width="135" />
      </div>
    </header>
    <div className="h-full w-full  gap-10 flex flex-col justify-center items-center">
      <div className="text-3xl font-bold">Choose Account Type</div>
      <div className="w-[40%] ">
        <div className="flex gap-8">
<<<<<<< HEAD
          <div className={`${isOrganisation && "border-2 !border-primary"} cursor-pointer  border dark:border-greylish w-1/2 bg-white dark:bg-darkSecond rounded-lg`} onClick={() => { setOrganisation(!isOrganisation); setIndividual(false) }}>
            <div className={`${isOrganisation && "border-b-2 !border-primary"} flex items-center text-xl justify-center font-bold py-4 px-4 border-b dark:border-greylish`}>Organisation</div>
            <div className="p-10 tracking-wider text-center text-lg font-bold pb-12">Manage Your organization's crypto finance in one place, from contributor payment to treasury managment</div>
          </div>
          <div className={`${isIndividual && "border-2 !border-primary"}  cursor-pointer border dark:border-greylish w-1/2 bg-white dark:bg-darkSecond rounded-lg`} onClick={() => { setIndividual(!isIndividual); setOrganisation(false) }}>
            <div className={`${isIndividual && "border-b-2 !border-primary"} flex items-center text-xl font-bold  justify-center py-4 px-4 border-b dark:border-greylish`}>individual</div>
            <div className="p-7 tracking-wider text-center text-lg  font-bold pb-12">Manage your personal crypto assets  in one place with ease.</div>
=======
          {address ? <div className="h-full cursor-pointer border border-b-0 transition-all hover:transition-all   hover:border-primary rounded-lg w-full">
            {data.map((i,id)=>{
              return <div key={id} className={` ${id === 0 ? 'rounded-lg !border-b !border-t-0' : id=== data.length- 1 && '!border-t !border-b-0'} flex items-center gap-3 border-y  transition-all hover:transition-all bg-white hover:bg-light hover:border-primary py-3 px-3`}>
              <div className="w-9 h-9 bg-greylish bg-opacity-30 rounded-full"></div>
              <div className="flex  flex-col">
                <p className="text-base">{i.name}</p>
                <p className="text-sm text-greylish">{i.address}</p>
              </div>
            </div>
            })}
            <Button className="w-full rounded-t-none !border-0" onClick={() => navigate.push('/create-organisation')}>Add Organisation</Button>
          </div>
            :
            <div className={`${organisation2 && " !border-primary"} hover:border-primary hover:text-primary transition-all hover:transition-all  cursor-pointer  border dark:border-greylish w-1/2 bg-white flex items-center justify-center dark:bg-darkSecond rounded-lg min-h-[10rem]`} onClick={() => { setOrganisation2(!organisation2); setIndividual2(false); }}>
              <div className={`${organisation2 && "  text-primary"}  flex items-center text-xl justify-center font-bold py-4 px-4 dark:border-greylish`}>Add a new Organisation</div>
            </div>
          }
          {address ? <div className={`${individual && " !border-primary "} border  hover:border-primary hover:text-primary transition-all hover:transition-all h-full rounded-lg   w-full`}>
          <div className={`    cursor-pointer  dark:border-greylish  bg-white flex items-center justify-center dark:bg-darkSecond rounded-lg !rounded-b-none min-h-[10rem]`} onClick={() => { setIndividual(!individual); setOrganisation(false); }}>
            <div className={`${individual && "  text-primary"}   flex items-center text-xl font-bold  justify-center py-4 px-4 dark:border-greylish`}>Continue as a Individual</div>     
>>>>>>> 2a050805132671985966ba78319c775b8debbe44
          </div>
         {individual && <Button className="cursor-pointer bg-primary text-white text-xl text-center w-full rounded-lg !py-2 rounded-t-none" onClick={login}>Next  &gt;</Button>}
          </div> :
           <div className={` ${individual2 && " !border-primary "} w-1/2 border hover:border-primary hover:text-primary transition-all hover:transition-all    cursor-pointer  dark:border-greylish  bg-white flex items-center justify-center dark:bg-darkSecond rounded-lg !rounded-b-none min-h-[10rem]`} onClick={() => { setIndividual2(!individual2); setOrganisation2(false); }}>
            <div className={`${individual2 && "  text-primary"}   flex items-center text-xl font-bold  justify-center py-4 px-4 dark:border-greylish`}>Continue as a Individual</div>     
          </div> }
        </div>
<<<<<<< HEAD
        <div className="flex gap-5 items-center justify-center  pt-7">
          {!isUserExist && <Button version="second" className={'!py-2 !px-9 !rounded-xl'} onClick={() => navigate.push(isOrganisation ? '/create-organisation' : '/create-account')}>Sign up</Button>}
          {isUserExist && <Button version="second" className={'!py-2 !px-11 !rounded-xl'} onClick={login}>Login</Button>}
        </div>
=======

>>>>>>> 2a050805132671985966ba78319c775b8debbe44
      </div>
    </div>
  </div>

}
ChooseType.disableLayout = true
ChooseType.disableGuard = true

export default ChooseType