import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router"
import Button from "components/button";
import { useDispatch, useSelector } from "react-redux";
import { changeError, changeSuccess, selectDarkMode } from "redux/slices/notificationSlice";
import Input from "subpages/pay/payinput";
import { CeloCoins, Coins, CoinsName, DropDownItem } from "types";
import Upload from "components/upload";
import useRequest from "hooks/useRequest";
import DatePicker from "react-datepicker";
import Modal from "components/general/modal";
import dateFormat from "dateformat";
import { IRequest } from "rpcHooks/useRequest";
import { isAddress } from "web3-utils";
import { toast, ToastContainer } from 'react-toastify';
import useCurrency from "rpcHooks/useCurrency";
import { ICoinMembers, updateAllCurrencies } from 'redux/slices/currencies'
import { SelectCurrencies } from 'redux/slices/currencies';
import { TotalUSDAmount } from "subpages/dashboard/requests/totalAmount";
// import { SelectInputs, changeBasedValue } from "redux/slices/payinput";
import { AddressReducer } from 'utils'
import { useForm, SubmitHandler } from "react-hook-form";
import { useWalletKit } from "hooks";
import Dropdown from "components/general/dropdown";

export interface IFormInput {
    name: string;
    surname: string;
    address: string;
    amount: number;
    amount2?: number;
    serviceName: string;
    link?: string;
    requestType:string;
}

