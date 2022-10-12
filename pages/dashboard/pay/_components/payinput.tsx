import { useMemo, useState, useEffect } from "react";
import { BsFillTrashFill } from "react-icons/bs";
import Dropdown from "components/general/dropdown";
import { useWalletKit } from "hooks";
import { useDispatch } from "react-redux";
import { changeAddress, changeAmount, changeName, changeSecondAmount, changeSecondWallet, changeWallet, IPayInput, removePayInput, removeSeconField, SelectInputAmount, SelectIsBaseOnDollar } from "redux/slices/payinput";
import { useSelector } from "react-redux";
import { Autocomplete, TextField } from "@mui/material";
import { FiatMoneyList, IAddressBook } from "firebaseConfig";
import PriceInputField from "components/general/PriceInputField";
import { IPrice } from "utils/api";
import { IPaymentInputs } from "../[[...name]].page";
import { BiTrash } from "react-icons/bi";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { IoMdRemoveCircle } from "react-icons/io";
import { useAppSelector } from "redux/hooks";
import { SelectBalance } from "redux/slices/account/selector";
import { AltCoins } from "types";

interface IProps {
    addressBook: IAddressBook[],
    onChange: (amount: number | null, address: string | null, coin: AltCoins | null, fiatMoney: FiatMoneyList | null, name: string | null, amountSecond: number | null, coinSecond: AltCoins | null, fiatMoneySecond: FiatMoneyList | null) => void,
    onDelete: () => void,
    onDeleteSecond: () => void,
    input: IPaymentInputs,
    length: number,
    allowSecond: boolean,
}

const Input = ({ addressBook, onChange, input, onDelete, onDeleteSecond, length, allowSecond }: IProps) => {
    const coins = useAppSelector(SelectBalance)

    const [amount, setAmount] = useState<number | null>(input.amount)
    const [address, setAddress] = useState<string | null>(input.address)
    const [coin, setCoin] = useState<AltCoins | null>(input?.coin ?? null)
    const [fiatMoney, setFiatMoney] = useState<FiatMoneyList | null>(input.fiatMoney)
    const [name, setName] = useState<string | null>(input.name ?? null)


    const [amountSecond, setAmountSecond] = useState<number | null>(input.amount)
    const [coinSecond, setCoinSecond] = useState<AltCoins | null>(input?.second?.coin ?? null)
    const [fiatMoneySecond, setFiatMoneySecond] = useState<FiatMoneyList | null>(input.fiatMoney)

    const [isSecondOptionActive, setSecondOptionActive] = useState<boolean>(!!input.second)

    useEffect(() => {
        onChange(amount, address, coin, fiatMoney, name, amountSecond, coinSecond, fiatMoneySecond)
    }, [amount, address, coin, fiatMoney, name, amountSecond, coinSecond, fiatMoneySecond])


    return <>
        <div className="grid grid-cols-2 gap-x-10 gap-y-5 pb-2">
            <div>
                <Autocomplete
                    freeSolo
                    fullWidth
                    className='dark:bg-darkSecond bg-white'
                    options={addressBook.map(s => s.name)}
                    value={name ?? ""}
                    onInputChange={(e, v) => {
                        setName(v)
                        setAddress(addressBook.find(s => s.name === v)?.address ?? address)
                    }}
                    renderInput={(params) => <TextField
                        {...params}
                        InputProps={{ style: { fontSize: '0.875rem' } }}
                        InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                        className="text-xs" label="Receiver Name (Optional)" />}
                />
            </div>
            <div>
                <TextField
                    fullWidth
                    className='dark:bg-darkSecond bg-white'
                    label="Receiver Wallet Address"
                    value={address}
                    InputProps={{ style: { fontSize: '0.875rem' } }}
                    InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                    onChange={(e) => {
                        setAddress(e.target.value)
                    }}
                />
            </div>
            <div className="col-span-2 relative">
                <PriceInputField isMaxActive coins={coins} defaultValue={input.amount} defaultCoin={input.coin ?? undefined} onChange={(val, coin, fiatMoney) => {
                    setAmount(val)
                    setCoin('amount' in coin ? coin.coin : coin)
                    setFiatMoney(fiatMoney ?? null)
                }} />
                {length > 1 && <div className="absolute -right-6 top-5 cursor-pointer" onClick={onDelete}>
                    <BiTrash />
                </div>}
            </div>
            {allowSecond && (!isSecondOptionActive ?
                <div className="col-span-2 relative cursor-pointer grid grid-cols-[20%,80%] gap-x-1 w-[5rem]" onClick={() => setSecondOptionActive(true)}>
                    <div className="self-center">
                        <AiOutlinePlusCircle color={"#FF7348"} />
                    </div>
                    <span className="text-primary font-medium text-xs">Add</span>
                </div>
                :
                <div className="col-span-2 relative">
                    <PriceInputField isMaxActive coins={coins} defaultValue={input.second?.amount ?? null} defaultCoin={input.second?.coin ?? undefined} onChange={(val, coin, fiatMoney) => {
                        setAmountSecond(val)
                        setCoinSecond('amount' in coin ? coin.coin : coin)
                        setFiatMoneySecond(fiatMoney ?? null)
                        console.log(val)
                    }} />
                    <div className="absolute -right-6 top-5 cursor-pointer" onClick={() => {
                        onDeleteSecond()
                        setSecondOptionActive(false)
                    }}>
                        <IoMdRemoveCircle color="red" />
                    </div>
                </div>)
            }
        </div>
    </>
}
export default Input;