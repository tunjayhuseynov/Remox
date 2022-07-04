import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from 'components/general/dropdown';
import Siderbarlist from './sidebarlist'
import Modal from 'components/general/modal';
import { changeError, changeSuccess } from 'redux/reducers/notificationSlice';
import { changeAccount, SelectSelectedAccount } from 'redux/reducers/selectedAccount';
import { DropDownItem } from 'types';
import Create from '../multisig/create';
import Button from 'components/button';
import useMultisig, { SolanaMultisigData } from 'hooks/walletSDK/useMultisig';
import { BiLogOut } from 'react-icons/bi'
import useMultiWallet from 'hooks/useMultiWallet';
import { WordSplitter } from 'utils';
import { useRouter } from 'next/router';
import { useWalletKit } from 'hooks';
import Pay from 'subpages/pay/pay';

import useNextSelector from 'hooks/useNextSelector';

const Sidebar = () => {

    const { Disconnect, blockchain } = useWalletKit()
    const { data, importMultisigAccount, isLoading } = useMultisig()
    const navigator = useRouter()
    const { addWallet, data: wallets, Wallet, walletSwitch } = useMultiWallet()
    const selectedAccount = useNextSelector(SelectSelectedAccount)

    const dispatch = useDispatch()

    const [isAccountModal, setAccountModal] = useState(false)
    const [isImportModal, setImportModal] = useState(false)
    const [isCreateModal, setCreateModal] = useState(false)



    const importInputRef = useRef<HTMLInputElement>(null)
    const importNameInputRef = useRef<HTMLInputElement>(null)
    const [selectedItem, setItem] = useState<DropDownItem>({ name: "Treasury vault", totalValue: '$4500', photo: "nftmonkey" })

    const importClick = async () => {
        if (importInputRef.current && importInputRef.current.value) {
            try {
                await importMultisigAccount(importInputRef.current.value, (importNameInputRef.current?.value ?? ""))
                dispatch(changeSuccess({ activate: true, text: "Successfully imported" }))
                setImportModal(false)
            } catch (error: any) {
                console.error(error)
                dispatch(changeError({ activate: true, text: (error || "Something went wrong") }))
                setImportModal(false)
            }
        }
    }

    const [list, setList] = useState<DropDownItem[]>([])

    useEffect(() => {


            setList([
                { name: "Treasury vault 0", totalValue: '$2,800', photo: "nftmonkey" },
                { name: "Treasury vault 1", totalValue: '$3,700', photo: "" },
                { name: "Add Organization",  onClick: () => {navigator.push('/create-organization')}}
                
            ])
    }, [])

    return <>
        <div className="hidden md:block z-[1] md:col-span-2 w-[17.188rem] flex-none fixed pt-28 bg-light dark:bg-dark">
            <div className="grid grid-rows-[85%,1fr] pb-4 pl-4 lg:pl-10 h-full">
                <div className="absolute  flex items-center gap-5 ">
                    <Dropdown className="min-w-[14.5rem]  bg-white dark:bg-darkSecond truncate" photoDisplay={true} childClass="flex gap-2" list={list} selected={selectedItem} onSelect={(w) => {                     
                            setItem(w)
                    }} />
                </div>
                <div>
                    <Siderbarlist />
                    <Pay />
                  
                </div>

            </div>
        </div>

        {isAccountModal && <Modal onDisable={setAccountModal} disableX={true}>
            <div className="flex flex-col gap-8 mt-[-2rem]">
                <div className="text-center font-semibold pt-4 text-xl">Multi-Signature Account</div>
                <div className="flex space-x-3 border border-greylish  py-3 rounded-md cursor-pointer items-center justify-center" onClick={() => {
                    setCreateModal(true)
                    setAccountModal(false)
                }}>
                    <span>Create Multisig Account</span>
                </div>
                <div className="flex space-x-3 border border-greylish  py-3 rounded-md cursor-pointer items-center justify-center" onClick={() => {
                    setImportModal(true)
                    setAccountModal(false)
                }}>
                    <span>Import Multisig Account</span>
                </div>
                <div className="flex items-center justify-center"><Button onClick={() => setAccountModal(false)} className=" w-[30%] !px-4 !py-2">Cancel</Button></div>
            </div>
        </Modal>}
        {isImportModal && <Modal onDisable={setImportModal} disableX={true}>
            <div className="flex flex-col gap-4 mt-[-2rem]">
                <div className="text-center font-semibold text-xl">Import MultiSig Account</div>
                <div className="flex flex-col">
                    <span className="text-greylish opacity-35 pl-3">MultiSig Name</span>
                    <input ref={importNameInputRef} type="text" className="border p-3 rounded-md border-greylish dark:bg-darkSecond outline-none" placeholder="Multisig name" />
                </div>
                <div className="flex flex-col">
                    <span className="text-greylish opacity-35 pl-3">MultiSig Address</span>
                    <input ref={importInputRef} type="text" className="border p-3 rounded-md border-greylish dark:bg-darkSecond outline-none" placeholder="Multisig Address" />
                </div>
                <div className="flex justify-center gap-5">
                    <Button className="!px-10 !py-2" version="second" onClick={() => setImportModal(false)}>
                        Cancel
                    </Button>
                    <Button className="!px-10 !py-2" onClick={importClick} isLoading={isLoading}>
                        Import
                    </Button>
                </div>
            </div>
        </Modal>}
        {
            isCreateModal && <Modal onDisable={setCreateModal} disableX={true}>
                <Create setCreateModal={setCreateModal} />
            </Modal>
        }
        {/* {isSuccess && <Success onClose={(val: boolean) => dispatch(changeSuccess({ activate: val }))} />}
        {isError && <Error onClose={(val: boolean) => dispatch(changeError({ activate: val }))} />} */}
    </>
}

export default Sidebar;