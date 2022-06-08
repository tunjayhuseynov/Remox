import React, { SyntheticEvent, useState } from "react";
import { DropDownItem } from "types/dropdown";
import Dropdown from "components/general/dropdown";
import { useAppDispatch, useAppSelector } from "redux/hooks"
import { changeSuccess, changeError, selectError } from 'redux/reducers/notificationSlice'
import DatePicker from "react-datepicker";
import Button from "components/button";
import { DateInterval, ExecutionType, IMember } from "rpcHooks/useContributors";
import { selectContributors } from "redux/reducers/contributors";
import useContributors from "hooks/useContributors";
import { v4 as uuidv4 } from 'uuid'
import { selectStorage } from "redux/reducers/storage";
import { encryptMessage } from "utils/hashing";
import { useContractKit } from "@celo-tools/use-contractkit";
import useAllowance from "rpcHooks/useAllowance";
import useGelato from "rpcHooks/useGelato";
import useCeloPay, { PaymentInput } from "rpcHooks/useCeloPay";
import { SelectBalances } from "redux/reducers/currencies";
import { ToastRun } from "utils/toast";
import { AltCoins, CoinsName, CoinsURL } from "types";
import { useWalletKit } from "hooks";
import Loader from "components/Loader";
import Paydropdown from '../../../../subpages/pay/paydropdown';
import Upload from "components/upload";

