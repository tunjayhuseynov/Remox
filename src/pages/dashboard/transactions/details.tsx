import dateFormat from "dateformat";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import Dropdown from "../../../components/general/dropdown";
import { useAppSelector } from "../../../redux/hooks";
import { SelectCurrencies } from "../../../redux/reducers/currencies";
import { CoinsURL } from "../../../types/coins";
import { DropDownItem } from "../../../types/dropdown";
import { AddressReducer } from 'utils'
import _ from "lodash";
import { SelectSelectedAccount } from "../../../redux/reducers/selectedAccount";
import { useTransactionProcess } from "hooks";
import { ERC20MethodIds, IBatchRequest, IFormattedTransaction, ISwap, ITransfer } from "hooks/useTransactionProcess";
import { fromWei } from "web3-utils";

const Details = () => {
    const selectedAccount = useAppSelector(SelectSelectedAccount)
    const currencies = useAppSelector(SelectCurrencies)

    const [transactions] = useTransactionProcess()

    let params = useParams<{ id: string }>() as { id: string }

    const [info, setInfo] = useState<{
        paidTo: string,
        totalAmount: string,
        fee: string,
        date: string,
        walletAddress: string[],

    }>()

    const [notFound, setNotFound] = useState(false)

    const [tx, setTx] = useState<IFormattedTransaction>()

    useEffect(() => {
        if (transactions) {
            const txFind = transactions.find(s => s.hash.toLowerCase() === params.id)
            if (txFind) {
                const isBatch = txFind.id === ERC20MethodIds.batchRequest;
                const isSwap = txFind.id === ERC20MethodIds.swap;
                let paidTo, totalAmount, walletAddress;
                let fee = `${fromWei((parseInt(txFind.rawData.gasUsed) * parseInt(txFind.rawData.gasPrice)).toString(), "ether")} ${!isBatch && txFind.rawData.tokenSymbol === "cUSD" ? "cUSD" : "CELO"}`;
                let date = dateFormat(new Date(parseInt(txFind.rawData.timeStamp) * 1e3), "dd/mm/yyyy hh:MM:ss")

                if (isBatch) {
                    const batch = txFind as IBatchRequest
                    paidTo = `${Array.from(new Set((batch).payments.map(s => s.to))).length} people`
                    totalAmount = `${batch.payments.reduce((a, c) => (parseFloat(fromWei(c.amount, 'ether')) * (currencies[c.coinAddress.name]?.price ?? 1)) + a, 0).toPrecision(4)} USD`
                    walletAddress = Array.from(new Set(batch.payments.map(s => s.to)))
                } else if (isSwap) {
                    const swap = txFind as ISwap
                    paidTo = "Swap"
                    totalAmount = `${fromWei(swap.amountIn, 'ether')} ${swap.coinIn.name} -> ${parseFloat(fromWei(swap.amountOutMin, 'ether')).toPrecision(4)} ${swap.coinOutMin.name}`
                    walletAddress = ["Ubeswap"]
                } else {
                    const single = txFind as ITransfer
                    paidTo = "1 person"
                    totalAmount = `${(parseFloat(fromWei(single.amount, 'ether')) * (currencies[single.rawData.tokenSymbol]?.price ?? 1)).toPrecision(4)} USD`
                    walletAddress = single.to.toLowerCase() === selectedAccount.toLowerCase() ? [single.rawData.from] : [single.to]
                }

                setInfo({
                    date,
                    fee,
                    paidTo,
                    totalAmount,
                    walletAddress
                })
                setTx(txFind)
            } else setNotFound(true)
        }
    }, [transactions, params.id])

    return <>
        <div>
            <div className="w-full shadow-custom px-5 py-14 rounded-xl flex flex-col items-center justify-center">
                <div className="font-bold text-xl sm:text-2xl">
                    Transaction Details
                </div>
                {tx && info && !notFound ? <div className="flex flex-col sm:grid sm:grid-cols-3 py-5 gap-14 w-full">
                    {
                        TransactionDetailInput("Transaction Hash", `${tx.hash}`, `https://explorer.celo.org/tx/${tx.hash}/token-transfers`)
                    }
                    {TransactionDetailInput("Paid To", info.paidTo)}
                    {TransactionDetailInput("Total Amount", info.totalAmount)}
                    {TransactionDetailInput("Transaction Fee", `${info.fee}`)}
                    {TransactionDetailInput("Created Date & Time", info.date)}
                    {TransactionDetailInput("Status", <div className="flex items-center gap-x-2"><div className="bg-green-400 h-[10px] w-[10px] rounded-full"></div>Completed</div>)}
                    {info.walletAddress.length === 1 ?
                        TransactionDetailInput("Wallet Address", `${AddressReducer(info.walletAddress[0])}`, undefined, () => window.navigator.clipboard.writeText(info.walletAddress[0]))
                        :
                        <Dropdown displayName="Wallet Address" className="h-[75px] bg-greylish bg-opacity-10" nameActivation={true} selected={{ name: "Choose to copy an address", coinUrl: CoinsURL.None }}
                            onSelect={(w: DropDownItem) => {
                                if (w.name) window.navigator.clipboard.writeText(w.name)
                            }}
                            list={[
                                ...info.walletAddress.map(w => ({ name: w, coinUrl: CoinsURL.None, disableAddressDisplay: true })),
                            ]} />}
                </div> : <ClipLoader />}
                {notFound && <div>There is no such transaction belongs to your address</div>}
            </div>
        </div>
    </>
}

export default Details;


const TransactionDetailInput = (title: string, children: JSX.Element | JSX.Element[] | string, url?: string, onClick?: () => void) => {

    return <div className="bg-greylish bg-opacity-10 flex flex-col px-4 py-3 rounded-xl min-h-[75px]">
        <div className="text-sm text-greylish opacity-80">
            {title}
        </div>
        <div className={`font-bold text-lg truncate ${onClick && "cursor-pointer"} ${url && "cursor-pointer"}`} onClick={() => {
            url ? window.open(url, '_blank') : console.log("Wish you more money :)")
        }}>
            {children}
        </div>
        { }
    </div>
}