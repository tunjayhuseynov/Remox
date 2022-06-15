import { SyntheticEvent, useState } from "react";
import Button from "components/button";
import Input from "components/input";
import { useAuth, useSignInOrUp, useWalletKit } from "hooks";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useAppSelector } from "redux/hooks";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import Paydropdown from "subpages/pay/paydropdown";
import Upload from "components/upload";
import useSign from "hooks/singingProcess/useSign";
import useLoading from "hooks/useLoading";
import useOrganization from "hooks/organization/useOrganization";
import { ToastRun } from "utils/toast";
import { UploadImage } from "rpcHooks/useFirebase";
import { auth, Image, IOrganization } from "firebaseConfig";
import { Get_Individual, Get_Individual_Ref } from "crud/individual";
import useIndividual from "hooks/individual/useIndividual";
import uniqid from 'uniqid'
import { GetTime } from "utils";

type UploadType = "Upload Photo" | "NFT"

const CreateOrganisation = () => {
  const { Address: address, Wallet, blockchain } = useWalletKit();

  const { create } = useOrganization(address ?? "0", blockchain);

  const navigate = useRouter()
  const dark = useAppSelector(selectDarkMode)
  const [organizationImageStatus, setOrganizationImage] = useState<string>("")
  const [individualImageStatus, setIndividualImage] = useState<string>("")
  const [selectedType, setSelectedType] = useState(false)
  const [organizationFile, setOrganizationFile] = useState<File>()
  const [individualFile, setIndividualFile] = useState<File>()

  const paymentname = ["Upload Photo", "NFT"]
  const paymentname2 = ["Upload Photo", "NFT"]

  const Create = async (e: SyntheticEvent<HTMLFormElement>) => {
    
    const organization = await create(e, organizationImageStatus, organizationFile ?? null, individualImageStatus, individualFile ?? null)

    navigate.push('/create-multisig', {
      query: {
        id: organization.id, 
        type: "organization"
      }
    })
  }

  const [isLoading, submit] = useLoading(Create)


  return <div className="h-screen w-full">
    <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
      <div>
        <img src={dark ? "/logo.png" : "/logo_white.png"} alt="" width="135" />
      </div>
    </header>
    <form onSubmit={submit} className="py-[6.25rem] sm:py-0 sm:h-full" >
      <section className="flex flex-col items-center h-full  gap-6 pt-20">
        <div className="flex flex-col gap-4">
          <div className="text-xl sm:text-3xl  dark:text-white text-center font-bold">Set Account Details</div>
          {/* <div className="text-greylish dark:text-primary tracking-wide font-light text-sm sm:text-lg text-center">This password encrypts your accounts on this device.</div> */}
        </div>
        <div className="flex flex-col px-3 gap-1 items-center justify-center min-w-[25%]">
          <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs text-left  dark:text-white">Choose Organisation Profile Photo Type</div>
            <div className={` flex items-center gap-3 w-full rounded-lg`}>
              <Paydropdown setSelectedType={setSelectedType} paymentname={paymentname} value={organizationImageStatus} setValue={setOrganizationImage} />
            </div>
          </div>
          {organizationImageStatus && <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs text-left  dark:text-white">{organizationImageStatus === "NFT" ? "NFT Address" : "Your Photo"} </div>
            <div className={`  w-full border rounded-lg`}>
              {organizationImageStatus === "NFT" ? <input type="text" name="organizationNFTAddress" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setOrganizationFile} />}
            </div>
          </div>}
          {blockchain === 'celo' && organizationImageStatus === "NFT" && <div className="flex flex-col mb-4 gap-1 w-full">
            <div className="text-xs text-left  dark:text-white">Token ID</div>
            <div className={`w-full border rounded-lg`}>
              <input type="number" name="organizationTokenId" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
            </div>
          </div>}
          <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs dark:text-white">Organisation Name</div>
            <div className={` flex items-center gap-3 w-full border rounded-lg`}>
              <input type="text" name="organizationName" placeholder="Remox DAO" className="bg-white dark:bg-darkSecond  h-[3.4rem] rounded-lg w-full px-1" />
            </div>
          </div>
          <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs dark:text-white">Choose Your Profile Photo Type</div>
            <div className={` flex items-center gap-3 w-full rounded-lg`}>
              <Paydropdown setSelectedType={setSelectedType} paymentname={paymentname2} value={individualImageStatus} setValue={setIndividualImage} />
            </div>
          </div>
          {individualImageStatus && <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs  text-left  dark:text-white">{individualImageStatus === "NFT" ? "NFT Address" : "Your Photo"} </div>
            <div className={`  w-full border rounded-lg`}>
              {individualImageStatus === "NFT" ? <input type="text" name="individualNFTAddress" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setIndividualFile} />}
            </div>
          </div>}
          {blockchain === 'celo' && individualImageStatus === "NFT" && <div className="flex flex-col mb-4 gap-1 w-full">
            <div className="text-xs text-left  dark:text-white">Token ID</div>
            <div className={`w-full border rounded-lg`}>
              <input type="number" name="individualTokenId" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
            </div>
          </div>}
          <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs dark:text-white">Individual Name</div>
            <div className={` flex items-center gap-3 w-full border rounded-lg`}>
              <input type="text" name="individualName" placeholder="Your name" className="bg-white dark:bg-darkSecond  h-[3.4rem] rounded-lg w-full px-1" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-8 min-w-[23.5%] pb-8">
          <Button version="second" onClick={() => navigate.push('/choose-type')}>Back</Button>
          <Button type="submit" isLoading={isLoading}>Next</Button>
        </div>
      </section>
    </form>
  </div>
}

CreateOrganisation.disableLayout = true
CreateOrganisation.disableGuard = true
export default CreateOrganisation