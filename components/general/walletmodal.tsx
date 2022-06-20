import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from 'components/general/dropdown';
import Modal from 'components/general/modal';
import { changeError, changeSuccess } from 'redux/reducers/notificationSlice';
import { changeAccount, SelectSelectedAccount } from 'redux/reducers/selectedAccount';
import { DropDownItem } from 'types';
import Button from 'components/button';
import useMultisig, { SolanaMultisigData } from 'hooks/walletSDK/useMultisig';
import useMultiWallet from 'hooks/useMultiWallet';
import { WordSplitter } from 'utils';
import { useRouter } from 'next/router';
import { useWalletKit } from 'hooks';
import Paydropdown from "subpages/pay/paydropdown";

function Walletmodal({ onDisable, setModals }: { onDisable: React.Dispatch<boolean>, setModals: React.Dispatch<boolean> }) {
    const { Disconnect, blockchain } = useWalletKit()
    const { data, importMultisigAccount, isLoading } = useMultisig()
    const navigator = useRouter()
    const selectedAccount = useSelector(SelectSelectedAccount)
    const { addWallet, data: wallets, Wallet, walletSwitch } = useMultiWallet()
    const [selectedItem, setItem] = useState<DropDownItem>({ name: WordSplitter(Wallet), address: selectedAccount, photo: "nftmonkey" })
    const [list, setList] = useState<DropDownItem[]>([])
    const dispatch = useDispatch()
    const [isAccountModal, setAccountModal] = useState(false)


    const paymentname: DropDownItem[] = [{ name: "CELO" }, { name: "SOLANA" }]
    const [selectedPayment, setSelectedPayment] = useState(paymentname[0])

    const paymentname2: DropDownItem[] = [{ name: "Security" }, { name: "Development" }]
    const [selectedPayment2, setSelectedPayment2] = useState(paymentname2[0])


    useEffect(() => {
        if (data && wallets) {
            let parsedData;
            if (blockchain === 'solana') {
                parsedData = data.addresses.map((e, i) => ({ name: e.name || `MultiSig ${i + 1}`, address: (e.address as SolanaMultisigData).multisig }))
            } else {
                parsedData = data.addresses.map((e, i) => ({ name: e.name || `MultiSig ${i + 1}`, address: (e.address as string) }))
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
                ...parsedData,
            ])
        }
    }, [data, wallets])



    return <>
        <div className="text-2xl font-semibold py-3 text-center">
            Remox Pay
        </div>
        <div className=" px-12 flex flex-col gap-5 w-full">
            <div className="flex flex-col gap-2 w-full">
                <div className="text-greylish">Choose Wallet</div>
                <div className="  flex items-center gap-5 w-full">
                    <Dropdown parentClass={'!w-full'} className=" !py-2 !rounded-md px-3 bg-white dark:bg-darkSecond truncate" list={list} photo={true} selected={selectedItem} onSelect={(w) => {
                        if (w.address && w.amount) {
                            setItem(w)
                            dispatch(changeAccount(w.amount ? w.amount : w.address))
                        }
                    }} />
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <div className="text-greylish">Choose Budget</div>
                <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={paymentname} selected={selectedPayment} onSelect={(e) => {
                    setSelectedPayment(e)
                }} />
            </div>
            {selectedPayment && <div className="flex flex-col gap-2 w-full">
                <div className="text-greylish">Choose Subbudget</div>
                <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={paymentname2} selected={selectedPayment2} onSelect={(e) => {
                    setSelectedPayment2(e)
                }} />
            </div>}
            <div className="flex  self-center w-full pt-4 gap-4 max-w-[80%] xl:max-w-full">
                <Button version="second" className={'!py-2 px-9 w-full rounded-xl'} onClick={() => { onDisable(false) }}>Close</Button>
                <Button type="submit" className={'!py-2 px-10 w-full rounded-xl'} onClick={() => { setModals(true); onDisable(false) }}>Next</Button>
            </div>
        </div>
    </>
}

export default Walletmodal