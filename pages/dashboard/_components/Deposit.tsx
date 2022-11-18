import { Avatar } from '@mui/material';
import { IAccountORM } from 'pages/api/account/index.api';
import { Dispatch, useState } from 'react';
import QRCode from 'react-qr-code';
import { useAppSelector } from 'redux/hooks';
import { SelectBlockchain, SelectDarkMode } from 'redux/slices/account/selector';
import { RiFileCopyLine } from 'react-icons/ri'
import { BiLinkExternal } from 'react-icons/bi';
import Copied from 'components/copied';
import makeBlockie from 'ethereum-blockies-base64';
import { Blockchains } from 'types/blockchains';

interface IProps {
    onDisable: Dispatch<boolean>,
    account: IAccountORM
}

const Deposit = ({ account, onDisable }: IProps) => {
    const dark = useAppSelector(SelectDarkMode)
    const blockchain = Blockchains.find(b => b.name === account.blockchain)!

    const [tooltip, setTooltip] = useState(false);
    const [divRef, setDivRef] = useState<HTMLDivElement | null>(null)


    return <div>
        <div className='flex flex-col space-y-5'>
            <div className='text-center text-xl font-bold'>
                Deposit
            </div>
            <div>
                <div className='flex justify-center'>
                    <QRCode value={account.address} bgColor={dark ? "#1C1C1C" : "#FFFFFF"} fgColor={dark ? "#FFFFFF" : "#1C1C1C"} />
                </div>
            </div>
            <div>
                <div className='border border-gray-600 bg-gray-200 dark:bg-darkSecond grid grid-cols-[85%,1fr] gap-x-2 px-5 py-3 rounded-md w-full justify-between'>
                    <div className='flex space-x-2 items-center'>
                        <div>
                            <Avatar src={account.image?.imageUrl ?? makeBlockie(account?.name ?? "random")} />
                        </div>
                        <div className='overflow-hidden text-sm text-greylish '>
                            <div>{account.address}</div>
                        </div>
                    </div>
                    <div className='flex space-x-2 items-center'>
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
                        <div className="cursor-pointer" onClick={() => window.open(blockchain.explorerUrlAddress + account.address.trim())}>
                            <BiLinkExternal />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}


export default Deposit