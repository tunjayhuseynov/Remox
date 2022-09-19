import { Avatar } from '@mui/material';
import { IAccountORM } from 'pages/api/account/index.api';
import { Dispatch, useState } from 'react';
// import QRCode from 'react-qr-code';
import { useAppSelector } from 'redux/hooks';
import { SelectDarkMode } from 'redux/slices/account/selector';
import { AddressReducer } from 'utils';
import { RiFileCopyLine } from 'react-icons/ri'
import { BiLinkExternal } from 'react-icons/bi';
import Copied from 'components/copied';

interface IProps {
    onDisable: Dispatch<boolean>,
    account: IAccountORM
}

const Deposit = ({ account, onDisable }: IProps) => {
    const dark = useAppSelector(SelectDarkMode)

    const [tooltip, setTooltip] = useState(false);
    const [divRef, setDivRef] = useState<HTMLDivElement | null>(null)


    return <div>
        <div className='flex flex-col space-y-5'>
            <div className='text-center text-xl font-semibold'>
                Deposit
            </div>
            <div>
                <div className='flex justify-center'>
                    {/* <QRCode value={account.address} bgColor={dark ? "#1C1C1C" : "#FFFFFF"} fgColor={dark ? "#FFFFFF" : "#1C1C1C"} /> */}
                </div>
            </div>
            <div>
                <div className='border border-gray-600 bg-gray-200 dark:bg-darkSecond flex p-5 rounded-md space-x-2 w-full justify-between'>
                    <div className='flex space-x-2'>
                        <div>
                            <Avatar src={account.image?.imageUrl} />
                        </div>
                        <div className='overflow-hidden'>
                            <div>{AddressReducer(account.address)}</div>
                        </div>
                    </div>
                    <div className='flex space-x-2'>
                        <div ref={setDivRef} className={'cursor-pointer'} onClick={() => {
                            navigator.clipboard.writeText(account.address.trim())
                            setTooltip(true)
                            setTimeout(() => {
                                setTooltip(false)
                            }, 300)
                        }}>
                            <RiFileCopyLine />
                            <Copied tooltip={tooltip} triggerRef={divRef} />
                        </div>
                        <div>
                            <BiLinkExternal />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}


export default Deposit