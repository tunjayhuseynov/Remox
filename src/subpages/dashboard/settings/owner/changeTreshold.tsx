import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Dropdown from "components/general/dropdown";
import useMultisigProcess from "hooks/useMultisigProcess";
import { changeError, changeSuccess } from "redux/reducers/notificationSlice";
import { DropDownItem } from "types";
import Button from "components/button";
import { ClipLoader } from "react-spinners";


const ChangeTreshold = ({ onDisable }: { onDisable: React.Dispatch<boolean> }) => {

    const { signAndInternal, isMultisig, owners, isLoading, changeSigns, refetch } = useMultisigProcess()

    const [sign, setSign] = useState<DropDownItem>({ name: (signAndInternal?.sign.toString() ?? "1"), address: '' })
    const [internalSign, setInternalSign] = useState<DropDownItem>({ name: (signAndInternal?.internalSigns.toString() ?? "1"), address: '' })

    const dispatch = useDispatch()

    useEffect(() => {
        if (signAndInternal?.sign) {
            setSign({ name: (signAndInternal?.sign.toString() ?? "1"), address: '' })
        }
        if (signAndInternal?.internalSigns) {
            setInternalSign({ name: (signAndInternal?.internalSigns.toString() ?? "1"), address: '' })
        }
    }, [signAndInternal])

    if (!isMultisig) return <div className="text-center">Select a MultiSig account</div>

    return owners ? <div className="-my-5 flex flex-col space-y-7">
        <div className="font-bold text-xl">Replace Owner</div>
        <div className="flex flex-col space-y-3">
            <span>Any transaction requires the confirmation of: </span>
            <div className="flex items-center gap-x-3">
                <Dropdown onSelect={setSign} className="px-3 space-x-2" nameActivation={true} list={Array(owners.length).fill('').map((s, i) => ({ name: (i + 1).toString(), address: '' }))} selected={sign} /> out of {owners.length} owners
            </div>
        </div>
        <div className="flex flex-col space-y-3">
            <span>Signatures required to change MultiSig properties: </span>
            <div className="flex items-center gap-x-3">
                <Dropdown onSelect={setInternalSign} className="px-3 space-x-2" nameActivation={true} list={Array(owners.length).fill('').map((s, i) => ({ name: (i + 1).toString(), address: '' }))} selected={internalSign} /> out of {owners.length} owners
            </div>
        </div>
        <div className="flex justify-center">
            <div className="grid grid-cols-1 gap-5 w-[30%] ">
                <Button className="!px-3 !py-2" isLoading={isLoading} onClick={async () => {
                    if (sign.name && internalSign.name) {
                        try {
                            await changeSigns(
                                parseInt(sign.name),
                                parseInt(internalSign.name),
                                !(signAndInternal?.sign === parseInt(sign.name)),
                                !(signAndInternal?.internalSigns === parseInt(internalSign.name))
                            )
                            refetch()
                            dispatch(changeSuccess({ activate: true, text: "Successfully" }))
                            onDisable(false)
                        } catch (error: any) {
                            console.error(error)
                            dispatch(changeError({ activate: true, text: error?.data?.message }))
                            onDisable(false)
                        }
                    }
                }}>
                    Save
                </Button>
            </div>
        </div>
    </div> : <div> <ClipLoader /> </div>
}

export default ChangeTreshold;