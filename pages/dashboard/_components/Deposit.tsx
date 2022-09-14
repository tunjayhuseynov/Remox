import { Avatar } from '@mui/material';
import { IAccountORM } from 'pages/api/account/index.api';
import { Dispatch } from 'react';

interface IProps {
    onDisable: Dispatch<boolean>,
    account: IAccountORM
}

const Deposit = ({ account, onDisable }: IProps) => {

    return <div>
        <div className='flex flex-col px-10'>
            <div></div>
            <div>
                <div className='border border-gray-600 bg-gray-400 flex'>
                    <div>
                        <Avatar src={account.image?.imageUrl} />
                    </div>
                    <div className='overflow-hidden'>
                        <div>{account.address}</div>
                    </div>
                    <div>

                    </div>
                    <div></div>
                </div>
            </div>
        </div>
    </div>
}


export default Deposit