import { useState } from 'react'
import { MdEdit } from 'react-icons/md'
import Avatar from 'components/avatar'
import Button from 'components/button'
import Modal from 'components/general/modal'
import { useSelector } from 'react-redux'
import { selectStorage } from 'redux/slices/account/storage'
import { useAppSelector } from 'redux/hooks';
import Paydropdown from "pages/dashboard/pay/_components/paydropdown";
import { useWalletKit } from 'hooks'
import useModalSideExit from 'hooks/useModalSideExit';
import WalletItem from './wallet/walletItem'
import { useForm, SubmitHandler } from "react-hook-form";
import { DropDownItem } from "types/dropdown";
import Dropdown from "components/general/dropdown";
import { SetComma } from 'utils'
import { SelectAccounts } from 'redux/slices/account/selector'
import { IAccountORM } from 'pages/api/account/index.api'

export interface IWallets {
    id: number;
    image: string | null,
    name: string;
    value: number;
    signers: {
        image: string | null;
    }[],

}[]

export interface IWalletData {
    total: number;
    wallets: IAccountORM[]
}

export interface IFormInput {
    nftAddress?: string;
    nftTokenId?: number;
    name: string;
}

const WalletSetting = () => {
    const accounts = useAppSelector(SelectAccounts)

    const walletData: IWalletData = {
        total: accounts.reduce((s, c) => s + c.totalValue, 0),
        wallets: accounts
    }

    return <div className="flex flex-col space-y-7 ">
        <div className="w-full py-6">
            <div className="text-greylish font-semibold">Total Balance</div>
            <div className="text-3xl font-semibold">${SetComma(walletData.total)}</div>
        </div>
        <div className='flex flex-col space-y-5'>
            {walletData.wallets.map((item, index) => {
                return <WalletItem item={item} key={item.id} />
            })}
        </div>

    </div>
}

export default WalletSetting