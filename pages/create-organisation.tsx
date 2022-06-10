import { useState } from "react";
import Button from "components/button";
import Input from "components/input";
import { useAuth, useSignInOrUp, useWalletKit } from "hooks";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useAppSelector } from "redux/hooks";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import Paydropdown from "subpages/pay/paydropdown";
import Upload from "components/upload";

const CreateOrganisation = () => {
  const { Address, Wallet, blockchain } = useWalletKit();
  const address = Address
  const { executeSign, isLoading } = useSignInOrUp()
  const { user } = useAuth(address);
  const navigate = useRouter()
  const dark = useAppSelector(selectDarkMode)
  const [value, setValue] = useState('')
  const [value2, setValue2] = useState('')
  const [selectedType, setSelectedType] = useState(false)
  const [file, setFile] = useState<File>()

  const list = useMemo<Array<{ title: string, type?: string, name: string }>>(() => [
    { title: "Your Name", name: "userName" },
    { title: "Password", name: "password", type: "password", limit: 6 },
  ], [])

  const paymentname = ["Upload Photo", "NFT"]
  const paymentname2 = ["Upload Photo", "NFT"]


  return <div className="h-screen w-full">
    <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
      <div>
        <img src={dark ? "/logo.png" : "/logo_white.png"} alt="" width="135" />
      </div>
    </header>
    <form className="py-[6.25rem] sm:py-0 sm:h-full " >
      <section className="flex flex-col items-center h-full  gap-6 pt-20">
        <div className="flex flex-col gap-4">
          <div className="text-xl sm:text-3xl  dark:text-white text-center font-bold">Set Account Details</div>
          {/* <div className="text-greylish dark:text-primary tracking-wide font-light text-sm sm:text-lg text-center">This password encrypts your accounts on this device.</div> */}
        </div>
        <div className="flex flex-col px-3 gap-1 items-center justify-center min-w-[25%]">
          <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs text-left  dark:text-white">Choose Organisation Profile Photo Type</div>
            <div className={` flex items-center gap-3 w-full rounded-lg`}>
              <Paydropdown setSelectedType={setSelectedType} paymentname={paymentname} value={value} setValue={setValue} />
            </div>
          </div>
          {value && <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs text-left  dark:text-white">{value === "NFT" ? "NFT Address" : "Your Photo"} </div>
            <div className={`  w-full border rounded-lg`}>
              {value === "NFT" ? <input type="text" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
            </div>
          </div>}
          {blockchain === 'celo' && value === "NFT" && <div className="flex flex-col mb-4 gap-1 w-full">
            <div className="text-xs text-left  dark:text-white">Token ID</div>
            <div className={`w-full border rounded-lg`}>
              <input type="number" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
            </div>
          </div>}
          <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs dark:text-white">Organisation Name</div>
            <div className={` flex items-center gap-3 w-full border rounded-lg`}>
              <input type="text" placeholder="Remox DAO" className="bg-white dark:bg-darkSecond  h-[3.4rem] rounded-lg w-full px-1" />
            </div>
          </div>
          <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs dark:text-white">Choose Your Profile Photo Type</div>
            <div className={` flex items-center gap-3 w-full rounded-lg`}>
              <Paydropdown setSelectedType={setSelectedType} paymentname={paymentname2} value={value2} setValue={setValue2} />
            </div>
          </div>
          {value2 && <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs  text-left  dark:text-white">{value2 === "NFT" ? "NFT Address" : "Your Photo"} </div>
            <div className={`  w-full border rounded-lg`}>
              {value2 === "NFT" ? <input type="text" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
            </div>
          </div>}
          {list.map((w, i) => <Input key={i} {...w} />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-8 min-w-[23.5%] pb-8">
          <Button version="second" onClick={() => navigate.push('/choose-type')}>Back</Button>
          <Button type="submit" onClick={() => navigate.push('/create-multisig')}>Next</Button>
        </div>
      </section>
    </form>
  </div>
}

CreateOrganisation.disableLayout = true
CreateOrganisation.disableGuard = true
export default CreateOrganisation