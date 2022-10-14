import { useState } from "react";
import Button from "components/button";
import { useWalletKit } from "hooks";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { SelectDarkMode, setOrganizations } from 'redux/slices/account/remoxData';
import useLoading from "hooks/useLoading";
import { SubmitHandler } from "react-hook-form";
import { ToastRun } from "utils/toast";
import { Create_Organization_Thunk, Get_Organizations_Thunk } from "redux/slices/account/thunks/organization";
import { SelectIndividual } from "redux/slices/account/selector";
import EditableAvatar from "components/general/EditableAvatar";
import { nanoid } from "@reduxjs/toolkit";
import { Image } from "firebaseConfig";
import { TextField } from "@mui/material";

export interface IFormInput {
  name: string;
}

const CreateOrganization = () => {
  const { Address, blockchain, Wallet } = useWalletKit();

  const individual = useAppSelector(SelectIndividual)
  const dispatch = useAppDispatch()
  const navigate = useRouter()
  const dark = useAppSelector(SelectDarkMode)

  const [name, setName] = useState<string>()
  const [url, setUrl] = useState<string>()
  const [type, setType] = useState<"image" | "nft">("image")

  const onSubmit = async () => {
    try {
      const address = await Address
      if (!individual) throw new Error("No Individual")
      if (!name) throw new Error("Please, fill the field")
      if (!address) return ToastRun(<>Please, sign in first</>, "warning")

      let image: Image | null = null;
      if (url) {
        image = {
          blockchain: blockchain.name,
          imageUrl: url ?? "",
          nftUrl: url ?? "",
          tokenId: null,
          type: type ?? "image"
        };
      }

      await dispatch(Create_Organization_Thunk({
        address: address,
        blockchain,
        individual,
        name: name,
        newAccountName: Wallet,
        uploadType: type,
        image: image
      })).unwrap()

      const organizations = await dispatch(Get_Organizations_Thunk(address)).unwrap()
      dispatch(setOrganizations(organizations))

      navigate.push('/create-multisig')
    } catch (error) {
      console.error(error as any)
      ToastRun(<div>{(error as any).message}</div>, "error")
    }
  };

  const imageSelected = async (url: string, type: "nft" | "image") => {
    setUrl(url)
    setType(type)
  }

  const [isLoading, submit] = useLoading(onSubmit)

  return <div className="h-screen w-full">
    <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
      <div>
        <img src={dark ? "/logo.png" : "/logo_white.png"} alt="" width="150" height="40" />
      </div>
    </header>
    <div className="py-[6.25rem] sm:py-0 sm:h-full" >
      <section className="flex flex-col items-center justify-center space-y-2 h-full gap-6 pt-20">
        <div className="flex flex-col gap-4">
          <div className="text-xl sm:text-4xl dark:text-white text-center font-bold">Set Account Details</div>
        </div>
        <div className="flex flex-col space-y-8 px-3 gap-1 items-center justify-center min-w-[25%]">
          <EditableAvatar
            avatarUrl={null}
            name={"random"}
            blockchain={blockchain}
            evm={blockchain.name !== "solana"}
            userId={`accounts/${nanoid()}`}
            onChange={imageSelected}
          />
          <div className={`w-full rounded-lg`}>
            <TextField
              label="Organization Name"
              variant="outlined"
              InputLabelProps={{
                style: {
                  fontSize: "1rem"
                }
              }}
              InputProps={{
                style: {
                  fontSize: "1rem"
                }
              }}
              className="w-full"
              onChange={(e) => setName(e.target.value)}
              inputProps={{ required: true, name: "name", placeholder: "E.g: Remox DAO" }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-8 min-w-[23.5%] pb-8">
          <Button version="second" onClick={() => navigate.push('/choose-type')}>Back</Button>
          <Button type="submit" isLoading={isLoading} onClick={() => submit()}>Next</Button>
        </div>
      </section>
    </div>
  </div>
}

CreateOrganization.disableLayout = true
CreateOrganization.disableGuard = true
export default CreateOrganization