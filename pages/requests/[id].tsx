import { useRouter } from "next/router"
import Button from "components/button";
import { SyntheticEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeError, changeSuccess, selectDarkMode } from "redux/reducers/notificationSlice";
import Input from "subpages/pay/payinput";
import { CeloCoins, Coins, CoinsName, DropDownItem } from "types";
import Upload from "components/upload";
import useRequest from "hooks/useRequest";
import DatePicker from "react-datepicker";
import Modal from "components/general/modal";
import dateFormat from "dateformat";
import { IRequest } from "apiHooks/useRequest";
import { isAddress } from "web3-utils";
import { toast, ToastContainer } from 'react-toastify';
import useCurrency from "apiHooks/useCurrency";
import { ICoinMembers, updateAllCurrencies } from 'redux/reducers/currencies'
import { SelectCurrencies } from 'redux/reducers/currencies';
import { TotalUSDAmount } from "subpages/dashboard/requests/totalAmount";
import { SelectInputs } from "redux/reducers/payinput";

const RequestId = () => {
    const { id } = useRouter().query as { id: string }

    const { loading, addRequest } = useRequest()

    const data = useCurrency()

    const dark = useSelector(selectDarkMode)
    const currency = useSelector(SelectCurrencies)


    const MyInput = useSelector(SelectInputs)[0]

    const dispatch = useDispatch()
    const router = useRouter();

    const [modal, setModal] = useState(false)

    const [file, setFile] = useState<File>()

    const [selectedType, setSelectedType] = useState(false)

    const [startDate, setStartDate] = useState<Date>(new Date());

    const [result, setResult] = useState<Omit<Omit<Omit<IRequest, "id">, "status">, "timestamp">>()

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

    const Submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const { requestType, nameService, attachLink } = e.target as HTMLFormElement;

        const request = requestType.value
        const serviceName = nameService.value
        const link = attachLink.value

        const amount = MyInput.amount
        const name = MyInput.name
        const address = MyInput.address
        const wallet = MyInput.wallet
        if (!isAddress(address ?? "") && !address?.includes('.nom')) {
            toast.error(<div className="dark:text-white"><strong>Address is invalid</strong> <br /> Please, use valid address or Nomspace name</div>, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                bodyClassName: "dark:border-darkSecond dark:bg-darkSecond",
                className: "dark:bg-darkSecond",
            });
            return
        }
        if (request && serviceName && startDate && amount && address && wallet && wallet.name) {
            setResult({
                address,
                amount: amount.toFixed(4),
                currency: wallet.name as CoinsName,
                name: name ?? "",
                requestType: request,
                nameOfService: serviceName,
                serviceDate: startDate.getTime(),
                attachLink: link ?? "",
                secondaryAmount: MyInput.amount2 ? MyInput.amount2.toFixed(4) : undefined,
                secondaryCurrency: MyInput.wallet2?.name as CoinsName | undefined,
                usdBase: selectedType,
                uploadedLink: file?.name ?? undefined
            })

            setModal(true)
        }

    }

    const Send = async () => {
        if (result) {
            try {
                await addRequest(id.toLowerCase(), result)
                setModal(false)
                dispatch(changeSuccess({ activate: true, text: "Request has been sent" }))
            } catch (error: any) {
                console.error(error.message)
                setModal(false)
                dispatch(changeError({ activate: true, text: error.message ?? "Something went wrong" }))
            }
        }
    }


    return <>
        <ToastContainer />
        <header className="flex justify-start h-[4.688rem] pl-10  md:px-40 items-center absolute top-0 w-full cursor-pointer">
            <div onClick={() => router.push('/dashboard')} className="w-[6.25rem] h-[1.25rem] sm:w-full sm:h-[1.875rem]" >
                <img src={!dark ? "/logo.png" : "/logo_white.png"} alt="" width="150" />
            </div>
        </header>
        <div className="px-8 sm:px-32">
            <form onSubmit={Submit}>
                <div className="py-0 pt-24 sm:flex flex-col items-center justify-center min-h-screen sm:py-24">
                    <div className="sm:min-w-[85vw] min-h-[75vh] h-auto ">
                        <div className="py-2 text-center w-full">
                            <div className="text-3xl font-semibold">Request money from Remox</div>
                        </div>
                        <div className="sm:flex flex-col gap-3 gap-y-10 sm:gap-10 py-10">
                            <div className="sm:flex flex-col pl-3 sm:pl-12 sm:pr-[20%] gap-3 gap-y-10 sm:gap-10">
                                <div className="flex flex-col space-y-5">
                                    <span className="text-left text-xl font-semibold">Deposit To</span>
                                    <div className="flex space-x-12 sm:space-x-24 pb-5 pl-1 sm:pb-0">
                                        <div className="flex space-x-2 items-center">
                                            <input type="radio" className="w-4 h-4 checkradio cursor-pointer peer" name="paymentType" value="token" onChange={(e) => setSelectedType(false)} checked={!selectedType} />
                                            <label className="font-semibold text-sm peer-checked:text-primary">
                                                Pay with Token Amounts
                                            </label>
                                        </div>
                                        <div className="flex space-x-2 items-center">
                                            <input type="radio" className="w-4 h-4 checkradio cursor-pointer peer" name="paymentType" value="fiat" onChange={(e) => setSelectedType(true)} checked={selectedType} />
                                            <label className="font-semibold text-sm peer-checked:text-primary">
                                                Pay with USD-based Amounts
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="pb-14 sm:pb-0 pr-20 sm:pr-0 grid grid-rows-4 md:grid-rows-1  md:grid-cols-[25%,35%,35%,5%] gap-y-5 sm:gap-5">
                                    <Input incomingIndex={MyInput.index} />
                                </div>
                                <div className="flex flex-col gap-5 pb-5 sm:pb-0 sm:space-y-5 sm:gap-0">
                                    <span className="text-left text-xl font-semibold tracking-wide">Details</span>
                                    <div className="flex flex-col gap-y-3  sm:grid grid-cols-1 md:grid-cols-2 gap-x-40 sm:gap-y-7">
                                        <div className="flex flex-col space-y-2">
                                            <div className="font-semibold tracking-wide">
                                                Request Type
                                            </div>
                                            <div>
                                                <input type="text" name="requestType" placeholder="Request type" className="mb-0 sm:w-full sm:h-[2.813rem] border dark:border-darkSecond dark:bg-darkSecond rounded-md px-3 outline-none" required />
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <div className="font-semibold tracking-wide">
                                                Name of service
                                            </div>
                                            <div>
                                                <input type="text" name="nameService" placeholder="Name of service" className="mb-0 sm:w-full sm:h-[2.813rem]  border dark:border-darkSecond dark:bg-darkSecond rounded-md px-3 outline-none" required />
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <div className="font-semibold tracking-wide">
                                                Date of service
                                            </div>
                                            <div>
                                                <DatePicker className="mb-0 sm:w-full sm:h-[2.813rem] border dark:border-darkSecond dark:bg-darkSecond rounded-md px-3 outline-none" selected={startDate} minDate={new Date()} onChange={(date) => date ? setStartDate(date) : null} required />
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <div className="font-semibold tracking-wide">
                                                Attach link (optional)
                                            </div>
                                            <div>
                                                <input type="text" name="attachLink" placeholder="Attach link" className="mb-0 sm:w-full sm:h-[2.813rem] border dark:border-darkSecond dark:bg-darkSecond rounded-md px-3 outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-3 w-[82%] sm:w-full">
                                    <span className="text-left">Upload receipt or invoice (optional)</span>
                                    <div className="grid grid-cols-1">
                                        <Upload setFile={setFile} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center pt-5 sm:pt-0">
                                <div className="flex flex-row gap-10 sm:grid grid-cols-2 w-[25rem] sm: justify-center sm:gap-5">
                                    <Button version="second" className="w-[9.375rem] sm:w-full" onClick={() => router.push("/dashboard")}>Close</Button>
                                    <Button type="submit" className=" w-[9.375rem] sm:w-full bg-primary px-3 py-2 text-white flex items-center justify-center rounded-lg" >Request</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {modal &&
                    <Modal onDisable={setModal} className="lg:min-w-[50%]">
                        <div className="flex flex-col space-y-8">
                            <div className="font-semibold">
                                Depositing To
                            </div>
                            <div className="flex flex-col space-y-5">
                                {!!result?.name && <div className="flex justify-between">
                                    <div className="text-greylish">
                                        Name
                                    </div>
                                    <div>
                                        {result?.name}
                                    </div>
                                </div>}
                                <div className="flex justify-between">
                                    <div className="text-greylish">
                                        Wallet
                                    </div>
                                    <div className="truncate">
                                        {result?.address}
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
                                                    {result?.amount}
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
                                                        {result?.secondaryAmount}
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
                                        Attach link
                                    </div>
                                    <div>
                                        <a href={result?.attachLink} target="_blank" />
                                    </div>
                                </div>
                                }
                            </div>
                            <div className="flex justify-center pt-5 sm:pt-0">
                                <div className="flex flex-row gap-10 sm:grid grid-cols-2 w-[25rem] sm:justify-center sm:gap-5">
                                    <Button version="second" onClick={() => setModal(false)} className="w-[9.375rem] sm:w-full" >Back</Button>
                                    <Button type="submit" className=" w-[9.375rem] sm:w-full bg-primary px-0 !py-2 text-white flex items-center justify-center rounded-lg" isLoading={loading} onClick={Send}>Confirm & Submit</Button>
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