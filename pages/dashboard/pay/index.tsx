import { useState, useRef, useEffect, SyntheticEvent, Fragment } from "react";
import shortid, { generate } from 'shortid'
import Success from "components/general/success";
import Error from "components/general/error";
import { MultipleTransactionData } from "types/sdk";
import CSV, { csvFormat } from 'utils/CSV'
import { useSelector } from "react-redux";
import { selectStorage } from "redux/reducers/storage";
import Input from "subpages/pay/payinput";
import { useAppDispatch } from "redux/hooks";
import { changeError, selectDarkMode, selectError } from "redux/reducers/notificationSlice";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import { IBalanceItem, SelectBalances } from "redux/reducers/currencies";
import Button from "components/button";
import { PaymentInput } from "apiHooks/useCeloPay";
import useMultisig from 'hooks/walletSDK/useMultisig'
import Select, { StylesConfig } from 'react-select';
import chroma from 'chroma-js';
import { Tag } from "apiHooks/useTags";
import { selectTags } from "redux/reducers/tags";
import { AltCoins, Coins } from "types";
import { useWalletKit } from "hooks";
import { useRouter } from "next/router";
import { addPayInput, changeBasedValue, IPayInput, resetPayInput, SelectInputs } from "redux/reducers/payinput";

const Pay = () => {

    const storage = useSelector(selectStorage)
    const selectedAccount = useSelector(SelectSelectedAccount)
    const isError = useSelector(selectError)
    const MyInputs = useSelector(SelectInputs)


    const dispatch = useAppDispatch()
    const router = useRouter();
    const { GetCoins, blockchain, SendTransaction, SendBatchTransaction } = useWalletKit()

    const balance = useSelector(SelectBalances)

    const { submitTransaction } = useMultisig()

    const [isPaying, setIsPaying] = useState(false)
    const [isSuccess, setSuccess] = useState(false)

    const [selectedType, setSelectedType] = useState(false)
    const [selectedTags, setSelectedTags] = useState<Tag[]>([])

    const tags = useSelector(selectTags)
    const dark = useSelector(selectDarkMode)

    const [csvImport, setCsvImport] = useState<csvFormat[]>([]);

    const fileInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return ()=> {
            dispatch(resetPayInput())
        }
    }, [])


    useEffect(() => {
        if (csvImport.length > 0 && GetCoins) {
            const list = csvImport.filter(w => w.address && w.amount && w.coin)
            for (let index = 0; index < list.length; index++) {
                const { name, address, amount, coin, amount2, coin2 } = list[index]

                let newInput: IPayInput = {
                    index: generate(),
                    name,
                    address,
                    amount: parseFloat(amount || "0"),
                    wallet: GetCoins[coin as keyof Coins],
                }

                if (amount2) newInput.amount2 = parseFloat(amount2)
                if (coin2) newInput.wallet2 = GetCoins[coin2 as keyof Coins]
                dispatch(addPayInput(newInput))
            }
            // setRefreshPage(generate())
            fileInput.current!.files = new DataTransfer().files;
        }
    }, [csvImport])



    const Submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsPaying(true)

        try {
            const result: Array<MultipleTransactionData> = []

            for (let index = 0; index < MyInputs.length; index++) {
                const one = MyInputs[index]
                if (one.address && one.amount && one.wallet?.name) {
                    let amount = one.amount;
                    if (selectedType) {
                        let value = (balance[one.wallet.name as keyof typeof balance]?.tokenPrice ?? 1)
                        amount = amount / value
                    }
                    result.push({
                        toAddress: one.address,
                        amount: amount.toFixed(4),
                        tokenName: one.wallet.name,
                    })
                }
            }
            if (!GetCoins) return
            if (storage?.accountAddress.toLowerCase() === selectedAccount.toLowerCase()) {
                if (result.length === 1) {
                    // await Pay({ coin: (isPrivate ? PoofCoins[result[0].tokenName as keyof PoofCoins] : CeloCoins[result[0].tokenName as keyof Coins]) as AltCoins, recipient: result[0].toAddress, amount: result[0].amount }, undefined, selectedTags)
                    await SendTransaction({ coin: GetCoins[result[0].tokenName as keyof Coins] as AltCoins, recipient: result[0].toAddress, amount: result[0].amount }, undefined, selectedTags)
                }
                else if (result.length > 1) {
                    const arr: Array<PaymentInput> = result.map(w => ({
                        coin: (GetCoins[w.tokenName as keyof Coins]) as AltCoins,
                        recipient: w.toAddress,
                        amount: w.amount,
                        from: true
                    }))

                    // await BatchPay(arr, undefined, selectedTags)
                    await SendBatchTransaction(arr, undefined, selectedTags)
                }
            } else {
                if (result.length === 1) {
                    await submitTransaction(selectedAccount, [{ recipient: result[0].toAddress, amount: result[0].amount, coin: GetCoins[result[0].tokenName as keyof Coins] }])
                }
                else if (result.length > 1) {
                    const arr: Array<PaymentInput> = result.map(w => ({
                        coin: GetCoins[w.tokenName as keyof Coins],
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

    const onChangeType = (value: boolean) => {
        setSelectedType(value)
        dispatch(changeBasedValue(value))
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
                                        <input type="radio" className="w-4 h-4 accent-[#ff501a] cursor-pointer peer" name="paymentType" value="token" onChange={(e) => onChangeType(false)} checked={!selectedType} />
                                        <label className="font-semibold text-sm peer-checked:text-primary">
                                            Pay with Token Amounts
                                        </label>
                                    </div>
                                    <div className="flex space-x-2 items-center">
                                        <input type="radio" className="w-4 h-4 accent-[#ff501a] cursor-pointer peer" name="paymentType" value="fiat" onChange={(e) => onChangeType(true)} checked={selectedType} />
                                        <label className="font-semibold text-sm peer-checked:text-primary">
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
                                    {MyInputs.map((e, i) => {
                                        return <Input key={e.index} incomingIndex={e.index} />
                                    })
                                    }
                                </div>
                            </div>
                            <div className="py-5 sm:py-0 grid grid-cols-[65%,35%] gap-16">
                                <div className="flex space-x-5">
                                    <Button version="second" className="min-w-[12.5rem] text-left !px-6 font-semibold tracking-wide shadow-none" onClick={() => {
                                        dispatch(addPayInput({
                                            index: shortid()
                                        }))
                                    }}>
                                        + Add More
                                    </Button>
                                    <Button version="second" onClick={() => {
                                        fileInput.current?.click()
                                    }} className="min-w-[12.5rem] text-left !px-6 font-semibold tracking-wide shadow-none">
                                        Import CSV file
                                    </Button>
                                </div>
                                <span className="self-center text-lg opacity-60">Total: ${MyInputs.reduce((a, e, i) => {
                                    if (!e.wallet?.name) return a;
                                    if (selectedType) return a + (e.amount ?? 0) + (e.amount2 ?? 0);
                                    return a + ((e.amount ?? 0) * (balance[e.wallet?.name as keyof typeof balance]?.tokenPrice ?? 1)) + ((e.amount2 ?? 0) * (balance[e.wallet2?.name as keyof typeof balance]?.tokenPrice ?? 1));
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
                            <div className="flex flex-col-reverse sm:grid grid-cols-2 w-[12.5rem] sm:w-[25rem] justify-center gap-5">
                                <Button version="second" onClick={() => router.push("/dashboard")}>Close</Button>
                                <Button type="submit" className="bg-primary px-3 py-2 text-white flex items-center justify-center rounded-lg" isLoading={isPaying}>Pay</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        {isSuccess && <Success onClose={setSuccess} onAction={() => { router.push("/dashboard") }} />}
        {isError && <Error onClose={(val) => dispatch(changeError({ activate: val, text: '' }))} />}
    </div>
}

Pay.disableLayout = true;

export default Pay;