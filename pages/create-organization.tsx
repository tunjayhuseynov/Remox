import { useState } from "react";
import Button from "components/button";
import { useWalletKit } from "hooks";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { selectDarkMode } from "redux/slices/notificationSlice";
import Upload from "components/upload";
import useLoading from "hooks/useLoading";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { useForm, SubmitHandler } from "react-hook-form";
import { ToastRun } from "utils/toast";
import { Create_Organization_Thunk } from "redux/slices/account/thunks/organization";
import { SelectIndividual } from "redux/slices/account/selector";

export interface IFormInput {
  nftAddress?: string;
  nftTokenId?: number;
  name: string;
}

const CreateOrganization = () => {
  const { register, handleSubmit } = useForm<IFormInput>();
  const { Address: address, blockchain, Wallet } = useWalletKit();

  const individual = useAppSelector(SelectIndividual)
  const dispatch = useAppDispatch()
  const navigate = useRouter()
  const dark = useAppSelector(selectDarkMode)
  const [organizationFile, setOrganizationFile] = useState<File>()

  const imageType: DropDownItem[] = [{ name: "Upload Photo", id: "image" }, { name: "NFT", id: "nft" }]

  const [selectedImageType, setSelectedImageType] = useState(imageType[0])
  const organizationIsUpload = selectedImageType.id === "image"

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    try {
      const File = organizationFile;
      if (!individual) throw new Error("No Individual")
      if (!address) return ToastRun(<>Please, sign in first</>, "warning")
      if (organizationIsUpload && !File) throw new Error("No organization file uploaded")

      await dispatch(Create_Organization_Thunk({
        address: address,
        blockchain,
        file: File ?? null,
        individual,
        name: data.name,
        newAccountName: Wallet,
        nftAddress: data.nftAddress ?? null,
        nftTokenId: data.nftTokenId ?? null,
        uploadType: organizationIsUpload ? "image" : "nft"
      }))

      navigate.push('/create-multisig')
    } catch (error) {
      console.error(error as any)
      ToastRun(<div>{(error as any).message}</div>, "error")
    }

  };

  const [isLoading, submit] = useLoading(onSubmit)

  return <div className="h-screen w-full">
    <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
      <div>
        <img src={dark ? "/logo.png" : "/logo_white.png"} alt="" width="135" />
      </div>
    </header>
    <form onSubmit={handleSubmit(submit)} className="py-[6.25rem] sm:py-0 sm:h-full" >
      <section className="flex flex-col items-center h-full  gap-6 pt-20">
        <div className="flex flex-col gap-4">
          <div className="text-xl sm:text-3xl  dark:text-white text-center font-bold">Set Account Details</div>
        </div>
        <div className="flex flex-col px-3 gap-1 items-center justify-center min-w-[25%]">
          <div className="flex flex-col mb-4 space-y-1 w-full">
            {/* <div className="text-xs text-left  dark:text-white">Choose Organisation Profile Photo Type</div> */}
            <div className={` flex items-center gap-3 w-full rounded-lg`}>
              <Dropdown parentClass={'bg-white dark:bg-darkSecond w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} label="Choose Organisation Profile Photo Type" list={imageType} selected={selectedImageType} setSelect={setSelectedImageType} />
            </div>
          </div>
          {<div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs text-left  dark:text-white">{!organizationIsUpload ? "NFT Address" : "Your Photo"} </div>
            <div className={`  w-full border rounded-lg`}>
              {!organizationIsUpload ? <input type="text" {...register("nftAddress", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setOrganizationFile} />}
            </div>
          </div>}
          {blockchain === 'celo' && !organizationIsUpload && <div className="flex flex-col mb-4 gap-1 w-full">
            <div className="text-xs text-left  dark:text-white">Token ID</div>
            <div className={`w-full border rounded-lg`}>
              <input type="number" {...register("nftTokenId", { required: true, valueAsNumber: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
            </div>
          </div>}
          <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs dark:text-white">Organisation Name</div>
            <div className={` flex items-center gap-3 w-full border rounded-lg`}>
              <input type="text" {...register("name", { required: true })} placeholder="Remox DAO" className="bg-white dark:bg-darkSecond  h-[3.4rem] rounded-lg w-full px-1" />
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

CreateOrganization.disableLayout = true
CreateOrganization.disableGuard = true
export default CreateOrganization