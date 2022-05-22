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
import { removeStorage } from 'redux/reducers/storage'
import { setMenu } from 'redux/reducers/toggles'
import { removeTransactions } from 'redux/reducers/transactions'
import { BiLogOut } from 'react-icons/bi'
import useMultiWallet from 'hooks/useMultiWallet';
import { WordSplitter } from 'utils';
import { useRouter } from 'next/router';
import { useWalletKit } from 'hooks';

const Sidebar = () => {

    const { Disconnect, blockchain } = useWalletKit()
    const { data, importMultisigAccount, isLoading } = useMultisig()
    const navigator = useRouter()
    const { addWallet, data: wallets, Wallet, walletSwitch } = useMultiWallet()
    const selectedAccount = useSelector(SelectSelectedAccount)

    const dispatch = useDispatch()

    const [isAccountModal, setAccountModal] = useState(false)
    const [isImportModal, setImportModal] = useState(false)
    const [isCreateModal, setCreateModal] = useState(false)

    const importInputRef = useRef<HTMLInputElement>(null)
    const importNameInputRef = useRef<HTMLInputElement>(null)
    const [selectedItem, setItem] = useState<DropDownItem>({ name: WordSplitter(Wallet), address: selectedAccount })

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
        if (data && wallets) {
            const multi = { name: "+ Multisig Account", address: "", onClick: () => { setAccountModal(true) } }
            const wallet = { name: "+ Add New Wallet", address: "", onClick: async () => { addWallet().then(s => { if (s) setItem({ name: s.type, address: s.account! }) }).catch(e => console.error(e)) } }
            let parsedData;
            if (blockchain === 'solana') {
                parsedData = data.addresses.map((e, i) => ({ name: e.name || `MultiSig ${i + 1}`, address: (e?.address as SolanaMultisigData)?.multisig }))
            } else {
                parsedData = data.addresses.map((e, i) => ({ name: e.name || `MultiSig ${i + 1}`, address: (e?.address as string) }))
            }
            setList([
                ...wallets.map(s => ({
                    name: WordSplitter(s.name), address: s.address, onClick: async () => {
                        try {
                            await walletSwitch(s.name)
                        } catch (error: any) {
                            console.error(error)
                        }
                        setItem({ name: WordSplitter(s.name), address: s.address })
                    }
                })),
                ...parsedData, wallet, multi
            ])
        }
    }, [data, wallets])

    return <>
        <div className="hidden md:block md:col-span-2 w-[17.188rem] flex-none fixed pt-32 z-50">
            <div className="grid grid-rows-[85%,1fr] pb-4 pl-4 lg:pl-10 h-full">
                <div>
                    <Siderbarlist />
                </div>

                <div className="absolute -bottom-[15%] flex items-center gap-5 ">
                    <Dropdown className="min-w-[12.5rem] max-w-[13rem] bg-white dark:bg-darkSecond truncate" list={list} toTop={true} selected={selectedItem} onSelect={(w) => {
                        if (w.address) {
                            setItem(w)
                            dispatch(changeAccount(w.address))
                        }
                    }} />
                    <span className="rotate-180" onClick={() => {
                        dispatch(setMenu(false))
                        dispatch(removeTransactions())
                        dispatch(removeStorage())
                        Disconnect()
                        navigator.push('/')
                    }}><LogoutSVG />
                    </span>
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

const LogoutSVG = () => <BiLogOut className="w-[1.5rem] h-[1.5rem] cursor-pointer" />

export default Sidebar;