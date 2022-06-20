import { useEffect, useState, useRef } from "react";
import { IBalanceItem, SelectOrderBalance } from 'redux/reducers/currencies';
import { AddressReducer } from "../../../utils";
import useNextSelector from "hooks/useNextSelector";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import Modal from 'components/general/modal'
import EditWallet from "./editWallet";
import DeleteWallet from "./deleteWallet";
import Loader from "components/Loader";
import { changeDarkMode, selectDarkMode } from 'redux/reducers/notificationSlice';
import { useSelector } from "react-redux";
import { SelectAccountStats, SelectRawStats } from "redux/reducers/accountstats";
import CoinItem from './coinitem';
import useModalSideExit from 'hooks/useModalSideExit';
import Deposit from "./deposit";

export interface AllwalletTypes {
    id: number,
    walletName: string,
    balance: string,
}


function AllWallets({ item }: { item: AllwalletTypes }) {
    const [details, setDetails] = useState<boolean>(false)
    const selectedAccount = useNextSelector(SelectSelectedAccount)
    const [modalEditVisible, setModalEditVisible] = useState<boolean>(false)
    const [deleteModal, setDeleteModal] = useState<boolean>(false)
    const [depositModal, setDepositModal] = useState<boolean>(false)
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const orderBalance = useNextSelector(SelectOrderBalance)
    const [orderBalance4, setOrderBalance] = useState<IBalanceItem[]>([])
    const dark = useNextSelector(selectDarkMode)
    const [selectcoin, setSelectcoin] = useState<string>("")
    const [customRef] = useModalSideExit<string>(selectcoin, setSelectcoin, "")



    useEffect(() => {
        setOrderBalance(orderBalance?.slice(0, 3) ?? [])
    }, [orderBalance])

    const {
        isLoading,
        totalBalance: balance,
        TotalBalancePercentage: percent
    } = useSelector(SelectAccountStats)

    const [divRef, exceptRef] = useModalSideExit(details, setDetails, false)
    return <>
        {
            modalEditVisible && <Modal onDisable={setModalEditVisible} disableX={true} className={'!pt-4 !w-[43%]'}>
                <EditWallet onDisable={setModalEditVisible} />
            </Modal>
        }
        {
            deleteModal && <Modal onDisable={setDeleteModal} disableX={true} className={'!pt-4'}>
                <DeleteWallet onDisable={setDeleteModal} />
            </Modal>
        }
        {
            depositModal && <Modal onDisable={setDepositModal} className={'!pt-4'}>
                <Deposit/>
            </Modal>
        }
        <div className="w-full shadow-custom  pt-4  rounded-xl bg-white dark:bg-darkSecond min-w-[50%]">
            <div className="w-full">
                <div className="border-b dark:border-greylish pb-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 px-3">
                            <div className="bg-greylish bg-opacity-40 w-9 h-9 rounded-full"></div>
                            <div className="flex flex-col">
                                <div className="font-semibold">{item.walletName}</div>
                                <div className="text-sm text-greylish ">{AddressReducer(selectedAccount ?? "")}</div>
                            </div>
                        </div>
                        <div ref={exceptRef} onClick={() => { setDetails(!details) }} className="relative cursor-pointer  h-7 w-7  text-2xl m-0 font-bold text-greylish dark:text-white flex "><span className="rotate-90">...</span>
                            {details && <div ref={divRef} className="flex flex-col   bg-white dark:bg-darkSecond absolute right-8  w-[8rem]  rounded-lg shadow-xl z-50 ">
                                <div className="cursor-pointer  text-sm  items-start    w-full pl-3  py-2 gap-3" onClick={() => {
                                    setModalEditVisible(true)
                                    setModalVisible(false)
                                }}>
                                    <div className="flex w-full gap-2"><img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert text-greylish dark:text-white dark:brightness-0 w-4 h-4" alt="" /> <span>Edit</span></div>
                                </div>
                                <div className="cursor-pointer  text-sm flex w-full pl-3 pr-12 py-2 gap-3" onClick={() => {
                                    setDeleteModal(true)
                                    setModalVisible(false)
                                }}>
                                    <div className="flex w-full gap-2"> <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="w-4 h-4  text-greylish dark:text-white" alt="" /> <span>Delete</span></div>
                                </div>
                                <div className="cursor-pointer  text-sm flex w-full pl-3 pr-12 py-2 gap-3" onClick={() => {
                                    setDepositModal(true)
                                    setModalVisible(false)
                                }}>
                                    <div className="flex w-full gap-2"> <img src={`/icons/${dark ? 'trashicon_white' : 'deposit'}.png`} className="w-4 h-4  text-greylish dark:text-white" alt="" /> <span>Deposit</span></div>
                                </div>
                            </div>}
                        </div>
                    </div>
                </div>
                <div className="flex ">
                    <div className="border-r dark:border-greylish min-w-[28%]  flex flex-col gap-3 py-2 px-3">
                        <div className="flex flex-col">
                            <div className="text-greylish dark:text-white">Total Value</div>
                            <div className="text-lg"> {!isLoading ? item.balance : <Loader />}</div>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-greylish dark:text-white">Signers</div>
                            <div className="flex pl-3">
                                <div className=" absolute z-[0] bg-greylish bg-opacity-80  w-5 h-5 rounded-full"></div>
                                <div className="relative z-[3] right-[10px] bg-greylish bg-opacity-70 w-5 h-5 rounded-full"></div>
                                <div className=" relative z-[5] -left-[5px] bg-greylish bg-opacity-60 w-5 h-5 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    <div className="w-[75%] rounded-xl">
                        {
                            balance && orderBalance4 !== undefined ?
                                <div className="flex flex-col  w-full" ref={customRef}>
                                    {orderBalance4.map((item, index) => {
                                        return <div className="border-b dark:border-greylish w-full" key={index} >
                                            <CoinItem key={item.coins.contractAddress + item.coins.name} setSelectcoin={setSelectcoin} onClick={() => {
                                                if (item.amount) {
                                                    setSelectcoin(item.coins.name)
                                                }
                                            }}
                                                selectcoin={selectcoin}
                                                title={item.coins.name}
                                                coin={item.amount.toFixed(2)}
                                                usd={((item.tokenPrice ?? 0) * item.amount).toFixed(2)}
                                                percent={(item.percent || 0).toFixed(1)}
                                                rate={item.per_24}
                                                img={item.coins.coinUrl} />
                                        </div>
                                    })}
                                </div> : <Loader />
                        }
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default AllWallets