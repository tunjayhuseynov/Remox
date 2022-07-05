import { FirestoreWrite } from "rpcHooks/useFirebase"
import useMultisig from "rpcHooks/useMultisig"
import { PaymentInput } from "rpcHooks/useCeloPay"
import { IRequest, RequestStatus } from "rpcHooks/useRequest"
import Button from "components/button"
import Modal from "components/general/modal"
import { arrayRemove, FieldValue } from "firebase/firestore"
import { useWalletKit } from "hooks"
import useRequest from "hooks/useRequest"
import { useContext, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useAppSelector } from "redux/hooks"
import { SelectBalances } from "redux/slices/currencies"
import { changeError, selectError, changeSuccess } from "redux/slices/notificationSlice"
import { SelectRequests } from "redux/slices/requests"
import { SelectSelectedAccount } from "redux/slices/account/selectedAccount"
import { selectStorage } from "redux/slices/account/storage"
import RequestedUserItem from "subpages/dashboard/requests/requestedUserItem"
import TokenBalance from "subpages/dashboard/requests/tokenBalance"
import TotalAmount from "subpages/dashboard/requests/totalAmount"
import { Coins } from "types"
import { MultipleTransactionData } from "types/sdk"
import { DashboardContext } from "layouts/dashboard"
import Loader from "components/Loader"
import ModalRequestItem from "./modalRequestItem"
import Walletmodal from "components/general/walletmodal"
import { DropDownItem } from 'types';
import { motion, AnimatePresence } from "framer-motion"

