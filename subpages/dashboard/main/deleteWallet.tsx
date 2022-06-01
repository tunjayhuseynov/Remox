import { Dispatch, useState } from "react";
import { useAppDispatch } from "redux/hooks";
import Button from "components/button";

const DeleteWallet = ({ name,onDisable}: { name?: string, onDisable: React.Dispatch<boolean>}) => {
    return <div className="flex flex-col space-y-8 items-center">
        <div className="text-2xl text-primary">Are You Sure?</div>
        <div className="flex items-center justify-center text-xl">
           Your Are About Delete This Wallet.
        </div>
        <div className="flex justify-center items-center space-x-3">
            <Button version="second" className="border-2  w-[7rem] h-[3rem] !px-4 !py-0" onClick={() =>{onDisable(false)}}>No</Button>
            <Button className="  w-[7rem] h-[3rem] !px-4 !py-0"  >Yes</Button>
        </div>
    </div>
}

export default DeleteWallet;