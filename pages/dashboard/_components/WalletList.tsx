import { useEffect, useState, useRef, Fragment } from "react";
import { AddressReducer, SetComma } from "../../../utils";
import useNextSelector from "hooks/useNextSelector";
import Modal from 'components/general/Modal'
import DeleteWallet from "./deleteWallet";
import Loader from "components/Loader";
import { SelectDarkMode } from 'redux/slices/account/remoxData';
import { useSelector } from "react-redux";
import CoinItem from './coinitem';
import useModalSideExit from 'hooks/useModalSideExit';
import { useRouter } from "next/router";
import { IAccountORM } from "pages/api/account/index.api";
import AvatarGroup from '@mui/material/AvatarGroup';
import Avatar from '@mui/material/Avatar';
import makeBlockie from 'ethereum-blockies-base64';


function WalletList({ item }: { item: IAccountORM }) {
    const [details, setDetails] = useState<boolean>(false)
    const [modalEditVisible, setModalEditVisible] = useState<boolean>(false)
    const [deleteModal, setDeleteModal] = useState<boolean>(false)
    const [depositModal, setDepositModal] = useState<boolean>(false)
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const dark = useNextSelector(SelectDarkMode)
    const [selectcoin, setSelectcoin] = useState<string>("")
    const [customRef] = useModalSideExit<string>(selectcoin, setSelectcoin, "")
    const route = useRouter()


    const [divRef, exceptRef] = useModalSideExit(details, setDetails, false)
    return <>
        {/*         
           <Modal onDisable={setModalEditVisible} openNotify={modalEditVisible} >
                <EditWallet onDisable={setModalEditVisible} />
            </Modal>       */}
        {deleteModal && <Modal onDisable={setDeleteModal} animatedModal={false} disableX={true} className="!pt-4">
            <DeleteWallet onDisable={setDeleteModal} account={item} />
        </Modal>}
        {/* <Modal onDisable={setDepositModal} openNotify={depositModal}>
            <Deposit onDisable={setDepositModal} />
        </Modal> */}

        <div className="w-full shadow-15 pt-2 rounded-md bg-white dark:bg-darkSecond min-w-[50%] hover:transition-all hover:bg-[#f9f9f9] dark:hover:!bg-[#191919]">
            <div className="w-full">
                <div className="pb-2 border-b dark:border-[#454545]">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 px-3">
                            <div className="w-9 h-9">
                                <img className="rounded-full" src={item.image?.nftUrl ?? item.image?.imageUrl as string ?? makeBlockie(item.address ?? "")} />
                            </div>
                            {/* <div className="bg-greylish bg-opacity-40 w-9 h-9 rounded-full"></div> */}
                            <div className="flex flex-col">
                                <div className="font-semibold">{item.name}</div>
                                <div className="text-[10px] text-greylish">{AddressReducer(item.address ?? "")}</div>
                            </div>
                        </div>
                        <div ref={exceptRef} onClick={() => { setDetails(!details) }} className="relative cursor-pointer  h-7 w-7 text-xl pl-2 font-bold text-greylish text-opacity-70 dark:text-white flex"><span className="rotate-90">...</span>
                            {details && <div ref={divRef} className="flex flex-col bg-white dark:bg-darkSecond absolute right-8 w-[8rem] rounded-lg shadow-xl z-50 ">
                                <div className="cursor-pointer border-b dark:border-[#454545] text-sm items-start hover:bg-greylish hover:bg-opacity-5 hover:transition-all w-full pl-3 py-2 gap-3" onClick={() => {
                                    route.push(`/dashboard/edit-wallet?id=${item.id}&address=${item.address}`)
                                    setModalVisible(false)
                                }}>
                                    <div className="flex w-full gap-2"><img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert text-greylish dark:text-white dark:brightness-0 w-4 h-4" alt="" /> <span>Edit</span></div>
                                </div>
                                <div className="cursor-pointer border-b dark:border-[#454545] text-sm flex w-full hover:bg-greylish hover:bg-opacity-5 hover:transition-all pl-3 pr-12 py-2 gap-3" onClick={() => {
                                    setDeleteModal(true)
                                    setModalVisible(false)
                                }}>
                                    <div className="flex w-full gap-2"> <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="w-4 h-4  text-greylish dark:text-white" alt="" /> <span>Delete</span></div>
                                </div>
                                <div className="cursor-pointer text-sm flex w-full hover:bg-greylish hover:bg-opacity-5 hover:transition-all pl-3 pr-12 py-2 gap-3" onClick={() => {
                                    route.push(`/dashboard/deposit?id=${item.id}&address=${item.address}`)
                                    setModalVisible(false)
                                }}>
                                    <div className="flex w-full gap-2"> <img src={`/icons/${dark ? 'trashicon_white' : 'deposit'}.png`} className="w-4 h-4  text-greylish dark:text-white" alt="" /> <span>Deposit</span></div>
                                </div>
                            </div>}
                        </div>
                    </div>
                </div>
                <div className="flex">
                    <div className="min-w-[24%] flex flex-col gap-3 py-5 px-3 items-start border-r dark:border-[#454545]">
                        <div className="flex flex-col">
                            <div className="text-greylish text-sm">Total Value</div>
                            <div className="text-lg font-semibold">${SetComma(item.totalValue)}</div>
                        </div>
                        <div className="flex flex-col mr-2 gap-1">
                            <div className="text-greylish dark:text-white text-sm">Signers</div>
                            <AvatarGroup max={3} className={`${item.members.length <= 3 ? "flex-row" : ""}`}>
                                {
                                    item.members.map((member, index) =>
                                        <Avatar key={member.id} sizes="15px" alt={member.name} src={member?.image?.imageUrl as string ?? member?.image?.nftUrl ?? makeBlockie(member.address)} />)
                                }
                            </AvatarGroup>
                        </div>
                    </div>
                    <div className="w-[75%] rounded-xl">
                        <div className="w-full pt-2 h-full" ref={customRef}>
                            {[...item.coins].sort((a, b) => a.percent > b.percent ? -1 : 1).slice(0, 4).map((item, index) => {
                                return <div className="border-b dark:border-greylish w-full" key={item.coins.address} >
                                    <CoinItem
                                        key={item.coins.address + item.coins.name}
                                        setSelectcoin={setSelectcoin}
                                        onClick={() => {
                                            if (item.amount) {
                                                setSelectcoin(item.coins.name)
                                            }
                                        }}
                                        selectcoin={selectcoin}
                                        title={item.coins.symbol}
                                        coin={item.amount}
                                        usd={((item.tokenPrice ?? 0) * item.amount)}
                                        percent={(item.percent || 0).toFixed(1)}
                                        img={item.coins.logoURI}
                                    />
                                </div>
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default WalletList