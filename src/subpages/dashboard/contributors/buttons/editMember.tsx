import { Dispatch, SyntheticEvent, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ClipLoader } from "react-spinners";
import { changeError, changeSuccess } from "redux/reducers/notificationSlice";
import { Coins, CoinsURL } from "types/coins";
import { DropDownItem } from "types/dropdown";
import Dropdown from "components/general/dropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "components/button";
import { DateInterval, IMember } from "API/useContributors";
import { useAppSelector } from "redux/hooks";
import { selectContributors } from "redux/reducers/contributors";
import useContributors from "hooks/useContributors";
import { selectStorage } from "redux/reducers/storage";
import { encryptMessage } from "utils/hashing";
import { useContractKit } from "@celo-tools/use-contractkit";


const EditMember = (props: IMember & { onCurrentModal: Dispatch<boolean> }) => {
    const dispatch = useDispatch()
    const { kit } = useContractKit()

    const storage = useAppSelector(selectStorage)

    const contributors = useAppSelector(selectContributors).contributors
    const { editMember, isLoading } = useContributors()
    const [member, setMember] = useState<IMember>()

    const [selectedTeam, setSelectedTeam] = useState<DropDownItem>({ name: "No Team", coinUrl: CoinsURL.None })
    const [secondActive, setSecondActive] = useState(false)

    const [startDate, setStartDate] = useState<Date>(new Date());

    const [selectedFrequency, setSelectedFrequency] = useState<DropDownItem>({ name: "Monthly", type: DateInterval.monthly })
    const [selectedWallet, setSelectedWallet] = useState<DropDownItem>({ name: Coins[props.currency].name, type: Coins[props.currency].value, value: Coins[props.currency].value, id: Coins[props.currency].value, coinUrl: Coins[props.currency].coinUrl });
    const [selectedWallet2, setSelectedWallet2] = useState<DropDownItem>({ name: Coins[props.currency].name, type: Coins[props.currency].value, value: Coins[props.currency].value, id: Coins[props.currency].value, coinUrl: Coins[props.currency].coinUrl });

    const [selectedType, setSelectedType] = useState(props.usdBase)


    useEffect(() => {
        setMember(props)
        setSecondActive(!(!props.secondaryAmount))
        if (props.interval) {
            setSelectedFrequency(props.interval === DateInterval.monthly ? { name: "Monthly", type: DateInterval.monthly } : { name: "Weekly", type: DateInterval.weekly })
        }
        if (props.paymantDate) {
            setStartDate(new Date(props.paymantDate))
        }
        if (props.secondaryCurrency) {
            setSelectedWallet2({ name: Coins[props.secondaryCurrency].name, type: Coins[props.secondaryCurrency].value, value: Coins[props.secondaryCurrency].value, id: Coins[props.secondaryCurrency].value, coinUrl: Coins[props.secondaryCurrency].coinUrl })
        }
    }, [])

    useEffect(() => {
        if (member && contributors.length > 0) {
            setSelectedTeam({ name: contributors.find(w => w.id === member.teamId)!.name, coinUrl: CoinsURL.None, id: member.teamId })
        }
    }, [member, contributors])

    const Submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { memberName, amount, address, amount2 } = e.target as HTMLFormElement;

        if (memberName && amount && address && selectedWallet && selectedTeam) {
            if (!selectedWallet.value) {
                alert("Please, choose a Celo wallet")
                return
            }
            if (!selectedTeam.id) {
                alert("Please, choose a team")
                return
            }
            const memberNameValue = (memberName as HTMLInputElement).value
            const amountValue = (amount as HTMLInputElement).value
            const addressValue = (address as HTMLInputElement).value
            const amountValue2 = (amount2 as HTMLInputElement)?.value
            if (addressValue.trim().startsWith("0x")) {
                const isAddressExist = kit.web3.utils.isAddress(addressValue.trim());
                if (!isAddressExist) throw new Error("There is not any wallet belong this address");
            }
            let newMember: IMember = {
                id: props.id,
                name: encryptMessage(memberNameValue, storage?.encryptedMessageToken),
                address: encryptMessage(addressValue.trim(), storage?.encryptedMessageToken),
                amount: encryptMessage(amountValue, storage?.encryptedMessageToken),
                currency: selectedWallet.value,
                teamId: selectedTeam.id,
                usdBase: selectedType,

                interval: selectedFrequency!.type as DateInterval,
                paymantDate: startDate!.toISOString(),
            }

            if (amountValue2 && selectedWallet2 && selectedWallet2.value) {
                newMember = {
                    ...newMember,
                    secondaryAmount: encryptMessage(amountValue2.trim(), storage?.encryptedMessageToken),
                    secondaryCurrency: selectedWallet2.value,
                    secondaryUsdBase: selectedType,
                }
            }

            try {
                await editMember(props.teamId, props.id, newMember)
                dispatch(changeSuccess({ activate: true, text: "Member updated successfully" }))
            } catch (error : any) {
                console.error(error)
                dispatch(changeError({ activate: true, text: error?.message ?? "There was an error updating the member" }))
            }

        }
    }

    return <>
        <div>
            {!isLoading && member ? <form onSubmit={Submit}>
                <div className="text-xl font-bold pb-3">
                    Personal Details
                </div>
                <div className="grid grid-cols-2 gap-y-10">
                    <div className="flex flex-col space-y-3">
                        <div className="font-bold">Name</div>
                        <div className="flex space-x-2 items-center w-3/4">
                            <input name="memberName" type="text" defaultValue={member.name} className="w-full border-2 border-black border-opacity-50 outline-none rounded-md px-3 py-2 dark:bg-darkSecond" required />
                        </div>
                    </div>
                    <div className="flex flex-col space-y-3">
                        <div className="font-bold">Team</div>
                        <div>
                            <div className="flex space-x-2 items-center w-3/4">
                                <Dropdown onSelect={setSelectedTeam} parentClass="w-full" selected={selectedTeam} list={contributors.length > 0 ? [...contributors.map(w => { return { name: w.name, coinUrl: CoinsURL.None, id: w.id } })] : []} nameActivation={true} className="border-2 rounded-md w-full" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-3 col-span-2">
                        <div className="font-bold">Wallet Address</div>
                        <div className="flex space-x-2 items-center w-full">
                            <input name="address" type="text" defaultValue={member.address} className="w-full  border border-black border-opacity-50 outline-none rounded-md px-3 py-2 dark:bg-darkSecond" required />
                        </div>
                    </div>
                    <div className="col-span-2 flex flex-col space-y-4">
                        <div className="flex space-x-24">
                            <div className="flex space-x-2 items-center">
                                <input type="radio" className="w-4 h-4 accent-[#ff501a] cursor-pointer" name="paymentType" value="token" onChange={(e) => setSelectedType(false)} checked={!selectedType} />
                                <label className="font-semibold text-sm">
                                    Token Amounts
                                </label>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <input type="radio" className="w-4 h-4 accent-[#ff501a] cursor-pointer" name="paymentType" value="fiat" onChange={(e) => setSelectedType(true)} checked={selectedType} />
                                <label className="font-semibold text-sm">
                                    USD-based Amounts
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-2 flex flex-col space-y-4 w-2/3">
                        <div className={`border text-black py-1 rounded-md grid ${selectedType ? "grid-cols-[40%,15%,45%]" : "grid-cols-[50%,50%]"}`}>
                            <input type="number" defaultValue={member.amount} name="amount" className="outline-none unvisibleArrow pl-2 dark:bg-dark dark:text-white" placeholder="Amount" required step={'any'} min={0} />
                            {selectedType && <span className="text-xs self-center opacity-70 dark:text-white">USD as</span>}
                            {!selectedWallet ? <ClipLoader /> : <Dropdown className="border-transparent text-sm dark:text-white" onSelect={setSelectedWallet} nameActivation={true} selected={selectedWallet} list={Object.values(Coins)} />}

                        </div>
                    </div>
                    {secondActive ?
                        <div className="col-span-2 flex flex-col space-y-4 w-2/3">
                            <div className={`border text-black py-1 rounded-md grid ${selectedType ? "grid-cols-[40%,15%,45%]" : "grid-cols-[50%,50%]"}`}>
                                <input type="number" defaultValue={member.secondaryAmount} name="amount2" className="outline-none unvisibleArrow pl-2 dark:bg-dark dark:text-white" placeholder="Amount" required step={'any'} min={0} />
                                {selectedType && <span className="text-xs self-center opacity-70 dark:text-white">USD as</span>}
                                {!selectedWallet ? <ClipLoader /> : <Dropdown className="border-transparent text-sm dark:text-white" onSelect={setSelectedWallet2} nameActivation={true} selected={selectedWallet2} list={Object.values(Coins)} />}

                            </div>
                        </div> : <div className="text-primary cursor-pointer" onClick={() => setSecondActive(true)}>+ Add another token</div>}
                    <div className="col-span-2 flex flex-col space-y-4 w-1/2">
                        <div className="font-bold">Payment Frequency</div>
                        <div>
                            <Dropdown onSelect={setSelectedFrequency} selected={selectedFrequency} list={[{ name: "Monthly", type: DateInterval.monthly }, { name: "Weekly", type: DateInterval.weekly }]} nameActivation={true} className="border-2 rounded-md" />
                        </div>
                    </div>
                    <div className="col-span-2 flex flex-col space-y-4 w-1/2">
                        <div className="font-bold">Payment Date</div>
                        <div className="border dark:border-darkSecond p-2 rounded-md">
                            <DatePicker className="dark:bg-dark outline-none" selected={startDate} minDate={new Date()} onChange={(date) => date ? setStartDate(date) : null} />
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-center pt-10">
                    <div className="flex justify-center">
                        <div>
                            <Button type='submit' isLoading={isLoading} className="w-full px-6 py-3">
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
                : <div className="flex justify-center"> <ClipLoader /></div>}
        </div>
    </>
}

export default EditMember;