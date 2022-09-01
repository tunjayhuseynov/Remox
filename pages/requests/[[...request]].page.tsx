import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Button from "components/button";
import { useSelector } from "react-redux";
import { CeloCoins, Coins, CoinsName, DropDownItem } from "types";
import Upload from "components/upload";
import useRequest from "hooks/useRequest";
import DatePicker from "react-datepicker";
import Modal from "components/general/modal";
// import dateFormat from "dateformat";
import { IRequest, RequestStatus } from "rpcHooks/useRequest";
import useCurrency from "rpcHooks/useCurrency";
import { TotalUSDAmount } from "pages/dashboard/requests/_components/totalAmount";
// import { SelectInputs, changeBasedValue } from "redux/slices/payinput";
import { AddressReducer, GetTime } from "utils";
import { useForm, SubmitHandler } from "react-hook-form";
import { useWalletKit } from "hooks";
import Dropdown from "components/general/dropdown";
import { useAppDispatch } from "redux/hooks";
import useLoading from "hooks/useLoading";
import { UploadImage } from "rpcHooks/useFirebase";
import { storage } from "firebaseConfig/firebase";
import { ref, StorageReference, deleteObject } from "firebase/storage";
import { SelectCurrencies, SelectDarkMode } from "redux/slices/account/selector";
import { setBlockchain, updateAllCurrencies } from "redux/slices/account/remoxData";
import { Blockchains, BlockchainType } from "types/blockchains";
import Confirm from "./confirm";

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
  const router = useRouter()

  const { id, coin, signer } = router.query as {
    id: string;
    coin: string;
    signer: string;
  };

  const { register, handleSubmit } = useForm<IFormInput>();
  const { loading, addRequest } = useRequest();

  const data = useCurrency(Blockchains.find(s => s.name === coin)!.currencyCollectionName);

  const dispatch = useAppDispatch();


  const dark = useSelector(SelectDarkMode);
  const currency = useSelector(SelectCurrencies);
  const [secondActive, setSecondActive] = useState(false);
  const { GetCoins } = useWalletKit();

  useEffect(() => {
    dispatch(setBlockchain(Blockchains.find(s => s.name === coin) as BlockchainType));
  }, []);

  useEffect(() => {
    if (data) {
      dispatch(updateAllCurrencies(data));
    }
  }, [data]);


  const [selectedWallet, setSelectedWallet] = useState(
    GetCoins[0]
  );
  const [selectedWallet2, setSelectedWallet2] = useState(
    GetCoins[0]
  );
  const paymentBase: DropDownItem[] = [
    { name: "Pay with Token Amounts" },
    { name: "Pay with USD-based Amounts" },
  ];
  const [selectedPaymentBase, setSelectedPaymentBase] = useState(paymentBase[0]);
  const selectedTypeIsUsd = selectedPaymentBase.name === "Pay with USD-based Amounts";

  const [file, setFile] = useState<File>();
  const [serviceDate, setServiceDate] = useState<Date>(new Date());
  const [fileName, setFileName] = useState<string>("");
  const [imageRef, setImageRef] = useState<StorageReference>();
  const [imageUrl, setImageUrl] = useState<string>("");
  // const MyInput = useSelector(SelectInputs)[0]

  const [modal, setModal] = useState(false);
  const [request, setRequest] = useState<IRequest>();


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
    const Wallet = selectedWallet;
    const Wallet2 = selectedWallet2;
    const ServDate = serviceDate;

    try {
      if (Invoice) {
        const url = await UploadImage(`/requests/${signer}/${id}`, Invoice!);
        setImageUrl(url);
        setImageRef(ref(storage, url));
      }

      console.log(data.amount);

      const result: IRequest = {
        id: id,
        name: data.name,
        surname: data.surname,
        address: data.address,
        amount: data.amount,
        currency: Wallet === undefined ? (coin === "solana" ? CoinsName.SOL : CoinsName.CELO) : Wallet.name as CoinsName,
        requestType: data.requestType,
        nameOfService: data.serviceName,
        serviceDate: GetTime(ServDate),
        usdBase: selectedTypeIsUsd,
        timestamp: GetTime(),
        secondaryAmount: data.amount2 ? data.amount2 : null,
        secondaryCurrency: Wallet2 === undefined ? (coin === "solana" ? CoinsName.SOL : CoinsName.CELO) : Wallet2.name as CoinsName,
        status: RequestStatus.pending,
        attachLink: data.link ? data.link : null,
        uploadedLink: Invoice ? imageUrl : null,
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
        <form onSubmit={handleSubmit(SetModalVisible)} >
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
                    <div>
                      <div className="text-greylish ">First Name</div>
                      <input
                        type="text"
                        {...register("name", { required: true })}
                        className="border pl-2 rounded-md outline-none sm:h-[3.15rem]  w-full dark:bg-darkSecond"
                        required
                      />
                    </div>
                    <div>
                      <div className="text-greylish ">Last Name</div>
                      <input
                        type="text"
                        {...register("surname", { required: true })}
                        className="border pl-2 rounded-md outline-none sm:h-[3.15rem] w-full dark:bg-darkSecond"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-10">
                    <div>
                      {/* <div className="text-greylish">Amount Type</div> */}
                      <div>
                        <Dropdown
                          parentClass={"bg-white w-full rounded-lg "}
                          className={
                            "!rounded-lg !h-[3.15rem] border dark:border-white"
                          }
                          label="Amount Type"
                          list={paymentBase}
                          selected={selectedPaymentBase}
                          setSelect={setSelectedPaymentBase}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-greylish">Wallet Address</div>
                      <div>
                        <input
                          type="text"
                          {...register("address", { required: true })}
                          className="border pl-2 rounded-md outline-none py-3 w-full dark:bg-darkSecond"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full gap-x-10">
                    <div className="w-full h-full">
                      {/* <div className="text-greylish">Token</div> */}
                      {
                        <Dropdown
                          parentClass="w-full border-transparent text-sm dark:text-white"
                          className="!rounded-md !h-[3.15rem]  border dark:border-white"
                          selected={selectedWallet}
                          label="Token"
                          list={Object.values(GetCoins)}
                          setSelect={setSelectedWallet}
                        />
                      }
                    </div>
                    <div className="w-full h-full">
                      <div className="text-greylish">Amount</div>
                      <div
                        className={`border w-full text-black py-1 h-full bg-white dark:bg-darkSecond rounded-md grid ${selectedTypeIsUsd
                          ? "grid-cols-[25%,75%]"
                          : "grid-cols-[50%,50%]"
                          }`}
                      >
                        {selectedTypeIsUsd && (
                          <span className="text-sm self-center pl-2 pt-1 opacity-70 dark:text-white">
                            USD as
                          </span>
                        )}
                        <input
                          type="number"
                          {...register("amount", {
                            required: true,
                            valueAsNumber: true,
                          })}
                          className="outline-none unvisibleArrow pl-2 bg-white dark:bg-darkSecond py-2  dark:text-white "
                          required
                          step={"any"}
                          min={0}
                        />
                      </div>
                    </div>
                  </div>
                  {secondActive ? (
                    <div className="flex gap-x-10">
                      <div className="w-full h-full">
                        {/* <div className="text-greylish">Token</div> */}
                        {
                          <Dropdown
                            parentClass="w-full border-transparent text-sm dark:text-white"
                            className="!rounded-md !h-[3.15rem] border dark:border-white"
                            label="Token"
                            selected={selectedWallet2}
                            list={Object.values(GetCoins)}
                            setSelect={setSelectedWallet2}
                          />
                        }
                      </div>
                      <div className="w-full h-full">
                        <div className="text-greylish">Amount</div>
                        <div
                          className={`border w-full text-black py-1 bg-white dark:bg-darkSecond rounded-md grid ${selectedTypeIsUsd
                            ? "grid-cols-[25%,75%]"
                            : "grid-cols-[50%,50%]"
                            }`}
                        >
                          {selectedTypeIsUsd && (
                            <span className="text-sm self-center pl-2 pt-1 opacity-70 dark:text-white">
                              USD as
                            </span>
                          )}
                          <input
                            type="number"
                            {...register("amount2", {
                              required: true,
                              valueAsNumber: true,
                            })}
                            className="outline-none unvisibleArrow pl-2 py-2 bg-white dark:bg-darkSecond dark:text-white"
                            step={"any"}
                            min={0}
                          />
                        </div>
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
                  {/* <div className="pb-14 sm:pb-0 pr-20 sm:pr-0 grid grid-rows-4 md:grid-rows-1  md:grid-cols-[25%,35%,35%,5%] gap-y-5 sm:gap-5">
                                    <Input incomingIndex={MyInput.index} />
                                </div> */}
                  <div className="flex flex-col gap-5 pb-5 sm:pb-0 sm:space-y-5 sm:gap-0">
                    <span className="text-left text-2xl font-bold tracking-wide">
                      Details
                    </span>
                    <div className="flex flex-col gap-y-3  sm:grid grid-cols-1 md:grid-cols-2 gap-x-10 sm:gap-y-7">
                      <div className="flex flex-col space-y-1">
                        <div className="text-left  text-greylish pb-2 ml-2">
                          Request Type
                        </div>
                        <div>
                          <input
                            type="text"
                            {...register("requestType", { required: true })}
                            name="requestType"
                            className="mb-0 sm:w-full sm:h-[3.15rem] border dark:border-darkSecond dark:bg-darkSecond rounded-md px-3 outline-none"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div className="text-left  text-greylish pb-2 ml-2">
                          Name of service
                        </div>
                        <input
                          type="text"
                          {...register("serviceName", { required: true })}
                          className="mb-0 sm:w-full sm:h-[3.15rem] border dark:border-darkSecond dark:bg-darkSecond rounded-md px-3 outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div className="text-left  text-greylish pb-2 ml-2">
                          Date of service
                        </div>
                        <div>
                          <DatePicker
                            className="mb-0 sm:w-full sm:h-[3.15rem] border dark:border-darkSecond dark:bg-darkSecond rounded-md px-3 outline-none"
                            selected={serviceDate}
                            minDate={new Date()}
                            onChange={(date) =>
                              date ? setServiceDate(date) : null
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div className="text-left  text-greylish pb-2 ml-2">
                          Attach link{" "}
                          <span className="text-black">(optional)</span>
                        </div>
                        <div>
                          <input
                            type="text"
                            {...register("link")}
                            name="attachLink"
                            placeholder="Attach link"
                            className="mb-0 sm:w-full sm:h-[3.15rem] border dark:border-darkSecond dark:bg-darkSecond rounded-md px-3 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 w-[82%] sm:w-full">
                    <span className="text-left  text-greylish pb-2 ml-2">
                      Upload receipt or invoice{" "}
                      <span className="text-black">(optional)</span>
                    </span>
                    <div className="grid grid-cols-1 bg-white">
                      <Upload setFile={setFile} />
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
              <Confirm currency={currency} GetCoins={GetCoins} closeModal={closeModal} request={request} loading={loading} filename={fileName} />
            </Modal>
          )}
        </form>
      </div>
    </>
  );
};

RequestId.disableLayout = true;
RequestId.disableGuard = true;

export async function getServerSideProps() {
  return {
    props: {}, // will be passed to the page component as props
  }
}