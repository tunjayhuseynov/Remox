import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Button from "components/button";
import { useSelector } from "react-redux";
import { AltCoins, Coins, CoinsName, DropDownItem } from "types";
import Upload from "components/upload";
import useRequest from "hooks/useRequest";
import Modal from "components/general/modal";
import { IRequest, RequestStatus } from "rpcHooks/useRequest";
import { FormControl, TextField } from "@mui/material";
import { GetTime } from "utils";
import { useForm, SubmitHandler } from "react-hook-form";
import Dropdown from "components/general/dropdown";
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

export interface IFormInput {
  name: string;
  surname: string;
  address: string;
  amount: number;
  amount2?: number;
  serviceName: string;
  link?: string;
  requestType: string;
}

export default function RequestId() {
  const router = useRouter();

  const { id, coin, signer } = router.query as {
    id: string;
    coin: string;
    signer: string;
  };

  const [GetCoins, setGetCoins] = useState<AltCoins[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<AltCoins>();

  const [selectedCoin2, setSelectedCoin2] = useState<AltCoins>(GetCoins[0]);
  const [loader, setLoader] = useState<boolean>(true);

  const { register, handleSubmit } = useForm<IFormInput>();
  const { loading, addRequest } = useRequest();

  const collectionName = Blockchains.find(
    (s) => s.name === coin
  )!.currencyCollectionName;

  const dark = useSelector(SelectDarkMode);
  const [secondActive, setSecondActive] = useState(false);

  useAsyncEffect(async () => {
    const collection: AltCoins[] = await FirestoreReadAll(collectionName);
    setGetCoins(collection);
    setSelectedCoin(collection[0]);
    setSelectedCoin2(collection[0]);
    setLoader(false);
  }, []);

  const paymentBase: DropDownItem[] = [
    { name: "Pay with Token Amounts" },
    { name: "Pay with USD-based Amounts" },
  ];

  const [selectedPaymentBase, setSelectedPaymentBase] = useState(
    paymentBase[0]
  );
  const selectedTypeIsUsd =
    selectedPaymentBase.name === "Pay with USD-based Amounts";

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

  const setModalVisible: SubmitHandler<IFormInput> = async (data) => {
    const Invoice = file;
    const Wallet = selectedCoin;
    const Wallet2 = selectedCoin2;
    const ServDate = dateValue;
    console.log(data.link);

    try {
      let url = "";
      if (Invoice) {
        url = await UploadImage(`/requests/${signer}/${id}`, Invoice!);
        setImageRef(ref(storage, url));
      }

      const result: IRequest = {
        id: nanoid(),
        name: data.name,
        surname: data.surname,
        address: data.address,
        amount: data.amount.toString(),
        currency:
          Wallet === undefined
            ? coin === "solana"
              ? CoinsName.SOL
              : CoinsName.CELO
            : (Wallet.name as CoinsName),
        requestType: data.requestType,
        nameOfService: data.serviceName,
        serviceDate: GetTime(ServDate!),
        usdBase: selectedTypeIsUsd,
        timestamp: GetTime(),
        secondaryAmount: data.amount2 ? data.amount2.toString() : null,
        secondaryCurrency:
          Wallet2 === undefined
            ? coin === "solana"
              ? CoinsName.SOL
              : CoinsName.CELO
            : (Wallet2.name as CoinsName),
        status: RequestStatus.pending,
        attachLink: data.link ? data.link : null,
        uploadedLink: Invoice ? url : null,
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
        console.log("Request added");
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
                      label="First Name"
                      {...register("name", { required: true })}
                      className="bg-white dark:bg-darkSecond"
                      variant="outlined"
                    />

                    <TextField
                      label="Last Name"
                      {...register("surname", { required: true })}
                      className="bg-white dark:bg-darkSecond"
                      variant="outlined"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-10">
                    <Dropdown
                      label="Amount Type"
                      className=" border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md"
                      parentClass={" w-full rounded-md h-[3.15rem] "}
                      selectClass={"!text-sm"}
                      sx={{
                        ".MuiSelect-select": {
                          paddingTop: "6px",
                          paddingBottom: "6px",
                          maxHeight: "52px",
                        },
                      }}
                      list={paymentBase}
                      selected={selectedPaymentBase}
                      setSelect={setSelectedPaymentBase}
                    />
                    <TextField
                      label="Wallet Address"
                      {...register("address", { required: true })}
                      className="bg-white dark:bg-darkSecond"
                      variant="outlined"
                    />
                  </div>
                  <div className="flex w-full gap-x-10">
                    <div className="w-full h-full">
                      <Dropdown
                        label="Token"
                        className=" border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md"
                        selected={selectedCoin}
                        sx={{
                          ".MuiSelect-select": {
                            paddingTop: "6px",
                            paddingBottom: "6px",
                            maxHeight: "52px",
                          },
                        }}
                        setSelect={(val) => {
                          setSelectedCoin(val);
                        }}
                        list={Object.values(GetCoins)}
                      />
                    </div>
                    <div className="w-full h-full">
                      <TextField
                        label="Amount"
                        {...register("amount", {
                          required: true,
                          valueAsNumber: true,
                        })}
                        type={'number'}
                        inputProps={{step: 0.01}}
                        className="outline-none unvisibleArrow pl-2 bg-white dark:bg-darkSecond  dark:text-white w-full"
                        variant="outlined"
                      />
                    </div>
                  </div>
                  {secondActive ? (
                    <div className="flex gap-x-10">
                      <div className="w-full h-full">
                        <Dropdown
                          label="Tosken"
                          className=" border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md"
                          selected={selectedCoin2}
                          sx={{
                            ".MuiSelect-select": {
                              paddingTop: "6px",
                              paddingBottom: "6px",
                              maxHeight: "52px",
                            },
                          }}
                          setSelect={(val) => {
                            setSelectedCoin2(val);
                          }}
                          list={Object.values(GetCoins)}
                        />
                      </div>
                      <div className="w-full h-full">
                        <TextField
                          type={"number"}
                          label="Amount"
                          {...register("amount2", {
                            required: true,
                            valueAsNumber: true,
                          })}
                          inputProps={{step: 0.01}}
                          className="outline-none unvisibleArrow pl-2 bg-white dark:bg-darkSecond  dark:text-white w-full"
                          required
                          variant="outlined"
                        />
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
                      Upload receipt or invoice{" "}
                      <span className="text-black">(optional)</span>
                    </span>
                    <div className="grid grid-cols-1 bg-white">
                      <Upload setFile={setFile} noProfilePhoto={false} />
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
              className="lg:min-w-[50%] !pt-5"
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
