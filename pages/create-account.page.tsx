import { useState } from "react";
import Button from "components/button";
import { useWalletKit } from "hooks";
import { useRouter } from "next/router";
import { SelectDarkMode } from "redux/slices/account/remoxData";
import { ToastRun } from "utils/toast";
import Upload from "components/upload";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { useForm, SubmitHandler } from "react-hook-form";
import useLoading from "hooks/useLoading";
import useNextSelector from "hooks/useNextSelector";
import { useAppDispatch } from "redux/hooks";
import { Create_Individual_Thunk } from "redux/slices/account/thunks/individual";
import useAsyncEffect from "hooks/useAsyncEffect";
import { TextField } from "@mui/material";
import EditableAvatar from "components/general/EditableAvatar";
import { nanoid } from "@reduxjs/toolkit";

interface IFormInput {
  nftAddress?: string;
  nftTokenId?: number;
  name: string;
}

const CreateAccount = () => {
  const { register, handleSubmit } = useForm<IFormInput>();

  const { Address, Wallet, blockchain } = useWalletKit();
  const [address, setAddress] = useState<string>("");

  useAsyncEffect(async () => {
    const val = await Address;
    if (val) {
      setAddress(val);
    }
  }, []);

  const dispatch = useAppDispatch();
  const navigate = useRouter();
  const dark = useNextSelector(SelectDarkMode);


  const [imageURl, setImageUrl] = useState<string>();
  const [imageType, setImageType] = useState<"image" | "nft">()

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const Address = address;

    if (!Address) return ToastRun(<>Please. sign in first</>, "warning");

    try {
      await dispatch(
        Create_Individual_Thunk({
          address: Address,
          blockchain,
          imageUrl: imageURl ?? null,
          name: data.name,
          newAccountName: Wallet,
          nftAddress: null,
          nftTokenId: null,
          uploadType: imageType ?? "image",
        })
      ).unwrap();

      navigate.push("/choose-type");
    } catch (error) {
      console.error(error);
      ToastRun(<>{(error as any).message}</>, "error");
    }
  };

  const [isLoading, Submit] = useLoading(onSubmit);


  const onAvatarChange = (url: string, type: "image" | "nft") => {
    setImageUrl(url);
    setImageType(type);
  };

  return (
    <div className="h-screen w-full">
      <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
        <div>
          <img
            src={dark ? "/logo.png" : "/logo_white.png"}
            alt=""
            width="150"
            height="40"
          />
        </div>
      </header>
      <form
        onSubmit={handleSubmit(Submit)}
        className="py-[6.25rem] sm:py-0 sm:h-full "
      >
        <section className="flex flex-col items-center h-full justify-center gap-8 pt-12">
          <div className="flex flex-col gap-4">
            <div className="text-xl sm:text-2xl  dark:text-white text-center font-bold">
              Set Account Details
            </div>
          </div>
          <div className="flex flex-col space-y-5 items-center justify-center min-w-[25%]">
            <div className="flex">
              <EditableAvatar
                avatarUrl={null}
                name={"random"}
                blockchain={blockchain}
                evm={blockchain.name !== "solana"}
                userId={`accounts/${nanoid()}`}
                onChange={onAvatarChange}
              />
            </div>
            <div className="flex flex-col mb-4 gap-1 w-full">
              <div className={`w-full rounded-lg`}>
                <TextField
                  InputProps={
                    {
                      style: {
                        fontSize: "0.75rem",
                      }
                    }
                  }
                  InputLabelProps={
                    {
                      style: {
                        fontSize: "0.75rem",
                      }
                    }
                  }
                  type={"text"}
                  {...register("name", { required: true })}
                  className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1"
                  label="Name"
                  placeholder="E.g. Satoshi Nakamoto"
                />
              </div>
            </div>
            <div className="flex flex-col mb-4 gap-1 w-full">
              <div className={`w-full rounded-lg`}>
                <TextField
                  type={'text'}
                  InputProps={
                    {
                      style: {
                        fontSize: "0.875rem",
                      }
                    }
                  }
                  InputLabelProps={
                    {
                      style: {
                        fontSize: "0.875rem",
                      }
                    }
                  }
                  variant="outlined"
                  value={address}
                  className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1"
                  label="Your Address"
                  disabled
                />
              </div>
            </div>
          </div>
          <div className="grid grid-rows-2 sm:grid-cols-2 gap-8 min-w-[23.5%]">
            <Button version="second" className="!py-2 !text-sm" onClick={() => navigate.push("/")}>
              Back
            </Button>
            <Button type="submit" className="!py-2 !text-sm" isLoading={isLoading}>
              Next
            </Button>
          </div>
        </section>
      </form>
    </div>
  );
};

export default CreateAccount;

CreateAccount.disableLayout = true;
CreateAccount.disableGuard = true;
