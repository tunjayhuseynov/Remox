import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Dropdown from "components/general/dropdown";
import { changeError, changeSuccess } from "redux/slices/notificationSlice";
import { DropDownItem } from "types";
import Button from "components/button";
import Loader from "components/Loader";
import { useAppSelector } from "redux/hooks";
import { SelectMultisig } from "redux/slices/account/selector";
import { useRouter } from "next/router";


const ChangeTreshold = ({ onDisable }: { onDisable: React.Dispatch<boolean> }) => {

    const { address } = useRouter().query

    const multisigAccount = useAppSelector(SelectMultisig)!.all;
    const { threshold, owners } = multisigAccount.find(s => s.address === address)!

    const [sign, setSign] = useState({ name: threshold.sign })
    const [internalSign, setInternalSign] = useState({ name: threshold.internalSign })

    const dispatch = useDispatch()

    useEffect(() => {
        if (threshold.sign) {
            setSign({ name: threshold.sign })
        }
        if (threshold.internalSign) {
            setInternalSign({ name: threshold.internalSign })
        }
    }, [threshold])



    return <div className="-my-5 flex flex-col space-y-7">
        <div className="font-bold text-xl">Replace Owner</div>
        <div className="flex flex-col space-y-3">
            <span>Any transaction requires the confirmation of: </span>
            <div className="flex items-center gap-x-3">
                <Dropdown
                    label="Amount"
                    setSelect={setSign}
                    className="px-3 space-x-2"
                    list={Array(owners.length).fill('').map((s, i) => ({ name: i + 1 }))}
                    selected={sign}
                /> out of {owners.length} owners
            </div>
        </div>
        <div className="flex flex-col space-y-3">
            <span>Signatures required to change MultiSig properties: </span>
            <div className="flex items-center gap-x-3">
                <Dropdown
                    label="Amount"
                    setSelect={setInternalSign}
                    className="px-3 space-x-2"
                    list={Array(owners.length).fill('').map((s, i) => ({ name: i + 1 }))}
                    selected={internalSign}
                /> out of {owners.length} owners
            </div>
        </div>
        <div className="flex justify-center">
            <div className="grid grid-cols-1 gap-5 w-[30%] ">
                <Button className="!px-3 !py-2">
                    Save
                </Button>
            </div>
        </div>
    </div>
}

export default ChangeTreshold;