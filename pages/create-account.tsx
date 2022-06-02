import {useState} from "react";
import Button from "components/button";
import Input from "components/input";
import { useAuth, useSignInOrUp, useWalletKit } from "hooks";
import { useRouter } from "next/router";
import { SyntheticEvent, useMemo } from "react";
import { useAppSelector } from "redux/hooks";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import { ToastRun } from "utils/toast";
import Paydropdown from "subpages/pay/paydropdown";
import Upload from "components/upload";

const CreateAccount = () => {
  const { Address, Wallet, blockchain } = useWalletKit();
  const [address] = useState(Address)
  const { executeSign, isLoading } = useSignInOrUp()
  const { user } = useAuth(address);
  const navigate = useRouter()
  const dark = useAppSelector(selectDarkMode)
  const [Dark] = useState(dark)
  const [value, setValue] = useState('')
  const [selectedType, setSelectedType] = useState(false)
  const [file, setFile] = useState<File>()

  const list = useMemo<Array<{ title: string, type?: string, name: string }>>(() => [
    { title: "Your Name", name: "userName" },{ title: "Your Address", name: "address",value: Address },
    { title: "Password", name: "password", type: "password", limit: 6 },
  ], [])



  const create = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const target = e.target as HTMLFormElement
    if (target["password"].value !== target["repeatPassword"].value) {
      ToastRun(<div className="dark:text-white"><strong>Passwords don't match</strong></div>)
      return
    }
    if (!address) return ToastRun(<>Error</>)

    const inputData = {
      name: target["userName"].value,
      surname: target["surname"].value,
      companyName: target["companyName"].value,
      password: target["password"].value,
    }

    try {
      const user = await executeSign(address, inputData.password, {
        address: [address],
        id: "placeholder",
        multiwallets: [{ name: Wallet ?? "", address: address, blockchain }],
        companyName: inputData.companyName,
        name: inputData.name,
        surname: inputData.surname,
        seenTime: Math.floor(new Date().getTime() / 1e3),
        timestamp: Math.floor(new Date().getTime() / 1e3),
        blockchain,
      })

      navigate.push('/dashboard')
    } catch (error) {
      console.error(error)
    }
  }

  const paymentname = ["Upload Photo", "NFT"]

  if (user || !address) navigate.push('/unlock')

  return <div className="h-screen w-full">
    <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
      <div>
        <img src={!Dark ? "/logo.png" : "/logo_white.png"} alt="" width="150" />
      </div>
    </header>
    <form className="py-[6.25rem] sm:py-0 sm:h-full " onSubmit={create}>
      <section className="flex flex-col items-center h-full justify-center gap-8 pt-12">
        <div className="flex flex-col gap-4">
          <div className="text-xl sm:text-3xl  dark:text-white text-center font-bold">Set Account Details</div>
          {/* <div className="text-greylish dark:text-primary tracking-wide font-light text-sm sm:text-lg text-center">This password encrypts your accounts on this device.</div> */}
        </div>
        <div className="flex flex-col px-3 items-center justify-center min-w-[25%]">
        <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs text-left text-black  dark:text-white">Choose Profile Photo Type</div>
            <div className={` flex items-center gap-3 w-full`}>
            <Paydropdown setSelectedType={setSelectedType}  paymentname={paymentname}  value={value} setValue={setValue} />
            </div>
        </div>
        {value && <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs text-left  dark:text-white">{value=== "NFT" ? "NFT Address" : "Your Photo"} </div>
            <div className={`  w-full border rounded-lg`}>
              {value === "NFT" ? <input type="text" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
            </div>
        </div>}
          {list.map((w, i) => <Input key={i} {...w}  />)}
        </div>
        <div className="grid grid-rows-2 sm:grid-cols-2 gap-8 min-w-[23.5%]">
          <Button version="second" onClick={() => navigate.push('/choose-type')}>Back</Button>
          <Button type="submit" isLoading={isLoading}>Create</Button>
        </div>
      </section>
    </form>
  </div>
}

CreateAccount.disableLayout = true
CreateAccount.disableGuard = true
export default CreateAccount