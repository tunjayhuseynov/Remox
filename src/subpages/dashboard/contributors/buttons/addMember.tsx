import React, { SyntheticEvent, useEffect, useState } from "react";
import { AltCoins, Coins, CoinsName, CoinsURL } from "types/coins";
import { DropDownItem } from "types/dropdown";
import Dropdown from "components/general/dropdown";
import { ClipLoader } from "react-spinners";
import { useAppDispatch, useAppSelector } from "redux/hooks"
import { changeSuccess, changeError, selectError } from 'redux/reducers/notificationSlice'
import { useLazyGetTeamsQuery } from "redux/api/team";
import { useAddMemberMutation } from "redux/api/teamMember";
import { AddMember } from "types/sdk";
import DatePicker from "react-datepicker";
import Button from "components/button";
import "react-datepicker/dist/react-datepicker.css";
import { DateInterval, IMember } from "API/useContributors";
import { selectContributors } from "redux/reducers/contributors";
import useContributors from "hooks/useContributors";
import { v4 as uuidv4 } from 'uuid'
import { selectStorage } from "redux/reducers/storage";
import { encryptMessage } from "utils/hashing";
import { useContractKit } from "@celo-tools/use-contractkit";

const AddMemberModal = ({ onDisable }: { onDisable: React.Dispatch<boolean> }) => {
    const { kit } = useContractKit()
    const storage = useAppSelector(selectStorage)

    const contributors = useAppSelector(selectContributors).contributors
    const { addMember, isLoading } = useContributors()

    const [secondActive, setSecondActive] = useState(false)

    const [startDate, setStartDate] = useState<Date>(new Date());

    const [selected, setSelected] = useState<DropDownItem>(contributors.length > 0 ? { name: "Select Team", coinUrl: CoinsURL.None } : { name: "No Team", coinUrl: CoinsURL.None })
    const [selectedFrequency, setSelectedFrequency] = useState<DropDownItem>({ name: "Monthly", type: DateInterval.monthly })
    const [selectedWallet, setSelectedWallet] = useState<DropDownItem>(Coins[CoinsName.CELO]);
    const [selectedWallet2, setSelectedWallet2] = useState<DropDownItem>(Coins[CoinsName.CELO]);

    const [selectedType, setSelectedType] = useState(false)

    const dispatch = useAppDispatch()





    const Submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()

        const target = e.target as HTMLFormElement;

        const { firstName, lastName, teamName, walletAddress, amount, amount2 } = target;
        const firstNameValue = (firstName as HTMLInputElement).value
        const lastNameValue = (lastName as HTMLInputElement).value
        // const teamNameValue = (teamName as HTMLInputElement)?.value
        const walletAddressValue = (walletAddress as HTMLInputElement).value
        const amountValue = (amount as HTMLInputElement).value
        const amountValue2 = (amount2 as HTMLInputElement)?.value

        if (firstNameValue && lastNameValue && walletAddressValue && amountValue) {
            if (!Object.values(Coins).includes(selectedWallet as AltCoins)) {
                alert("Please, choose a wallet")
                return
            }
            if (selected === { name: "Select Team", coinUrl: CoinsURL.None }) {
                alert("Please, choose a team")
                return
            }

            if (selectedWallet.value && selected.id) {

                try {

                    const isAddressExist = kit.web3.utils.isAddress(walletAddressValue.trim());
                    if (!isAddressExist) throw new Error("There is not any wallet belong this address");
                    let sent: IMember = {
                        id: uuidv4(),
                        name: encryptMessage(`${firstNameValue} ${lastNameValue}`, storage?.encryptedMessageToken),
                        address: encryptMessage(walletAddressValue.trim(), storage?.encryptedMessageToken),
                        currency: selectedWallet.value,
                        amount: encryptMessage(parseFloat(amountValue.trim()).toString(), storage?.encryptedMessageToken),
                        teamId: selected.id,
                        usdBase: selectedType,

                        interval: selectedFrequency!.type as DateInterval,
                        paymantDate: startDate!.toISOString(),
                    }

                    if (amountValue2 && selectedWallet2.value) {
                        sent = {
                            ...sent,
                            secondaryAmount: encryptMessage(parseFloat(amountValue2.trim()).toString(), storage?.encryptedMessageToken),
                            secondaryCurrency: selectedWallet2.value,
                            secondaryUsdBase: selectedType,
                        }
                    }

                    await addMember(selected.id, sent)

                    dispatch(changeSuccess({ activate: true, text: "Member is added successfully" }))
                    onDisable(false)
                } catch (error: any) {
                    console.error(error)
                    dispatch(changeError({ activate: true, text: error.message }))
                }
            }
        }
    }

    return <>
        <form onSubmit={Submit}>
            <div className="flex flex-col space-y-8">
                <div className="flex flex-col space-y-4">
                    <div className="font-bold">Personal Details</div>
                    <div className="grid grid-cols-2 gap-x-10">
                        <div>
                            <input type="text" name="firstName" placeholder="First Name" className="border-2 pl-2 rounded-md outline-none h-[42px] w-full" required />
                        </div>
                        <div>
                            <input type="text" name="lastName" placeholder="Last Name" className="border-2 pl-2 rounded-md outline-none h-[42px] w-full" required />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col space-y-4">
                    <div className="font-bold">Choose Team</div>
                    <div className="grid grid-cols-2 w-[85%] gap-x-10">
                        <div>
                            <Dropdown onSelect={setSelected} selected={selected} list={contributors.length > 0 ? [...contributors.map(w => { return { name: w.name, coinUrl: CoinsURL.None, id: w.id } })] : []} nameActivation={true} className="border-2 rounded-md" />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col space-y-4">
                    <div className="font-bold">Wallet Address</div>
                    <div>
                        <input type="text" name="walletAddress" className="h-[42px] w-full rounded-lg border-2 pl-2 outline-none" placeholder="Wallet Address" required />
                    </div>
                </div>
                <div className="flex flex-col space-y-4">
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
                <div className="flex flex-col space-y-4 w-2/3">
                    <div className={`border text-black py-1 rounded-md grid ${selectedType ? "grid-cols-[40%,15%,45%]" : "grid-cols-[50%,50%]"}`}>
                        <input type="number" name="amount" className="outline-none unvisibleArrow pl-2" placeholder="Amount" required step={'any'} min={0} />
                        {selectedType && <span className="text-xs self-center opacity-70">USD as</span>}
                        {!selectedWallet ? <ClipLoader /> : <Dropdown className="border-transparent text-sm" onSelect={setSelectedWallet} nameActivation={true} selected={selectedWallet} list={Object.values(Coins)} />}

                    </div>
                </div>
                {secondActive ?
                    <div className="flex flex-col space-y-4 w-2/3">
                        <div className={`border text-black py-1 rounded-md grid ${selectedType ? "grid-cols-[40%,15%,45%]" : "grid-cols-[50%,50%]"}`}>
                            <input type="number" name="amount2" className="outline-none unvisibleArrow pl-2" placeholder="Amount" step={'any'} min={0} />
                            {selectedType && <span className="text-xs self-center opacity-70">USD as</span>}
                            {!selectedWallet ? <ClipLoader /> : <Dropdown className="border-transparent text-sm" onSelect={setSelectedWallet2} nameActivation={true} selected={selectedWallet2} list={Object.values(Coins)} />}

                        </div>
                    </div> : <div className="text-primary cursor-pointer" onClick={() => setSecondActive(true)}>+ Add another token</div>}
                <div className="flex flex-col space-y-4 w-1/2">
                    <div className="font-bold">Payment Frequency</div>
                    <div>
                        <Dropdown onSelect={setSelectedFrequency} selected={selectedFrequency} list={[{ name: "Monthly", type: DateInterval.monthly }, { name: "Weekly", type: DateInterval.weakly }]} nameActivation={true} className="border-2 rounded-md" />
                    </div>
                </div>
                <div className="flex flex-col space-y-4 w-1/2">
                    <div className="font-bold">Payment Date</div>
                    <div className="border-2 p-2 rounded-md">
                        <DatePicker selected={startDate} minDate={new Date()} onChange={(date) => date ? setStartDate(date) : null} />
                    </div>
                </div>
                {/* {isError && <Error onClose={(val)=>dispatch(changeError({activate: val, text: ''}))} />} */}
                <div className="flex justify-center">
                    <Button type="submit" className="px-8 py-3" isLoading={isLoading}>
                        Add Person
                    </Button>
                </div>
            </div>
        </form>
    </>
}

export default AddMemberModal;