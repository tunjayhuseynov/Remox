import Button from "components/button";
import Error from "components/general/error";
import Success from "components/general/success";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { changeError, changeSuccess, selectDarkMode, selectError, selectSuccess } from "redux/reducers/notificationSlice";
import Input from "subpages/pay/payinput";
import { generate } from 'shortid'
import { Coins, DropDownItem } from "types";
import Upload from "components/upload";
import useRequest from "hooks/useRequest";
import DatePicker from "react-datepicker";
import Modal from "components/general/modal";
import dateFormat from "dateformat";
import { IRequest } from "API/useRequest";
import { FirestoreRead } from "API/useFirebase";
import { isAddress } from "web3-utils";
import { toast, ToastContainer } from 'react-toastify';
import useCurrency from "API/useCurrency";
import { updateAllCurrencies } from 'redux/reducers/currencies'
import { SelectCurrencies } from 'redux/reducers/currencies';
import { TotalUSDAmount } from "subpages/dashboard/requests/totalAmount";

export default function Form() {

  const { id } = useParams() as { id: string }

  const { loading, addRequest } = useRequest()

  const data = useCurrency()

  const dark = useSelector(selectDarkMode)
  const isError = useSelector(selectError)
  const isSuccess = useSelector(selectSuccess)
  const currency = useSelector(SelectCurrencies)
  const dispatch = useDispatch()
  const router = useNavigate();

  const [modal, setModal] = useState(false)

  const [index, setIndex] = useState(1)
  const [file, setFile] = useState<File>()

  const [selectedType, setSelectedType] = useState(false)

  const [startDate, setStartDate] = useState<Date>(new Date());

  const [amountState, setAmountState] = useState<number[]>([])
  const uniqueRef = useRef<string[]>([generate(), generate()])
  const nameRef = useRef<Array<string>>([])
  const addressRef = useRef<Array<string>>([])
  const [wallets, setWallets] = useState<DropDownItem[]>([])
  const amountRef = useRef<Array<string>>([])

  const [result, setResult] = useState<Omit<Omit<Omit<IRequest, "id">, "status">, "timestamp">>()

  useEffect(() => {
    if (data) {
      dispatch(updateAllCurrencies(data))
    }
  }, [data])

  const Submit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { requestType, nameService, attachLink } = e.target as HTMLFormElement;

    const request = requestType.value
    const serviceName = nameService.value
    const link = attachLink.value

    const amount = amountRef.current.length > 0 ? amountRef.current[0] : null
    const name = nameRef.current.length > 0 ? nameRef.current[0] : null
    const address = addressRef.current.length > 0 ? addressRef.current[0] : null
    const wallet = wallets.length > 0 ? wallets[0] : null
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
    if (request && serviceName && startDate && amount && address && wallet && wallet.value) {
      setResult({
        address,
        amount,
        currency: wallet.value,
        name: name ?? "",
        requestType: request,
        nameOfService: serviceName,
        serviceDate: startDate.getTime(),
        attachLink: link ?? "",
        secondaryAmount: amountRef.current?.length > 1 ? amountRef.current[1] : undefined,
        secondaryCurrency: wallets.length > 1 ? wallets[1].value : undefined,
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
    <header className="flex md:px-40 h-[75px] justify-center md:justify-start items-center absolute top-0 w-full cursor-pointer">
      <div onClick={() => router('/dashboard')}>
        <img src={!dark ? "/logo.png" : "/logo_white.png"} alt="" width="150" />
      </div>
    </header>
    <div className="sm:px-32">
      <form onSubmit={Submit}>
        <div className="sm:flex flex-col items-center justify-center min-h-screen py-24">
          <div className="sm:min-w-[85vw] min-h-[75vh] h-auto ">
            <div className="py-2 text-center w-full">
              <div className="text-3xl font-semibold">Request money from Remox</div>
            </div>
            <div className="sm:flex flex-col gap-3 gap-y-10 sm:gap-10 py-10">
              <div className="sm:flex flex-col pl-3 sm:pl-12 sm:pr-[20%] gap-3 gap-y-10  sm:gap-10">
                <div className="flex flex-col space-y-5">
                  <span className="text-left text-xl font-semibold">Deposit To</span>
                  <div className="flex space-x-24">
                    <div className="flex space-x-2 items-center">
                      <input type="radio" className="w-4 h-4 accent-[#ff501a] cursor-pointer" name="paymentType" value="token" onChange={(e) => setSelectedType(false)} checked={!selectedType} />
                      <label className="font-semibold text-sm">
                        Pay with Token Amounts
                      </label>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <input type="radio" className="w-4 h-4 accent-[#ff501a] cursor-pointer" name="paymentType" value="fiat" onChange={(e) => setSelectedType(true)} checked={selectedType} />
                      <label className="font-semibold text-sm">
                        Pay with USD-based Amounts
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="grid grid-cols-4 sm:grid-cols-[25%,35%,35%,5%] gap-5">
                    <Input amountState={amountState} setAmount={setAmountState} setIndex={setIndex} overallIndex={index} uniqueArr={uniqueRef.current} index={0} name={nameRef.current} address={addressRef.current} amount={amountRef.current} selectedWallet={wallets} setWallet={setWallets} isBasedOnDollar={selectedType} />
                  </div>
                </div>
                <div className="flex flex-col space-y-5">
                  <span className="text-left text-xl font-semibold tracking-wide">Details</span>
                  <div className="grid grid-cols-2 gap-x-40 gap-y-7">
                    <div className="flex flex-col space-y-2">
                      <div className="font-semibold tracking-wide">
                        Request Type
                      </div>
                      <div>
                        <input type="text" name="requestType" placeholder="Request type" className="h-[45px] w-full border dark:border-darkSecond dark:bg-darkSecond rounded-md px-3 outline-none" required />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="font-semibold tracking-wide">
                        Name of service
                      </div>
                      <div>
                        <input type="text" name="nameService" placeholder="Name of service" className="h-[45px] w-full border dark:border-darkSecond dark:bg-darkSecond rounded-md px-3 outline-none" required />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="font-semibold tracking-wide">
                        Date of service
                      </div>
                      <div>
                        <DatePicker className="h-[45px] w-full bg-red-500 border dark:border-darkSecond dark:bg-darkSecond rounded-md px-3 outline-none" selected={startDate} minDate={new Date()} onChange={(date) => date ? setStartDate(date) : null} required />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="font-semibold tracking-wide">
                        Attach link (optional)
                      </div>
                      <div>
                        <input type="text" name="attachLink" placeholder="Attach link" className="h-[45px] w-full border dark:border-darkSecond dark:bg-darkSecond rounded-md px-3 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-3">
                  <span className="text-left">Upload receipt or invoice (optional)</span>
                  <div className="grid grid-cols-1">
                    <Upload setFile={setFile} />
                  </div>
                </div>
              </div>
              <div className="flex justify-center pt-5 sm:pt-0">
                <div className="flex flex-col-reverse sm:grid grid-cols-2 w-[200px] sm:w-[400px] justify-center gap-5">
                  <Button version="second" onClick={() => router("/dashboard")}>Close</Button>
                  <Button type="submit" className="bg-primary px-3 py-2 text-white flex items-center justify-center rounded-lg" >Request</Button>
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
                          {result?.currency ? <img src={Coins[result.currency as keyof Coins].coinUrl} className="rounded-xl w-[20px] h-[20px]" /> : ""}
                          {result?.currency ? Coins[result.currency as keyof Coins].name : ""}
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
                            {result?.secondaryCurrency ? <img src={Coins[result.secondaryCurrency as keyof Coins].coinUrl} className="rounded-xl w-[20px] h-[20px]" /> : ""}
                            {result?.secondaryCurrency ? Coins[result.secondaryCurrency as keyof Coins].name : ""}
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
                    {(result?.amount ? TotalUSDAmount([(result as IRequest)], currency).toFixed(2) : 0)} USD
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
                <div className="flex flex-col-reverse sm:grid grid-cols-2 w-[200px] sm:w-[400px] justify-center gap-5">
                  <Button version="second" onClick={() => setModal(false)}>Back</Button>
                  <Button type="submit" className="bg-primary px-0 py-2 text-white flex items-center justify-center rounded-lg" isLoading={loading} onClick={Send}>Confirm & Submit</Button>
                </div>
              </div>
            </div>
          </Modal>
        }
      </form>
      {isSuccess && <Success onClose={(val) => dispatch(changeSuccess({ activate: val, text: '' }))} onAction={() => { console.log("Success Modal Closed") }} />}
      {isError && <Error onClose={(val) => dispatch(changeError({ activate: val, text: '' }))} />}
    </div>
  </>
}