const RequestId = () => {
    const { id } = useRouter().query as { id: string }
    const { register, handleSubmit } = useForm<IFormInput>();
    const { loading, addRequest } = useRequest()

    const data = useCurrency()

    const dark = useSelector(selectDarkMode)
    const currency = useSelector(SelectCurrencies)
    const [secondActive, setSecondActive] = useState(false);
    const { GetCoins, blockchain } = useWalletKit();
    const DropDownCoins = useMemo(
        () =>
            Object.values(GetCoins!).map((w) => ({
                name: w.name,
                coinUrl: w.coinUrl,
            })),
        [GetCoins]
    );
    const [selectedWallet, setSelectedWallet] = useState<DropDownItem>(
        DropDownCoins[0]
    );
    const [selectedWallet2, setSelectedWallet2] = useState<DropDownItem>();
    const [amount, setAmount] = useState<number>(0);
    const [amount2, setAmount2] = useState<number>(0);
    const paymentname3: DropDownItem[] = [
        { name: "Pay with Token Amounts" },
        { name: "Pay with USD-based Amounts" },
    ];
    const [selectedPayment3, setSelectedPayment3] = useState(paymentname3[0]);

    const [file, setFile] = useState<File>()
    const [selectedType, setSelectedType] = useState(false)
    const [serviceDate, setServiceDate] = useState<Date>(new Date());
    // const MyInput = useSelector(SelectInputs)[0]

    const dispatch = useDispatch()
    const router = useRouter();

    const [modal, setModal] = useState(false)


    const [result, setResult] = useState<Omit<IRequest, "id" | "status" | "timestamp">>()

    useEffect(() => {
        if (data) {
            dispatch(updateAllCurrencies(data))
        }
    }, [])

    const [currentCurrency, setCurrentCurrency] = useState<ICoinMembers>(currency)


    useEffect(() => {
        if (currency) {
            setCurrentCurrency(currency)
        }
    }, [currency])

    // const Submit = async (e: SyntheticEvent<HTMLFormElement>) => {
    //     e.preventDefault()
    //     const { requestType, nameService, attachLink } = e.target as HTMLFormElement;

    //     const request = requestType.value
    //     const serviceName = nameService.value
    //     const link = attachLink.value

    //     const amount = MyInput.amount
    //     const name = MyInput.name
    //     const surname = MyInput.surname
    //     const address = MyInput.address
    //     const wallet = MyInput.wallet
    //     if (!isAddress(address ?? "") && !address?.includes('.nom')) {
    //         toast.error(<div className="dark:text-white"><strong>Address is invalid</strong> <br /> Please, use valid address or Nomspace name</div>, {
    //             position: "top-right",
    //             autoClose: 5000,
    //             hideProgressBar: false,
    //             closeOnClick: true,
    //             pauseOnHover: true,
    //             draggable: true,
    //             progress: undefined,
    //             bodyClassName: "dark:border-darkSecond dark:bg-darkSecond",
    //             className: "dark:bg-darkSecond",
    //         });
    //         return
    //     }
    //     if (request && serviceName && startDate && amount && address && wallet && wallet.name) {
    //         setResult({
    //             address,
    //             amount: amount.toFixed(4),
    //             currency: wallet.name as CoinsName,
    //             name: name ?? "",
    //             surname: surname ?? "",
    //             requestType: request,
    //             nameOfService: serviceName,
    //             serviceDate: startDate.getTime(),
    //             attachLink: link ?? "",
    //             secondaryAmount: MyInput.amount2 ? MyInput.amount2.toFixed(4) : undefined,
    //             secondaryCurrency: MyInput.wallet2?.name as CoinsName | undefined,
    //             usdBase: selectedType,
    //             uploadedLink: file?.name ?? undefined
    //         })

    //         setModal(true)
    //     }

    // }
    // const onChangeType = (value: boolean) => {
    //     setSelectedType(value)
    //     dispatch(changeBasedValue(value))
    // }

    // const Send = async () => {
    //     if (result) {
    //         try {
    //             await addRequest(id.toLowerCase(), result)
    //             setModal(false)
    //             dispatch(changeSuccess({ activate: true, text: "Request has been sent" }))
    //             router.push("/dashboard")
    //         } catch (error: any) {
    //             console.error(error.message)
    //             setModal(false)
    //             dispatch(changeError({ activate: true, text: error.message ?? "Something went wrong" }))
    //         }
    //     }
    // }
    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        const Invoice = file;
        const Wallet = selectedWallet;
        const Wallet2 = selectedWallet2;
        const ServDate = serviceDate;
        console.log(data,Invoice,Wallet,Wallet2,ServDate)
    }


    return <>
        <header className="flex justify-start h-[4.688rem] pl-10  md:px-40 items-center absolute top-0 w-full cursor-pointer">
            <div onClick={() => router.push('/dashboard')} className="w-[6.25rem] h-[1.25rem] sm:w-full sm:h-[1.875rem]" >
                <img src={dark ? "/logo.png" : "/logo_white.png"} alt="" width="135" />
            </div>
        </header>
        <div className="px-8 ">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="py-0 pt-24 flex flex-col items-center justify-center min-h-screen sm:py-24">
                    <div className="sm:min-w-[85vw] min-h-[75vh] h-auto ">
                        <div className="py-2 text-center w-full">
                            <div className="text-3xl font-semibold">Request money from Remox</div>
                        </div>
                        <div className="sm:flex flex-col w-1/2 mx-auto gap-3 sm:gap-10 py-10">
                            <div className="sm:flex flex-col  gap-3 gap-y-10">
                                <div className="flex flex-col space-y-5 ">
                                    <span className="text-left text-2xl font-bold">Your Information</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-10">
                                    <div>
                                        <div className="text-greylish ">First Name</div>
                                        <input type="text" {...register("name", { required: true })} className="border pl-2 rounded-md outline-none sm:h-[3.15rem]  w-full dark:bg-darkSecond" required />
                                    </div>
                                    <div>
                                        <div className="text-greylish ">Last Name</div>
                                        <input type="text" {...register("surname", { required: true })} className="border pl-2 rounded-md outline-none sm:h-[3.15rem] w-full dark:bg-darkSecond" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-10">
                                    <div>
                                        <div className="text-greylish">Amount Type</div>
                                        <div>
                                            <Dropdown parentClass={'bg-white w-full rounded-lg '} className={'!rounded-lg !h-[3.15rem] border dark:border-white'} childClass={'!rounded-lg'} list={paymentname3} selected={selectedPayment3} onSelect={(e) => {
                                                setSelectedPayment3(e)
                                                if (e.name === "Pay with USD-based Amounts") setSelectedType(true)
                                                else setSelectedType(false)
                                            }} />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-greylish">Wallet Address</div>
                                        <div>
                                            <input type="text"  {...register("address", { required: true })} className="border pl-2 rounded-md outline-none py-3 w-full dark:bg-darkSecond" required />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex w-full gap-x-10">
                                    <div className="w-full h-full">
                                        <div className="text-greylish">Token</div>
                                        {<Dropdown parentClass={'w-full   border-transparent text-sm dark:text-white'} className="!rounded-md !h-[3.15rem]  border dark:border-white" nameActivation={true} selected={selectedWallet ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
                                            setSelectedWallet(val)
                                        }} />}
                                    </div>
                                    <div className="w-full h-full">
                                        <div className="text-greylish">Amount</div>
                                        <div className={`border w-full text-black py-1 h-full bg-white dark:bg-darkSecond rounded-md grid ${selectedType ? "grid-cols-[25%,75%]" : "grid-cols-[50%,50%]"}`}>
                                            {selectedType && <span className="text-sm self-center pl-2 pt-1 opacity-70 dark:text-white">USD as</span>}
                                            <input type="number" {...register("amount", { required: true, valueAsNumber: true })} className="outline-none unvisibleArrow pl-2 bg-white dark:bg-darkSecond py-2  dark:text-white " required step={'any'} min={0} onChange={(e) => { setAmount(parseInt(e.target.value)) }} />
                                        </div>
                                    </div>
                                </div>
                                {secondActive ?
                                    <div className="flex gap-x-10">
                                        <div className="w-full h-full">
                                            <div className="text-greylish">Token</div>
                                            {<Dropdown parentClass={'w-full border-transparent text-sm dark:text-white'} className="!rounded-md !h-[3.15rem] border dark:border-white" nameActivation={true} selected={selectedWallet2 ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
                                                setSelectedWallet2(val)
                                            }} />}
                                        </div>
                                        <div className="w-full h-full">
                                        <div className="text-greylish">Amount</div>
                                        <div className={`border w-full text-black py-1 bg-white dark:bg-darkSecond rounded-md grid ${selectedType ? "grid-cols-[25%,75%]" : "grid-cols-[50%,50%]"}`}>
                                            {selectedType && <span className="text-sm self-center pl-2 pt-1 opacity-70 dark:text-white">USD as</span>}
                                            <input type="number" {...register("amount2", { required: true, valueAsNumber: true })} className="outline-none unvisibleArrow pl-2 py-2 bg-white dark:bg-darkSecond dark:text-white" step={'any'} min={0} onChange={(e) => { setAmount2(parseInt(e.target.value)) }} />
                                        </div>
                                        </div>
                                    </div> : <div className="text-primary cursor-pointer" onClick={() => setSecondActive(true)}> <span className="px-2 text-primary border-primary ">+</span> Add another token</div>}
                                {/* <div className="pb-14 sm:pb-0 pr-20 sm:pr-0 grid grid-rows-4 md:grid-rows-1  md:grid-cols-[25%,35%,35%,5%] gap-y-5 sm:gap-5">
                                    <Input incomingIndex={MyInput.index} />
                                </div> */}
                                <div className="flex flex-col gap-5 pb-5 sm:pb-0 sm:space-y-5 sm:gap-0">
                                    <span className="text-left text-2xl font-bold tracking-wide">Details</span>
                                    <div className="flex flex-col gap-y-3  sm:grid grid-cols-1 md:grid-cols-2 gap-x-10 sm:gap-y-7">
                                        <div className="flex flex-col space-y-1">
                                            <div className="text-left  text-greylish pb-2 ml-2">
                                                Request Type
                                            </div>
                                            <div>
                                                <input type="text" {...register("requestType", { required: true })} name="requestType" className="mb-0 sm:w-full sm:h-[3.15rem] border dark:border-darkSecond dark:bg-darkSecond rounded-md px-3 outline-none" required />
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <div className="text-left  text-greylish pb-2 ml-2">
                                                Name of service
                                            </div>
                                            <div>
                                                <input type="text" name="nameService" className="mb-0 sm:w-full sm:h-[3.15rem] border dark:border-darkSecond dark:bg-darkSecond rounded-md px-3 outline-none" required />
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <div className="text-left  text-greylish pb-2 ml-2">
                                                Date of service
                                            </div>
                                            <div>
                                                <DatePicker className="mb-0 sm:w-full sm:h-[3.15rem] border dark:border-darkSecond dark:bg-darkSecond rounded-md px-3 outline-none" selected={serviceDate} minDate={new Date()} onChange={(date) => date ? setServiceDate(date) : null} required />
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <div className="text-left  text-greylish pb-2 ml-2">
                                                Attach link <span className="text-black">(optional)</span>
                                            </div>
                                            <div>
                                                <input type="text" { ...register("link")} name="attachLink" placeholder="Attach link" className="mb-0 sm:w-full sm:h-[3.15rem] border dark:border-darkSecond dark:bg-darkSecond rounded-md px-3 outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2 w-[82%] sm:w-full">
                                    <span className="text-left  text-greylish pb-2 ml-2">Upload receipt or invoice <span className="text-black">(optional)</span></span>
                                    <div className="grid grid-cols-1 bg-white">
                                        <Upload setFile={setFile} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center pt-5 sm:pt-0">
                                <div className="flex flex-row gap-10 sm:grid grid-cols-2 w-full sm: justify-center sm:gap-10">
                                    <Button version="second" className="w-[9.375rem] sm:w-full" onClick={() => router.push("/dashboard")}>Close</Button>
                                    <Button onClick={() => setModal(true)} className=" w-[9.375rem] sm:w-full bg-primary px-3 py-2 text-white flex items-center justify-center rounded-lg" >Submit</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {modal &&
                    <Modal onDisable={setModal} animatedModal={false} disableX={true} className="lg:min-w-[50%] !pt-5">
                        <div className="flex flex-col space-y-8 px-2">
                            <div className="font-semibold">
                                Your Information
                            </div>
                            <div className="flex flex-col space-y-5">
                                {!!result?.name && <div className="flex justify-between">
                                    <div className="text-greylish">
                                        Full Name
                                    </div>
                                    <div>
                                        {`${result?.name} ${result?.surname}`}
                                    </div>
                                </div>}
                                <div className="flex justify-between">
                                    <div className="text-greylish">
                                        Wallet Adress
                                    </div>
                                    <div className="truncate">
                                        {(result?.address !== undefined && AddressReducer(result.address))}
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="text-greylish">
                                        Requesting Amount
                                    </div>
                                    <div className="flex flex-col space-y-3">
                                        <div>
                                            <div className="flex gap-x-5">
                                                <div className="flex gap-x-2 items-center">
                                                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                                                    {result?.amount ? TotalUSDAmount([(result as IRequest)], currentCurrency).toFixed(2) : result?.amount && CeloCoins[result.currency as keyof Coins].name === "cUSD" ? result.amount : 0}
                                                </div>
                                                <div className="flex gap-x-2 items-center">
                                                    {result?.currency ? <img src={CeloCoins[result.currency as keyof Coins].coinUrl} className="rounded-xl w-[1.25rem] h-[1.25rem]" /> : ""}
                                                    {result?.currency ? CeloCoins[result.currency as keyof Coins].name : ""}
                                                </div>
                                            </div>
                                        </div>
                                        {!!result?.secondaryCurrency && !!result?.secondaryAmount &&
                                            <div>
                                                <div className="flex gap-x-5">
                                                    <div className="flex gap-x-2 items-center">
                                                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                                                        {result?.secondaryAmount ? TotalUSDAmount([(result as IRequest)], currentCurrency).toFixed(2) : result?.secondaryAmount && CeloCoins[result.currency as keyof Coins].name === "cUSD" ? result.secondaryAmount : 0}
                                                    </div>
                                                    <div className="flex gap-x-2 items-center">
                                                        {result?.secondaryCurrency ? <img src={CeloCoins[result.secondaryCurrency as keyof Coins].coinUrl} className="rounded-xl w-[1.25rem] h-[1.25rem]" /> : ""}
                                                        {result?.secondaryCurrency ? CeloCoins[result.secondaryCurrency as keyof Coins].name : ""}
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="flex justify-between border-b pb-8">
                                    <div className="text-greylish">
                                        Total
                                    </div>
                                    <div>
                                        {(result?.amount ? TotalUSDAmount([(result as IRequest)], currentCurrency).toFixed(2) : 0)} USD
                                    </div>
                                </div>
                            </div>
                            <div className="font-semibold">
                                Details
                            </div>
                            <div className="flex flex-col space-y-4">
                                <div className="flex justify-between">
                                    <div className="text-greylish">
                                        Request Type
                                    </div>
                                    <div>
                                        {result?.requestType}
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="text-greylish">
                                        Name of service
                                    </div>
                                    <div>
                                        {result?.nameOfService}
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="text-greylish">
                                        Date of service
                                    </div>
                                    <div>
                                      {dateFormat(new Date(result?.serviceDate ?? 0), `dd mmmm yyyy`)}
                                    </div>
                                </div>
                                {!!result?.attachLink && <div className="flex justify-between">
                                    <div className="text-greylish">
                                        Attach links <span className="text-black">(optional)</span>
                                    </div>
                                    <div>
                                        <a href={result?.attachLink} rel="noreferrer" target="_blank">{result?.attachLink}</a>
                                    </div>
                                </div>
                                }
                                <div className="flex justify-between">
                                    <div className="text-greylish">
                                        Upload receipt or invoice <span className="text-black">(optional)</span>
                                    </div>
                                    <div>
                                        {result?.uploadedLink ? <a href={result?.uploadedLink} rel="noreferrer" target="_blank">{result?.uploadedLink}</a> : "No file uploaded"}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center pt-5 sm:pt-0">
                                <div className="flex flex-row gap-10 sm:grid grid-cols-2 w-[25rem] sm:justify-center sm:gap-5">
                                    <Button version="second" onClick={() => setModal(false)} className="w-[9.375rem] sm:w-full" >Back</Button>
                                    <Button type="submit" className=" w-[9.375rem] sm:w-full bg-primary px-0 !py-2 text-white flex items-center justify-center rounded-lg" isLoading={loading}>Confirm & Submit</Button>
                                </div>
                            </div>
                        </div>
                    </Modal>
                }
            </form>
        </div>
    </>
}
RequestId.disableLayout = true
RequestId.disableGuard = true

export default RequestId