import React, { Dispatch, SetStateAction } from 'react'
import dateFormat from "dateformat";
import { Fragment, useEffect, useState, useRef } from "react";
import Dropdown from "components/general/dropdown";
import { SelectCurrencies } from "redux/reducers/currencies";
import { DropDownItem } from "types/dropdown";
import { AddressReducer } from 'utils'
import _ from "lodash";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import { useTransactionProcess, useWalletKit } from "hooks";
import { ERC20MethodIds, IAutomationTransfer, IBatchRequest, IFormattedTransaction, InputReader, ISwap, ITransfer } from "hooks/useTransactionProcess";
import { selectTags } from "redux/reducers/tags";
import { useSelector } from "react-redux";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import useGelato from "rpcHooks/useGelato";
import { motion, AnimatePresence } from "framer-motion"
import useProfile from "rpcHooks/useProfile";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { TransactionDirection, TransactionType, TransactionStatus } from "../../../types";
import Button from "components/button";
import { useModalSideExit } from "hooks";
import { BN } from "utils/ray";
import Modal from 'components/general/modal';
import Paydropdown from 'subpages/pay/paydropdown';
import Split from './split';

function Details({ Transaction, TransferData, status, time, address, isSwap, isComment, Comment, Type }: { Transaction: IFormattedTransaction, Type: string | undefined, isSwap: boolean, isComment: boolean, Comment: string | undefined, address: string, time: string, TransferData: ITransfer | undefined, status: string }) {
    const [split, setSplit] = useState(false)
    const [split1, setSplit1] = useState(false)
    const [split2, setSplit2] = useState(false)
    const [split3, setSplit3] = useState(false)
    const { GetCoins, fromMinScale } = useWalletKit()
    const { profile, UpdateSeenTime } = useProfile()
    const [openNotify, setNotify] = useState(false)

    const [value, setValue] = useState('')
    const [wallet, setWallet] = useState<DropDownItem>({
        name: Object.values(GetCoins)[0].name,
        coinUrl: Object.values(GetCoins)[0].coinUrl
    })

    useEffect(() => {
        if (openNotify) {
            UpdateSeenTime(new Date().getTime())
        }
    }, [openNotify])


    const [divRef, exceptRef] = useModalSideExit(openNotify, setNotify, false)

    const paymentname = ["Marketing", "Security", "Development"]

    return <>
        {split && <Modal onDisable={setSplit} disableX={true} className={'!pt-2 !px-0 cursor-default'}>
            <div className=" py-6 flex flex-col items-center justify-center">
                <div className="flex flex-col gap-10 justify-center items-center border-b pb-8 mb-8">
                    <div className="text-2xl font-medium px-12">Split Transaction</div>
                    <div className="flex gap-12  px-12 w-full">
                        <div className={`flex flex-col text-start`}>
                            <span className="text-greylish pb-2">Total Amount</span>
                            <span className="text-lg font-semibold">$1460.00</span>
                        </div>
                        <div className={`flex flex-col text-start`}>
                            <span className="text-greylish pb-2">Token Allocation</span>
                            <div className="flex gap-5">
                                <div>
                                    <span className="text-lg font-semibold">{TransferData?.coin && <><div className="flex gap-1 items-center">0.001 <img src={TransferData.coin.coinUrl} className="w-4 h-4" alt="" />{TransferData.coin.name ?? "Unknown Coin"}</div></>}
                                    </span>
                                    <span className="text-greylish text-sm">$22.31</span>
                                </div>
                                <div>
                                    <span className="text-lg font-semibold">{TransferData?.coin && <><div className="flex gap-1 items-center">10 <img src={TransferData.coin.coinUrl} className="w-4 h-4" alt="" />{TransferData.coin.name ?? "Unknown Coin"}</div></>}
                                    </span>
                                    <span className="text-greylish text-sm">$22.31</span>
                                </div>
                            </div>

                        </div>
                        <div className={`flex flex-col text-start`}>
                            <span className="text-greylish pb-2">Recurring</span>
                            <span className="text-lg font-semibold">$250.00</span>
                        </div>
                        <div className={`flex flex-col  text-start`}>
                            <span className="text-greylish pb-2">Split</span>
                            <span className="text-lg font-semibold">2</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-10 justify-center items-center  pb-8  px-16 w-full">
                    <div className="flex justify-between items-center w-full px-1">
                        <span className="text-lg font-medium">Split 1</span>
                        <div></div>

                    </div>
                    <div className="flex w-full justify-between ">
                        <div className="flex flex-col w-[45%]">
                            <span className="text-left  text-greylish pb-2 pl-1" >Token</span>
                            <Dropdown className=" border bg-white text-sm rounded-lg" onSelect={val => {
                                setWallet(val)
                            }} nameActivation={true} selected={wallet ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} />
                        </div>
                        <div className="flex flex-col w-[45%]">
                            <span className="text-left  text-greylish pb-2 pl-1" >Amount</span>
                            <input className="outline-none unvisibleArrow  border rounded-xl py-[.4rem] pl-2 dark:bg-darkSecond dark:text-white" placeholder="0" step={'any'} min={0} />
                        </div>
                    </div>
                    <div className="flex flex-col w-full pb-4">
                        <span className="text-left  text-greylish pb-2 pl-1" >Budget</span>
                        <Paydropdown paymentname={paymentname} value={value} setValue={setValue} className={'!py-3'} />
                        {split1 ? <div className="border-b w-full pt-8"></div> : <div className="pt-8 cursor-pointer self-start text-primary flex items-center justify-center gap-1" onClick={() => { setSplit1(true) }} ><span className=" px-2 border border-primary rounded-full ">+</span>Add Split</div>}
                    </div>
                </div>
                <Split split={split1} split2={split2} split3={split3} setSplit={setSplit1} setSplit2={setSplit2} setSplit3={setSplit3} />
                <div className="flex gap-8">
                    <Button version="second" className="shadow-none px-10 py-2 !rounded-md" onClick={() => setSplit(false)}>Close</Button>
                    <Button className="shadow-none px-10 py-2 !rounded-md">Save</Button>
                </div>
            </div>
        </Modal>}
        <div ref={exceptRef} onClick={() => { setNotify(!openNotify) }}>
            <Button version="second" className="shadow-none px-6 py-1 !rounded-md" >Details</Button>
        </div>
        <AnimatePresence>
            {openNotify &&
                <motion.div initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 15, opacity: 1 }} exit={{ x: "100%", opacity: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} ref={divRef} className=" z-[97] fixed shadow-custom w-[35rem] h-[100vh] pr-1 overflow-y-auto overflow-x-hidden top-0 right-0 bg-white dark:bg-darkSecond cursor-default ">
                    <button onClick={() => setNotify(false)} className=" absolute left-full w-[2rem] top-0 translate-x-[-170%] translate-y-[25%] opacity-45">
                        <img src="/icons/cross_greylish.png" alt="" />
                    </button>
                    <div className="flex flex-col min-h-[325px] sm:min-h-[auto] px-12 py-12 justify-center sm:justify-between sm:items-stretch items-center">
                        <div className="flex flex-col sm:flex-row justify-center sm:items-center text-2xl font-semibold pt-2">Transaction Details</div>
                        <div className="flex flex-col sm:flex-row justify-center sm:items-center text-2xl font-medium pt-4">- $100.00</div>
                        <div className="pt-6 flex flex-col gap-7">
                            {TransferData && <div className="flex justify-center sm:items-center pt-5 gap-5">
                                <div className="flex">
                                    <div className={`flex items-center justify-center pr-1 text-xl font-medium`}>
                                        <span>
                                            {BN(fromMinScale(TransferData.amount)).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className={`flex gap-x-1 items-center text-xl font-medium`}>
                                        {TransferData.coin ?
                                            <>
                                                <div>
                                                    <img src={TransferData.coin.coinUrl} className="rounded-full w-[1.5rem] h-[1.5rem]" />
                                                </div>
                                                <div>
                                                    {TransferData.coin.name ?? "Unknown Coin"}
                                                </div>
                                            </>
                                            : <div>Unknown Coin</div>
                                        }

                                    </div>
                                </div>
                                <div className="flex">
                                    <div className={`flex items-center justify-center pr-1 text-xl font-medium`}>
                                        <span>
                                            {BN(fromMinScale(TransferData.amount)).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className={`flex gap-x-1 items-center text-xl font-medium`}>
                                        {TransferData.coin ?
                                            <>
                                                <div>
                                                    <img src={TransferData.coin.coinUrl} className="rounded-full w-[1.5rem] h-[1.5rem]" />
                                                </div>
                                                <div>
                                                    {TransferData.coin.name ?? "Unknown Coin"}
                                                </div>
                                            </>
                                            : <div>Unknown Coin</div>
                                        }

                                    </div>
                                </div>
                            </div>}
                            <div className="flex justify-between items-center w-full"><div className="text-greylish">Status</div>
                                <div className={` pr-2 grid grid-cols-[10%,90%]  gap-x-2 items-center`}>
                                    {status === TransactionStatus.Completed && <div className="bg-green-400 w-2 h-2 rounded-full"></div>}
                                    {status === TransactionStatus.Pending && <div className="bg-primary w-2 h-2 rounded-full"></div>}
                                    {status === TransactionStatus.Rejected && <div className="bg-red-600 w-2 h-2 rounded-full"></div>}
                                    <div>{status}</div>
                                </div>
                            </div>
                            <div className="flex justify-start items-center w-full"><div className="text-sm text-greylish">Created by Orkhan Aslanov</div></div>
                            <div className="flex justify-between items-center w-full"><div className="text-greylish">Signatures</div>
                                <div className="flex w-[40%] h-4">
                                    <div className=" grid grid-cols-[20%,80%] h-full gap-1 text-greylish w-full">
                                        <div className="flex">{status === TransactionStatus.Completed ? "3" : status === TransactionStatus.Pending && "2"} / 3</div>
                                        <div className="relative rounded-xl bg-greylish bg-opacity-10 w-full h-full">
                                            {status === TransactionStatus.Pending ? <div className="absolute rounded-xl h-full bg-primary w-[66%]"></div> : status === TransactionStatus.Completed && <div className="absolute rounded-xl h-full bg-green-600 w-full"></div>}
                                        </div>
                                    </div>
                                </div></div>
                            <div className="flex justify-between  w-full"><div className="text-greylish">Signers</div>
                                <div>
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <span>Orkhan Aslanov</span>
                                        <span>Masud Haydarli</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center w-full"><div className="text-greylish">Created</div><div>{time}, 04:06:31</div></div>
                            <div className="flex justify-between items-center w-full"><div className="text-greylish">Closed On</div><div>{time}, 07:56:52</div></div>
                            <div className="flex justify-between items-center w-full"><div className="text-greylish">Send From</div><div className="flex gap-1">
                                <div className={`hidden sm:flex items-center justify-center`}>
                                    <div className={`bg-greylish bg-opacity-10 w-[1.813rem] h-[1.813rem]  flex items-center justify-center rounded-full font-medium `}>
                                        {!isSwap ? <span> {isComment ? (Comment as string).slice(0, 2) : "Un"} </span> : <span>S</span>}
                                    </div>
                                </div>
                                <div className={`sm:flex flex-col justify-center items-start `}>
                                    <div className="text-lg dark:text-white">
                                        {!isSwap ? <span> {isComment ? `${Comment}` : "Unknown"} </span> : <span> Swap </span>}
                                    </div>
                                </div>
                            </div>
                            </div>
                            <div className="flex justify-between w-full"><div className="text-greylish">Send To</div><div>
                                <div className="flex flex-col justify-center gap-2">
                                    {!isSwap && <>
                                        <span>{address}</span>
                                        <span>{address}</span>
                                    </>}
                                </div>
                            </div></div>
                            <div className="flex justify-between items-center w-full"><div className="text-greylish">Gas fee</div>{TransferData?.coin && <><div className="flex gap-1 items-center">0.001 <img src={TransferData.coin.coinUrl} className="w-4 h-4" alt="" />{TransferData.coin.name ?? "Unknown Coin"}</div></>}</div>
                            <div className="flex justify-between items-center w-full"><div className="text-greylish">Type</div><div>{Type !== undefined && Type}</div></div>
                            <div className="flex justify-between items-center w-full"><div className="text-greylish">Tx Hash</div><div>{AddressReducer(Transaction.rawData.hash)}</div></div>
                            <div className="flex justify-between items-center w-full"><div className="text-greylish">Budget</div><div>Marketing</div></div>
                            <div className="flex justify-between items-center w-full"><div className="text-greylish">Tags</div><div className="flex">{Transaction.tags && Transaction.tags.map((tag, index) => {
                                return <div key={tag.id} className="flex space-x-1 items-center">
                                    <div className="w-[0.7rem] h-[0.7rem] rounded-full" style={{ backgroundColor: tag.color }}></div>
                                    <div className="!mt-0 text-base">{tag.name}</div>
                                </div>
                            })}</div></div>
                            <div className="flex justify-between items-center w-full"><div className="text-greylish">Description</div><div>Hello paycheck</div></div>
                            <div className="flex justify-between items-center w-full"><div className="text-primary py-2 px-2 border curosr-pointer border-primary rounded-lg" onClick={() => setSplit(true)}>Split Transaction</div><div></div></div>
                        </div>
                    </div>

                </motion.div>}
        </AnimatePresence>
    </>
}

export default Details