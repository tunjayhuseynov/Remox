import dateFormat from "dateformat";
import { useEffect, useState } from "react";
import Dropdown from "components/general/dropdown";
import { useAppSelector } from "redux/hooks";
import { SelectCurrencies } from "redux/reducers/currencies";
import { DropDownItem } from "types/dropdown";
import { AddressReducer } from 'utils'
import _ from "lodash";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import { useTransactionProcess, useWalletKit } from "hooks";
import { ERC20MethodIds, IAutomationTransfer, IBatchRequest, IFormattedTransaction, InputReader, ISwap, ITransfer } from "hooks/useTransactionProcess";
import { selectTags } from "redux/reducers/tags";
import { useSelector } from "react-redux";
import Select, { StylesConfig } from 'react-select';
import chroma from 'chroma-js';
import useTags, { Tag } from "apiHooks/useTags";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import useGelato from "apiHooks/useGelato";
import { CoinsURL } from "types";
import { useRouter } from "next/router";
import Loader from "components/Loader";

const Details = () => {
    const selectedAccount = useAppSelector(SelectSelectedAccount)
    const currencies = useAppSelector(SelectCurrencies)

    const [transactions] = useTransactionProcess()
    const { getDetails } = useGelato()
    const { GetCoins, fromMinScale } = useWalletKit()

    const tags = useSelector(selectTags)
    const dark = useSelector(selectDarkMode)

    const { removeTransactions, addTransaction } = useTags()

    let params = useRouter().query as { id: string | undefined }

    const [info, setInfo] = useState<{
        paidTo: string,
        totalAmount: string,
        fee: string,
        date: string,
        type:string,
        walletAddress: string[],

    }>()

    const [isTagLoading, setTagLoading] = useState(false)

    const [notFound, setNotFound] = useState(false)

    const [tx, setTx] = useState<IFormattedTransaction>()

    useEffect(() => {
        (
            async () => {
                if (transactions) {
                    const txFind = transactions.find(s => s.hash.toLowerCase() === params.id)
                    if (txFind) {
                        const isBatch = txFind.id === ERC20MethodIds.batchRequest;
                        const isSwap = txFind.id === ERC20MethodIds.swap;
                        const isAutomated = txFind.id === ERC20MethodIds.automatedTransfer;
                        const isTransfer = txFind.id === ERC20MethodIds.transfer;
                        const isTransferFrom = txFind.id === ERC20MethodIds.transferFrom;

                        let paidTo, totalAmount, walletAddress;
                        let fee = `${fromMinScale((parseInt(txFind.rawData.gasUsed) * parseInt(txFind.rawData.gasPrice)).toString())} ${!isBatch && txFind.rawData.tokenSymbol === "cUSD" ? "cUSD" : "CELO"}`;
                        let date = dateFormat(new Date(parseInt(txFind.rawData.timeStamp) * 1e3), "dd/mm/yyyy hh:MM:ss")
                        let type =  isSwap ? "Swap" : isAutomated ? "Automated" :  isTransfer ? "Send" :isTransferFrom ? "Require" : "Unknown"

                        if (isBatch) {
                            const batch = txFind as IBatchRequest
                            paidTo = `${Array.from(new Set((batch).payments.map(s => s.to))).length} people`
                            totalAmount = `${batch.payments.reduce((a, c) => (parseFloat(fromMinScale(c.amount)) * (currencies[c.coinAddress.name]?.price ?? 1)) + a, 0).toPrecision(4)} USD`
                            walletAddress = Array.from(new Set(batch.payments.map(s => s.to)))
                        } else if (isSwap) {
                            const swap = txFind as ISwap
                            paidTo = "Swap"
                            totalAmount = `${fromMinScale(swap.amountIn)} ${swap.coinIn.name} -> ${parseFloat(fromMinScale(swap.amountOutMin)).toPrecision(4)} ${swap.coinOutMin.name}`
                            walletAddress = ["Ubeswap"]
                        } else if (isAutomated) {
                            const data = txFind as IAutomationTransfer
                            const details = await getDetails(data.taskId)
                            const reader = InputReader(details[1], data.rawData, tags, GetCoins)
                            if (reader) {
                                if (reader.id === ERC20MethodIds.batchRequest) {
                                    const batch = reader as IBatchRequest
                                    paidTo = `${Array.from(new Set((batch).payments.map(s => s.to))).length} people`
                                    totalAmount = `${batch.payments.reduce((a, c) => (parseFloat(fromMinScale(c.amount)) * (currencies[c.coinAddress.name]?.price ?? 1)) + a, 0).toPrecision(4)} USD`
                                    walletAddress = Array.from(new Set(batch.payments.map(s => s.to)))

                                } else if (reader.id === ERC20MethodIds.swap) {
                                    const swap = reader as ISwap
                                    paidTo = "Swap"
                                    totalAmount = `${fromMinScale(swap.amountIn)} ${swap.coinIn.name} -> ${parseFloat(fromMinScale(swap.amountOutMin)).toPrecision(4)} ${swap.coinOutMin.name}`
                                    walletAddress = ["Ubeswap"]
                                } else {
                                    const single = reader as ITransfer
                                    paidTo = "1 person"
                                    totalAmount = `${(parseFloat(fromMinScale(single.amount)) * (currencies[single.coin.name]?.price ?? 1)).toPrecision(4)} USD`
                                    walletAddress = single.to.toLowerCase() === selectedAccount.toLowerCase() ? [data.rawData.from] : [single.to]
                                }

                                setInfo({
                                    date,
                                    fee,
                                    paidTo,
                                    type,
                                    totalAmount,
                                    walletAddress
                                })
                                setTx(txFind)
                            }

                            return;
                        }
                        else {
                            const single = txFind as ITransfer
                            paidTo = "1 person"
                            totalAmount = `${(parseFloat(fromMinScale(single.amount)) * (currencies[single.coin.name]?.price ?? 1)).toPrecision(4)} USD`
                            walletAddress = single.to.toLowerCase() === selectedAccount.toLowerCase() ? [single.rawData.from] : [single.to]
                        }

                        setInfo({
                            date,
                            fee,
                            paidTo,
                            type,
                            totalAmount,
                            walletAddress
                        })
                        setTx(txFind)
                    } else setNotFound(true)
                }
            }
        )()
    }, [transactions, params.id])

    type SelectType = { value: string, label: string, color: string, transactions: string[], isDefault: boolean }

    const colourStyles: StylesConfig<SelectType, true> = {
        control: (styles) => ({ ...styles, boxShadow: 'none', height: '100%', border: "1px solid transparent", "&:hover": { border: "1px solid transparent", }, backgroundColor: dark ? "text-dark" : 'white' }),
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            const color = chroma(data.color);
            return {
                ...styles,
                outline: 'none',
                border: 'none',
                backgroundColor: isDisabled
                    ? undefined
                    : isSelected
                        ? data.color
                        : isFocused
                            ? color.alpha(0.1).css()
                            : undefined,
                color: isDisabled
                    ? '#ccc'
                    : isSelected
                        ? chroma.contrast(color, 'white') > 2
                            ? 'white'
                            : 'black'
                        : data.color,
                cursor: isDisabled ? 'not-allowed' : 'default',

                ':active': {
                    ...styles[':active'],
                    backgroundColor: !isDisabled
                        ? isSelected
                            ? data.color
                            : color.alpha(0.3).css()
                        : undefined,
                },
            };
        },
        multiValue: (styles, { data }) => {
            const color = chroma(data.color);
            return {
                ...styles,
                backgroundColor: color.alpha(0).css(),
            };
        },
        multiValueLabel: (styles, { data }) => ({
            ...styles,
            color: data.color,
            ...dot(data.color)
        }),
        multiValueRemove: (styles, { data }) => {

            return {
                ...styles,
                color: data.color,
                ':hover': {
                    backgroundColor: data.color,
                    color: 'white',
                },
            }
        },
    };

    const dot = (color = 'transparent') => ({
        alignItems: 'center',
        display: 'flex',

        ':before': {
            backgroundColor: color,
            borderRadius: 10,
            content: '" "',
            display: 'block',
            marginRight: 8,
            height: 10,
            width: 10,
        },
    });

    const onChange = async (value: any) => {
        setTagLoading(true)
        const selectedTags = value.map((s: SelectType) => ({ color: s.color, id: s.value, name: s.label, transactions: s.transactions, isDefault: s.isDefault }))

        const deletedTags = tx?.tags?.filter(s => !selectedTags.find((t: any) => t.id === s.id))

        if (selectedTags && selectedTags.length > 0) {
            for (const tag of selectedTags) {
                await addTransaction(tag.id, tx!.hash)
            }
        }

        if (deletedTags && deletedTags.length > 0) {
            for (const tag of deletedTags) {
                await removeTransactions(tag.id, tx!.hash!.toLocaleLowerCase())
            }
        }
        setTagLoading(false)
    }

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
                    {TransactionDetailInput("Status", <div className="flex items-center gap-x-2"><div className="bg-green-400 h-[0.625rem] w-[0.625rem] rounded-full"></div>Completed</div>)}
                    {info.walletAddress.length === 1 ?
                        TransactionDetailInput("Wallet Address", `${AddressReducer(info.walletAddress[0])}`, undefined, () => window.navigator.clipboard.writeText(info.walletAddress[0]))
                        :
                        <Dropdown displayName="Wallet Address" className="h-[4.688rem] bg-greylish bg-opacity-10" nameActivation={true} selected={{ name: "Choose to copy an address", coinUrl: CoinsURL.None }}
                            onSelect={(w: DropDownItem) => {
                                if (w.name) window.navigator.clipboard.writeText(w.name)
                            }}
                            list={[
                                ...info.walletAddress.map(w => ({ name: w, coinUrl: CoinsURL.None, disableAddressDisplay: true })),
                            ]} />}
                    {tags && tags.length > 0 && tx.tags && tx.tags?.length > 0 && <Select
                        className="bg-greylish bg-opacity-10 rounded-xl"
                        closeMenuOnSelect={false}
                        defaultValue={tx.tags?.map(t => ({ value: t.id, label: t.name, color: t.color, transactions: t.transactions, isDefault: t.isDefault }))}
                        isMulti
                        isLoading={isTagLoading}
                        isClearable={false}
                        options={tags.map(s => ({ value: s.id, label: s.name, color: s.color, transactions: s.transactions, isDefault: s.isDefault }))}
                        styles={colourStyles}
                        onChange={onChange}
                    />}
                    {tags && tags.length > 0 && tx.tags && tx.tags?.length === 0 && <Select
                        className="bg-greylish bg-opacity-10 rounded-xl"
                        closeMenuOnSelect={false}
                        isMulti
                        isClearable={false}
                        isLoading={isTagLoading}
                        options={tags.map(s => ({ value: s.id, label: s.name, color: s.color, transactions: s.transactions, isDefault: s.isDefault }))}
                        styles={colourStyles}
                        onChange={onChange}
                    />}
                    {TransactionDetailInput("Type", info.type)}
                </div> : <Loader />}
                {notFound && <div>There is no such transaction belongs to your address</div>}
            </div>
        </div>
    </>
}

export default Details;


const TransactionDetailInput = (title: string, children: JSX.Element | JSX.Element[] | string, url?: string, onClick?: () => void) => {

    return <div className="bg-greylish bg-opacity-10 flex flex-col px-4 py-3 rounded-xl min-h-[4.688rem]">
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