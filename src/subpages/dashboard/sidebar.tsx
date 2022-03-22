import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from '../../components/general/dropdown';
import Siderbarlist from './sidebarlist'
import Error from '../../components/general/error';
import Modal from '../../components/general/modal';
import Success from '../../components/general/success';
import { changeError, changeSuccess, selectError, selectSuccess } from '../../redux/reducers/notificationSlice';
import { changeAccount, SelectSelectedAccount } from '../../redux/reducers/selectedAccount';
import { selectStorage } from '../../redux/reducers/storage';
import { DropDownItem } from '../../types';
import Create from '../multisig/create';
import Button from '../../components/button';
import useMultisig from '../../API/useMultisig';
import { removeStorage } from '../../redux/reducers/storage'
import { setMenu } from '../../redux/reducers/toggles'
import { removeTransactions } from '../../redux/reducers/transactions'
import { useContractKit } from '@celo-tools/use-contractkit'
import { useNavigate} from 'react-router-dom'
import { BiLogOut } from 'react-icons/bi'
import { RiFlaskLine } from 'react-icons/ri';

const Sidebar = () => {

    const { destroy } = useContractKit()
    const { data, importMultisigAccount, isLoading } = useMultisig()
    const navigator = useNavigate()

    const storage = useSelector(selectStorage)
    const selectedAccount = useSelector(SelectSelectedAccount)

    const dispatch = useDispatch()
    const isSuccess = useSelector(selectSuccess)
    const isError = useSelector(selectError)

    const [isAccountModal, setAccountModal] = useState(false)
    const [isImportModal, setImportModal] = useState(false)
    const [isCreateModal, setCreateModal] = useState(false)

    const importInputRef = useRef<HTMLInputElement>(null)
    const importNameInputRef = useRef<HTMLInputElement>(null)

    const [selectedItem, setItem] = useState<DropDownItem>({ name: storage!.accountAddress === selectedAccount ? "Wallet" : "Multisig", address: selectedAccount })

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

    const [list, setList] = useState<DropDownItem[]>([
        { name: storage!.companyName || "Remox", address: storage!.accountAddress },
        { name: "+ Multisig Account", address: "", onClick: () => { setAccountModal(true) } },
    ])

    useEffect(() => {
        if (data) {
            setList([list[0], ...data.addresses.map((e, i) => ({ name: e.name || `MultiSig ${i + 1}`, address: e.address })), { name: "+ Multisig Account", address: "", onClick: () => { setAccountModal(true) } }])
        }
    }, [data])



    return <div className="flex flex-col  justify-between pb-4 pl-4 lg:pl-10">
        <div>
            <Siderbarlist />
        </div>

        <div className="flex items-center gap-5 mt-10 mb-2">
            <Dropdown className="min-w-[170px]" list={list} toTop={true} selected={selectedItem} onSelect={(w) => {
                if (w.address) {
                    setItem(w)
                    dispatch(changeAccount(w.address))
                }
            }} />
            <span onClick={() => {
                dispatch(setMenu(false))
                dispatch(removeTransactions())
                dispatch(removeStorage())
                destroy() 
                navigator('/')
            }}><LogoutSVG />
            </span>
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
                <div className="flex items-center justify-center"><Button onClick={() => setAccountModal(false) } className=" w-[30%] px-4 py-2">Cancel</Button></div>
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
                <Button className="px-10 py-2" version="second" onClick={() => setImportModal(false)}>
                        Cancel
                    </Button>
                    <Button className="px-10 py-2" onClick={importClick} isLoading={isLoading}>
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
        {isSuccess && <Success onClose={(val: boolean) => dispatch(changeSuccess({ activate: val }))} />}
        {isError && <Error onClose={(val: boolean) => dispatch(changeError({ activate: val }))} />}
    </div>

}

const LogoutSVG = ({ active = false }) => <BiLogOut className="w-[24px] h-[24px] cursor-pointer" />

export default Sidebar;