import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
    AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import { Dispatch, useState } from 'react';
import DatePicker, { DateObject } from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel"
import { useAppSelector } from 'redux/hooks';
import { SelectAccounts, SelectAllBudgets, SelectDarkMode, SelectTags } from 'redux/slices/account/selector';
import "react-multi-date-picker/styles/backgrounds/bg-dark.css"
import { Checkbox, FormControlLabel, Input, Radio, RadioGroup } from '@mui/material';
import { ITag } from 'pages/api/tags/index.api';
import { AiOutlineSearch } from 'react-icons/ai';
import { IAccount, IBudget } from 'firebaseConfig';

const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
        borderBottom: 0,
    },
    '&:before': {
        display: 'none',
    },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
    <MuiAccordionSummary
        expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
        {...props}
    />
))(({ theme }) => ({
    backgroundColor:
        theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, .05)'
            : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(1),
    },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

const ariaLabel = { 'aria-label': 'description' };



const mainColor = { colorPrimary: "!text-primary", root: "" }

const mainCheckBox = {
    '&.Mui-checked': {
        color: "#FF7348!important",
    }
}

export interface ITransactionFilter {
    date: DateObject[] | null;
    setDate: Dispatch<ITransactionFilter["date"]>,

    selectedTags: string[];
    setSelectedTags: Dispatch<ITransactionFilter["selectedTags"]>,

    selectedBudgets: string[];
    setSelectedBudgets: Dispatch<ITransactionFilter["selectedBudgets"]>,

    selectedAccounts: string[];
    setSelectedAccounts: Dispatch<ITransactionFilter["selectedAccounts"]>,

    selectedDirection: string;
    setSelectedDirection: Dispatch<ITransactionFilter["selectedDirection"]>,

    specificAmount: number | undefined;
    setSpecificAmount: Dispatch<ITransactionFilter["specificAmount"]>,

    minAmount: number | undefined;
    setMinAmount: Dispatch<ITransactionFilter["minAmount"]>,

    maxAmount: number | undefined;
    setMaxAmount: Dispatch<ITransactionFilter["maxAmount"]>,
}

const Filter = ({
    date, selectedAccounts, selectedBudgets, selectedDirection, selectedTags, maxAmount, minAmount, specificAmount,
    setDate, setSelectedAccounts, setSelectedBudgets, setSelectedDirection, setSelectedTags, setMaxAmount, setMinAmount, setSpecificAmount }: ITransactionFilter) => {
    const [expanded, setExpanded] = useState<string | false>('');

    const dark = useAppSelector(SelectDarkMode)
    const tags = useAppSelector(SelectTags)
    const budgets = useAppSelector(SelectAllBudgets)
    const accounts = useAppSelector(SelectAccounts)

    const [searchLabel, setSearchLabel] = useState<string>("")

    const handleChange =
        (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
            setExpanded(newExpanded ? panel : false);
        };

    const changeSpecificAmount = (val: string) => {
        if (val.length > 0) {
            isNaN(+val) ? null : setSpecificAmount(+val)
        } else {
            setSpecificAmount(undefined)
        }
    }

    const changeMinAmount = (val: string) => {
        if (val.length > 0) {
            isNaN(+val) ? null : setMinAmount(+val)
        } else {
            setMinAmount(undefined)
        }
    }

    const changeMaxAmount = (val: string) => {
        if (val.length > 0) {
            isNaN(+val) ? null : setMaxAmount(+val)
        } else {
            setMaxAmount(undefined)
        }
    }

    return <>
        <div className='w-[20rem]'>
            <Accordion expanded={false}>
                <AccordionSummary aria-controls="date-content" id="date-header" expandIcon={<></>} className="!ml-0" classes={{
                    content: "!ml-0"
                }}>
                    <Typography>Filters</Typography>
                </AccordionSummary>
            </Accordion>
            <Accordion expanded={expanded === 'date'} onChange={handleChange('date')}>
                <AccordionSummary aria-controls="date-content" id="date-header">
                    <Typography>Date</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className='text-sm pb-1 font-medium'>
                        Show transaction for
                    </div>
                    <DatePicker plugins={[<DatePanel />]} value={date} onChange={setDate} range={true} maxDate={new Date()} className={`${dark ? "bg-dark" : ""}`} style={
                        {
                            height: "2rem",
                        }
                    } />
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'labels'} onChange={handleChange('labels')}>
                <AccordionSummary aria-controls="labels-content" id="labels-header">
                    <Typography>Labels</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Input inputProps={ariaLabel} onChange={(val) => setSearchLabel(val.target.value)} endAdornment={<>
                        <AiOutlineSearch />
                    </>} />
                    <div className='flex flex-col mt-3'>
                        {tags.filter(s => s.name.toLowerCase().includes(searchLabel.toLowerCase())).map((tag, index) => {
                            return <div className='flex space-x-2 items-center'>
                                <Checkbox classes={mainColor} checked={selectedTags.includes(tag.id)} onChange={() => {
                                    if (selectedTags.includes(tag.id)) {
                                        setSelectedTags(selectedTags.filter(s => s !== tag.id))
                                    } else {
                                        setSelectedTags([...selectedTags, tag.id])
                                    }
                                }} /> {tag.name}
                            </div>
                        })}
                    </div>
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'budget'} onChange={handleChange('budget')}>
                <AccordionSummary aria-controls="budget-content" id="budget-header">
                    <Typography>Budget</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className='flex flex-col'>
                        {budgets.map((budget) => {
                            return <div className='flex space-x-2 items-center'>
                                <Checkbox classes={mainColor} checked={selectedBudgets.includes(budget.id)} onChange={() => {
                                    if (selectedBudgets.includes(budget.id)) {
                                        setSelectedBudgets(selectedBudgets.filter(s => s !== budget.id))
                                    } else {
                                        setSelectedBudgets([...selectedBudgets, budget.id])
                                    }
                                }} /> {budget.name}
                            </div>
                        })}
                        {budgets.length === 0 && <div className='text-sm text-gray-400'>
                            No budgets found
                        </div>}
                    </div>
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'amount'} onChange={handleChange('amount')}>
                <AccordionSummary aria-controls="amount-content" id="amount-header">
                    <Typography>Amount</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className='flex flex-col space-y-1'>
                        <div className='text-sm text-gray-400'>
                            Direction
                        </div>
                        <RadioGroup
                            row
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                            value={selectedDirection}
                            onChange={(val) => setSelectedDirection(val.target.value)}
                        >
                            <FormControlLabel value="Any" control={<Radio sx={mainCheckBox} />} label="Any" />
                            <FormControlLabel value="In" control={<Radio sx={mainCheckBox} />} label="In" />
                            <FormControlLabel value="Out" control={<Radio sx={mainCheckBox} />} label="Out" />
                        </RadioGroup>
                    </div>
                    <div className='flex flex-col space-y-1 mt-5'>
                        <div className='text-sm text-gray-400'>
                            Specific Amount
                        </div>
                        <input className='border p-1 rounded-md' value={specificAmount} onChange={(val) => changeSpecificAmount(val.target.value)} type="number" step={0.1} />
                    </div>
                    <div className='grid grid-cols-[40%,20%,40%] mt-5 w-full'>
                        <div className='flex flex-col'>
                            <div className='text-sm text-gray-400'>
                                Min
                            </div>
                            <input className='border p-1 rounded-md' value={minAmount} onChange={(val) => changeMinAmount(val.target.value)} type="number" step={0.1} />
                        </div>
                        <div className='flex items-center translate-y-3 justify-center'>
                            <div className='w-[80%] h-[1px] bg-gray-400' />
                        </div>
                        <div className='flex flex-col'>
                            <div className='text-sm text-gray-400'>
                                Max
                            </div>
                            <input className='border p-1 rounded-md' value={maxAmount} onChange={(val) => changeMaxAmount(val.target.value)} type="number" step={0.1} />
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'wallets'} onChange={handleChange('wallets')}>
                <AccordionSummary aria-controls="wallets-content" id="wallets-header">
                    <Typography>Wallets</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className='flex flex-col'>
                        {accounts.map((account) => {
                            return <div className='flex space-x-2 items-center'>
                                <Checkbox classes={mainColor} checked={selectedAccounts.includes(account.address)} onChange={() => {
                                    if (selectedAccounts.includes(account.address)) {
                                        setSelectedAccounts(selectedAccounts.filter(s => s !== account.address))
                                    } else {
                                        setSelectedAccounts([...selectedAccounts, account.address])
                                    }
                                }} /> {account.name}
                            </div>
                        })}
                        {accounts.length === 0 && <div className='text-sm text-gray-400'>
                            No account found
                        </div>}
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    </>
}

export default Filter