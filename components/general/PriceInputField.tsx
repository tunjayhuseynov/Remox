import { ClickAwayListener, FormControl, InputAdornment, InputLabel, TextField } from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BiSearch } from 'react-icons/bi';
import { IPrice } from 'utils/api';
import { FiatMoneyList } from 'firebaseConfig';
import FormHelperText from '@mui/material/FormHelperText';
import { useEffect } from 'react';
import { AltCoins } from 'types';

interface IProps {
    coins: IPrice | { [coin: string]: AltCoins },
    customFiatList?: FiatList[],
    disableFiatNoneSelection?: boolean,
    isMaxActive?: boolean;
    maxRegularCalc?: boolean;
    setMaxAmount?: number;
    onChange: (val: number | null, coin: IPrice[0] | AltCoins, fiatMoney: FiatList["name"] | undefined) => void,
    defaultValue?: number | null,
    defaultCoin?: IPrice[0] | AltCoins,
    defaultFiat?: FiatList["name"],
    textSize?: number,
    helper?: string,
    disableFiat?: boolean,
    lock?: boolean,
}
interface FiatList { logo: string, name: FiatMoneyList }

export const fiatList: FiatList[] = [
    {
        name: "AUD",
        logo: "https://cdn.countryflags.com/thumbs/australia/flag-400.png"
    },
    {
        name: "CAD",
        logo: "https://cdn.countryflags.com/thumbs/canada/flag-400.png"
    },
    {
        name: "EUR",
        logo: "https://cdn.countryflags.com/thumbs/europe/flag-400.png"
    },
    {
        name: "GBP",
        logo: "https://cdn.countryflags.com/thumbs/united-kingdom/flag-400.png"
    },
    {
        name: "JPY",
        logo: "https://cdn.countryflags.com/thumbs/japan/flag-400.png"
    },
    {
        name: "USD",
        logo: "https://cdn.countryflags.com/thumbs/united-states-of-america/flag-400.png"
    },
    {
        name: "TRY",
        logo: "https://cdn.countryflags.com/thumbs/turkey/flag-400.png"
    },
]

