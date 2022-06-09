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
import { changeAccount, changeExisting, SelectExisting } from 'redux/reducers/selectedAccount';
import { useDispatch } from 'react-redux';
import { setStorage } from 'redux/reducers/storage';
import { Get_Individual } from 'crud/individual';
import { AddressReducer } from 'utils';
import useNextSelector from 'hooks/useNextSelector';
import useAsyncEffect from 'hooks/useAsyncEffect';
import { isIndividualExisting } from 'hooks/singingProcess/utils';


function ChooseType() {
  const [isOrganisation, setOrganisation] = useState(false)
  const [isIndividual, setIndividual] = useState(false)
  const dark = useAppSelector(selectDarkMode)
  const [organisation2, setOrganisation2] = useState(false)
  const [individual2, setIndividual2] = useState(false)
  const navigate = useRouter()
  // const { search } = useFirestoreSearchField()
  const { Address } = useWalletKit();

  const isUserExist = useNextSelector(SelectExisting)
  const dispatch = useDispatch()

  const [address, setAddress] = useState<string | null>(null)

  useAsyncEffect(async () => {
    if (Address && auth.currentUser) {
      setAddress(Address)
      if (!isUserExist) {
        dispatch(changeAccount(Address!))
        dispatch(changeExisting(await isIndividualExisting(auth.currentUser!.uid)))
      }
    } else navigate.push("/")
  }, [Address])


  const login = async () => {
    if (isUserExist) {
      const individual = await Get_Individual(auth.currentUser?.uid!)
      if (isOrganisation) {


      } else if (isIndividual) {
        dispatch(setStorage({
          uid: auth.currentUser?.uid!,
          lastSignedProviderAddress: Address!,
          signType: "individual",
          organization: null,
          individual: individual
        }))
        navigate.push("/dashboard")
      }
    }
  }


  const data = [
    {
      name: "UbeSwap",
      value: "$50.000",
    },
    {
      name: "AriSwap",
      value: "$50.000",
    },
    {
      name: "AriSwap",
      value: "$50.000",
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
          {address ? <div className="h-full cursor-pointer border border-b-0 dark:border-greylish transition-all hover:transition-all   hover:!border-primary rounded-lg w-full">
            <div className="overflow-auto max-h-[13.1rem] w-full">
              {data.map((i, id) => {
                return <div key={id} className={` ${id === 0 ? 'rounded-lg !border-b !border-t-0' : id === data.length - 1 && '!border-t !border-b-0'} flex items-center gap-3 border-y  transition-all hover:transition-all bg-white dark:bg-darkSecond dark:border-greylish hover:bg-light hover:!border-primary py-3 px-3`}>
                  <div className="w-9 h-9 bg-greylish bg-opacity-30 rounded-full"></div>
                  <div className="flex  flex-col">
                    <p className="text-base">{i.name}</p>
                    <p className="text-sm text-greylish">{i.value}</p>
                  </div>
                </div>
              })}

            </div>
            <Button className=" top-0 w-full rounded-t-none !border-0 " onClick={() => navigate.push('/create-organisation')}>Add Organisation</Button>
          </div>
            :
            <div className={`${organisation2 && " !border-primary"} hover:!border-primary hover:text-primary transition-all hover:transition-all  cursor-pointer  border dark:border-greylish w-1/2 bg-white flex items-center justify-center dark:bg-darkSecond rounded-lg min-h-[10rem]`} onClick={() => { setOrganisation2(!organisation2); setIndividual2(false); }}>
              <div className={`${organisation2 && "  text-primary"}  flex items-center text-xl justify-center font-bold py-4 px-4 dark:border-greylish`} onClick={() => navigate.push('/create-organisation')}>Add a new Organisation</div>
            </div>
          }
          {address ? <div  onClick={login} className={`${isIndividual && " !border-primary "} border  hover:!border-primary dark:border-greylish  hover:text-primary transition-all hover:transition-all h-full rounded-lg   w-full`}  onMouseEnter={() => { setIndividual(!isIndividual); setOrganisation(false); } } onMouseLeave={() =>  setIndividual(!isIndividual) }>
            <div className={`    cursor-pointer    bg-white flex items-center justify-center dark:bg-darkSecond rounded-lg !rounded-b-none min-h-[10rem]`}>
              <div className={`${isIndividual && "  text-primary"}   flex items-center text-xl font-bold  justify-center py-4 px-4 dark:border-greylish`}>Continue as a Individual</div>
            </div>
            {isIndividual && <Button className="cursor-pointer bg-primary text-white text-xl text-center w-full rounded-lg !py-2 rounded-t-none ">Next  &gt;</Button>}
          </div> :
            <div className={` ${individual2 && " !border-primary "} w-1/2 border hover:!border-primary hover:text-primary transition-all hover:transition-all cursor-pointer dark:border-greylish  bg-white flex items-center justify-center dark:bg-darkSecond rounded-lg !rounded-b-none min-h-[10rem]`} onClick={() => { setIndividual2(!individual2); setOrganisation2(false); }}>
              <div className={`${individual2 && "  text-primary"}   flex items-center text-xl font-bold  justify-center py-4 px-4 dark:border-greylish`} onClick={() => navigate.push('/create-account')}>Continue as a Individual</div>
            </div>}
        </div>
      </div>
    </div>
  </div>

}
ChooseType.disableLayout = true
ChooseType.disableGuard = true

export default ChooseType