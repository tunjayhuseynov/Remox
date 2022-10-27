import { SelectDarkMode, setOrganization, setResetRemoxData } from 'redux/slices/account/remoxData';
import Button from "components/button";
import { useRouter } from 'next/router';
import useNextSelector from 'hooks/useNextSelector';
import useAsyncEffect from 'hooks/useAsyncEffect';
import { auth } from "firebaseConfig";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { SelectAllOrganizations, SelectBlockchain, SelectIndividual, SelectProviderAddress, setAccountType, setOrganizations, setProviderID, setStorage } from "redux/slices/account/remoxData";
import { useState } from "react";
import Loader from "components/Loader";
import { Get_Organizations_Thunk } from "redux/slices/account/thunks/organization";
import { IOrganizationORM } from "types/orm";
import Image from 'next/image'
import makeBlockie from 'ethereum-blockies-base64';
import { useCelo } from '@celo/react-celo';

function ChooseType() {
  const navigate = useRouter()
  const dark = useNextSelector(SelectDarkMode)
  const organizations = useAppSelector(SelectAllOrganizations)
  const dispatch = useAppDispatch()
  const { kit } = useCelo()

  const address = useAppSelector(SelectProviderAddress)
  const blockchain = useAppSelector(SelectBlockchain)
  const individual = useAppSelector(SelectIndividual)

  const [organizationLoading, setOrganizationLoading] = useState(false)


  useAsyncEffect(async () => {
    setOrganizationLoading(true)
    if (!auth?.currentUser || !address || !blockchain) {
      await navigate.push("/")
    }
    const organizations = await dispatch(Get_Organizations_Thunk(address!)).unwrap()
    dispatch(setOrganizations(organizations))
    setOrganizationLoading(false)
  }, [])

  const individualLogin = async () => {
    if (address && auth.currentUser && blockchain && individual) {
      dispatch(setAccountType("individual"))
      dispatch(setProviderID(individual.id));
      dispatch(setOrganization(null))
      dispatch(setStorage({
        individual: individual,
        organization: null,
        lastSignedProviderAddress: address,
        signType: "individual",
        uid: auth.currentUser.uid,
      }))
      navigate.push("/dashboard")
    }
  }

  const organizationLogin = async (organization: IOrganizationORM) => {
    if (address && auth.currentUser && blockchain && individual) {
      dispatch(setAccountType("organization"))
      dispatch(setProviderID(organization.id));
      dispatch(setStorage({
        individual: individual,
        organization: organization,
        lastSignedProviderAddress: address,
        signType: "organization",
        uid: auth.currentUser.uid,
      }))
      navigate.push("/dashboard")
    }
  }


  return <div className="h-screen w-full">
    <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
      <div className='w-[9.375rem]'>
        <Image src={dark ? "/logo.png" : "/logo_white.png"} alt="" width="150" height={"40"} layout='responsive' />
      </div>
    </header>
    <div className="h-full w-full  gap-10 flex flex-col justify-center items-center">
      <div className="text-2xl font-bold">Choose Account Type</div>
      <div className="w-1/2 2xl:w-[40%]">
        <div className="flex gap-8">
          <div className="h-full  border border-b-0 dark:border-greylish transition-all hover:transition-all hover:!border-primary rounded-lg w-full">
            <div className="bg-white dark:bg-darkSecond rounded-lg overflow-auto h-[13.1rem] w-full relative">
              {organizations.map((i, id) => {
                return <div key={i.id} onClick={() => organizationLogin(i)} className={`cursor-pointer ${id === 0 ? 'rounded-lg !border-b !border-t-0' : id === organizations.length - 1 && '!border-t !border-b-0'} flex items-center gap-3 border-y  transition-all hover:transition-all bg-white dark:bg-darkSecond hover:dark:bg-greylish hover:bg-opacity-10 dark:border-greylish hover:bg-light hover:!border-primary py-3 px-3`}>
                  <div className="rounded-full">
                    <img src={i.image?.imageUrl ?? makeBlockie(i.name || "random")} className="w-9 h-9 rounded-full" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-base">{i.name}</p>
                    {/* <p className="text-sm text-greylish">{i.}</p> */}
                  </div>
                </div>
              })}
              {(organizations.length === 0 && !organizationLoading) && <div className="bg-white dark:bg-darkSecond absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">No Data Exists</div>}
              {(organizationLoading) && <div className="bg-white dark:bg-darkSecond absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><Loader /></div>}
            </div>
            <Button className="top-0 w-full rounded-t-none !border-0" onClick={() => navigate.push("/create-organization")}>Add Organization</Button>
          </div>
          <div onClick={individualLogin} className={`cursor-pointer bg-white group border hover:!border-primary dark:border-greylish  hover:text-primary transition-all dark:bg-darkSecond hover:transition-all h-full rounded-lg w-full`}>
            <div className={`bg-white dark:bg-darkSecond rounded-lg !rounded-b-none min-h-[8rem] group-hover:min-h-[10rem] relative`}>
              <div className={`group-hover:text-primary  font-bold dark:border-greylish absolute text-center top-[4rem] w-full`}>Continue as an individual</div>
            </div>
            <Button className="group-hover:visible invisible transition-all bg-primary text-white  text-center w-full rounded-lg !py-2 rounded-t-none ">Next  &gt;</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
}

ChooseType.disableLayout = true
ChooseType.disableGuard = true

export default ChooseType