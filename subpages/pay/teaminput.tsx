import { Dispatch, useEffect, useState } from "react";
import { DropDownItem } from "../../types/dropdown";
import Dropdown from "components/general/dropdown";
import { CoinsName } from "../../types";
import { IMember } from "apiHooks/useContributors";
import { IRequest } from "apiHooks/useRequest";
import { useWalletKit } from "hooks";
import Loader from "components/Loader";


const TeamInput = (props: (IMember | IRequest) & { index: number, selectedId: string[], setSelectedId: Dispatch<string[]>, members: Array<(IMember | IRequest) & { selected: boolean }>, setMembers: Dispatch<Array<(IMember | IRequest) & { selected: boolean }>> }) => {
    const { GetCoins } = useWalletKit()
    const [selectedWallet, setSelectedWallet] = useState<DropDownItem>({ name: GetCoins[props.currency].name, coinUrl: GetCoins[props.currency].coinUrl })
    const [selectedWallet2, setSelectedWallet2] = useState<DropDownItem>()

    useEffect(() => {
        if (props.secondaryCurrency) {
            setSelectedWallet2({ name: GetCoins[props.secondaryCurrency].name, coinUrl: GetCoins[props.secondaryCurrency].coinUrl })
        }
    }, [])

    useEffect(() => {
        if (selectedWallet && selectedWallet.name) {
            updateValue({ val: '', wallet: true })
        }
    }, [selectedWallet])

    useEffect(() => {
        if (selectedWallet2 && selectedWallet2.name) {
            updateValue({ val: '', wallet: true, is2: true })
        }
    }, [selectedWallet2])

    const updateValue = ({ val, wallet = false, is2 = false, customWallet }: { val: string, wallet?: boolean, is2?: boolean, customWallet?: CoinsName }) => {
        const arr = [...props.members]
        const newArr = arr.reduce<Array<(IMember | IRequest) & { selected: boolean }>>((a, e) => {
            if (e.id !== props.id) a.push(e)
            else {
                let newItem;
                if (wallet && is2) {
                    if (customWallet) {
                        newItem = { ...e, secondaryCurrency: customWallet }
                    } else {
                        newItem = { ...e, secondaryCurrency: (selectedWallet2!.name! as CoinsName) }
                    }
                }
                else if (!wallet && is2) {
                    newItem = { ...e, secondaryAmount: val }
                }
                else if (wallet) {
                    if (customWallet) {
                        newItem = { ...e, currency: customWallet }
                    } else {
                        newItem = { ...e, currency: (selectedWallet.name! as CoinsName) }
                    }
                } else {
                    newItem = { ...e, amount: val }
                }
                a.push(newItem)
            }
            return a;
        }, [])
        props.setMembers(newArr)
    }

    const updateTick = ({ tick }: { tick: boolean }) => {
        if (!tick) {
            props.setSelectedId(props.selectedId.filter(w => w !== props.id))
        } else {
            props.setSelectedId([...props.selectedId, props.id])
        }
    }

    return <>
        <div className="flex items-center">
            <input checked={props.selectedId.some(w => w === props.id)} className="relative cursor-pointer w-[1.25rem] h-[1.25rem] checked:before:absolute checked:before:w-full checked:before:h-full dark:text-white checked:before:bg-primary checked:before:block dark:bg-darkSecond" type="checkbox" onChange={(e) => {
                updateTick({ tick: e.target.checked })
            }} />
            <h2 className={`text-black px-3 py-1 name__${props.index} text-sm dark:text-white`}>{props.name}</h2>
        </div>
        <div className="flex items-center">
            <h2 className={`text-black py-1 rounded-md address__${props.index} text-sm truncate dark:text-white`}>{props.address}</h2>
        </div>
        {/* <div className="col-span-2 sm:col-span-1 flex border border-greylish rounded-md border-opacity-60">
            <input className="text-black py-1 outline-none ml-2 rounded-md w-full font-bold unvisibleArrow" placeholder="Amount" defaultValue={props.amount} type="number" name={`amount__${props.index}`} min="0" required step={'any'} onBlur={d => props.setSelectedId([...props.selectedId])} onChange={e => updateValue({ val: e.target.value })} />
            {!selectedWallet ? <ClipLoader /> : <Dropdown className="border-transparent text-sm" onSelect={setSelectedWallet} nameActivation={true} selected={selectedWallet} list={Object.values(Coins).map(w => ({ name: w.name, type: w.value, coinUrl: w.coinUrl, value: w.value }))} />}
        </div> */}
        <div className={`col-span-2 sm:col-span-1 border dark:bg-darkSecond dark:border-darkSecond text-black py-1 rounded-md grid ${props.usdBase ? "grid-cols-[40%,15%,45%]" : "grid-cols-[50%,50%]"}`}>
            <input className="outline-none unvisibleArrow pl-2 dark:bg-darkSecond dark:text-white" placeholder="Amount" defaultValue={props.amount} type="number" name={`amount__${props.index}`} onChange={(e) => {
                updateValue({ val: e.target.value })
            }} required step={'any'} min={0} />
            {props.usdBase && <span className="text-xs self-center opacity-70 dark:text-white">USD as</span>}
            {!selectedWallet ? <Loader /> : <Dropdown className="border-transparent text-sm dark:text-white" onSelect={setSelectedWallet} nameActivation={true} selected={selectedWallet} list={Object.values(GetCoins).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} />}
        </div>
        <div className="hidden sm:block"></div>
        <div></div>
        <div></div>
        {props.secondaryCurrency && props.secondaryAmount && selectedWallet2 ? <div className={`col-span-2 sm:col-span-1 border dark:bg-darkSecond dark:border-darkSecond text-black py-1 rounded-md grid ${props.usdBase ? "grid-cols-[40%,15%,45%]" : "grid-cols-[50%,50%]"}`}>
            <input className="outline-none unvisibleArrow pl-2 dark:bg-darkSecond dark:text-white" placeholder="Amount" defaultValue={props.secondaryAmount} type="number" name={`amount__${props.index}`} onChange={(e) => {
                updateValue({ val: e.target.value, wallet: false, is2: true })
            }} step={'any'} min={0} />
            {props.usdBase && <span className="text-xs self-center opacity-70 dark:text-white">USD as</span>}
            {!selectedWallet ? <Loader /> : <Dropdown className="border-transparent text-sm dark:text-white" onSelect={setSelectedWallet2} nameActivation={true} selected={selectedWallet2} list={Object.values(GetCoins).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} />}
        </div> : <div className="text-primary cursor-pointer text-sm" onClick={() => {
            setSelectedWallet2({ name: GetCoins[CoinsName.CELO].name, coinUrl: GetCoins[CoinsName.CELO].coinUrl })
            updateValue({ val: '', wallet: true, is2: true, customWallet: CoinsName.CELO })
        }}> <span className="bg-greylish bg-opacity-5 font-semibold tracking-wide py-3 px-5 text-center rounded-xl">+ Add another token</span></div>}
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </>
}
export default TeamInput;