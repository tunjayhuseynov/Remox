import { useState } from "react";
import Button from "components/button";
import { useWalletKit } from "hooks";
import { useRouter } from "next/router";
import { selectDarkMode } from "redux/slices/notificationSlice";
import { ToastRun } from "utils/toast";
import Upload from "components/upload";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { useForm, SubmitHandler } from "react-hook-form";
import useRemoxAccount from "hooks/accounts/useRemoxAccount";
import { IIndividual } from "firebaseConfig";
import { UploadImageForUser } from "hooks/singingProcess/utils";
import { GetTime } from "utils";
import useLoading from "hooks/useLoading";
import useNextSelector from "hooks/useNextSelector";
import { process } from "uniqid";
import useSign from "hooks/singingProcess/useSign";

interface IFormInput {
  nftAddress?: string;
  nftTokenId?: number;
  name: string;
}

const CreateAccount = () => {
  const { register, handleSubmit } = useForm<IFormInput>();

  const { Address, Wallet, blockchain } = useWalletKit();
  const [address] = useState(Address)

  const { RegisterIndividual } = useSign(address ?? "0", blockchain)

  const navigate = useRouter()
  const dark = useNextSelector(selectDarkMode)

  const [file, setFile] = useState<File>()
  const [individualIsUpload, setIndividualIsUpload] = useState<boolean>(true)
  const paymentname: DropDownItem[] = [{ name: "Upload Photo" }, { name: "NFT" }]
  const [selectedPayment, setSelectedPayment] = useState(paymentname[0])

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const File = file

    if (!address) return ToastRun(<>Please. sign in first</>)
    try {
      let image: Parameters<typeof UploadImageForUser>[0] | undefined;
      if (File || data.nftAddress) {
        image =
        {
          image: {
            blockchain,
            imageUrl: File ?? data.nftAddress!,
            nftUrl: data.nftAddress ?? "",
            tokenId: data.nftTokenId ?? null,
            type: individualIsUpload ? "image" : "nft"
          },
          name: `organizations/${data.name}`
        }
      }

      let user: Omit<IIndividual, "id" | "created_date"> = {
        accounts: [
          {
            address: address,
            blockchain,
            created_date: GetTime(),
            name: Wallet,
            id: address,
            image: null,
            members: [
              {
                address,
                id: process(),
                image: null,
                mail: null,
                name: data.name,
              }
            ],
            provider: null,
            signerType: "single",
          }
        ],
        budget_execrises: [],
        image: image?.image ?? null,
        members: [address],
        name: data.name,
        seenTime: GetTime()
      }

      await RegisterIndividual(user)

      navigate.push('/choose-type')
    } catch (error) {
      console.error(error)
      ToastRun(<>{(error as any).message}</>)
    }

  }

  const [isLoading, Submit] = useLoading(onSubmit)

  return <div className="h-screen w-full">
    <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
      <div>
        <img src={dark ? "/logo.png" : "/logo_white.png"} alt="" width="135" />
      </div>
    </header>
    <form onSubmit={handleSubmit(Submit)} className="py-[6.25rem] sm:py-0 sm:h-full ">
      <section className="flex flex-col items-center h-full justify-center gap-8 pt-12">
        <div className="flex flex-col gap-4">
          <div className="text-xl sm:text-3xl  dark:text-white text-center font-bold">Set Account Details</div>
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
              {!individualIsUpload ? <input type="text" {...register("nftAddress", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
            </div>
          </div>}
          {blockchain === 'celo' && !individualIsUpload && <div className="flex flex-col mb-4 gap-1 w-full">
            <div className="text-xs text-left  dark:text-white">Token ID</div>
            <div className={`w-full border rounded-lg`}>
              <input type="number" {...register("nftTokenId", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
            </div>
          </div>}
          <div className="flex flex-col mb-4 gap-1 w-full">
            <div className="text-xs text-left  dark:text-white">Name</div>
            <div className={`w-full border rounded-lg`}>
              <input type="text" {...register("name", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
            </div>
          </div>
          <div className="flex flex-col mb-4 gap-1 w-full">
            <div className="text-xs text-left dark:text-white">Your Address</div>
            <div className={`w-full border rounded-lg`}>
              <input type="text" readOnly defaultValue={address ?? ""} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
            </div>
          </div>
        </div>
        <div className="grid grid-rows-2 sm:grid-cols-2 gap-8 min-w-[23.5%]">
          <Button version="second" onClick={() => navigate.push('/')}>Back</Button>
          <Button type="submit" isLoading={isLoading}>Next</Button>
        </div>
      </section>
    </form>
  </div>
}

export default CreateAccount

CreateAccount.disableLayout = true
CreateAccount.disableGuard = true