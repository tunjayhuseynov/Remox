import { useMemo, useState } from "react";
import { BsFillTrashFill } from "react-icons/bs";
import Dropdown from "components/general/dropdown";
import { useWalletKit } from "hooks";
import { useDispatch } from "react-redux";
import { changeAddress, changeAmount, changeName, changeSecondAmount, changeSecondWallet, changeWallet, IPayInput, removePayInput, removeSeconField, SelectInputAmount, SelectIsBaseOnDollar } from "redux/slices/payinput";
import { useSelector } from "react-redux";
import { Autocomplete, TextField } from "@mui/material";
import { IAddressBook } from "firebaseConfig";
import PriceInputField from "components/general/PriceInputField";

const Input = ({ payInput, index, request = false, addressBook }: { payInput: IPayInput, index: number, request?: boolean, addressBook: IAddressBook[] }) => {
    const { GetCoins } = useWalletKit()



    return <>
        <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            <div>
                <Autocomplete
                    freeSolo
                    fullWidth
                    className='dark:bg-darkSecond bg-white'
                    options={addressBook.map(s => s.name)}
                    renderInput={(params) => <TextField {...params} label="Receiver Name (Optional)" />}
                />
            </div>
            <div>
                <TextField
                    fullWidth
                    className='dark:bg-darkSecond bg-white'
                    label="Receiver Wallet Address"
                />
            </div>
            <div className="col-span-2">
                <PriceInputField isMaxActive onChange={(val, coin, fiatMoney) => {
                    console.log(val, coin, fiatMoney)
                }} />
            </div>
        </div>
    </>
}
export default Input;