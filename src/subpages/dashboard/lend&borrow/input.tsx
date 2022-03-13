import { Dispatch, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { AltCoins, Coins, PoofCoins, TokenType } from "../../../types/coins";
import { DropDownItem } from "../../../types/dropdown";
import Dropdown from "components/general/dropdown";
import { useContractKit, WalletTypes } from "@celo-tools/use-contractkit";


const Input = ({ selectedWallet, setWallet, amount, setAmount }: { selectedWallet: DropDownItem[], setWallet: Dispatch<DropDownItem[]>, amount: number, setAmount: Dispatch<number> }) => {
    const { walletType } = useContractKit()

    useEffect(() => {
        const v = Object.values(walletType === WalletTypes.PrivateKey ? PoofCoins : Coins).map(w => ({ name: w.name, type: w.value, coinUrl: w.coinUrl, value: w.value }))[0];
        setWallet([...selectedWallet, v, v])
    }, [])

    return <div className="sm:h-[40px] sm:w-full md:col-span-1 border dark:border-darkSecond dark:bg-darkSecond text-black dark:text-white rounded-md grid  grid-cols-[50%,50%]">
        <input className="outline-none unvisibleArrow pl-2  dark:bg-darkSecond dark:text-white" placeholder="Amount" defaultValue={amount} type="number" name={`amount__${0}`} onChange={(e) => {
            setAmount(Number(e.target.value))
        }} required step={'any'} min={0} />
        {!selectedWallet ? <ClipLoader /> : <Dropdown className="border-transparent text-sm border-none" onSelect={val => {
            const wallet = [...selectedWallet];
            wallet[0] = val;
            setWallet(wallet)
        }} nameActivation={true} selected={selectedWallet[0] ?? Object.values(walletType === WalletTypes.PrivateKey ? PoofCoins : Coins).map(w => ({ name: w.name, type: w.value, coinUrl: w.coinUrl, value: w.value }))[0]} list={Object.values(walletType === WalletTypes.PrivateKey ? PoofCoins : Coins).filter((s: AltCoins) => s.type !== TokenType.Altcoin).map(w => ({ name: w.name, type: w.value, coinUrl: w.coinUrl, value: w.value }))} />}

    </div>

}
export default Input;