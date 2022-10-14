import { useAppSelector } from 'redux/hooks';
import WalletItem from './wallet/walletItem'
import { SetComma } from 'utils'
import { SelectAccounts, SelectFiatSymbol, SelectTotalBalance } from 'redux/slices/account/selector'
import { IAccountORM } from 'pages/api/account/index.api'
import { NG } from 'utils/jsxstyle';

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
    const totalBalance = useAppSelector(SelectTotalBalance)
    const fiatSymbol = useAppSelector(SelectFiatSymbol)

    const walletData: IWalletData = {
        total: totalBalance,
        wallets: accounts
    }

    return <div className="flex flex-col space-y-7 mt-8">
        <div className='flex flex-col space-y-5 pb-10'>
            {walletData.wallets.map((item, index) => {
                return <WalletItem item={item} key={item.id} />
            })}
        </div>

    </div>
}

export default WalletSetting