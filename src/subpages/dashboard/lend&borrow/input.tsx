import { Dispatch, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { PoofCoins } from "../../../types/coins/celoCoins";
import { DropDownItem } from "../../../types/dropdown";
import Dropdown from "components/general/dropdown";
import { useContractKit, WalletTypes } from "@celo-tools/use-contractkit";
import { AltCoins, TokenType } from "types";
import { useWalletKit } from "hooks";


const Input = ({ selectedWallet, setWallet, amount, setAmount, customCurreny, maxAmount }: { maxAmount?: number, customCurreny: string, selectedWallet: DropDownItem[], setWallet: Dispatch<DropDownItem[]>, amount: number, setAmount: Dispatch<number> }) => {
    const { walletType } = useContractKit()
    const { GetCoins } = useWalletKit()

    useEffect(() => {
        const v = Object.values(walletType === WalletTypes.PrivateKey ? PoofCoins : GetCoins).map(w => ({ name: w.name, coinUrl: w.coinUrl })).find(s => s.name === customCurreny)!;
        setWallet([...selectedWallet, v, v])
    }, [])

    return <>
        <div className="sm:h-[2.5rem] sm:w-full md:col-span-1 border dark:border-darkSecond dark:bg-darkSecond text-black dark:text-white rounded-md grid  grid-cols-[50%,50%]">
            <input className="outline-none unvisibleArrow pl-2  dark:bg-darkSecond dark:text-white" placeholder="Amount" value={amount === -1 ? '' : amount} type="number" name={`amount__${0}`} onChange={(e) => {
                if (e.target.value === '') return setAmount(-1)
                const amnt = Number(e.target.value)
                if (amnt > (maxAmount || Number.MAX_SAFE_INTEGER)) {
                    setAmount(maxAmount || Number.MAX_SAFE_INTEGER)
                }
                else setAmount(amnt)
            }} required step={'any'} />
            {!selectedWallet ? <ClipLoader /> : <Dropdown className="border-transparent text-sm border-none" onSelect={val => {
                const wallet = [...selectedWallet];
                wallet[0] = val;
                setWallet(wallet)
            }} nameActivation={true} selected={selectedWallet[0] ?? Object.values(GetCoins).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins).filter((s: AltCoins) => s.type !== TokenType.Altcoin).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} />}
        </div>
        <div className="pt-1 text-xs col-span-2 truncate">max: {maxAmount} {selectedWallet?.[0]?.name}</div>
    </>
}
export default Input;