const PriceInputField = (
    { isMaxActive: max, helper, onChange, coins, maxRegularCalc, defaultValue, defaultCoin, lock,
        defaultFiat, customFiatList, disableFiatNoneSelection, setMaxAmount, textSize = 0.875, disableFiat
    }: IProps) => {
    const [dropdown, setDropdown] = useState<boolean>(false);
    const coinMemoList = useRef(Object.values(coins));
    const [coinsList, setCoinsList] = useState<AltCoins[]>(Object.values(coins))
    const [selectedCoin, setSelectedCoin] = useState<IPrice[0] | AltCoins>(defaultCoin ?? Object.values(coins)[0]);
    const [value, setValue] = useState<string | null>(defaultValue?.toString() ?? null);
    const [selectedFiat, setSelectedFiat] = useState<FiatList | undefined>(customFiatList ? customFiatList?.find(f => f.name === defaultFiat) : fiatList?.find(f => f.name === defaultFiat));

    useEffect(() => {
        let list: AltCoins[] = Object.values(coins)
        if (list.length !== coinMemoList.current.length && list[0].symbol !== coinMemoList.current[0].symbol) {
            setCoinsList(Object.values(coins))
            setSelectedCoin(defaultCoin ?? Object.values(coins)[0])
            coinMemoList.current = list
        }
    }, [coins])
    const searching = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.trim() === "") {
            setCoinsList(Object.values(coins))
        } else {
            const filteredCoins = Object.values(coins).filter((coin) => coin.name.toLowerCase().includes(e.target.value.toLowerCase()) || coin.symbol.toLowerCase().includes(e.target.value.toLowerCase()))
            setCoinsList(filteredCoins)
        }
    }

    useEffect(() => {
        if (selectedCoin && value && max && 'amount' in selectedCoin) {
            if (selectedFiat) {
                if (+value > selectedCoin[`price${selectedFiat.name}`] * selectedCoin.amount) {
                    setValue((selectedCoin[`price${selectedFiat.name}`] * selectedCoin.amount).toString())
                }
            } else {
                if (+value > selectedCoin.amount) {
                    setValue(selectedCoin.amount.toString())
                }
            }
        }
    }, [selectedFiat, selectedCoin])

    return <>
        <FormControl fullWidth className='relative'>
            <InputLabel htmlFor='display-amount' disabled={lock} sx={{
                fontSize: `${textSize}rem`,
                top: 2
            }}>Amount</InputLabel>
            <OutlinedInput
                id="display-amount"
                fullWidth
                disabled={lock}
                type="number"
                className='dark:bg-darkSecond bg-white '
                inputProps={{ step: 0.01, value: value?.toString() ?? "", inputMode: "numeric", style: { fontSize: `${textSize}rem` } }}
                onChange={(e) => {
                    const val = e.target.value;
                    if (!val && val !== "0") {
                        setValue(null)
                        onChange(null, selectedCoin, selectedFiat?.name)
                        return
                    };
                    if ((val || val === "0") && !isNaN(+val)) {
                        if (max && (setMaxAmount || 'amount' in selectedCoin) && +val > (selectedFiat && !maxRegularCalc ? (selectedCoin?.[`price${selectedFiat.name}`] ?? 1) * (setMaxAmount ?? (selectedCoin as IPrice[0])?.amount ?? Number.MAX_SAFE_INTEGER) : (setMaxAmount ?? (selectedCoin as IPrice[0])?.amount ?? Number.MAX_SAFE_INTEGER))) return;
                        onChange(+val, selectedCoin, selectedFiat?.name)
                        setValue(val)
                    }
                }}
                endAdornment={<>
                    <div className={`${selectedFiat ? "w-[120%]" : "w-auto"} flex space-x-3 justify-end`}>
                        {'amount' in selectedCoin &&
                            <div className='self-center'>
                                <div className='px-2 flex justify-center items-center dark:bg-greylish bg-[#D9D9D9] text-[0.5rem] cursor-pointer' onClick={() => {
                                    if (selectedCoin) {
                                        if (selectedFiat) {
                                            setValue((selectedCoin[`price${selectedFiat.name}`] * selectedCoin.amount).toString())
                                            onChange(selectedCoin[`price${selectedFiat.name}`] * selectedCoin.amount, selectedCoin, selectedFiat?.name)
                                        } else {
                                            setValue(selectedCoin.amount.toString())
                                            onChange(selectedCoin.amount, selectedCoin, undefined)
                                        }
                                    }
                                }}>
                                    MAX
                                </div>
                            </div>}
                        <div className={`w-auto border border-[#a7a7a7] dark:border-[#777777] px-5 py-1 my-1 rounded-md ${lock ? "" : "cursor-pointer"} select-none`} onClick={() => { if (!lock) setDropdown(!dropdown) }}>
                            {selectedCoin &&
                                <div className='flex space-x-2 tracking-wide text-xs items-center justify-center'>
                                    {selectedFiat && <>
                                        <img src={selectedFiat?.logo} className="aspect-auto w-6 ml-1" /> <span>{selectedFiat?.name}</span>
                                        <span className='font-thin text-xs dark:text-[#c0c0c0] text-[#808080] px-1 tracking-wider'>as</span>
                                    </>}
                                    <img src={selectedCoin?.logoURI} className="rounded-full w-5 h-5 mr-2" />
                                    <span>{selectedCoin?.symbol}</span>
                                </div>}
                            {!selectedCoin && <div>No Coin Selected</div>}
                        </div>
                    </div>
                </>}
                label="Amount"
            />
            {'amount' in selectedCoin && <FormHelperText className='!text-xs'>Balance: {selectedFiat && selectedCoin ? selectedCoin[`price${selectedFiat.name}`] * selectedCoin.amount : selectedCoin?.amount} {selectedFiat?.name ?? selectedCoin?.symbol}</FormHelperText>}
            {max && setMaxAmount !== undefined ?
                <FormHelperText className='!text-xs flex justify-between'>
                    <div>Remains: {setMaxAmount - (+(value ?? "0"))} {selectedFiat?.name ?? selectedCoin?.symbol}</div>
                    <div>{helper}</div>
                </FormHelperText> : helper ? <FormHelperText className='!text-xs'>{helper}</FormHelperText> : null}
            <AnimatePresence>
                {dropdown &&
                    <ClickAwayListener onClickAway={() => setDropdown(false)}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`${disableFiat ? "w-[15rem]" : "w-[30rem]"} cursor-default absolute h-[15rem] bg-white dark:bg-darkSecond z-[9999] bottom-0 right-0 translate-y-full rounded-md border border-[#a7a7a7] dark:border-[#777777]`}>
                            <div className={`${disableFiat ? "" : "grid grid-cols-2"}`}>
                                <div className='pt-2 px-3 border-r border-[#a7a7a7] dark:border-[#777777]'>
                                    <div className='w-full'>
                                        <FormControl fullWidth>
                                            <TextField
                                                placeholder='Search token'
                                                inputProps={{ style: { width: '100%' } }}
                                                onChange={searching}
                                                InputProps={{
                                                    style: {
                                                        fontSize: '0.875rem',
                                                        width: '100%',
                                                        height: '35px'
                                                    },
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <BiSearch />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                variant="outlined"
                                            />
                                        </FormControl>
                                    </div>
                                    <div className='text-greylish mt-3 font-medium text-xs tracking-wide'>Token</div>
                                    <div className='flex flex-col overflow-y-auto pb-2 h-[10rem] hover:scrollbar-thumb-gray-200 dark:hover:scrollbar-thumb-greylish scrollbar-thin'>
                                        {coinsList.map((coin, index) => {
                                            return <div key={index} onClick={() => { setSelectedCoin(coin); onChange(value ? +value : null, coin, selectedFiat?.name) }} className={`flex items-center space-x-2 py-2 hover:bg-gray-400 hover:bg-opacity-20 cursor-pointer px-2 ${selectedCoin?.symbol === coin.symbol && "bg-gray-400 bg-opacity-20"}`}>
                                                <div className='w-6 h-6 rounded-full'>
                                                    <img className='w-full h-full rounded-full' src={coin.logoURI} />
                                                </div>
                                                <div className='text-xs font-medium'>{coin.symbol}</div>
                                            </div>
                                        })}
                                    </div>
                                </div>
                                {!disableFiat && <div className='overflow-y-auto'>
                                    <div className='pt-2 px-3 '>
                                        <div className='h-[35px] font-medium flex items-center text-xs'>
                                            Fiat Currency
                                        </div>
                                        <div className='flex flex-col overflow-y-auto pb-2 h-[12rem] hover:scrollbar-thumb-gray-200 dark:hover:scrollbar-thumb-greylish scrollbar-thin'>
                                            {!disableFiatNoneSelection && <div onClick={() => { setSelectedFiat(undefined); onChange(value ? +value : null, selectedCoin, undefined) }} className={`flex items-center space-x-2 py-2 hover:bg-gray-400 hover:bg-opacity-20 cursor-pointer px-2 ${!selectedFiat && "bg-gray-400 bg-opacity-20"}`}>
                                                {/* <div className='w-6 h-6 rounded-full'><img className='w-full h-full rounded-full' src={coin.logoURI} /></div> */}
                                                <div className='text-xs font-medium'>None</div>
                                            </div>}
                                            {(customFiatList ?? fiatList).map((fiat, index) => {
                                                return <div key={index} onClick={() => { setSelectedFiat(fiat); onChange(value ? +value : null, selectedCoin, fiat?.name); setDropdown(false) }} className={`flex items-center space-x-2 py-2 hover:bg-gray-400 hover:bg-opacity-20 cursor-pointer px-2 ${selectedFiat?.name === fiat.name && "bg-gray-400 bg-opacity-20"}`}>
                                                    <div className='w-5 h-5 rounded-full'><img className='w-full h-full rounded-full' src={fiat.logo} /></div>
                                                    <div className='text-xs font-medium'>{fiat.name}</div>
                                                </div>
                                            })}
                                        </div>
                                    </div>
                                </div>}
                            </div>
                        </motion.div>
                    </ClickAwayListener>}
            </AnimatePresence>
        </FormControl>
    </>

}

export default PriceInputField