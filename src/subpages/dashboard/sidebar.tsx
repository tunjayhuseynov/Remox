import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from '../../components/general/dropdown';
import Siderbarlist from './sidebarlist'
import Error from '../../components/general/error';
import Modal from '../../components/general/modal';
import Success from '../../components/general/success';
import { useImportAddressMutation } from '../../redux/api';
import { changeError, changeSuccess, selectError, selectSuccess } from '../../redux/reducers/notificationSlice';
import { changeAccount, SelectSelectedAccount } from '../../redux/reducers/selectedAccount';
import { selectStorage } from '../../redux/reducers/storage';
import { DropDownItem } from '../../types';
import Create from '../multisig/create';
import Button from '../../components/button';
import useMultisig from '../../API/useMultisig';

const Sidebar = () => {

    const { data, importMultisigAccount, isLoading } = useMultisig()

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



    return <div className="flex flex-col gap-14 pl-4 lg:pl-10">
        <div>
            <Dropdown list={list} selected={selectedItem} onSelect={(w) => {
                if (w.address) {
                    setItem(w)
                    dispatch(changeAccount(w.address))
                }
            }} />
        </div>
        <div>
            <Siderbarlist />
        </div>
        {isAccountModal && <Modal onDisable={setAccountModal}>
            <div className="flex flex-col gap-4 mt-[-2rem]">
                <div className="text-center font-semibold">Multi-Signature Account</div>
                <div className="flex space-x-3 border border-black px-5 py-2 rounded-md cursor-pointer items-center" onClick={() => {
                    setCreateModal(true)
                    setAccountModal(false)
                }}>
                    <img src="/icons/teamicon.svg" alt="" />
                    <span>Create Multisig Account</span>
                </div>
                <div className="flex space-x-3 border border-black px-5 py-2 rounded-md cursor-pointer items-center" onClick={() => {
                    setImportModal(true)
                    setAccountModal(false)
                }}>
                    <img src="/icons/teamicon.svg" alt="" />
                    <span>Import Multisig Account</span>
                </div>
            </div>
        </Modal>}
        {isImportModal && <Modal onDisable={setImportModal}>
            <div className="flex flex-col gap-4 mt-[-2rem]">
                <div className="text-center font-semibold">Import MultiSig Account</div>
                <div className="flex flex-col">
                    <span className="text-greylish opacity-35 pl-3">MultiSig Name</span>
                    <input ref={importNameInputRef} type="text" className="border p-3 rounded-md border-black" placeholder="0xabc..." />
                </div>
                <div className="flex flex-col">
                    <span className="text-greylish opacity-35 pl-3">MultiSig Address</span>
                    <input ref={importInputRef} type="text" className="border p-3 rounded-md border-black" placeholder="0xabc..." />
                </div>
                <div className="flex justify-center">
                    <Button className="px-10 py-2" onClick={importClick} isLoading={isLoading}>
                        Import
                    </Button>
                </div>
            </div>
        </Modal>}
        {
            isCreateModal && <Modal onDisable={setCreateModal}>
                <Create setCreateModal={setCreateModal} />
            </Modal>
        }
        {isSuccess && <Success onClose={(val: boolean) => dispatch(changeSuccess({ activate: val }))} />}
        {isError && <Error onClose={(val: boolean) => dispatch(changeError({ activate: val }))} />}
    </div>

}

export default Sidebar;