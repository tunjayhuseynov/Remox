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

interface IProps {
    addressBook: IAddressBook[],
    onChange: (amount: number | null, address: string | null, coin: IPrice[0], fiatMoney: FiatMoneyList | null, name: string | null, amountSecond: number | null, coinSecond: IPrice[0], fiatMoneySecond: FiatMoneyList | null) => void,
    onDelete: () => void,
    onDeleteSecond: () => void,
    input: IPaymentInputs,
    length: number,
}

const Input = ({ addressBook, onChange, input, onDelete, onDeleteSecond, length }: IProps) => {
    const [amount, setAmount] = useState<number | null>(input.amount)
    const [address, setAddress] = useState<string | null>(input.address)
    const [coin, setCoin] = useState<IPrice[0]>(input.coin)
    const [fiatMoney, setFiatMoney] = useState<FiatMoneyList | null>(input.fiatMoney)
    const [name, setName] = useState<string | null>(input.name ?? null)


    const [amountSecond, setAmountSecond] = useState<number | null>(input.amount)
    const [coinSecond, setCoinSecond] = useState<IPrice[0]>(input.coin)
    const [fiatMoneySecond, setFiatMoneySecond] = useState<FiatMoneyList | null>(input.fiatMoney)

    const [isSecondOptionActive, setSecondOptionActive] = useState<boolean>(false)

    useEffect(() => {
        onChange(amount, address, coin, fiatMoney, name, amountSecond, coinSecond, fiatMoneySecond)
    }, [amount, address, coin, fiatMoney, name])


    return <>
        <div className="grid grid-cols-2 gap-x-10 gap-y-5 py-10">
            <div>
                <Autocomplete
                    freeSolo
                    fullWidth
                    className='dark:bg-darkSecond bg-white'
                    options={addressBook.map(s => s.name)}
                    onInputChange={(e, v) => {
                        setName(v)
                    }}
                    renderInput={(params) => <TextField {...params} label="Receiver Name (Optional)" />}
                />
            </div>
            <div>
                <TextField
                    fullWidth
                    className='dark:bg-darkSecond bg-white'
                    label="Receiver Wallet Address"
                    value={address}
                    onChange={(e) => {
                        setAddress(e.target.value)
                    }}
                />
            </div>
            <div className="col-span-2 relative">
                <PriceInputField isMaxActive onChange={(val, coin, fiatMoney) => {
                    setAmount(val)
                    setCoin(coin)
                    setFiatMoney(fiatMoney ?? null)
                }} />
                {length > 1 && <div className="absolute -right-6 top-5 cursor-pointer" onClick={onDelete}>
                    <BiTrash />
                </div>}
            </div>
            {!isSecondOptionActive ?
                <div className="col-span-2 relative cursor-pointer grid grid-cols-[20%,80%] gap-x-1 w-[5rem]" onClick={() => setSecondOptionActive(true)}>
                    <div className="self-center">
                        <AiOutlinePlusCircle color={"#FF7348"} />
                    </div>
                    <span className="text-primary font-medium">Add</span>
                </div>
                :
                <div className="col-span-2 relative">
                    <PriceInputField isMaxActive onChange={(val, coin, fiatMoney) => {
                        setAmountSecond(val)
                        setCoinSecond(coin)
                        setFiatMoneySecond(fiatMoney ?? null)
                    }} />
                    <div className="absolute -right-6 top-5 cursor-pointer" onClick={() => {
                        onDeleteSecond()
                        setSecondOptionActive(false)
                    }}>
                        <BiTrash />
                    </div>
                </div>
            }
        </div>
    </>
}
export default Input;