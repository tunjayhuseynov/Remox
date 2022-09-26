import React, { useState } from "react";
import { useRouter } from "next/router";
import Button from "components/button";
import { useSelector } from "react-redux";
import { AltCoins } from "types";
import Upload from "components/upload";
import useRequest from "hooks/useRequest";
import Modal from "components/general/modal";
import { IRequest, RequestStatus } from "rpcHooks/useRequest";
import { TextField } from "@mui/material";
import { GetTime } from "utils";
import { useForm, SubmitHandler } from "react-hook-form";
import useLoading from "hooks/useLoading";
import { UploadImage } from "rpcHooks/useFirebase";
import { storage } from "firebaseConfig/firebase";
import { ref, StorageReference, deleteObject } from "firebase/storage";
import { SelectDarkMode } from "redux/slices/account/selector";
import { Blockchains } from "types/blockchains";
import { FirestoreReadAll } from "../../rpcHooks/useFirebase";
import useAsyncEffect from "hooks/useAsyncEffect";
import Loader from "components/Loader";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Confirm from "./confirm";
import Stack from "@mui/material/Stack";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { nanoid } from "@reduxjs/toolkit";
import PriceInputField from "components/general/PriceInputField";
import { IPrice } from "utils/api";
import { FiatMoneyList } from 'firebaseConfig';
import { IoMdRemoveCircle } from "react-icons/io";
import { useAppSelector } from "redux/hooks";

export interface IFormInput {
  fullname: string;
  address: string;
  serviceName: string;
  link?: string;
  requestType: string;
}


