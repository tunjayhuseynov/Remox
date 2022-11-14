import { Dispatch, useId, useState } from 'react'
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { FormControl, InputLabel, SxProps, Theme } from '@mui/material';
import { Image } from 'firebaseConfig';
import Loader from 'components/Loader';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;


interface IProp<T> {
    parentClass?: string,
    className?: string,
    selectClass?: string,
    label?: string,
    displaySelector?: string,
    loading?: boolean,
    selected?: T,
    list: Array<T>,
    setSelect?: Dispatch<T>,
    runFn?: (val: T) => () => Promise<any>,
    sx?: SxProps<Theme>,
    labelSX?: SxProps<Theme>,
    textClass?: string,
    textContainerClass?: string,
    inputProps?: any,
    nonrounded?: boolean,
    lock?: boolean
}

interface IGenericExtendedProp {
    [name: string]: any,
    name: string | number,
    displayName?: string,
    onClick?: Function,
    image?: string | Image,
    coinUrl?: string,
    logoUrl?: string,
    secondValue?: string | number,
}

const Dropdown = <T extends IGenericExtendedProp,>(
    { loading, nonrounded, selected, label, lock, setSelect, list, className, labelSX = {}, inputProps = {}, parentClass = '', runFn, selectClass, sx, textClass, displaySelector, textContainerClass }: IProp<T>) => {
    const id = useId()
    const labelId = useId()
    const [internalLaoding, setInternalLoading] = useState(false)

    // const props: { value?: T } = {}
    // if (selected) {
    //     props.value = selected
    // }

    return (
        <div className={`relative ${parentClass}`}>
            <FormControl className={`${className} w-full`}>
                {label && <InputLabel sx={labelSX} id={labelId + "-label"}>{label}</InputLabel>}
                <Select
                    disabled={lock}
                    id={id}
                    labelId={labelId + "-label"}
                    value={selected ?? ""}
                    displayEmpty
                    inputProps={inputProps}
                    MenuProps={{
                        PaperProps: {
                            style: {
                                zIndex: 99999999999,
                                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                                width: 250,
                                fontSize: '0.875rem'
                            },
                        },
                    }}
                    SelectDisplayProps={{
                        style: {
                            fontSize: '0.875rem'
                        }
                    }}
                    // {...props}
                    renderValue={(selected: T) =>
                        <div className={`${selectClass} flex flex-col items-center`}>
                            <div className="flex items-center text-sm">
                                {(loading || internalLaoding) && <span><Loader size={12} /></span>}
                                {selected.coinUrl && (!loading && !internalLaoding) && <img className={`w-4 h-4 mr-2 ${nonrounded ? "!w-6" : "rounded-full"} object-cover`} src={`${selected.coinUrl}`} />}
                                {selected.logoUrl && (!loading && !internalLaoding) && <img className={`w-4 h-4 mr-2 ${nonrounded ? "!w-6" : "rounded-full"} object-cover`} src={`${selected.logoUrl}`} />}
                                {selected.logoURI && (!loading && !internalLaoding) && <img className={`w-4 h-4 mr-2 ${nonrounded ? "!w-6" : "rounded-full"} object-cover`} src={`${selected.logoURI}`} />}
                                {selected.image && (!loading && !internalLaoding) && <img className="w-10 h-10 mr-2 rounded-full object-cover" src={`${typeof selected.image === "string" ? selected.image : selected.image.imageUrl}`} />}
                                {(!loading && !internalLaoding) &&
                                    <div className={`${textContainerClass} flex flex-col items-start`}>
                                        <span className={`${textClass} text-sm font-sans font-semibold`}>{displaySelector ? selected[displaySelector] : (selected.displayName ?? selected.name)}</span>
                                        {selected.secondValue && <span className={`${textClass} text-left text-sm text-gray-500`}>{selected.secondValue}</span>}
                                    </div>
                                }
                            </div>
                        </div>
                    }
                    sx={sx}
                    label={label}
                    onChange={async (e) => {
                        setInternalLoading(true)
                        const selected = e.target.value as T;
                        if (setSelect) setSelect(selected)
                        if (selected["onClick"]) selected["onClick"]()
                        if (runFn) {
                            await (runFn(e.target.value as T))()
                        }
                        setInternalLoading(false)
                    }}
                >
                    {list.map(e => {
                        return <MenuItem key={e.name} value={e as any} className="flex items-center z-[100000]">
                            {e.coinUrl && <img className={`w-4 h-4 mr-2 ${nonrounded ? "!w-6" : "rounded-full"}`} src={`${e.coinUrl}`} />}
                            {e.logoUrl && <img className={`w-4 h-4 mr-2 ${nonrounded ? "!w-6" : "rounded-full"}`} src={`${e.logoUrl}`} />}
                            {e.logoURI && <img className={`w-4 h-4 mr-2 ${nonrounded ? "!w-6" : "rounded-full"}`} src={`${e.logoURI}`} />}
                            {e.image && <img className={`w-4 h-4 mr-2 ${nonrounded ? "!w-6" : "rounded-full"}`} src={`${typeof e.image === "string" ? e.image : e.image.imageUrl}`} />}
                            {<span className='text-sm'>{e.displayName ?? e.name}</span>}
                        </MenuItem>
                    })}
                </Select>
            </FormControl>
        </div>
    )
}

export default Dropdown;