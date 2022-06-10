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


const ModalRequestItem = ({ request, payment, setRequestModal,aprovedActive}: { request: IRequest,aprovedActive:boolean,  payment?: boolean,setRequestModal:any }) => {

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

    // if(aprovedActive){
    //     async () => {
    //         setLoading(true)
    //         try {
    //             await approveRequest(selectedAccount.toLowerCase(), request)
    //             setLoading(false)
    //             dispatch(changeSuccess({ activate: true, text: 'Request approved' }))
    //         } catch (error: any) {
    //             setLoading(false)
    //             console.error(error.message)
    //             dispatch(changeError({ activate: true, text: 'Something went wrong' }))
    //         }
    //         setRequestModal(false)
    //     }
    // }




    return <div ref={divRef} className={`border-b border-greylish border-opacity-10 mx-1 grid ${detect ? 'grid-cols-[25%,45%,30%] sm:grid-cols-[25%,20%,20%,20%,15%]' : 'grid-cols-[27%,48%,25%]'} min-h-[4.688rem] py-6 `}>
        <div className="flex space-x-3 overflow-hidden">
            <div className={`hidden sm:flex ${detect ? "items-center" : "items-start"} justify-center`}>
                <div className={` ${request.status !== RequestStatus.rejected ? "bg-greylish bg-opacity-10" : "bg-red-300 text-black"}  ${detect ? "w-[2.813rem] h-[2.813rem] text-lg" : "w-[1.563rem] h-[1.563rem] text-xs"} flex items-center justify-center rounded-full font-bold `}>
                    {<span> {request.name ? request.name.slice(0, 2) : "Un"} </span>}
                </div>
            </div>
            <div className={`sm:flex flex-col ${detect ? "justify-center" : "justify-start"} items-start `}>
                <div className="text-greylish dark:text-white">
                    {<span> {request.name ? `${request.name}` : "Unknown"} </span>}
                </div>
                {request.address && <div className="text-sm text-greylish dark:text-white">
                    {AddressReducer(request.address)}
                </div>}
            </div>
        </div>
        <div>
            <div className="flex h-full items-center justify-start">
                {request.serviceDate && !payment &&
                    <div className="text-greyish dark:text-white tracking-wide">
                        {dateFormat(request.serviceDate, "mmmm dd, yyyy")}
                    </div>
                }
            </div>
        </div>
        <div className="flex items-center justify-start">
            <div className="flex flex-col space-y-2">
                <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"} items-center space-x-4`}>
                    <div className={`flex ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2 items-center`}>
                        <div className="w-[0.625rem] h-[0.625rem] rounded-full bg-primary self-center">
                        </div>
                        <span>
                            {parseFloat(request.amount).toFixed(2)}
                        </span>
                    </div>
                    <div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-2 items-center`}>
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
    </div>
}

export default ModalRequestItem