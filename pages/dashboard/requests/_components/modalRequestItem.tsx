import { IRequest, RequestStatus } from 'rpcHooks/useRequest';
import { Dispatch, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Coins } from 'types';
import { AddressReducer, SetComma } from 'utils';
import dateFormat from 'dateformat';
import Modal from 'components/general/modal';
import Button from 'components/button';
import useRequest from 'hooks/useRequest';
import { changeError, changeSuccess } from 'redux/slices/notificationSlice';
import { TotalUSDAmount } from './totalAmount';
import { useWalletKit } from 'hooks';
import Avatar from 'components/avatar';

const ModalRequestItem = ({ request, payment, aprovedActive }: { request: IRequest, aprovedActive: boolean, payment?: boolean }) => {

    const [modal, setModal] = useState(false)
    const [isLoading, setLoading] = useState(false)
    const [detect, setDetect] = useState(true);
    const divRef = useRef<HTMLDivElement>(null)
    const { GetCoins } = useWalletKit()

    useEffect(() => {
        if (divRef.current && window.innerWidth / divRef.current.clientWidth > 3) {
            setDetect(false)
        }
    }, [])


    return <div ref={divRef} className={`py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond my-4 rounded-md border-opacity-10 hover:bg-greylish dark:hover:!bg-[#191919]   hover:bg-opacity-5 hover:transition-all   grid ${detect ? 'grid-cols-[25%,45%,30%] sm:grid-cols-[25%,20%,20%,20%,15%]' : 'grid-cols-[27%,48%,25%]'}  `}>
        <div className="flex space-x-3 overflow-hidden pl-2">
            <div className={`hidden sm:flex ${detect ? "items-center" : "items-start"} justify-center`}>
                <div className={` ${request.status !== RequestStatus.rejected ? "" : "bg-red-300 text-black"}  ${detect ? "w-[2.813rem] h-[2.813rem] text-lg" : "w-[1.563rem] h-[1.563rem] text-xs"} flex items-center justify-center rounded-full font-bold `}>
                    {request.image ? <img src={`/icons/profilePhoto/${request.image}`} alt="" className="  w-12 h-12 border items-center justify-center rounded-full" /> : <Avatar name={request.name} surname={request.surname} />}
                </div>
            </div>
            <div className={`sm:flex flex-col ${detect ? "justify-center" : "justify-start"} items-start `}>
                <div className="text-lg font-medium">
                    {<span> {request.name ? `${request.name} ${request.surname}` : "Unknown"} </span>}
                </div>
                {request.address && <div className="text-greylish font-medium text-[10px]">
                    {AddressReducer(request.address)}
                </div>}
            </div>
        </div>
        <div>
            <div className="flex h-full items-center justify-start">
                {request.serviceDate && !payment &&
                    <div className="text-greyish dark:text-white tracking-wide text-lg font-medium w-20 text-right">
                        {request.serviceDate}
                    </div>
                }
            </div>
        </div>
        <div className="flex items-center justify-start">
            <div className="flex flex-col space-y-2">
                <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"} items-center space-x-4`}>
                    <div className={`flex ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2 items-center`}>
                        <div className="w-[0.625rem] h-[0.625rem] rounded-full bg-primary self-center text-lg font-medium">
                        </div>
                        <div className={`flex  items-center text-lg font-medium `}>
                            {GetCoins && GetCoins[request.currency as keyof Coins] ?
                                <>
                                    <div>
                                        <img src={GetCoins[request.currency as keyof Coins]?.coinUrl} width="20" height="20" className="rounded-full " />
                                    </div>
                                    <div>

                                    </div>
                                </>
                                : <div>Unknown Coin</div>
                            }
                        </div>
                        <span className='text-lg font-medium '>
                            {SetComma(parseInt(request.amount))}
                        </span>
                    </div>

                </div>
                {!!request.secondaryAmount && !!request.secondaryCurrency &&
                    <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"} items-center space-x-4`}>
                        <div className={`flex gap-x-2 items-center`}>
                            <div className="w-[0.625rem] h-[0.625rem] rounded-full bg-primary self-center">
                            </div>
                            <div className={`flex  items-center text-lg font-medium `}>
                                {GetCoins && GetCoins[request.secondaryCurrency as keyof Coins] ?
                                    <>
                                        <div>
                                            <img src={GetCoins[request.secondaryCurrency as keyof Coins]?.coinUrl} width="20" height="20" className="rounded-full" />
                                        </div>
                                        <div>

                                        </div>
                                    </>
                                    : <div>Unknown Coin</div>
                                }

                            </div>
                            <span className="text-lg font-medium">
                            {SetComma(parseInt(request.secondaryAmount))}
                              
                            </span>
                        </div>

                    </div>}
            </div>
        </div>
        <div className="flex items-center justify-start text-lg font-medium">{request.requestType}</div>
    </div>
}

export default ModalRequestItem