export default function DynamicRequest({ type }: { type: "approved" | "pending" | "rejected" }) {



    const [aprovedActive, setAprovedActive] = useState(false);
    const [modal, setModal] = useState(false)
    const [requestmodal, setRequestModal] = useState(false)
    const [isLoading, setLoading] = useState(false)
    const [isPaying, setIsPaying] = useState(false)
    // const [walletModals, setWalletModals] = useState(false)
    const { submitTransaction } = useMultisig()
    const { genLoading } = useRequest()
    // const { BatchPay, Pay } = usePay()
    const { SendBatchTransaction, SendTransaction } = useWalletKit()
    const dispatch = useDispatch()
    const isError = useAppSelector(selectError)
    const [isSuccess, setSuccess] = useState(false)
    const { refetch } = useContext<{ refetch: () => void }>(DashboardContext)

    let page;
    if (type === "pending") {
        page = RequestStatus.pending
    } else if (type === "approved") {
        page = RequestStatus.approved
    } else {
        page = RequestStatus.rejected
    }

    let selector = useSelector(SelectRequests)
    const penders = page === RequestStatus.pending ? selector.pending : page === RequestStatus.approved ? selector.approved : selector.rejected
    console.log(penders)
    const [selected, setSelected] = useState<IRequest[]>([]);
    const [selected2, setSelected2] = useState<IRequest[]>([]);
    const balance = useAppSelector(SelectBalances)
    const storage = useAppSelector(selectStorage)
    const selectedAccount = useAppSelector(SelectSelectedAccount)
    const { GetCoins } = useWalletKit()

    const [selectedItem, setItem] = useState<DropDownItem>({ name: "Treasury vault", totalValue: '$4500', photo: "nftmonkey" })
    const paymentname: DropDownItem[] = [{ name: "CELO" }, { name: "SOLANA" }]
    const [selectedPayment, setSelectedPayment] = useState(paymentname[0])
    const paymentname2: DropDownItem[] = [{ name: "Security" }, { name: "Development" }]
    const [selectedPayment2, setSelectedPayment2] = useState(paymentname2[0])
    const [openNotify, setNotify] = useState(false)
    const [openNotify2, setNotify2] = useState(false)
    const [openNotify3, setNotify3] = useState(false)

    useEffect(() => {
        if (openNotify) {
            document.querySelector('body')!.style.overflowY = "hidden"
        } else {
            document.querySelector('body')!.style.overflowY = ""
        }


    }, [openNotify])

    const Submit = async () => {
        const result: Array<MultipleTransactionData & { member?: IRequest }> = []

        const mems = selected;

        if (mems.length) {
            for (let index = 0; index < mems.length; index++) {
                let amount;
                if (mems[index].usdBase) {
                    amount = (parseFloat(mems[index].amount) * (balance[GetCoins[mems[index].currency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)).toString()
                } else {
                    amount = mems[index].amount
                }
                result.push({
                    toAddress: mems[index].address,
                    amount,
                    tokenName: mems[index].currency,
                    member: mems[index]
                })

                let secAmount = mems[index].secondaryAmount, secCurrency = mems[index].secondaryCurrency;

                if (secAmount && secCurrency) {
                    if (mems[index].secondaryAmount) {
                        secAmount = (parseFloat(secAmount) * (balance[GetCoins[mems[index].secondaryCurrency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)).toFixed(4)
                    }

                    result.push({
                        toAddress: mems[index].address,
                        amount: secAmount,
                        tokenName: secCurrency,
                    })
                }
            }
        }
        setIsPaying(true)

        try {
            if (selectedAccount) { //storage?.accountAddress.toLowerCase() === selectedAccount.toLowerCase()
                if (result.length === 1) {
                    // await Pay({ coin: GetCoins[result[0].tokenName as keyof Coins], recipient: result[0].toAddress, amount: result[0].amount })
                    await SendTransaction({ coin: GetCoins[result[0].tokenName as keyof Coins], recipient: result[0].toAddress, amount: result[0].amount })
                }
                else if (result.length > 1) {
                    const arr: Array<PaymentInput> = result.map(w => ({
                        coin: GetCoins[w.tokenName as keyof Coins],
                        recipient: w.toAddress,
                        amount: w.amount,
                        from: true
                    }))

                    // await BatchPay(arr)
                    await SendBatchTransaction(arr)
                }
            } else {
                if (result.length === 1) {
                    await submitTransaction(selectedAccount, [{ recipient: result[0].toAddress, coin: GetCoins[result[0].tokenName as keyof Coins], amount: result[0].amount }])
                }
                else if (result.length > 1) {
                    const arr: Array<PaymentInput> = result.map(w => ({
                        coin: GetCoins[w.tokenName as keyof Coins],
                        recipient: w.toAddress,
                        amount: w.amount,
                        from: true
                    }))

                    await submitTransaction(selectedAccount, arr)
                }
            }

            await FirestoreWrite<{ requests: FieldValue }>().updateDoc("requests", selectedAccount.toLowerCase(), {
                requests: arrayRemove(...selected)
            })

            setSuccess(true);
            setSelected([])
            refetch()
            setModal(false)

        } catch (error: any) {
            console.error(error)
            dispatch(changeError({ activate: true, text: error.message }));
        }

        setIsPaying(false);
    }


    return <>
    <Walletmodal  openNotify={openNotify} openNotify2={openNotify2} selectedItem={selectedItem} setItem={setItem} setNotify={setNotify} setNotify2={setNotify2} paymentname={paymentname} paymentname2={paymentname2} selectedPayment={selectedPayment} selectedPayment2={selectedPayment2} setSelectedPayment={setSelectedPayment} setSelectedPayment2={setSelectedPayment2} />
        {
            genLoading ? <div className="flex items-center justify-center"><Loader /></div> :
                penders.length === 0 ? <div className="w-full h-[90%] flex flex-col  items-center justify-center gap-6">
                    <img src="/icons/noData.png" alt="" className="w-[10rem] h-[10rem]" />
                    <div className="text-greylish font-bold dark:text-white text-2xl">No Data</div>
                </div> : <>
                    <div className="flex flex-col space-y-8">
                        {page === RequestStatus.approved && <>
                            <div className="w-full flex flex-col  border-b pt-2  px-0">
                                <div className="grid grid-cols-[20%,80%]  pb-2">
                                    <div className="font-semibold text-lg text-greylish dark:text-white ">Total Treasury</div>
                                    {selected.length > 0 && <div className="font-semibold text-lg text-greylish dark:text-white">Token Allucation</div>}
                                </div>
                                <div className="grid grid-cols-[20%,20%,20%,20%,20%]">
                                    <div className="flex flex-col items-start   mb-3">
                                        <TotalAmount coinList={selected} />

                                    </div>
                                    <>
                                        <TokenBalance coinList={selected} />
                                    </>
                                </div>
                            </div>
                        </>
                        }
                        <Modal onDisable={setNotify3} openNotify={openNotify3} >
                            <div className="flex flex-col   w-[75%] mx-auto">
                                <div className="text-2xl font-semibold pt-4 pb-4">Pending Requests</div>
                                <div className="w-full pt-12 pb-4">
                                    <div className="grid grid-cols-[25%,20%,20%,20%,15%] py-2   font-semibold tracking-wide items-center rounded-xl  sm:mb-5 px-2 ">
                                        <div className="text-base font-semibold">Name</div>
                                        <div className="text-base font-semibold">Request date</div>
                                        <div className="text-base font-semibold">Requested Amount</div>
                                        <div className="text-base font-semibold">Requests Type</div>
                                    </div>
                                    {selected2.map(s => <ModalRequestItem key={s.id} request={s} setRequestModal={setRequestModal} aprovedActive={aprovedActive} />)}
                                </div>
                                <Button className={'w-full py-2 mt-5 text-2xl'} >Approve Requests</Button>
                                </div>
                        </Modal>
                        <div className="w-full   pt-4 pb-6 ">
                            <div className="grid grid-cols-[25%,20%,20%,22%,13%] py-1   font-semibold tracking-wide items-center rounded-xl  sm:mb-5 px-1 ">
                                <div className="flex pl-4 items-center space-x-2 min-h-[2.125rem]">
                                    {page === RequestStatus.approved ?
                                        <input type="checkbox" className="relative cursor-pointer w-[0.938rem] h-[0.938rem] checked:before:absolute checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block" onChange={(e) => {
                                            const requests = [...selected]
                                            if (e.target.checked) {
                                                penders?.forEach(m => {
                                                    if (!requests.some(x => x.id === m.id)) {
                                                        requests.push(m)
                                                    }
                                                })
                                                setSelected(requests)
                                            } else {
                                                setSelected(requests.filter(m => !requests?.some(x => x.id === m.id)))
                                            }
                                        }} /> : page === RequestStatus.pending && <input type="checkbox" className="relative cursor-pointer w-[0.938rem] h-[0.938rem] checked:before:absolute checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block" onChange={(e) => {
                                            const requests2 = [...selected2]
                                            if (e.target.checked) {
                                                penders?.forEach(m => {
                                                    if (!requests2.some(x => x.id === m.id)) {
                                                        requests2.push(m)
                                                    }
                                                })
                                                setSelected2(requests2)
                                            } else {
                                                setSelected2(requests2.filter(m => !requests2?.some(x => x.id === m.id)))
                                            }
                                        }} />}
                                    <span className="text-base font-bold">Name</span>
                                </div>
                                <div className="text-base font-bold">Request date</div>
                                <div className="text-base font-bold">Requested Amount</div>
                                <div className="text-base font-bold">Requests Type</div>
                                {page === RequestStatus.pending && selected2.length > 0 && <div className="text-primary cursor-pointer font-bold text-lg" onClick={() => { setNotify3(true) }}>Approve Selected</div>}
                                {page === RequestStatus.approved && selected.length > 0 && <div className="text-primary cursor-pointer font-bold text-lg" onClick={() => { setNotify(true) }}>Pay selected</div>}

                            </div>
                            {penders.map(pender => <RequestedUserItem key={pender.id} request={pender} selected={selected} setSelected={setSelected} selected2={selected2} setSelected2={setSelected2} />)}
                        </div>
                    </div>
                    {page === RequestStatus.approved && <Modal onDisable={setNotify} openNotify={openNotify2} setNotify2={setNotify}>
                        <div className="flex   w-[75%] mx-auto">
                            <div className="flex flex-col w-full  ">
                                <div className="flex flex-col">
                                    <div className="text-2xl font-bold tracking-wide pt-4 pb-4">Approve Payments</div>
                                    <div className="w-full pt-12 pb-4 ">
                                        <div className="grid grid-cols-[25%,20%,20%,20%,15%] py-2   font-semibold tracking-wide rounded-xl  sm:mb-5 ">
                                            <div className="text-base font-bold ">Name</div>
                                            <div className="text-base font-bold">Request date</div>
                                            <div className="text-base font-bold">Requested Amount</div>
                                            <div className="text-base font-bold">Requests Type</div>
                                        </div>
                                        {selected.map(w => <RequestedUserItem key={w.id} request={w} selected={selected} setSelected={setSelected} selected2={selected2} setSelected2={setSelected2} payment={true} />)}

                                    </div>
                                </div>
                                <div className="flex flex-col pt-4 space-y-3">
                                    <div className="text-2xl font-bold tracking-wide">Review Treasury Impact</div>
                                    <div className="w-full flex flex-col  ">
                                        <div className="grid grid-cols-[20%,80%]  pb-2">
                                            <div className="font-semibold text-lg text-greylish">Treasury Balance</div>
                                            <div className="font-semibold text-lg text-greylish">Token Allocation</div>
                                        </div>
                                        <div className="grid grid-cols-[20%,20%,20%,20%,20%]">
                                            <div className="flex flex-col items-start mb-3">
                                                <TotalAmount coinList={selected} />

                                            </div>
                                            <>
                                                <TokenBalance coinList={selected} />
                                            </>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full pb-6 pt-6">
                                    <Button className="w-full text-xl font-semibold" isLoading={isPaying} onClick={Submit}>
                                        Confirm and Create Transactions
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Modal>
                    }
                </>
        }
    </>
}