export default function RequestId() {
  const router = useRouter();

  const { id, coin: blockchain, signer } = router.query as {
    id: string;
    coin: string;
    signer: string;
  };

  const [GetCoins, setGetCoins] = useState<AltCoins[]>([]);
  const isDark = useAppSelector(SelectDarkMode)

  const [amount, setAmount] = useState<number | null>()
  const [coin, setCoin] = useState<AltCoins>();
  const [fiatMoney, setFiatMoney] = useState<FiatMoneyList | null>()
  
  const [amountSecond, setAmountSecond] = useState<number | null>()
  const [coinSecond, setCoinSecond] = useState<AltCoins>()
  const [fiatMoneySecond, setFiatMoneySecond] = useState<FiatMoneyList | null>()

  const [loader, setLoader] = useState<boolean>(true);

  const { register, handleSubmit } = useForm<IFormInput>();
  const { loading, addRequest } = useRequest();

  const dark = useSelector(SelectDarkMode);
  const [secondActive, setSecondActive] = useState(false);

  useAsyncEffect(async () => {
    if (typeof window !== "undefined" && blockchain) {
      const collectionName = Blockchains.find(
        (s) => s.name === blockchain
      )?.currencyCollectionName;
      const collection: AltCoins[] = await FirestoreReadAll(collectionName ?? "");
      setGetCoins(collection);
      setLoader(false);
    }
  }, [blockchain]);

  const [file, setFile] = useState<File>();
  const [fileName, setFileName] = useState<string>("");
  const [imageRef, setImageRef] = useState<StorageReference>();

  const [modal, setModal] = useState(false);
  const [request, setRequest] = useState<IRequest>();
  const [dateValue, setDateValue] = React.useState<Date | null>(new Date());

  const handleDateChange = (newValue: Date | null) => {
    setDateValue(newValue);
  };

  const closeModal = async () => {
    try {
      if (file) {
        await deleteObject(imageRef!);
      }
      setModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  const onChange1 = (val: number | null, coin: IPrice[0] | AltCoins, fiatMoney: FiatMoneyList | undefined ) => {
    console.log(val)
    console.log(coin)
    console.log(fiatMoney)
    setAmount(val);
    setCoin(coin);
    setFiatMoney(fiatMoney)
  }

  const setModalVisible: SubmitHandler<IFormInput> = async (data) => {
    const Invoice = file;
    const ServDate = dateValue;
    console.log(data.link);

    try {
      let url = "";
      if (Invoice) {
        url = await UploadImage(`/requests/${signer}/${id}`, Invoice!);
        setImageRef(ref(storage, url));
      }

      const result : IRequest = {
        id: nanoid(),
        fullname: data.fullname,
        address: data.address,
        amount: (amount ?? 0).toString() ,
        currency: coin?.symbol ?? "",
        fiat: fiatMoney ?? null,
        secondAmount: (amountSecond ?? 0).toString(),
        secondCurrency: coinSecond?.symbol ?? null,
        fiatSecond: fiatMoneySecond ?? null,
        requestType: data.requestType,
        nameOfService: data.serviceName,
        serviceDate: GetTime(ServDate!),
        attachLink: data.link ? data.link : null,
        uploadedLink: Invoice ? url : null,
        timestamp: GetTime(),
        status: RequestStatus.pending,
      };

      setRequest(result);
      setFileName(Invoice?.name ?? "");
      setModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const [isLoading, SetModalVisible] = useLoading(setModalVisible);

  const submit = async () => {
    try {
      if (request) {
        await addRequest(id, request);
        router.push("/dashboard");
      }
    } catch (error) {
      console.log(error);
      throw new Error("An error occured while adding request");
    }
  };

  if (loader) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <header className="flex justify-start h-[4.688rem] pl-10  md:px-40 items-center absolute top-0 w-full cursor-pointer">
        <div
          onClick={() => router.push("/dashboard")}
          className="w-[6.25rem] h-[1.25rem] sm:w-full sm:h-[1.875rem]"
        >
          <img
            src={dark ? "/logo.png" : "/logo_white.png"}
            alt=""
            width="135"
          />
        </div>
      </header>
      <div className="px-8 ">
        <form onSubmit={handleSubmit(SetModalVisible)}>
          <div className="py-0 pt-24 flex flex-col items-center justify-center min-h-screen sm:py-24">
            <div className="sm:min-w-[85vw] min-h-[75vh] h-auto ">
              <div className="py-2 text-center w-full">
                <div className="text-3xl font-semibold">
                  Request money from Remox
                </div>
              </div>
              <div className="sm:flex flex-col w-1/2 mx-auto gap-3 sm:gap-10 py-10">
                <div className="sm:flex flex-col  gap-3 gap-y-10">
                  <div className="flex flex-col space-y-5 ">
                    <span className="text-left text-2xl font-bold">
                      Your Information
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-10">
                    <TextField
                      label="Full Name"
                      {...register("fullname", { required: true })}
                      className="bg-white dark:bg-darkSecond"
                      variant="outlined"
                    />
                    <TextField
                      label="Wallet Address"
                      {...register("address", { required: true })}
                      className="bg-white dark:bg-darkSecond"
                      variant="outlined"
                    />
                  </div>
                  <div>
                    <PriceInputField 
                      isMaxActive
                      coins={GetCoins.reduce((a, v) => ({...a, [v.name] : v}), {})} 
                      onChange={(val, coin, fiatMoney) => {
                        setAmount(val)
                        setCoin('amount' in coin ? coin.coin : coin)
                        setFiatMoney(fiatMoney ?? null)
                      }}
                    />
                  </div>
                  {secondActive ? (
                    <div className="col-span-2 relative">
                      <PriceInputField 
                        isMaxActive
                        coins={GetCoins.reduce((a, v) => ({...a, [v.name] : v}), {})} 
                        onChange={(val, coin, fiatMoney) => {
                          setAmountSecond(val)
                          setCoinSecond('amount' in coin ? coin.coin : coin)
                          setFiatMoneySecond(fiatMoney ?? null)
                        }}
                      />
                      <div className="absolute -right-6 top-5 cursor-pointer" onClick={() => {
                        setSecondActive(false),
                        setCoinSecond(undefined),
                        setAmountSecond(undefined)
                      }}>
                        <IoMdRemoveCircle color="red" />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="text-primary cursor-pointer"
                      onClick={() => setSecondActive(true)}
                    >
                      {" "}
                      <span className="px-2 text-primary border-primary ">
                        +
                      </span>{" "}
                      Add another token
                    </div>
                  )}
                  <div className="flex flex-col gap-5 pb-5 sm:pb-0 sm:space-y-5 sm:gap-0">
                    <span className="text-left text-2xl font-bold tracking-wide">
                      Details
                    </span>
                    <div className="flex flex-col gap-y-3  sm:grid grid-cols-1 md:grid-cols-2 gap-x-10 sm:gap-y-7">
                      <div className="flex flex-col space-y-1">
                        <TextField
                          label="Request Type"
                          {...register("requestType", { required: true })}
                          className="bg-white dark:bg-darkSecond"
                          variant="outlined"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <TextField
                          label="Name of Service"
                          {...register("serviceName", { required: true })}
                          className="bg-white dark:bg-darkSecond"
                          variant="outlined"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <Stack
                            spacing={3}
                            className={` bg-white dark:bg-darkSecond text-sm !rounded-md`}
                          >
                            <DesktopDatePicker
                              label="Date of Service"
                              inputFormat="MM/dd/yyyy"
                              value={dateValue}
                              onChange={handleDateChange}
                              renderInput={(params) => (
                                <TextField {...params} />
                              )}
                            />
                          </Stack>
                        </LocalizationProvider>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <TextField
                          label="Attach Link (optional)"
                          {...register("link", { required: false })}
                          className="bg-white dark:bg-darkSecond"
                          variant="outlined"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 w-[82%] sm:w-full">
                    <span className="text-left  text-greylish pb-2 ml-2">
                      Upload receipt or invoice (optional)
                    </span>
                    <div className="grid grid-cols-1 bg-white">
                      <Upload className={`${isDark ? "!border-greylish" : "!border-dark"}  `} setFile={setFile} noProfilePhoto={false} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-center pt-5 sm:pt-0">
                  <div className="flex flex-row gap-10 sm:grid grid-cols-2 w-full sm: justify-center sm:gap-10">
                    <Button
                      version="second"
                      className="w-[9.375rem] sm:w-full"
                      onClick={() => router.push("/dashboard")}
                    >
                      Close
                    </Button>
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      className=" w-[9.375rem] sm:w-full bg-primary px-3 py-2 text-white flex items-center justify-center rounded-lg"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {modal && (
            <Modal
              onDisable={setModal}
              animatedModal={false}
              disableX={true}
              className="lg:min-w-[40%] !pt-5"
            >
              <Confirm
                GetCoins={GetCoins}
                submit={submit}
                closeModal={closeModal}
                request={request}
                loading={loading}
                filename={fileName}
              />
            </Modal>
          )}
        </form>
      </div>
    </>
  );
}


RequestId.disableLayout = true;
RequestId.disableGuard = true;

