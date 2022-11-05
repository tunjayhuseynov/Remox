import * as React from 'react';
import Loader from "components/Loader";
import { useAppSelector } from '../../../redux/hooks';
import { AltCoins, TokenType } from "types/coins/index";
import AnimatedTabBar from 'components/animatedTabBar';
import { useRouter } from 'next/router';
import { styled } from '@mui/material/styles';
import { SelectSpotBalance, SelectYieldBalance, SelectSpotTotalBalance, SelectYieldTotalBalance, SelectNfts, SelectDarkMode, SelectFiatSymbol, SelectFiatPreference, SelectTotalBalance, SelectPriceCalculationFn, SelectAccounts } from 'redux/slices/account/remoxData';
import useNextSelector from 'hooks/useNextSelector';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
    AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NftContainer from './_components/nftContainer';
import { FiatMoneyList } from 'firebaseConfig';
import { IFormattedTransaction } from 'hooks/useTransactionProcess';
import { GetFiatPrice } from 'utils/const';
import { useWalletKit } from 'hooks';
import { NG } from 'utils/jsxstyle';
import AssetItem from './_components/assetItem';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Filter from '../transactions/_components/Filter';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { Checkbox } from "@mui/material";
import { useState } from 'react';


export interface INFT {
    name: string;
    text: string;
    contractAddress: string;
    imageAddress: string;
    currency?: number;
    value: string;
}

export interface INftData {
    totalBalance: number;
    nft: {
        name: string;
        text: string;
        currency: number;
        value: number;
    }[];
}


const AccordionSummary = styled((props: AccordionSummaryProps) => (
    <MuiAccordionSummary
        expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '1.1rem' }} />}
        {...props}
    />
))(({ theme }) => ({

    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {

        transform: 'rotate(180deg)',
    },
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(1),
    },
}));

const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    minHeight: '20px',

}));



const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(0),

}));


