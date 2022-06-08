import { IRequest, RequestStatus } from 'rpcHooks/useRequest';
import { Dispatch, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SelectSelectedAccount } from 'redux/reducers/selectedAccount';
import { Coins } from 'types';
import { AddressReducer } from 'utils';
import dateFormat from 'dateformat';
import Modal from 'components/general/modal';
import Button from 'components/button';
import useRequest from 'hooks/useRequest';
import { changeError, changeSuccess } from 'redux/reducers/notificationSlice';
import { TotalUSDAmount } from './totalAmount';
import { SelectCurrencies } from 'redux/reducers/currencies';
import { useWalletKit } from 'hooks';


const RequestedUserItem = ({ request, selected, setSelected, payment,selected2,setSelected2 }: { request: IRequest, selected: IRequest[], setSelected: Dispatch<IRequest[]>,selected2: IRequest[], setSelected2: Dispatch<IRequest[]>, payment?: boolean }) => {

    const [modal, setModal] = useState(false)
    const [isLoading, setLoading] = useState(false)
    const [detect, setDetect] = useState(true);
    const divRef = useRef<HTMLDivElement>(null)
    const dispatch = useDispatch()
    const { approveRequest, rejectRequest } = useRequest()
    const selectedAccount = useSelector(SelectSelectedAccount)
    const currency = useSelector(SelectCurrencies)
    const { GetCoins } = useWalletKit()

    useEffect(() => {
        if (divRef.current && window.innerWidth / divRef.current.clientWidth > 3) {
            setDetect(false)
        }
    }, [])

    const Reject = async () => {
        setLoading(true)
        try {
            await rejectRequest(selectedAccount.toLowerCase(), request)
            setLoading(false)
            dispatch(changeSuccess({ activate: true, text: 'Request rejected' }))
        } catch (error: any) {
            setLoading(false)
            console.error(error.message)
            dispatch(changeError({ activate: true, text: 'Something went wrong' }))
        }
        setModal(false)
    }

    const Approve = async () => {
        setLoading(true)
        try {
            await approveRequest(selectedAccount.toLowerCase(), request)
            setLoading(false)
            dispatch(changeSuccess({ activate: true, text: 'Request approved' }))
        } catch (error: any) {
            setLoading(false)
            console.error(error.message)
            dispatch(changeError({ activate: true, text: 'Something went wrong' }))
        }
        setModal(false)
    }

    return <div ref={divRef} className={`border-b border-greylish border-opacity-10 mx-1 grid ${detect ? 'grid-cols-[25%,45%,30%] sm:grid-cols-[25%,20%,20%,20%,15%]' : 'grid-cols-[27%,48%,25%]'} min-h-[4.688rem] py-6 `}>
        <div className="flex space-x-3 overflow-hidden">
            <div className="flex items-center">
                {!payment && request.status === RequestStatus.approved ?
                    <input type="checkbox" checked={selected.some(s => s.id === request.id)} className="relative cursor-pointer w-[0.938rem] h-[0.938rem] checked:before:absolute checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block" onChange={(e) => {
                        const requests = [...selected]
                        if (e.target.checked) {
                            if (!requests.some(s => s.id === request.id)) {
                                requests.push(request)
                                setSelected(requests)
                            }
                        } else {
                            setSelected(requests.filter(m => m.id !== request.id))
                        }
                    }} /> :request.status === RequestStatus.pending &&  <input type="checkbox" checked={selected2.some(s => s.id === request.id)} className="relative cursor-pointer w-[0.938rem] h-[0.938rem] checked:before:absolute checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block" onChange={(e) => {
                        const requests2 = [...selected2]
                        if (e.target.checked) {
                            if (!requests2.some(s => s.id === request.id)) {
                                requests2.push(request)
                                setSelected2(requests2)
                            }
                        } else {
                            setSelected2(requests2.filter(m => m.id !== request.id))
                        }
                    }} />  }
                {!payment && request.status === RequestStatus.rejected && <img src="/icons/request/close.png" />}
            </div>
            <div className={`hidden sm:flex ${detect ? "items-center" : "items-start"} justify-center`}>
                <div className={` ${request.status !== RequestStatus.rejected ? "bg-greylish bg-opacity-10" : "bg-red-300 text-black"}  ${detect ? "w-[2.813rem] h-[2.813rem] text-lg" : "w-[1.563rem] h-[1.563rem] text-xs"} flex items-center justify-center rounded-full font-bold `}>
                    {<span> {request.name ? request.name.slice(0, 2) : "Un"} </span>}
                </div>
            </div>
            <div className={`sm:flex flex-col ${detect ? "justify-center" : "justify-start"} items-start `}>
                <div className="font-semibold  dark:text-white">
                    {<span> {request.name ? `${request.name}` : "Unknown"} </span>}
                </div>
                {request.address && <div className="text-sm text-greylish dark:text-white">
                    {AddressReducer(request.address)}
                </div>}
            </div>
        </div>
        <div>
            <div className="flex h-full items-center justify-start">
                {request.serviceDate && 
                    <div className="text-greyish dark:text-white tracking-wide">
                        {dateFormat(request.serviceDate, "mmmm dd, yyyy")}
                    </div>
                }
            </div>
        </div>
        <div className="flex items-center justify-start">
            <div className="flex flex-col space-y-2">
                <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"} items-center space-x-4`}>
                    <div className={`flex ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-1 items-center`}>
                        <span>
                            {parseFloat(request.amount).toFixed(2)}
                        </span>
                    </div>
                    <div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-1 items-center`}>
                        {GetCoins && GetCoins[request.currency as keyof Coins] ?
                            <>
                                <div>
                                    <img src={GetCoins[request.currency as keyof Coins]?.coinUrl} className="rounded-full w-[1.125rem] h-[1.125rem]" />
                                </div>
                                <div>
                                    {GetCoins[request.currency as keyof Coins]?.name ?? "Unknown Coin"}
                                </div>
                            </>
                            : <div>Unknown Coin</div>
                        }
                    </div>
                </div>
                {!!request.secondaryAmount && !!request.secondaryCurrency &&
                    <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"} items-center space-x-4`}>
                        <div className={`flex ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2 items-center`}>
                            <div className="w-[0.625rem] h-[0.625rem] rounded-full bg-primary self-center">
                            </div>
                            <span>
                                {parseFloat(request.secondaryAmount).toFixed(2)}
                            </span>
                        </div>
                        <div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-2 items-center`}>
                            {GetCoins && GetCoins[request.secondaryCurrency as keyof Coins] ?
                                <>
                                    <div>
                                        <img src={GetCoins[request.secondaryCurrency as keyof Coins]?.coinUrl} className="rounded-full w-[1.125rem] h-[1.125rem]" />
                                    </div>
                                    <div>
                                        {GetCoins[request.secondaryCurrency as keyof Coins]?.name ?? "Unknown Coin"}
                                    </div>
                                </>
                                : <div>Unknown Coin</div>
                            }

                        </div>
                    </div>}
            </div>
        </div>
        <div className="flex items-center justify-start">{request.requestType}</div>
        <div className="flex justify-end cursor-pointer items-center md:pr-0 ">
            {request.status !== RequestStatus.rejected && !payment && <div onClick={() => setModal(true)} className={`text-primary text-center mr-7 ${detect ? "px-5 max-h-[5rem] min-w-[10rem] border-2 rounded-2xl border-primary hover:bg-primary hover:text-white" : "text-sm hover:text-black dark:hover:text-white "}  py-1 transition-colors duration-300`}>View Details</div>}
        </div>
        {modal &&
            <Modal onDisable={setModal} disableX={true}>
                <div className="flex flex-col space-y-4 min-w-[30vw]">
                    <div className="font-semibold">
                        Overview
                    </div>
                    <div>
                        <div className="flex justify-between border-b border-greylish border-opacity-10 pb-6">
                            <div className="text-greylish">
                                Status
                            </div>
                            <div className="font-semibold flex gap-x-3">
                                {request.status === RequestStatus.pending && <div className="bg-primary w-[0.625rem] h-[0.625rem] rounded-full self-center"></div>}
                                {request.status === RequestStatus.approved && <div className="bg-green-500 w-[0.625rem] h-[0.625rem] rounded-full self-center"></div>}
                                {request.status === RequestStatus.rejected && <div className="bg-red-500 w-[0.625rem] h-[0.625rem] rounded-full self-center"></div>}
                                {request?.status}
                            </div>
                        </div>
                    </div>
                    <div className="font-semibold">
                        Payee information
                    </div>
                    <div className="flex flex-col space-y-5">
                        {!!request?.name && <div className="flex justify-between">
                            <div className="text-greylish">
                               Full Name
                            </div>
                            <div>
                                {request?.name}
                            </div>
                        </div>}
                        <div className="flex justify-between">
                            <div className="text-greylish">
                                Wallet
                            </div>
                            <div className="truncate">
                                {request?.address}
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
                                            {request?.amount}
                                        </div>
                                        <div className="flex gap-x-2 items-center">
                                            {request?.currency && GetCoins ? <img src={GetCoins[request.currency as keyof Coins].coinUrl} className="rounded-xl w-[1.25rem] h-[1.25rem]" /> : ""}
                                            {request?.currency  && GetCoins? GetCoins[request.currency as keyof Coins].name : ""}
                                        </div>
                                    </div>
                                </div>
                                {!!request?.secondaryCurrency && !!request?.secondaryAmount &&
                                    <div>
                                        <div className="flex gap-x-5">
                                            <div className="flex gap-x-2 items-center">
                                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                                                {request?.secondaryAmount}
                                            </div>
                                            <div className="flex gap-x-2 items-center">
                                                {request?.secondaryCurrency && GetCoins? <img src={GetCoins[request.secondaryCurrency as keyof Coins].coinUrl} className="rounded-xl w-[1.25rem] h-[1.25rem]" /> : ""}
                                                {request?.secondaryCurrency && GetCoins? GetCoins[request.secondaryCurrency as keyof Coins].name : ""}
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
                                {(request?.amount ? TotalUSDAmount([request], currency) : 0).toFixed(0)} 
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
                                {request?.requestType}
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="text-greylish">
                                Name of service
                            </div>
                            <div>
                                {request?.nameOfService}
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="text-greylish">
                                Date of service
                            </div>
                            <div>
                                {dateFormat(new Date(request?.serviceDate ?? 0), `dd mmmm yyyy`)}
                            </div>
                        </div>
                        {!!request?.attachLink && <div className="flex justify-between">
                            <div className="text-greylish">
                                Attach links <span className="text-black">(optional)</span>
                            </div>
                            <div>
                                <a href={request?.attachLink} target="_blank" >{request?.attachLink}</a>
                            </div>
                        </div>
                        }
                        {!!request?.uploadedLink && <div className="flex justify-between">
                            <div className="text-greylish">
                                Upload Receipt or invoice <span className="text-black">(optional)</span>
                            </div>
                            <div>
                                <a href={request?.uploadedLink} target="_blank" >{request?.uploadedLink}</a>
                            </div>
                        </div>
                        }
                    </div>
                    <div className="flex justify-center pt-5 sm:pt-0">
                        <div className="flex flex-col-reverse sm:grid grid-cols-2 w-[12.5rem] sm:w-[25rem] justify-center gap-5">
                            {request.status == RequestStatus.pending &&
                                <>
                                    <Button version="second" className="border-red-500 text-red-500 hover:!bg-red-500 dark:hover:!bg-red-500" isLoading={isLoading} onClick={Reject}>Reject</Button>
                                    <Button type="submit" className="bg-primary px-0 !py-2 text-white flex items-center justify-center rounded-lg" isLoading={isLoading} onClick={Approve}>Approve Request</Button>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </Modal>
        }
    </div>
}

export default RequestedUserItem