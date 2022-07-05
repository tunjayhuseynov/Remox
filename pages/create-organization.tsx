import { useState } from "react";
import Button from "components/button";
import { useWalletKit } from "hooks";
import { useRouter } from "next/router";
import { useAppSelector } from "redux/hooks";
import { selectDarkMode } from "redux/slices/notificationSlice";
import Upload from "components/upload";
import useLoading from "hooks/useLoading";
import useOrganization from "hooks/accounts/useOrganization";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { useForm, SubmitHandler } from "react-hook-form";
import { ToastRun } from "utils/toast";
import useSignUp from "hooks/singingProcess/useSignUp";
import { UploadImageForUser } from "hooks/singingProcess/utils";
import { IOrganization } from "firebaseConfig";
import { GetTime } from "utils";
import { generate } from "shortid";

export interface IFormInput {
  nftAddress?: string;
  nftTokenId?: number;
  name: string;
}

const CreateOrganization = () => {
  const { register, handleSubmit } = useForm<IFormInput>();
  const { Address: address, blockchain, Wallet } = useWalletKit();
  const { RegisterOrganization } = useSignUp(address ?? "0", blockchain)

  const navigate = useRouter()
  const dark = useAppSelector(selectDarkMode)
  const [organizationIsUpload, setOrganizationIsUpload] = useState<boolean>(true)
  const [organizationFile, setOrganizationFile] = useState<File>()

  const paymentname: DropDownItem[] = [{ name: "Upload Photo" }, { name: "NFT" }]

  const [selectedPayment, setSelectedPayment] = useState(paymentname[0])

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    try {
      const File = organizationFile;
      if (!address) return ToastRun(<>Please, sign in first</>)
      if (organizationIsUpload && !File) throw new Error("No organization file uploaded")

      let image: Parameters<typeof UploadImageForUser>[0] | undefined;
      if (File || data.nftAddress) {
        image =
        {
          image: {
            blockchain,
            imageUrl: File ?? data.nftAddress!,
            nftUrl: data.nftAddress ?? "",
            tokenId: data.nftTokenId ?? null,
            type: organizationIsUpload ? "image" : "nft"
          },
          name: `organizations/${data.name}`
        }
      }

      let user: Omit<IOrganization, "id" | "created_date" | "creator"> = {
        blockchain,
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
                id: generate(),
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
      }
      // organizationFile: orgFile,
      //   organizationIsUpload: organizationIsUpload,
      //   organizationName: data.name,
      //   organizationNFTAddress: data.nftAddress,
      //   organizationNFTTokenId: data.nftTokenId
      await RegisterOrganization(user, {
        organizationFile: File,
        organizationIsUpload: organizationIsUpload,
        organizationName: data.name,
        organizationNFTAddress: data.nftAddress,
        organizationNFTTokenId: data.nftTokenId
      })

      navigate.push('/create-multisig')
    } catch (error) {
      console.error(error as any)
      ToastRun(<div>{(error as any).message}</div>)
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
            <div className="text-xs text-left  dark:text-white">Choose Organisation Profile Photo Type</div>
            <div className={` flex items-center gap-3 w-full rounded-lg`}>
              <Dropdown parentClass={'bg-white dark:bg-darkSecond w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={paymentname} selected={selectedPayment} onSelect={(e) => {
                setSelectedPayment(e)
                if (e.name === "NFT") setOrganizationIsUpload(false)
                else setOrganizationIsUpload(true)
              }} />
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
              <input type="number" {...register("nftTokenId", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
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