const Assets = () => {
    const dark = useNextSelector(SelectDarkMode)
    
    const spotTokens = useAppSelector(SelectSpotBalance);
    const yieldTokens = useAppSelector(SelectYieldBalance);
    const spotTotalBalance = useAppSelector(SelectSpotTotalBalance);
    const yieldTotalBalance = useAppSelector(SelectYieldTotalBalance);
    
    
    const accountsAll = useAppSelector(SelectAccounts)
    const accounts = accountsAll.map((a) => a.address)
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>(accountsAll.map(s=>s.id));
    
    const nfts = useAppSelector(SelectNfts)
    
    
    const mySpotTokens = Object.values(spotTokens(selectedAccounts) ?? {}).filter((token) => token.amount > 0);
    const myYieldTokens = Object.values(yieldTokens(selectedAccounts) ?? {}).filter((token) => token.amount > 0);

    const fiat = useAppSelector(SelectFiatPreference)
    const calculatePrice = useAppSelector(SelectPriceCalculationFn)
    const {GetCoins} = useWalletKit()
    const nftTotalPrice =  getTotalNftPrice(nfts, fiat,  Object.values(GetCoins).find((c) => c.symbol === "CELO")!)

    
    const totalBalance = useAppSelector(SelectTotalBalance)


    let totalBalances = (spotTotalBalance(selectedAccounts) + yieldTotalBalance(selectedAccounts)).toFixed(2);
    const navigate = useRouter()
    const index = (navigate.query.index as string | undefined) ? + navigate.query.index! : 0
    const [expanded, setExpanded] = React.useState<string | false>('panel1');


    const [isWalletFilterOpen, setWalletFilterOpen] = useState<boolean>(false)



    const symbol = useAppSelector(SelectFiatSymbol)



    const handleChange =
        (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
            setExpanded(newExpanded ? panel : false);
        };

    const TypeCoin = [
        {
            header: "Spot Assets",
            balance: spotTotalBalance(selectedAccounts).toFixed(2),
            tokenTypes: TokenType.YieldToken,
        },
        {
            header: "Yield Bearing Assets",
            balance: yieldTotalBalance(selectedAccounts).toFixed(2),
            tokenTypes: TokenType.YieldToken,
        }

    ]

    const assetType = [
        {
            to: "/dashboard/assets?index=0&noAnimation=true",
            text: "Tokens"
        },
        {
            to: "/dashboard/assets?index=1&noAnimation=true",
            text: "NFTs"
        }
    ]

    const nftdata: INftData = {
        totalBalance: 3453,
        nft: [
            {
                name: "Bored Rmx #31",
                text: "Bored Ape Yacht Club",
                currency: 71,
                value: 876,
            },
            {
                name: "Bored Rmx #32",
                text: "Bored Ape Yacht Club",
                currency: 42,
                value: 623,
            },
        ]

    }

    return <>
        <div>
            <div className='flex justify-between'>
                <div className="font-bold text-2xl">
                    Assets
                </div>
                <Filter xAxis={-52} isOpen={isWalletFilterOpen} setOpen={setWalletFilterOpen} title={selectedAccounts.length > 0 ?
                    <div className="rounded-md font-semimedium text-xs">
                        <div>Wallets ({selectedAccounts.length})</div>
                    </div> : "All wallets"} childWidth={12}>
                    <div className='flex flex-col'>
                        <div className='flex space-x-1 items-center'>
                            <Checkbox
                                icon={<RadioButtonUncheckedIcon />}
                                checkedIcon={<RadioButtonCheckedIcon />}
                                style={{
                                    transform: "scale(0.875)",
                                    padding: 0
                                }}
                                classes={{ colorPrimary: "!text-primary", root: "" }} checked={selectedAccounts.length === accountsAll.length} onChange={() => {
                                    setSelectedAccounts(accountsAll.map(s => s.id))
                                }} /> <span className="text-xs font-medium">All wallets</span>
                        </div>
                        {accountsAll.map((account) => {
                            return <div key={account.id} className='flex space-x-1 items-center'>
                                <Checkbox
                                    style={{
                                        transform: "scale(0.875)",
                                        padding: 0
                                    }}
                                    classes={{ colorPrimary: "!text-primary", root: "" }} checked={selectedAccounts.includes(account.id)} onChange={() => {
                                        if (selectedAccounts.includes(account.id)) {
                                            setSelectedAccounts(selectedAccounts.filter(s => s !== account.id))
                                        } else {
                                            setSelectedAccounts([...selectedAccounts, account.id])
                                        }
                                    }} />
                                <span className="text-xs font-medium">{account.name}</span>
                            </div>
                        })}
                        {accounts.length === 0 && <div className='text-sm text-gray-400'>
                            No account found
                        </div>}
                    </div>
                </Filter>
            </div>
            <div className="w-full h-full  pt-4 ">
                <div className="flex   pt-2  w-[40%] justify-between text-2xl">
                    <AnimatedTabBar data={assetType} index={index} className={'!text-2xl'} />
                </div>
                <div className="flex justify-between items-center  py-8 ">
                    <div className="font-medium text-xl">{index === 0 ? 'Token Balances' : "NFT Balances"}</div>
                    {index === 0 ? <div className="font-semibold text-xl">{(totalBalances) || (totalBalances !== undefined && parseFloat(totalBalances) === 0) ? <div className='text-xl'>{symbol}<NG number={+totalBalances} fontSize={1.25} /></div>  : <Loader />}</div> : <div className="font-bold text-xl">{symbol}<NG number={nftTotalPrice} fontSize={1.25} /></div>}
                </div>
                {index === 0 ? <div className=" pb-5 ">
                    <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')} className="w-full" sx={{ borderRadius: '5px', marginBottom: '35px' }}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1d-content" id="panel1d-header"
                            className=" hover:bg-[#f9f9f9] dark:hover:bg-darkSecond  !min-h-[0.7rem]  !pb-0 !rounded-md w-full"
                            sx={{ borderRadius: '5px', border: !dark ? '1px solid #D6D6D6' : '1px solid #3C3C3C', paddingLeft: '11px', paddingRight: '7px', paddingTop: '3px', paddingBottom: '3px !important', '.MuiAccordionSummary-content': { margin: '0px !important' } }}
                        >
                            <div className="w-full flex items-center h-10 rounded-md">
                                <div className="flex items-center justify-between  w-full ">
                                    <div className="text-sm font-semibold pl-1">{TypeCoin[0].header}</div>
                                    <div className={`text-base font-semibold`}>{symbol}<NG number={+TypeCoin[0].balance}/></div>
                                </div>
                            </div>
                        </AccordionSummary>
                        <AccordionDetails className='bg-light dark:bg-dark'>
                            <div className='bg-light dark:bg-dark pt-6 flex flex-col gap-4'>
                                <table id="header" >
                                    <thead>
                                        <tr className="grid grid-cols-[25%,35%,15%,25%] bg-[#F2F2F2] shadow-15 py-2 px-3 dark:bg-darkSecond rounded-md">
                                            <th className="text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa]">Asset</th>
                                            <th className="text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa]">Balance</th>
                                            <th className="text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa]">Price</th>
                                            <th className="text-sm text-right font-semibold text-greylish dark:text-[#aaaaaa]">Value</th>
                                        </tr>
                                    </thead>
                                </table>
                                {mySpotTokens.sort((a, b) => {
                                    const precent1 = totalBalance > 0 ? (calculatePrice(a) / totalBalance) * 100 : 0
                                    const precent2 = totalBalance > 0 ? (calculatePrice(b) / totalBalance) * 100 : 0
                                    return precent2 - precent1
                                }).map((token) => {
                                    return <AssetItem asset={token} key={token.address} />
                                })}
                            </div>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')} className="w-full" sx={{ borderRadius: '5px', marginBottom: '10px' }}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel2d-content" id="panel2d-header"
                            className="hover:bg-[#f9f9f9] dark:hover:bg-darkSecond  !min-h-[0.7rem]  !pb-0 !rounded-md w-full"
                            sx={{ borderRadius: '5px', border: !dark ? '1px solid #D6D6D6' : '1px solid #3C3C3C', paddingLeft: '11px', paddingRight: '7px', paddingTop: '3px', paddingBottom: '3px !important', '.MuiAccordionSummary-content': { margin: '0px !important' } }}
                        >
                            <div className="w-full flex items-center h-10">
                                <div className="flex items-center justify-between w-full">
                                    <div className="text-sm font-semibold pl-2 ">{TypeCoin[1].header}</div>
                                    <div className="text-sm font-medium">{symbol}<NG number={+TypeCoin[1].balance} fontSize={0.875}/></div>
                                </div>
                            </div>
                        </AccordionSummary>

                        <AccordionDetails className='bg-light dark:bg-dark'>
                            <div className='bg-light dark:bg-dark pt-6 flex flex-col gap-3'>
                                <table id="header" >
                                    <thead>
                                        <tr className="grid grid-cols-[25%,35%,15%,25%] bg-[#F2F2F2] shadow-15 py-2 px-3 dark:bg-darkSecond rounded-md">
                                            <th className="text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa]">Asset</th>
                                            <th className="text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa]">Balance</th>
                                            <th className="text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa]">Price</th>
                                            <th className="text-sm text-right font-semibold text-greylish dark:text-[#aaaaaa]">Value</th>
                                        </tr>
                                    </thead>
                                </table>
                                {myYieldTokens.sort((a, b) => {
                                    const precent1 = totalBalance > 0 ? (calculatePrice(a) / totalBalance) * 100 : 0
                                    const precent2 = totalBalance > 0 ? (calculatePrice(b) / totalBalance) * 100 : 0
                                    return precent2 - precent1
                                }).map((token) => {
                                    return <AssetItem asset={token} key={token.address} />
                                })}
                            </div>
                        </AccordionDetails>
                    </Accordion>
                </div> : 
                    <NftContainer />
                }
            </div>
        </div>
    </>
}

export default Assets;

const getTotalNftPrice = (nfts : IFormattedTransaction[] , fiat : FiatMoneyList, coin: AltCoins) => {
    return nfts.reduce((acc, curr) => {
        const rawData = curr.rawData
        const fiatPrice = GetFiatPrice(coin, fiat)

        const amount = +rawData.value * fiatPrice
        acc += amount

        return acc
    }, 0)
}
 