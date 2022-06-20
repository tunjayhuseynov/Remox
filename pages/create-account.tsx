import { useState } from "react";
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
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { useForm, SubmitHandler } from "react-hook-form";
import {IFormInput} from '../pages/create-organization'


const CreateAccount = () => {
  const { register, handleSubmit } = useForm<IFormInput>();
  const { Address, Wallet, blockchain } = useWalletKit();
  const [address] = useState(Address)
  const { executeSign, isLoading } = useSignInOrUp()
  const { user } = useAuth(address);
  const navigate = useRouter()
  const dark = useAppSelector(selectDarkMode)
  const [Dark] = useState(dark)


  const [file, setFile] = useState<File>()
  const [individualIsUpload, setIndividualIsUpload] = useState<boolean>(true)
  const paymentname: DropDownItem[] = [{ name: "Upload Photo" }, { name: "NFT" }]
  const [selectedPayment, setSelectedPayment] = useState(paymentname[0])

  const list = useMemo<Array<{ title: string, type?: string, name: string }>>(() => [
    { title: "Your Name", name: "userName",register : register }, { title: "Your Address", name: "address", value: Address },
  ], [])

  const onSubmit: SubmitHandler<IFormInput> = data => {
    const indFile = file
    console.log(data,indFile)
    navigate.push('/choose-type')
  }


  // const create = async (e: SyntheticEvent<HTMLFormElement>) => {
  //   e.preventDefault()
  //   const target = e.target as HTMLFormElement
  //   if (target["password"].value !== target["repeatPassword"].value) {
  //     ToastRun(<div className="dark:text-white"><strong>Passwords don't match</strong></div>)
  //     return
  //   }
  //   if (!address) return ToastRun(<>Error</>)

  //   const inputData = {
  //     name: target["userName"].value,
  //     surname: target["surname"].value,
  //     companyName: target["companyName"].value,
  //     password: target["password"].value,
  //   }

  //   try {
  //     const user = await executeSign(address, inputData.password, {
  //       address: [address],
  //       id: "placeholder",
  //       multiwallets: [{ name: Wallet ?? "", address: address, blockchain }],
  //       companyName: inputData.companyName,
  //       name: inputData.name,
  //       surname: inputData.surname,
  //       seenTime: Math.floor(new Date().getTime() / 1e3),
  //       timestamp: Math.floor(new Date().getTime() / 1e3),
  //       blockchain,
  //     })

  //     navigate.push('/choose-type')
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }


  // if (user || !address) navigate.push('/unlock')

  return <div className="h-screen w-full">
    <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
      <div>
        <img src={Dark ? "/logo.png" : "/logo_white.png"} alt="" width="135" />
      </div>
    </header>
    <form  onSubmit={handleSubmit(onSubmit)} className="py-[6.25rem] sm:py-0 sm:h-full ">
      <section className="flex flex-col items-center h-full justify-center gap-8 pt-12">
        <div className="flex flex-col gap-4">
          <div className="text-xl sm:text-3xl  dark:text-white text-center font-bold">Set Account Details</div>
          {/* <div className="text-greylish dark:text-primary tracking-wide font-light text-sm sm:text-lg text-center">This password encrypts your accounts on this device.</div> */}
        </div>
        <div className="flex flex-col px-3 items-center justify-center min-w-[25%]">
          <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs text-left text-black  dark:text-white">Choose Profile Photo Type</div>
            <div className={` flex items-center gap-3 w-full`}>
              <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={paymentname} selected={selectedPayment} onSelect={(e) => {
                setSelectedPayment(e)
                if (e.name === "NFT") setIndividualIsUpload(false)
                else setIndividualIsUpload(true)
              }} />
            </div>
          </div>
          {<div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs text-left  dark:text-white">{!individualIsUpload ? "NFT Address" : "Your Photo"} </div>
            <div className={`  w-full border rounded-lg`}>
              {!individualIsUpload ? <input type="text" {...register("nftAddress", { required: true })}  className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
            </div>
          </div>}
          {blockchain === 'celo' && !individualIsUpload &&  <div className="flex flex-col mb-4 gap-1 w-full">
            <div className="text-xs text-left  dark:text-white">Token ID</div>
            <div className={`w-full border rounded-lg`}>
              <input type="number" {...register("nftTokenId", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
            </div>
          </div>}
          {list.map((w, i) => <Input key={i} {...w} />)}
        </div>
        <div className="grid grid-rows-2 sm:grid-cols-2 gap-8 min-w-[23.5%]">
          <Button version="second" onClick={() => navigate.push('/')}>Back</Button>
          <Button type="submit"  isLoading={isLoading}>Next</Button>
        </div>
      </section>
    </form>
  </div>
}

export default CreateAccount

CreateAccount.disableLayout = true
CreateAccount.disableGuard = true