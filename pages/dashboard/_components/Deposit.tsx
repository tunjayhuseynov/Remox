import { Avatar } from '@mui/material';
import { IAccountORM } from 'pages/api/account/index.api';
import { Dispatch } from 'react';
import QRCode from 'react-qr-code';
import { useAppSelector } from 'redux/hooks';
import { SelectDarkMode } from 'redux/slices/account/selector';
import { AddressReducer } from 'utils';
import { RiFileCopyLine } from 'react-icons/ri'
import { BiLinkExternal } from 'react-icons/bi';

interface IProps {
    onDisable: Dispatch<boolean>,
    account: IAccountORM
}

const Deposit = ({ account, onDisable }: IProps) => {
    const dark = useAppSelector(SelectDarkMode)

    return <div>
        <div className='flex flex-col px-10'>
            <div>
                <div style={{ padding: '16px' }}>
                    <QRCode value={account.address} bgColor={dark ? "#1C1C1C" : "#FFFFFF"} fgColor={dark ? "#FFFFFF" : "#1C1C1C"} />
                </div>
            </div>
            <div>
                <div className='border border-gray-600 bg-gray-200 dark:bg-darkSecond flex p-5 rounded-md space-x-2'>
                    <div>
                        <Avatar src={account.image?.imageUrl} />
                    </div>
                    <div className='overflow-hidden'>
                        <div>{AddressReducer(account.address)}</div>
                    </div>
                    <div>
                        <RiFileCopyLine />
                    </div>
                    <div>
                        <BiLinkExternal />
                    </div>
                </div>
            </div>
        </div>
    </div>
}


export default Deposit