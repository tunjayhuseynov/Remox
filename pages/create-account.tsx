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
import { IIndividual } from "firebaseConfig";
import { UploadNFTorImageForUser } from "hooks/singingProcess/utils";
import { GetTime } from "utils";
import useLoading from "hooks/useLoading";
import useNextSelector from "hooks/useNextSelector";
import { process } from "uniqid";
import { useAppDispatch } from "redux/hooks";
import { CreateTag } from "redux/slices/account/thunks/tags";
import { useDispatch } from "react-redux";
import { Create_Individual_Thunk } from "redux/slices/account/thunks/individual";

interface IFormInput {
  nftAddress?: string;
  nftTokenId?: number;
  name: string;
}

const CreateAccount = () => {
  const { register, handleSubmit } = useForm<IFormInput>();

  const { Address, Wallet, blockchain } = useWalletKit();
  const [address] = useState(Address)

  const dispatch = useAppDispatch()
  const navigate = useRouter()
  const dark = useNextSelector(selectDarkMode)

  const [file, setFile] = useState<File>()

  const imageType: DropDownItem[] = [{ name: "Upload Photo", id: 'image' }, { name: "NFT", id: "nft" }]
  const [selectedImageType, setSelectedImageType] = useState(imageType[0])
  const individualIsUpload = selectedImageType.id === "image"

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const File = file

    if (!address) return ToastRun(<>Please. sign in first</>, "warning")
    try {

      await dispatch(Create_Individual_Thunk({
        address,
        blockchain,
        file: File ?? null,
        name: data.name,
        newAccountName: Wallet,
        nftAddress: data.nftAddress ?? null,
        nftTokenId: data.nftTokenId ?? null,
        uploadType: individualIsUpload ? "image" : "nft",
      }))

      navigate.push('/choose-type')
    } catch (error) {
      console.error(error)
      ToastRun(<>{(error as any).message}</>, "error")
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
              <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={imageType} selected={selectedImageType} onSelect={(e) => {
                setSelectedImageType(e)
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
              <input type="number" {...register("nftTokenId", { required: true, valueAsNumber: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
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