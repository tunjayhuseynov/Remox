import * as React from 'react';
import Loader from "components/Loader";
import { motion } from 'framer-motion'
import { useAppSelector } from '../../../redux/hooks';
import { AltCoins, TokenType } from "types/coins/index";
import AnimatedTabBar from 'components/animatedTabBar';
import { useRouter } from 'next/router';
import { SetComma } from 'utils';
import { styled } from '@mui/material/styles';
import { SelectSpotBalance, SelectYieldBalance, SelectSpotTotalBalance, SelectYieldTotalBalance, SelectBalance, SelectNfts, SelectDarkMode } from 'redux/slices/account/remoxData';
import useNextSelector from 'hooks/useNextSelector';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
    AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssetItem from './_components/assetItem';
import { IPriceCoin } from 'pages/api/calculation/price.api';
import NftContainer from './_components/nftContainer';

export interface INFT {
    name: string;
    text: string;
    contractAddress: string;
    imageAddress: string;
    currency?: number;
    value?: number;
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


export interface IToken {
    coins: AltCoins;
    amountUSD: number;
    amount: number;
    percent: number;
    tokenPrice: number;
    name: string;
    coinUrl: string;
    type: TokenType;
    address: string;
    color: string;
    decimals: number;
    chainID: number;
    logoURI: string;
    priceUSD: number;
    symbol: string;
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
    const mySpotTokens = Object.values(spotTokens ?? {}).filter((token) => token.amount > 0);
    const myYieldTokens = Object.values(yieldTokens ?? {}).filter((token) => token.amount > 0);
    const spotTotalBalance = useAppSelector(SelectSpotTotalBalance);
    const yieldTotalBalance = useAppSelector(SelectYieldTotalBalance);

    let totalBalance = (spotTotalBalance + yieldTotalBalance).toFixed(2);
    const balanceRedux = useAppSelector(SelectBalance)
    const navigate = useRouter()
    const index = (navigate.query.index as string | undefined) ? + navigate.query.index! : 0
    const [expanded, setExpanded] = React.useState<string | false>('panel1');


    


    
    const handleChange =
        (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
            setExpanded(newExpanded ? panel : false);
    };

