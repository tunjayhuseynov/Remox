import { useState, useRef, useEffect, SyntheticEvent } from "react";
import { generate } from 'shortid'
import { useNavigate } from 'react-router-dom'
import ClipLoader from "react-spinners/ClipLoader";
import Success from "components/general/success";
import Error from "components/general/error";
import { DropDownItem } from "types/dropdown";
import { MultipleTransactionData } from "types/sdk";
import CSV, { csvFormat } from 'utils/CSV'
import { useSelector } from "react-redux";
import { selectStorage } from "redux/reducers/storage";
import Input from "subpages/pay/payinput";
import { Coins, PoofCoins, AltCoins } from "types/coins";
import { useAppDispatch } from "redux/hooks";
import { changeError, selectDarkMode, selectError } from "redux/reducers/notificationSlice";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import { IBalanceItem, SelectBalances } from "redux/reducers/currencies";
import Button from "components/button";
import usePay, { PaymentInput } from "API/usePay";
import useMultisig from 'API/useMultisig'
import Select, { StylesConfig } from 'react-select';
import chroma from 'chroma-js';
import { Tag } from "API/useTags";
import { selectTags } from "redux/reducers/tags";
import { useContractKit, WalletTypes } from "@celo-tools/use-contractkit";

const Pay = () => {

    const { walletType } = useContractKit()
    const storage = useSelector(selectStorage)
    const selectedAccount = useSelector(SelectSelectedAccount)
    const isError = useSelector(selectError)
    const dispatch = useAppDispatch()
    const router = useNavigate();

    const balance = useSelector(SelectBalances)

    const { BatchPay, Pay } = usePay()
    const { submitTransaction } = useMultisig()

    const [index, setIndex] = useState(1)
    const [isPaying, setIsPaying] = useState(false)
    const [isSuccess, setSuccess] = useState(false)

    const [selectedType, setSelectedType] = useState(false)

    const [selectedTags, setSelectedTags] = useState<Tag[]>([])

    const tags = useSelector(selectTags)
    const dark = useSelector(selectDarkMode)

    const [amountState, setAmountState] = useState<number[]>([])
    const uniqueRef = useRef<string[]>([generate(), generate()])
    const nameRef = useRef<Array<string>>([])
    const addressRef = useRef<Array<string>>([])
    const [wallets, setWallets] = useState<DropDownItem[]>([])
    const amountRef = useRef<Array<string>>([])

    const [csvImport, setCsvImport] = useState<csvFormat[]>([]);

    const fileInput = useRef<HTMLInputElement>(null);

    const [selectedWallet, setSelectedWallet] = useState<DropDownItem>();

    const reset = () => {
        nameRef.current = []
        addressRef.current = []
        amountRef.current = []
        uniqueRef.current = []
        setWallets([])
    }

    const isPrivate = WalletTypes.PrivateKey === walletType;


    useEffect(() => {
        if (csvImport.length > 0) {
            const list = csvImport.filter(w => w.address && w.amount && w.coin)
            reset()
            let ind = 0;
            const wllt: any[] = []
            const amm: number[] = []
            for (let index = 0; index < list.length; index++) {
                const { name, address, amount, coin, amount2, coin2 } = list[index]

                uniqueRef.current.push(generate())
                uniqueRef.current.push(generate())
                nameRef.current.push((name || ""));
                addressRef.current.push((address || ""));
                amountRef.current.push((amount || ""));
                amm.push(parseFloat(amount || "0"))
                nameRef.current.push((name || ""));
                addressRef.current.push((address || ""));
                amountRef.current.push((amount2 || ""));

                amm.push(parseFloat(amount2 || "0"))

                const a = { ...Coins[coin as keyof Coins], type: Coins[coin as keyof Coins].name };
                const b = { ...Coins[coin2 as keyof Coins], type: Coins[coin2 as keyof Coins].name };
                const wallet = [a, b];
                wllt.push(...wallet)
                setAmountState(amm)

            }
            setIndex((index === 1 ? 0 : index) + list.length)
            setWallets(wllt)
            // setRefreshPage(generate())
            fileInput.current!.files = new DataTransfer().files;
        }
    }, [csvImport])


    useEffect(() => {
        if (balance && balance.CELO) {
            const coins = Object.values(balance).map((coin: IBalanceItem) => ({
                name: `${coin.amount.toFixed(3)} ${coin.coins.name}`,
                type: coin.coins.name.toString(),
                amount: coin.amount.toString(),
                coinUrl: coin.coins.coinUrl,
            }))
            const v = { name: coins[0].name.split(' ')[1], coinUrl: coins[0].coinUrl, type: coins[0].type }
            if (isPrivate) {
                const v = { name: PoofCoins.CELO_v2.name, coinUrl: PoofCoins.CELO_v2.coinUrl, type: PoofCoins.CELO_v2.type }
                setWallets([{ ...v }, { ...v }])
            } else {
                setWallets([{ ...v }, { ...v }])
            }
            setSelectedWallet(coins[0])
        }
    }, [balance])

    const Submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsPaying(true)

        try {
            const result: Array<MultipleTransactionData> = []

            const [nameList, addressList, amountList] = [nameRef.current, addressRef.current, amountRef.current]


            for (let index = 0; index < addressList.length; index++) {
                if (addressList[index] && amountList[index] && wallets[index].type) {
                    let amount = amountList[index];
                    if (selectedType) {
                        let value = (balance[wallets[index].name as keyof typeof balance]?.tokenPrice ?? 1)
                        amount = (parseFloat(amount) / value).toFixed(4)
                    }
                    result.push({
                        toAddress: addressList[index],
                        amount: amount,
                        tokenName: wallets[index].name,
                    })
                }
            }

            if (storage!.accountAddress.toLowerCase() === selectedAccount.toLowerCase()) {
                if (result.length === 1 && selectedWallet && selectedWallet.name) {
                    await Pay({ coin: (isPrivate ? PoofCoins[result[0].tokenName as keyof PoofCoins] : Coins[result[0].tokenName as keyof Coins]) as AltCoins, recipient: result[0].toAddress, amount: result[0].amount }, undefined, selectedTags)
                }
                else if (result.length > 1) {
                    const arr: Array<PaymentInput> = result.map(w => ({
                        coin: (isPrivate ? PoofCoins[result[0].tokenName as keyof PoofCoins] : Coins[result[0].tokenName as keyof Coins]) as AltCoins,
                        recipient: w.toAddress,
                        amount: w.amount,
                        from: true
                    }))

                    await BatchPay(arr, undefined, selectedTags)
                }
            } else {
                if (result.length === 1 && selectedWallet && selectedWallet.name) {
                    await submitTransaction(selectedAccount, [{ recipient: result[0].toAddress, amount: result[0].amount, coin: Coins[result[0].tokenName as keyof Coins] }])
                }
                else if (result.length > 1) {
                    const arr: Array<PaymentInput> = result.map(w => ({
                        coin: Coins[w.tokenName as keyof Coins],
                        recipient: w.toAddress,
                        amount: w.amount,
                        from: true
                    }))

                    await submitTransaction(selectedAccount, arr)
                }
            }
            setSuccess(true);
            //refetch()

        } catch (error: any) {
            console.error(error)
            dispatch(changeError({ activate: true, text: error.message }));
        }

        setIsPaying(false);
    }

    type SelectType = { value: string, label: string, color: string, transactions: string[], isDefault: boolean }

    const colourStyles: StylesConfig<SelectType, true> = {
        control: (styles) => ({ ...styles, boxShadow: 'none', border: "1px solid #1C1C1C", "&:hover": { border: "1px solid #1C1C1C", }, backgroundColor: dark ? "text-dark" : 'white' }),
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

    const onChange = (value: any) => {
        setSelectedTags(value.map((s: SelectType) => ({ color: s.color, id: s.value, name: s.label, transactions: s.transactions, isDefault: s.isDefault })));
    }

    return <div className="sm:px-32">
        <form onSubmit={Submit}>
            <div className="sm:flex flex-col items-center justify-center min-h-screen py-10">
                <div className="sm:min-w-[85vw] min-h-[75vh] h-auto ">
                    <div className="py-2 text-center w-full">
                        <div className="text-xl font-semibold">Pay Someone</div>
                    </div>
                    <div className="sm:flex flex-col gap-3 gap-y-10 sm:gap-10 py-10">
                        <div className="sm:flex flex-col pl-3 sm:pl-12 sm:pr-[20%] gap-3 gap-y-10  sm:gap-10">
                            <div className="flex flex-col space-y-5">
                                <span className="text-left text-sm font-semibold">Payment Type</span>
                                <div className="flex space-x-24">
                                    <div className="flex space-x-2 items-center">
                                        <input type="radio" className="w-4 h-4 accent-[#ff501a] cursor-pointer" name="paymentType" value="token" onChange={(e) => setSelectedType(false)} checked={!selectedType} />
                                        <label className="font-semibold text-sm">
                                            Pay with Token Amounts
                                        </label>
                                    </div>
                                    <div className="flex space-x-2 items-center">
                                        <input type="radio" className="w-4 h-4 accent-[#ff501a] cursor-pointer" name="paymentType" value="fiat" onChange={(e) => setSelectedType(true)} checked={selectedType} />
                                        <label className="font-semibold text-sm">
                                            Pay with USD-based Amounts
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-3">
                                <span className="text-left text-sm font-semibold">Tags</span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 sm:gap-x-10">
                                    {tags && tags.length > 0 && <Select
                                        closeMenuOnSelect={false}
                                        isMulti
                                        isClearable={false}
                                        options={tags.map(s => ({ value: s.id, label: s.name, color: s.color, transactions: s.transactions, isDefault: s.isDefault }))}
                                        styles={colourStyles}
                                        onChange={onChange}
                                    />}
                                    {tags.length === 0 && <div>No tag yet</div>}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex space-x-5 sm:space-x-0 sm:justify-between py-4 items-center">
                                    <span className="text-left font-semibold text-sm">Paying To</span>

                                    <input ref={fileInput} type="file" className="hidden" onChange={(e) => e.target.files!.length > 0 ? CSV.Import(e.target.files![0]).then(e => setCsvImport(e)).catch(e => console.error(e)) : null} />
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-[25%,35%,35%,5%] gap-5">
                                    {wallets.length > 0 && index ? Array(index).fill(" ").map((e, i) => {
                                        if (!uniqueRef.current[i * 2]) {
                                            uniqueRef.current[i * 2] = generate()
                                            uniqueRef.current[i * 2 + 1] = generate()
                                        }

                                        return <Input key={uniqueRef.current[i * 2]} amountState={amountState} setAmount={setAmountState} setIndex={setIndex} overallIndex={index} uniqueArr={uniqueRef.current} index={i * 2} name={nameRef.current} address={addressRef.current} amount={amountRef.current} selectedWallet={wallets} setWallet={setWallets} isBasedOnDollar={selectedType} />
                                    }) : <div><ClipLoader /></div>}
                                </div>
                            </div>
                            <div className="py-5 sm:py-0 grid grid-cols-[65%,35%] gap-16">
                                <div className="flex space-x-5">
                                    <Button version="second" className="min-w-[200px] text-left !px-6 font-semibold tracking-wide shadow-none" onClick={() => {
                                        setIndex(index + 1)
                                    }}>
                                        + Add More
                                    </Button>
                                    <Button version="second" onClick={() => {
                                        fileInput.current?.click()
                                    }} className="min-w-[200px] text-left !px-6 font-semibold tracking-wide shadow-none">
                                        Import CSV file
                                    </Button>
                                </div>
                                <span className="self-center text-lg opacity-60">Total: ${amountState.reduce((a, e, i) => {
                                    if (!wallets[i]?.type) return a;
                                    if (selectedType) return a + e;
                                    return a + e * (balance[wallets[i].name as keyof typeof balance]?.tokenPrice ?? 1);
                                }, 0).toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col space-y-3">
                                <span className="text-left">Description (Optional)</span>
                                <div className="grid grid-cols-1">
                                    <textarea placeholder="Paid 50 CELO to Ermak....." className="border-2 dark:border-darkSecond rounded-xl p-3 outline-none dark:bg-darkSecond" name="description" id="" cols={28} rows={5}></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center pt-5 sm:pt-0">
                            <div className="flex flex-col-reverse sm:grid grid-cols-2 w-[200px] sm:w-[400px] justify-center gap-5">
                                <Button version="second" onClick={() => router("/dashboard")}>Close</Button>
                                <Button type="submit" className="bg-primary px-3 py-2 text-white flex items-center justify-center rounded-lg" isLoading={isPaying}>Pay</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        {isSuccess && <Success onClose={setSuccess} onAction={() => { router("/dashboard") }} />}
        {isError && <Error onClose={(val) => dispatch(changeError({ activate: val, text: '' }))} />}
    </div>
}



export default Pay;