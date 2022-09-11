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

  const [file, setFile] = useState<File>();

  const imageType: DropDownItem[] = [
    { name: "Upload Photo", id: "image" },
    { name: "NFT", id: "nft" },
  ];
  const [selectedImageType, setSelectedImageType] = useState(imageType[0]);
  const individualIsUpload = selectedImageType.id === "image";

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const File = file;
    const Address = address;

    if (!Address) return ToastRun(<>Please. sign in first</>, "warning");
    try {
      await dispatch(
        Create_Individual_Thunk({
          address: Address,
          blockchain,
          file: File ?? null,
          name: data.name,
          newAccountName: Wallet,
          nftAddress: data.nftAddress ?? null,
          nftTokenId: data.nftTokenId ?? null,
          uploadType: individualIsUpload ? "image" : "nft",
        })
      );

      navigate.push("/choose-type");
    } catch (error) {
      console.error(error);
      ToastRun(<>{(error as any).message}</>, "error");
    }
  };

  const [isLoading, Submit] = useLoading(onSubmit);

  return (
    <div className="h-screen w-full">
      <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
        <div>
          <img
            src={dark ? "/logo.png" : "/logo_white.png"}
            alt=""
            width="135"
          />
        </div>
      </header>
      <form
        onSubmit={handleSubmit(Submit)}
        className="py-[6.25rem] sm:py-0 sm:h-full "
      >
        <section className="flex flex-col items-center h-full justify-center gap-8 pt-12">
          <div className="flex flex-col gap-4">
            <div className="text-xl sm:text-3xl  dark:text-white text-center font-bold">
              Set Account Details
            </div>
          </div>
          <div className="flex flex-col px-3 items-center justify-center min-w-[25%]">
            <div className="flex flex-col mb-4 space-y-1 w-full">
              {/* <div className="text-xs text-left text-black  dark:text-white">Choose Profile Photo Type</div> */}
              <div className={` flex items-center gap-3 w-full`}>
                <Dropdown
                  parentClass={" w-full rounded-lg h-[3.4rem]"}
                  className={"!rounded-lg h-[3.4rem]"}
                  label="Choose Profile Photo Type"
                  list={imageType}
                  selected={selectedImageType}
                  setSelect={setSelectedImageType}
                />
              </div>
            </div>
            {
              <div className="flex flex-col mb-4 space-y-1 w-full">
                <div className="text-xs text-left  dark:text-white">
                  {!individualIsUpload ? "NFT Address" : "Your Photo"}{" "}
                </div>
                <div className={`  w-full border rounded-lg`}>
                  {!individualIsUpload ? (
                    <input
                      type="text"
                      {...register("nftAddress", { required: true })}
                      className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1"
                    />
                  ) : (
                    <Upload
                      className={"!h-[3.4rem] block border-none w-full"}
                      setFile={setFile}
                    />
                  )}
                </div>
              </div>
            }
            {blockchain.name === "celo" && !individualIsUpload && (
              <div className="flex flex-col mb-4 gap-1 w-full">
                <div className="text-xs text-left  dark:text-white">
                  Token ID
                </div>
                <div className={`w-full border rounded-lg`}>
                  <input
                    type="number"
                    {...register("nftTokenId", {
                      required: true,
                      valueAsNumber: true,
                    })}
                    className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1"
                  />
                </div>
              </div>
            )}
            <div className="flex flex-col mb-4 gap-1 w-full">
              <div className={`w-full border rounded-lg`}>
                <TextField
                  type={"text"}
                  {...register("name", { required: true })}
                  className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1"
                  label="Name"

                />
              </div>
            </div>
            <div className="flex flex-col mb-4 gap-1 w-full">
              <div className={`w-full border rounded-lg`}>
                <TextField
                  type={'text'}
                  defaultValue={address}
                  className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1"
                  label="Yor Address"
                  disabled
                />
              </div>
            </div>
          </div>
          <div className="grid grid-rows-2 sm:grid-cols-2 gap-8 min-w-[23.5%]">
            <Button version="second" onClick={() => navigate.push("/")}>
              Back
            </Button>
            <Button type="submit" isLoading={isLoading}>
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
