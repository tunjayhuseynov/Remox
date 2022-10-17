import makeBlockie from "ethereum-blockies-base64";
import { SyntheticEvent, useState } from "react";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import { AnimatePresence, motion } from "framer-motion";
import { BsImages } from 'react-icons/bs'
import { useAppSelector } from "redux/hooks";
import { SelectDarkMode } from "redux/slices/account/selector";
import { Box, Modal, TextField } from "@mui/material";
import Button from "components/button";
import { UploadImage } from "rpcHooks/useFirebase";
import useLoading from "hooks/useLoading";
import { NFTFetcher } from "utils/nft";
import { ToastRun } from "utils/toast";
import { BlockchainType } from "types/blockchains";
import Loader from "components/Loader";

interface IProps {
    avatarUrl: string | null;
    name: string;
    className?: string;
    size?: number;
    onChange?: (url: string, type: "image" | "nft") => void;
    userId?: string,
    evm?: boolean,
    noNFT?: boolean,
    blockchain?: BlockchainType,
}

const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    // border: '2px solid #000',
    boxShadow: 24,
    borderRadius: "6px",
    p: 4,
};

const EditableAvatar = ({ avatarUrl, name, className, onChange, evm = true, userId, blockchain, size, noNFT = false }: IProps) => {
    const [avatar, setAvatar] = useState(avatarUrl);
    const [modal, setModal] = useState(false);
    const [isLoading, setLoader] = useState<boolean>(false);

    const [nftModal, setNftModal] = useState(false);

    const dark = useAppSelector(SelectDarkMode)

    const uploadImage = async (e: SyntheticEvent<HTMLInputElement>) => {
        setLoader(true);
        const file = e.currentTarget.files![0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            setAvatar(reader.result as string);
            if (userId) {
                const url = await UploadImage(`${userId}/avatar`, file)
                onChange?.(url, "image")
            }
            setModal(false)
            setLoader(false);
        }
    }

    const uploadNFT = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!blockchain) return ToastRun(<>Cannot find in which blockchain you are</>, "error")
        setLoader(true);
        const { address, id } = e.target as { address?: HTMLInputElement, id?: HTMLInputElement };
        if (!address) return ToastRun(<>Please fill NFT address field</>, "error")
        if (blockchain.name !== "solana") {
            if (!id) return ToastRun(<>Please fill NFT token id field</>, "error")
        }
        let url = await NFTFetcher(blockchain, address.value, id?.value)
        if (url) {
            if (userId) {
                url = url.includes("ipfs://") ? url.replace("ipfs://", "https://ipfs.io/ipfs/") : url
                const response = await fetch(url);
                const blob = await response.blob();
                const file = new File([blob], 'image.jpg', { type: blob.type });
                const link = await UploadImage(`${userId}/avatar`, file)
                onChange?.(link, "nft")
            }
        } else {
            throw new Error("Cannot fetch NFT")
        }
        setLoader(false);
    }

    const [loading, UploadNFT] = useLoading(uploadNFT)

    return <div className="relative">
        <div className={`${className} rounded-full`} style={{
            width: (size ?? 5) + "rem",
            height: (size ?? 5) + "rem",
        }}>
            {
                isLoading ? <div className="flex items-center justify-center"><Loader /></div> : <img src={avatar ?? makeBlockie((name || "random"))} className="rounded-full object-cover aspect-square" />
            }
        </div>
        <div className="absolute right-0 bottom-0 w-[1.25rem] h-[1.25rem]">
            <div className="bg-gray-200 rounded-full flex justify-center items-center cursor-pointer w-full h-full hover:bg-gray-300" onClick={() => setModal(!modal)}>
                <AddPhotoAlternateIcon className="text-primary" style={{
                    width: "0.875rem",
                    height: "0.875rem",
                }} />
            </div>
            <div className="relative">
                <AnimatePresence>
                    {modal && <ClickAwayListener onClickAway={() => setModal(false)}>
                        <motion.div variants={variants} initial="hidden" animate="visible" exit="exit" className="z-[999] absolute right-0 bottom-0 translate-y-full translate-x-full rounded-md dark:bg-darkSecond bg-white w-48 border">
                            <div className={`grid ${noNFT ? "grid-rows-1" : "grid-rows-2"}`}>
                                <div className="border-b text-sm hover:bg-opacity-10 hover:dark:bg-opacity-10 hover:bg-gray-800 hover:dark:bg-gray-100 cursor-pointer relative">
                                    <label htmlFor="upload-photo" className="cursor-pointer flex items-center p-2"><BsImages className="float-left mr-2 w-5" /> Upload Image</label>
                                    <input id="upload-photo" type="file" accept="image/*" className="hidden z-[900] absolute w-full h-full left-0 top-0" onChange={uploadImage} />
                                </div>
                                {!noNFT && <div className="border-b text-sm hover:bg-opacity-10 hover:dark:bg-opacity-10 hover:bg-gray-800 hover:dark:bg-gray-100 cursor-pointer" onClick={() => setNftModal(true)}>
                                    <div className="cursor-pointer flex items-center p-2 space-x-2">
                                        <img className="w-5 h-5" src={dark ? "/icons/settings/nft_dark.png" : "/icons/settings/nft.png"} /> <span> Choose NFT</span>
                                    </div>
                                </div>}
                            </div>
                        </motion.div>
                    </ClickAwayListener>}
                </AnimatePresence>
            </div>
        </div>
        <Modal
            open={nftModal}
            onClose={() => setNftModal(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <div>
                    <form onSubmit={UploadNFT} className="flex flex-col space-y-6 items-center">
                        <div className="font-semibold text-xl">Choose NFT</div>
                        <div className="flex flex-col space-y-8 w-3/4">
                            <TextField label="NFT Address" variant="outlined" required={true} name="address" />
                            {evm && <TextField label="Token Id" variant="outlined" required={true} name="id" />}
                        </div>
                        <div className="w-full text-center">
                            <Button type="submit" className="w-2/5" isLoading={loading}>Save</Button>
                        </div>
                    </form>
                </div>
            </Box>
        </Modal>
    </div>
}


export default EditableAvatar