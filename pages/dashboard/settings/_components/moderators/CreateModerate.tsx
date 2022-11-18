import EditableAvatar from "components/general/EditableAvatar"
import { Image } from "firebaseConfig"
import { Dispatch, useId, useState } from 'react'
import { useAppDispatch, useAppSelector } from "redux/hooks"
import { SelectAccounts, SelectBlockchain } from "redux/slices/account/selector"
import TextField from '@mui/material/TextField';
import Button from "components/button"
import { Add_Moderator_Thunk } from "redux/slices/account/thunks/moderator"
import { isAddress } from "web3-utils"
import { PublicKey } from "@solana/web3.js"
import { ToastRun } from "utils/toast"
import useLoading from "hooks/useLoading"
import { nanoid } from "@reduxjs/toolkit"
import { Blockchains } from "types/blockchains"

var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const CreateModerate = ({ onDisable }: { onDisable: Dispatch<boolean> }) => {

    const dispatch = useAppDispatch()

    const accounts = useAppSelector(SelectAccounts)
    const id = nanoid()
    const [image, setImage] = useState<Image | null>(null)
    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [mail, setMail] = useState("")

    const updateImage = async (url: string, type: "image" | "nft") => {
        const image = {
            blockchain: Blockchains.find(s=>s.name === "celo")!.name,
            imageUrl: url,
            nftUrl: url,
            type,
            tokenId: null
        }
        setImage(image)
    }

    const create = async () => {
        const addresses = accounts.map(item => item.address)
        if (!isAddress(address) && !validation(address)) return ToastRun(<>Wallet address is not in the correct format</>, "error")
        if (mail && !mail.match(validRegex)) return ToastRun(<>Email address is not in the correct format</>, "error")
        if (addresses.find(s => s.toLowerCase() === address.toLowerCase())) return ToastRun(<>This address is already being used in one of your accounts</>, "error")

        await dispatch(Add_Moderator_Thunk({
            moderator: {
                id: id,
                address,
                image,
                name,
                mail
            }
        })).unwrap()
        ToastRun(<>Moderator created</>, "success")
        onDisable(false)
    }

    const [loading, Create] = useLoading(create)

    const validation = (e: string) => {
        try {
            return PublicKey.isOnCurve(new PublicKey(e ?? ""))
        } catch (error) {
            return false
        }
    }

    return <div className="px-10">
        <div className="text-2xl font-bold mb-10">Add Moderator</div>
        <div className='flex flex-col space-y-5'>
            <div className="flex justify-center">
                <EditableAvatar
                    avatarUrl={null}
                    name={"random"}
                    noNFT={true}
                    userId={id}
                    onChange={updateImage}
                    size={4.5}
                />
            </div>
            <TextField label="Name" variant="outlined" onChange={(e) => setName(e.target.value)} />
            <TextField label="Wallet address" variant="outlined" onChange={(e) => setAddress(e.target.value)} />
            <TextField label="Email address (Optional)" type={"email"} variant="outlined" onChange={(e) => setMail(e.target.value)} />
            <div className="grid grid-cols-2 gap-x-5 px-16">
                <Button version="second" type="button" onClick={() => onDisable(false)}>Close</Button>
                <Button version="main" type="button" onClick={Create} isLoading={loading}>Save</Button>
            </div>
        </div>
    </div>
}

export default CreateModerate