export default ({ onDisable }: { onDisable: React.Dispatch<boolean> }) => {
    const [value, setValue] = useState('Pay with Token Amounts')
    const [value2, setValue2] = useState('Full Time')
    const [value3, setValue3] = useState('Manual')
    const [value4, setValue4] = useState('')

    const { kit } = useContractKit()
    const storage = useAppSelector(selectStorage)

    const { allow, loading: allowLoading } = useAllowance()
    const { GenerateBatchPay } = useCeloPay()
    const { createTask, loading } = useGelato()
    const balance = useAppSelector(SelectBalances)
    const { GetCoins } = useWalletKit()

    const contributors = useAppSelector(selectContributors).contributors
    const { addMember, isLoading } = useContributors()
    const [file, setFile] = useState<File>()
    const [secondActive, setSecondActive] = useState(false)

    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());

    const [selectedExecution, setSelectedExecution] = useState(false)

    const [selected, setSelected] = useState<DropDownItem>(contributors.length > 0 ? { name: "Select Team", coinUrl: CoinsURL.None } : { name: "No Team", coinUrl: CoinsURL.None })
    const [selectedFrequency, setSelectedFrequency] = useState<DropDownItem>({ name: "Monthly", type: DateInterval.monthly })
    const [selectedWallet, setSelectedWallet] = useState<DropDownItem>(GetCoins[CoinsName.CELO]);
    const [selectedWallet2, setSelectedWallet2] = useState<DropDownItem>(GetCoins[CoinsName.CELO]);

    const [selectedType, setSelectedType] = useState(false)

    const dispatch = useAppDispatch()


    const Submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()

        const target = e.target as HTMLFormElement;

        const { firstName, lastName, teamName, walletAddress, amount, amount2 } = target;
        const firstNameValue = (firstName as HTMLInputElement).value
        const lastNameValue = (lastName as HTMLInputElement).value
        const compensationValue = value2
        // const teamNameValue = (teamName as HTMLInputElement)?.value
        const walletAddressValue = (walletAddress as HTMLInputElement).value
        const amountValue = (amount as HTMLInputElement).value
        const amountValue2 = (amount2 as HTMLInputElement)?.value

        if (firstNameValue && lastNameValue && walletAddressValue && amountValue && compensationValue) {
            if (!Object.values(GetCoins).includes(selectedWallet as AltCoins)) {
                ToastRun(<>Please, choose a Celo wallet</>)
                return
            }
            if (selected.name === "Select Team") {
                ToastRun(<>Please, choose a team</>)
                return
            }

            if (selectedWallet.name && selected.id) {

                try {

                    if (walletAddressValue.trim().startsWith("0x")) {
                        const isAddressExist = kit.web3.utils.isAddress(walletAddressValue.trim());
                        if (!isAddressExist) throw new Error("There is not any wallet belong this address");
                    }

                    let sent: IMember = {
                        taskId: null,
                        id: uuidv4(),
                        first: `${firstNameValue}`,
                        name: `${firstNameValue} ${lastNameValue}`,
                        last: `${lastNameValue}`,
                        address: walletAddressValue.trim(),
                        compensation: compensationValue,
                        currency: selectedWallet.name as CoinsName,
                        amount: parseFloat(amountValue.trim()).toString(),
                        teamId: selected.id,
                        usdBase: selectedType,
                        execution: value3 === "Auto" ? ExecutionType.auto : ExecutionType.manual,
                        interval: selectedFrequency!.type as DateInterval,
                        paymantDate: startDate!.toISOString(),
                        paymantEndDate: endDate!.toISOString(),
                        secondaryAmount: amountValue2 ? parseFloat(amountValue2.trim()).toString() : null,
                        secondaryCurrency: selectedWallet2?.name ? selectedWallet2.name as CoinsName : null,
                        secondaryUsdBase: amountValue2 ? selectedType : null,
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

    const paymentname = ["Pay with USD-based Amounts", "Pay with Token Amounts"]
    const paymentname2 = ["Full Time", "Part Time", "Bounty"]
    const paymentname3 = ["Manual", "Auto"]
    const paymentname4 = ["Upload Photo", "NFT"]

    return <>
        <form onSubmit={Submit}>
            <div className="flex flex-col space-y-8">
                <div className="text-2xl self-center pt-2 font-semibold ">Add People</div>
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col mb-4 space-y-1 w-full">
                        <div className=" text-left text-greylish dark:text-white">Choose Profile Photo Type</div>
                        <div className={` flex items-center gap-3 w-full`}>
                            <Paydropdown className={'!py-4'} paymentname={paymentname4} value={value4} setValue={setValue4} />
                        </div>
                    </div>
                    {value4 && <div className="flex flex-col mb-4 space-y-1 w-full">
                        <div className="text-xs text-left  dark:text-white">{value === "NFT" ? "NFT Address" : "Your Photo"} </div>
                        <div className={`  w-full border rounded-lg`}>
                            {value === "NFT" ? <input type="text" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
                        </div>
                    </div>}
                    <div className="grid grid-cols-2 gap-x-10">
                        <div>
                            <div className="text-greylish ">Name</div>
                            <input type="text" name="firstName" placeholder="First Name" className="border-2 pl-2 rounded-md outline-none py-2  w-full dark:bg-darkSecond" required />
                        </div>
                        <div>
                            <div className="text-greylish ">Surname</div>
                            <input type="text" name="lastName" placeholder="Last Name" className="border-2 pl-2 rounded-md outline-none py-2 w-full dark:bg-darkSecond" required />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-x-10">
                    <div className="flex flex-col">
                        <div className="text-greylish">Team</div>
                        <div className="w-full ">
                            <div>
                                <Dropdown onSelect={setSelected} selected={selected} list={contributors.length > 0 ? [...contributors.map(w => { return { name: w.name, coinUrl: CoinsURL.None, id: w.id } })] : []} nameActivation={true} className="!py-[0.6rem]  border-2 !rounded-md " />
                            </div>
                        </div>

                    </div>
                    <div className="flex flex-col ">
                        <div className="text-greylish">Compensation Type</div>
                        <div className=" w-full ">
                            <div>
                                <Paydropdown paymentname={paymentname2} value={value2} setValue={setValue2} className={"!py-[0.6rem]"} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col space-y-1">
                    <div className="text-greylish">Amount Type</div>
                    <div>
                        <Paydropdown setSelectedType={setSelectedType} onChangeType={setSelectedType} paymentname={paymentname} value={value} setValue={setValue} className={"!py-[0.6rem] !rounded-md "} />
                    </div>
                </div>
                <div className="flex flex-col space-y-1">
                    <div className="text-greylish">Wallet Address</div>
                    <div>
                        <input type="text" name="walletAddress" className="border-2 pl-2 rounded-md outline-none py-2 w-full dark:bg-darkSecond" placeholder="Wallet Address" required />
                    </div>
                </div>

                <div className="flex w-full gap-x-10">
                    {!selectedWallet ? <Loader /> : <Dropdown parentClass={'w-full   border-transparent text-sm dark:text-white'} className="!rounded-md !py-3" onSelect={setSelectedWallet} nameActivation={true} selected={selectedWallet} list={Object.values(GetCoins)} />}
                    <div className={`border w-full text-black py-1 rounded-md grid ${selectedType ? "grid-cols-[80%,20%]" : "grid-cols-[50%,50%]"}`}>
                        <input type="number" name="amount" className="outline-none unvisibleArrow pl-2 dark:bg-dark dark:text-white " placeholder="Amount" required step={'any'} min={0} />
                        {selectedType && <span className="text-xs self-center opacity-70 dark:text-white">USD as</span>}
                    </div>
                </div>
                {secondActive ?
                    <div className="flex gap-x-10">
                        {!selectedWallet ? <Loader /> : <Dropdown parentClass={'w-full border-transparent text-sm dark:text-white'} className="!rounded-md !py-3" onSelect={setSelectedWallet2} nameActivation={true} selected={selectedWallet2} list={Object.values(GetCoins)} />}
                        <div className={`border w-full text-black py-1 rounded-md grid ${selectedType ? "grid-cols-[80%,20%]" : "grid-cols-[50%,50%]"}`}>
                            <input type="number" name="amount2" className="outline-none unvisibleArrow pl-2 dark:bg-dark dark:text-white" placeholder="Amount" step={'any'} min={0} />
                            {selectedType && <span className="text-xs self-center opacity-70 dark:text-white ">USD as</span>}
                        </div>
                    </div> : <div className="text-primary cursor-pointer" onClick={() => setSecondActive(true)}>+ Add another token</div>}
                <div className="flex gap-x-10">
                    <div className="flex flex-col space-y-1 w-full">
                        <div className="text-greylish">Payment Type</div>
                        <div>
                            <Paydropdown setSelectedType={setSelectedExecution} selectedExecution={selectedExecution} paymentname={paymentname3} value={value3} setValue={setValue3} className={"!py-[0.6rem]"} />
                        </div>
                    </div>

                    <div className="flex flex-col space-y-1 w-full">
                        <div className="text-greylish">Payment Frequency</div>
                        <div>
                            <Dropdown onSelect={setSelectedFrequency} selected={selectedFrequency} list={[{ name: "Monthly", type: DateInterval.monthly }, { name: "Weekly", type: DateInterval.weekly }]} nameActivation={true} className="border-2 !rounded-md !py-[0.7rem]" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-x-10">
                    <div className="flex flex-col space-y-1 w-full">
                        <div className="text-greylish">Payment Start Date</div>
                        <div className="border dark:border-darkSecond p-2 rounded-md">
                            <DatePicker className="dark:bg-dark w-full outline-none" selected={startDate} minDate={new Date()} onChange={(date) => date ? setStartDate(date) : null} />
                        </div>
                    </div>
                    <div className="flex flex-col space-y-1 w-full">
                        <div className="text-greylish">Payment End Date</div>
                        <div className="border dark:border-darkSecond p-2 rounded-md">
                            <DatePicker className="dark:bg-dark w-full outline-none" selected={endDate} minDate={new Date()} onChange={(date) => date ? setEndDate(date) : null} />
                        </div>
                    </div>
                </div>
                {/* {isError && <Error onClose={(val)=>dispatch(changeError({activate: val, text: ''}))} />} */}
                <div className="grid grid-cols-2 gap-x-10 justify-center">
                    <Button type="submit" version="second" className="px-8 py-3" onClick={() => { onDisable(false) }}>
                        Close
                    </Button>
                    <Button type="submit" className="px-8 py-3" isLoading={isLoading || loading || allowLoading}>
                        Add Person
                    </Button>
                </div>
            </div>
        </form>
    </>
}
