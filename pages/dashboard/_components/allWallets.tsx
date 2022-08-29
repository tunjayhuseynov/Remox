import { useEffect, useState, useRef, Fragment } from "react";
import { IBalanceItem, SelectOrderBalance } from 'redux/slices/currencies';
import { AddressReducer, SetComma } from "../../../utils";
import useNextSelector from "hooks/useNextSelector";
import Modal from 'components/general/modal'
import DeleteWallet from "./deleteWallet";
import Loader from "components/Loader";
import { SelectDarkMode } from 'redux/slices/account/remoxData';
import { useSelector } from "react-redux";
import CoinItem from './coinitem';
import useModalSideExit from 'hooks/useModalSideExit';
import { IAccount } from "firebaseConfig";
import { useRouter } from "next/router";
import { IAccountORM } from "pages/api/account/index.api";

function AllWallets({ item }: { item: IAccountORM }) {
    const [details, setDetails] = useState<boolean>(false)
    const [modalEditVisible, setModalEditVisible] = useState<boolean>(false)
    const [deleteModal, setDeleteModal] = useState<boolean>(false)
    const [depositModal, setDepositModal] = useState<boolean>(false)
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const orderBalance = useNextSelector(SelectOrderBalance)
    const [orderBalance4, setOrderBalance] = useState<IBalanceItem[]>([])
    const dark = useNextSelector(SelectDarkMode)
    const [selectcoin, setSelectcoin] = useState<string>("")
    const [customRef] = useModalSideExit<string>(selectcoin, setSelectcoin, "")
    const route = useRouter()


    useEffect(() => {
        setOrderBalance(orderBalance?.slice(0, 3) ?? [])
    }, [orderBalance])

    const [divRef, exceptRef] = useModalSideExit(details, setDetails, false)
    return <>
        {/*         
           <Modal onDisable={setModalEditVisible} openNotify={modalEditVisible} >
                <EditWallet onDisable={setModalEditVisible} />
            </Modal>       */}
        {deleteModal && <Modal onDisable={setDeleteModal} animatedModal={false} disableX={true} className="!pt-4">
            <DeleteWallet onDisable={setDeleteModal} />
        </Modal>}
        {/* <Modal onDisable={setDepositModal} openNotify={depositModal}>
            <Deposit onDisable={setDepositModal} />
        </Modal> */}

        <div className="w-full shadow-custom  pt-4  rounded-xl bg-white dark:bg-darkSecond min-w-[50%]">
            <div className="w-full">
                <div className="border-b dark:border-greylish pb-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 px-3">
                            <div className="bg-greylish bg-opacity-40 w-9 h-9 rounded-full"></div>
                            <div className="flex flex-col">
                                <div className="font-semibold">{item.name}</div>
                                <div className="text-sm text-greylish ">{AddressReducer(item.address ?? "")}</div>
                            </div>
                        </div>
                        <div ref={exceptRef} onClick={() => { setDetails(!details) }} className="relative cursor-pointer  h-7 w-7  text-2xl m-0 font-bold text-greylish dark:text-white flex "><span className="rotate-90">...</span>
                            {details && <div ref={divRef} className="flex flex-col   bg-white dark:bg-darkSecond absolute right-8  w-[8rem]  rounded-lg shadow-xl z-50 ">
                                <div className="cursor-pointer border-b  text-sm  items-start hover:bg-greylish hover:bg-opacity-5 hover:transition-all    w-full pl-3  py-2 gap-3" onClick={() => {
                                    route.push(`/dashboard/edit-wallet?id=${item.id}&address=${item.address}`)
                                    setModalVisible(false)
                                }}>
                                    <div className="flex w-full gap-2"><img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert text-greylish dark:text-white dark:brightness-0 w-4 h-4" alt="" /> <span>Edit</span></div>
                                </div>
                                <div className="cursor-pointer border-b  text-sm flex w-full hover:bg-greylish hover:bg-opacity-5 hover:transition-all pl-3 pr-12 py-2 gap-3" onClick={() => {
                                    setDeleteModal(true)
                                    setModalVisible(false)
                                }}>
                                    <div className="flex w-full gap-2"> <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="w-4 h-4  text-greylish dark:text-white" alt="" /> <span>Delete</span></div>
                                </div>
                                <div className="cursor-pointer border-b  text-sm flex w-full hover:bg-greylish hover:bg-opacity-5 hover:transition-all pl-3 pr-12 py-2 gap-3" onClick={() => {
                                    route.push(`/dashboard/deposit?id=${item.id}&address=${item.address}`)
                                    setModalVisible(false)
                                }}>
                                    <div className="flex w-full gap-2"> <img src={`/icons/${dark ? 'trashicon_white' : 'deposit'}.png`} className="w-4 h-4  text-greylish dark:text-white" alt="" /> <span>Deposit</span></div>
                                </div>
                            </div>}
                        </div>
                    </div>
                </div>
                <div className="flex ">
                    <div className="border-r dark:border-greylish min-w-[28%] flex flex-col gap-3 py-2 px-3">
                        <div className="flex flex-col">
                            <div className="text-greylish dark:text-white">Total Value</div>
                            <div className="text-lg">$ {SetComma(item.totalValue)}</div>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-greylish dark:text-white">Signers</div>
                            <div className="flex pl-3">
                                {
                                    item.members.map((member, index) => {
                                        return <Fragment key={member.id}>
                                            {member.image ? <img src={`${item.members[1].image}`} className={`z-[1] border  w-5 h-5 rounded-full`} /> : <div className="bg-gray-400 z-[1] border  w-5 h-5 rounded-full"></div>}
                                        </Fragment>
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div className="w-[75%] rounded-xl">
                        {
                            <div className="flex flex-col  w-full" ref={customRef}>

                                {[...item.coins].sort((a, b) => a.percent > b.percent ? -1 : 1).slice(0, 4).map((item, index) => {
                                    return <div className="border-b dark:border-greylish w-full" key={item.coins.contractAddress} >
                                        <CoinItem
                                            key={item.coins.contractAddress + item.coins.name}
                                            setSelectcoin={setSelectcoin}
                                            onClick={() => {
                                                if (item.amount) {
                                                    setSelectcoin(item.coins.name)
                                                }
                                            }}
                                            selectcoin={selectcoin}
                                            title={item.coins.name}
                                            coin={item.amount}
                                            usd={((item.tokenPrice ?? 0) * item.amount)}
                                            percent={(item.percent || 0).toFixed(1)}
                                            rate={item.per_24}
                                            img={item.coins.coinUrl}
                                        />
                                    </div>
                                })}
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default AllWallets