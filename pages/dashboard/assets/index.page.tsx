import * as React from 'react';
import Loader from "components/Loader";
import { motion } from 'framer-motion'
import { useAppSelector } from '../../../redux/hooks';
import { TokenType } from "types/coins/index";
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
import Typography from '@mui/material/Typography';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssetItem from './_components/assetItem';


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

// const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
//     padding: theme.spacing(2),
//     borderTop: '1px solid rgba(0, 0, 0, .125)',
// }));

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

    let totalBalance = (spotTotalBalance + yieldTotalBalance).toFixed(2);
    const balanceRedux = useAppSelector(SelectBalance)
    const navigate = useRouter()
    const index = (navigate.query.index as string | undefined) ? + navigate.query.index! : 0
    const [expanded, setExpanded] = React.useState<string | false>('panel1');
    const nfts = useAppSelector(SelectNfts);
    console.log(nfts)

    
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
            {
                name: "Bored Rmx #33",
                text: "Bored Ape Yacht Club",
                currency: 37,
                value: 945,
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
                    {index === 0 ? <div className="font-bold text-2xl">{(totalBalance && balanceRedux) || (totalBalance !== undefined && parseFloat(totalBalance) === 0 && balanceRedux) ? `$${totalBalance}` : <Loader />}</div> : <div className="font-bold text-2xl">${SetComma(nftdata.totalBalance)}</div>}
                </div>
                {index === 0 ? <div className=" pb-5 ">
                    <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')} className="w-full" sx={{ borderRadius: '5px', marginBottom: '35px' }}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1d-content" id="panel1d-header"
                            className="bg-white hover:bg-[#f9f9f9] dark:hover:bg-darkSecond  !min-h-[0.7rem]  !pb-0 !rounded-md w-full"
                            sx={{ borderRadius: '5px', border: !dark ? '1px solid #D6D6D6' : '1px solid #3C3C3C', paddingLeft: '11px', paddingRight: '7px', paddingTop: '5px', paddingBottom: '5px !important', '.MuiAccordionSummary-content': { margin: '0px !important' } }}
                        >
                            <Typography className="w-full flex items-center h-10 rounded-md">
                                <div className="flex items-center justify-between  w-full ">
                                    <div className="text-lg font-medium  font-sans  pl-2">{TypeCoin[0].header}</div>
                                    <div className={`text-lg font-medium  font-sans `}>${SetComma(+TypeCoin[0].balance)}</div>
                                </div></Typography>
                        </AccordionSummary>
                        <AccordionDetails className='bg-light dark:bg-dark'>
                            <Typography className='bg-light dark:bg-dark pt-6 flex flex-col gap-4'>
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
                                    <tbody>
                                        
                                    </tbody>
                                </table>
                                <div className=' py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond  rounded-md border-opacity-10 hover:bg-greylish hover:bg-opacity-5 hover:transition-all w-full px-3'>
                                    <div className="grid grid-cols-[35%,25%,20%,20%] md:grid-cols-[25%,20%,20%,23%,12%]  xl:grid-cols-[25%,20%,20%,29%,6%] ">
                                        <div className="flex space-x-3 items-center">
                                            <div><img src={`/icons/currencies/celo.png`} width={20} height={20} alt="" className="rounded-full" /></div>
                                            <div className="font-medium text-lg">{'CELO'}</div>
                                        </div>
                                        <div className={`font-medium text-lg`} >
                                            {SetComma(600000)}
                                        </div>
                                        <div className="hidden sm:block font-medium text-lg" >
                                            ${1}
                                        </div>
                                        <div className="hidden sm:block font-medium text-lg" >
                                            {-3}%
                                        </div>
                                        <div className="font-medium text-lg  text-right" >
                                            ${SetComma(600000)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[95.5%,4.5%] items-center pt-2 pb-8 ">
                                        <div className="bg-greylish bg-opacity-10 dark:bg-dark rounded-2xl relative my-3 h-3">
                                            <motion.div className='h-full bg-primary rounded-2xl' animate={{ width: ((37.7) + '%') }} transition={{ ease: "easeOut", duration: 2 }}></motion.div>
                                        </div>
                                        <div className="text-right font-semibold"> {37.7}%</div>
                                    </div>
                                </div>
                                <div className=" py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond  rounded-md border-opacity-10 hover:bg-greylish hover:bg-opacity-5 hover:transition-all w-full px-3">
                                    <div className="grid grid-cols-[35%,25%,20%,20%] md:grid-cols-[25%,20%,20%,27%,8%] xl:grid-cols-[25%,20%,20%,29%,6%] ">
                                        <div className="flex space-x-3 items-center">
                                            <div><img src={`/icons/currencies/celodollar.svg`} width={20} height={20} alt="" className="rounded-full" /></div>
                                            <div className="font-medium text-lg">{'cUSD'}</div>
                                        </div>
                                        <div className={`font-medium text-lg `} >
                                            {SetComma(610000)}
                                        </div>
                                        <div className="hidden sm:block font-medium text-lg" >
                                            ${1}
                                        </div>
                                        <div className="hidden sm:block font-medium text-lg" >
                                            {0.3}%
                                        </div>
                                        <div className="font-medium text-lg  text-right" >
                                            ${SetComma(610000)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[95.5%,4.5%] items-center pt-2 pb-8 ">
                                        <div className="bg-greylish bg-opacity-10 dark:bg-dark rounded-2xl relative my-3 h-3 ">
                                            <motion.div className='h-full bg-primary rounded-2xl' animate={{ width: ((38.3) + '%') }} transition={{ ease: "easeOut", duration: 2 }}></motion.div>
                                        </div>
                                        <div className="text-right font-semibold"> {38.3}%</div>
                                    </div>
                                </div>
                                <div className=" py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond  rounded-md border-opacity-10 hover:bg-greylish hover:bg-opacity-5 hover:transition-all w-full px-3">
                                    <div className="grid grid-cols-[35%,25%,20%,20%] md:grid-cols-[25%,20%,20%,27%,8%]  xl:grid-cols-[25%,20%,20%,29%,6%] ">
                                        <div className="flex space-x-3 items-center">
                                            <div><img src={`/icons/currencies/celoeuro.png`} width={20} height={20} alt="" className="rounded-full" /></div>
                                            <div className="font-medium text-lg ">{'cEUR'}</div>
                                        </div>
                                        <div className={`font-medium text-lg  `} >
                                            {SetComma(235000)}
                                        </div>
                                        <div className="hidden sm:block font-medium text-lg " >
                                            ${1.02}
                                        </div>
                                        <div className="hidden sm:block font-medium text-lg " >
                                            {1}%
                                        </div>
                                        <div className="font-medium text-lg text-right" >
                                            ${SetComma(239700)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[95.5%,4.5%] items-center pt-2 pb-8 ">
                                        <div className="bg-greylish bg-opacity-10 dark:bg-dark rounded-2xl relative my-3  h-3">
                                            <motion.div className='h-full bg-primary rounded-2xl' animate={{ width: ((14.7) + '%') }} transition={{ ease: "easeOut", duration: 2 }}></motion.div>
                                        </div>
                                        <div className="text-right font-semibold"> {14.7}%</div>
                                    </div>
                                </div>
                                <div className=" py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond  rounded-md border-opacity-10 hover:bg-greylish hover:bg-opacity-5 hover:transition-all w-full px-3">
                                    <div className="grid grid-cols-[35%,25%,20%,20%] md:grid-cols-[25%,20%,20%,27%,8%]  xl:grid-cols-[25%,20%,20%,29%,6%] ">
                                        <div className="flex space-x-3 items-center">
                                            <div><img src={`/icons/currencies/moola.png`} width={20} height={20} alt="" className="rounded-full" /></div>
                                            <div className="font-medium text-lg ">{'MOO'}</div>
                                        </div>
                                        <div className={`font-medium text-lg  `} >
                                            {SetComma(595238)}
                                        </div>
                                        <div className="hidden sm:block font-medium text-lg " >
                                            ${0.007}
                                        </div>
                                        <div className="hidden sm:block font-medium text-lg " >
                                            {-10}%
                                        </div>
                                        <div className="font-medium text-lg text-right" >
                                            ${SetComma(4165)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[95.5%,4.5%] items-center pt-2 pb-8">
                                        <div className="bg-greylish bg-opacity-10 dark:bg-dark rounded-2xl relative my-3 h-3 ">
                                            <motion.div className='h-full bg-primary rounded-2xl' animate={{ width: ((0.2) + '%') }} transition={{ ease: "easeOut", duration: 2 }}></motion.div>
                                        </div>
                                        <div className="text-right font-semibold"> {0.2}%</div>
                                    </div>
                                </div>

                            </Typography>
                        </AccordionDetails>
                    </Accordion>


                    <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')} className="w-full" sx={{ borderRadius: '5px', marginBottom: '10px' }}>
                        <AccordionSummary
                         expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel2d-content" id="panel2d-header"
                            className="bg-white hover:bg-[#f9f9f9] dark:hover:bg-darkSecond  !min-h-[0.7rem]  !pb-0 !rounded-md w-full"
                            sx={{ borderRadius: '5px', border: !dark ? '1px solid #D6D6D6' : '1px solid #3C3C3C', paddingLeft: '11px', paddingRight: '7px', paddingTop: '5px', paddingBottom: '5px !important', '.MuiAccordionSummary-content': { margin: '0px !important' } }}
                        >
                            <Typography className="w-full flex items-center h-10">
                                <div className="flex items-center justify-between  w-full">
                                    <div className="text-lg font-medium  font-sans pl-2 ">{TypeCoin[1].header}</div>
                                    <div className=" text-lg font-medium  font-sans ">${SetComma(+TypeCoin[1].balance)}</div>
                                </div></Typography>
                        </AccordionSummary>

                        <AccordionDetails className='bg-light dark:bg-dark'>
                            <Typography className='bg-light dark:bg-dark pt-6 flex flex-col gap-3'>
                                <div id="header" className="grid grid-cols-[35%,25%,20%,20%] md:grid-cols-[25%,20%,20%,30%,5%]  2xl:grid-cols-[25%,20%,20%,31%,4%]  bg-[#F2F2F2] shadow-15 py-2 px-3  dark:bg-[#2F2F2F] rounded-md">
                                    <div className="text-sm font-semibold text-greylish dark:text-[#aaaaaa] sm:text-lg">Asset</div>
                                    <div className="text-sm font-semibold text-greylish dark:text-[#aaaaaa] sm:text-lg">Balance</div>
                                    <div className="hidden font-semibold text-greylish dark:text-[#aaaaaa] sm:block sm:text-lg">Price</div>
                                    <div className="hidden font-semibold text-greylish dark:text-[#aaaaaa] sm:block sm:text-lg">24h</div>
                                    <div className="text-sm font-semibold text-greylish dark:text-[#aaaaaa] sm:text-lg pl-2">Value</div>
                                </div>
                                <div className=" py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond rounded-md border-opacity-10 hover:bg-greylish hover:bg-opacity-5 hover:transition-all w-full px-3">
                                    <div className="grid grid-cols-[35%,25%,20%,20%] md:grid-cols-[25%,20%,20%,27%,8%]  2xl:grid-cols-[25%,20%,20%,29%,6%] ">
                                        <div className="flex space-x-3 items-center">
                                            <div><img src={`/icons/currencies/mcUSD.png`} width={20} height={20} alt="" className="rounded-full" /></div>
                                            <div className="font-medium text-lg">{'mcUSD'}</div>
                                        </div>
                                        <div className={`font-medium text-lg `} >
                                            {SetComma(50000)}
                                        </div>
                                        <div className="hidden sm:block font-medium text-lg" >
                                            ${1}
                                        </div>
                                        <div className="hidden sm:block font-medium text-lg" >
                                            {0.2}%
                                        </div>
                                        <div className="font-medium text-lg flex  xl:block text-right" >
                                            ${SetComma(50000)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[95.5%,4.5%] items-center pt-2 pb-8 ">
                                        <div className="bg-greylish bg-opacity-10 dark:bg-dark rounded-2xl relative my-3 h-3 ">
                                            <motion.div className='h-full bg-primary rounded-2xl' animate={{ width: ((3.14) + '%') }} transition={{ ease: "easeOut", duration: 2 }}></motion.div>
                                        </div>
                                        <div className="text-right  font-semibold"> {3.14}%</div>
                                    </div>
                                </div>

                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                </div> :

                    <div className="w-full h-full  grid grid-cols-3 gap-20 ">
                        {nftdata.nft.map((i, index) => {
                            return <div key={index} className=" h-full shadow-custom rounded-xl bg-white dark:bg-darkSecond">
                                <div className="w-full   rounded-xl">
                                    <img src="/icons/nftmonkey.png" alt="" className="w-full max-h-[16rem] object-cover rounded-xl" />
                                </div>
                                <div className="flex justify-between items-center py-3 px-2 border-b dark:border-b-greylish">
                                    <div className="flex flex-col items-start justify-center">
                                        <div className="text-xl font-semibold">{i.name}</div>
                                        <div className="text-sm text-greylish">{i.text}</div>
                                    </div>
                                    <div className=" text-xl font-medium flex gap-1">{i.currency} <span><img src="/icons/celoicon.svg" alt="" w-2 h-2 /></span> CELO</div>
                                </div>
                                <div className="flex justify-between items-center  py-4 px-2">
                                    <div className=" text-2xl font-semibold">${i.value}</div>
                                    <div className="flex  items-center gap-3 justify-center">
                                        <div className="text-2xl font-semibold">
                                            <img src="/icons/copyicon.png" alt="" className="w-5 h-5 cursor-pointer" /></div>
                                        <a href=""><img src="/icons/edit.png" className="w-6 h-6 cursor-pointer" alt="" /></a>
                                    </div>
                                </div>
                            </div>
                        })}
                    </div>}
            </div>
        </div>
    </>
}

export default Assets;