    const TypeCoin = [
        {
            header: "Spot Assets",
            balance: spotTotalBalance.toFixed(2) ,
            tokenTypes: TokenType.YieldToken,
        },
        {
            header: "Yield Bearing Assets",
            balance: yieldTotalBalance.toFixed(2) ,
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

    const nftdata:INftData = {
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
            <div className="font-bold text-4xl">Assets</div>
            <div className="w-full h-full  pt-4 ">
                <div className="flex   pt-2  w-[40%] justify-between text-2xl">
                    <AnimatedTabBar data={assetType} index={index} className={'text-2xl'} />
                </div>
                <div className="flex justify-between items-center  py-8 ">
                    <div className="font-bold text-2xl">{index === 0 ? 'Token Balances' : "NFT Balances"}</div>
                    {index === 0 ? <div className="font-bold text-2xl">{(totalBalance && balanceRedux) || (totalBalance !== undefined && parseFloat(totalBalance) === 0 && balanceRedux) ? `$${totalBalance}` : <Loader />}</div> : <div className="font-bold text-2xl"></div>}
                </div>
                {index === 0 ? <div className=" pb-5 ">
                    <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')} className="w-full" sx={{ borderRadius: '5px', marginBottom: '35px' }}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1d-content" id="panel1d-header"
                            className="bg-white hover:bg-[#f9f9f9] dark:hover:bg-darkSecond  !min-h-[0.7rem]  !pb-0 !rounded-md w-full"
                            sx={{ borderRadius: '5px', border: !dark ? '1px solid #D6D6D6' : '1px solid #3C3C3C', paddingLeft: '11px', paddingRight: '7px', paddingTop: '5px', paddingBottom: '5px !important', '.MuiAccordionSummary-content': { margin: '0px !important' } }}
                        >
                            <div className="w-full flex items-center h-10 rounded-md">
                                <div className="flex items-center justify-between  w-full ">
                                    <div className="text-lg font-medium  font-sans  pl-2">{TypeCoin[0].header}</div>
                                    <div className={`text-lg font-medium  font-sans `}>${SetComma(+TypeCoin[0].balance)}</div>
                                </div>
                            </div>
                        </AccordionSummary>
                        <AccordionDetails className='bg-light dark:bg-dark'>
                            <div className='bg-light dark:bg-dark pt-6 flex flex-col gap-4'>
                                <table id="header" >
                                    <thead>
                                        <tr className="grid grid-cols-[35%,25%,20%,20%] md:grid-cols-[25%,20%,20%,30%,5%]  2xl:grid-cols-[25%,20%,20%,31%,4%]  bg-[#F2F2F2] shadow-15 py-2 px-3 dark:bg-[#2F2F2F] rounded-md">
                                            <th className="text-sm font-semibold text-greylish text-left dark:text-[#aaaaaa] sm:text-lg">Asset</th>
                                            <th className="text-sm font-semibold text-greylish text-left dark:text-[#aaaaaa] sm:text-lg">Balance</th>
                                            <th className="hidden font-semibold text-greylish  text-left dark:text-[#aaaaaa] sm:block sm:text-lg">Price</th>
                                            <th className="hidden font-semibold text-greylish  text-left dark:text-[#aaaaaa] sm:block sm:text-lg">24h</th>
                                            <th className="text-sm font-semibold text-greylish text-left dark:text-[#aaaaaa] sm:text-lg pl-2">Value</th>
                                        </tr>
                                    </thead>
                                </table>
                                    {mySpotTokens.map((token) => {
                                        return <AssetItem asset={token} key={token.address} />
                                    })}
                            </div>
                        </AccordionDetails>
                    </Accordion>


                    <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')} className="w-full" sx={{ borderRadius: '5px', marginBottom: '10px' }}>
                        <AccordionSummary
                         expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel2d-content" id="panel2d-header"
                            className="bg-white hover:bg-[#f9f9f9] dark:hover:bg-darkSecond  !min-h-[0.7rem]  !pb-0 !rounded-md w-full"
                            sx={{ borderRadius: '5px', border: !dark ? '1px solid #D6D6D6' : '1px solid #3C3C3C', paddingLeft: '11px', paddingRight: '7px', paddingTop: '5px', paddingBottom: '5px !important', '.MuiAccordionSummary-content': { margin: '0px !important' } }}
                        >
                            <div className="w-full flex items-center h-10">
                                <div className="flex items-center justify-between  w-full">
                                    <div className="text-lg font-medium  font-sans pl-2 ">{TypeCoin[1].header}</div>
                                    <div className=" text-lg font-medium  font-sans ">${SetComma(+TypeCoin[1].balance)}</div>
                                </div>
                            </div>
                        </AccordionSummary>

                        <AccordionDetails className='bg-light dark:bg-dark'>
                            <div className='bg-light dark:bg-dark pt-6 flex flex-col gap-3'>
                                <table id="header" >
                                    <thead>
                                        <tr className="grid grid-cols-[35%,25%,20%,20%] md:grid-cols-[25%,20%,20%,30%,5%]  2xl:grid-cols-[25%,20%,20%,31%,4%]  bg-[#F2F2F2] shadow-15 py-2 px-3 dark:bg-[#2F2F2F] rounded-md">
                                            <th className="text-sm font-semibold text-greylish text-left dark:text-[#aaaaaa] sm:text-lg">Asset</th>
                                            <th className="text-sm font-semibold text-greylish text-left dark:text-[#aaaaaa] sm:text-lg">Balance</th>
                                            <th className="hidden font-semibold text-greylish  text-left dark:text-[#aaaaaa] sm:block sm:text-lg">Price</th>
                                            <th className="hidden font-semibold text-greylish  text-left dark:text-[#aaaaaa] sm:block sm:text-lg">24h</th>
                                            <th className="text-sm font-semibold text-greylish text-left dark:text-[#aaaaaa] sm:text-lg pl-2">Value</th>
                                        </tr>
                                    </thead>
                                </table>
                                    {myYieldTokens.map((token) => {
                                        return <AssetItem asset={token} key={token.address} />
                                    })}
                            </div>
                        </AccordionDetails>
                    </Accordion>
                </div> :<NftContainer />}
            </div>
        </div>
    </>
}

export default Assets;

