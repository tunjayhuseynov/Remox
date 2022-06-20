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
import Walletmodal from 'components/general/walletmodal';
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
    const [Modals, setModals] = useState(false)
    const [walletModals, setWalletModals] = useState(false)

    const importInputRef = useRef<HTMLInputElement>(null)
    const importNameInputRef = useRef<HTMLInputElement>(null)
    const [selectedItem, setItem] = useState<DropDownItem>({ name: WordSplitter(Wallet), totalValue: '4500USD', photo: "nftmonkey" })

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
            const multi = { name: "+ Multisig Account", onClick: () => { setAccountModal(true) } }
            const wallet = { name: "+ Add New Wallet",  onClick: async () => { addWallet().then(s => { if (s) setItem({ name: s.type }) }).catch(e => console.error(e)) } }
            let parsedData;
            if (blockchain === 'solana') {
                parsedData = data.addresses.map((e, i) => ({ name: e.name || `MultiSig ${i + 1}` }))
            } else {
                parsedData = data.addresses.map((e, i) => ({ name: e.name || `MultiSig ${i + 1}` }))
            }
            setList([
                ...wallets.map(s => ({
                    name: WordSplitter(s.name),  onClick: async () => {
                        try {
                            await walletSwitch(s.name)
                        } catch (error: any) {
                            console.error(error)
                        }
                        setItem({ name: WordSplitter(s.name)})
                    }
                })),
                ...parsedData, wallet, multi
            ])
        }
    }, [data, wallets])

    return <>
        {Modals && <Pay setModals={setModals} />}
        {walletModals && <Modal onDisable={setWalletModals} disableX={true} className={''}>
            <Walletmodal onDisable={setWalletModals} setModals={setModals} />
        </Modal>}
        <div className="hidden md:block z-[1] md:col-span-2 w-[16.188rem] flex-none fixed pt-28">
            <div className="grid grid-rows-[85%,1fr] pb-4 pl-4 lg:pl-10 h-full">
                <div className="absolute  flex items-center gap-5 ">
                    <Dropdown className="min-w-[14.5rem]  bg-white dark:bg-darkSecond truncate" list={list} photo={true} totalValue={true} selected={selectedItem} onSelect={(w) => {
                        if (w.address && w.amount) {
                            setItem(w)
                            dispatch(changeAccount(w.amount ? w.amount : w.address))
                        }
                    }} />
                </div>
                <div>
                    <Siderbarlist />
                    <Button className="px-10 !py-1 ml-4  min-w-[70%]" onClick={() => setWalletModals(true)}>Send</Button>


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