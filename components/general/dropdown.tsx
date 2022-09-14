import { Dispatch, useId } from 'react'
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { CoinsURL } from 'types';
import { FormControl, InputLabel, SxProps, Theme } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { Image } from 'firebaseConfig';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            zIndex: 99999999999,
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

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
    runFn?: (val: T) => () => any,
    sx?: SxProps<Theme>
    textClass?: string,
    textContainerClass?: string,
}

interface IGenericExtendedProp {
    [name: string]: any,
    name: string | number,
    displayName?: string,
    onClick?: Function,
    image?: string | Image,
    coinUrl?: string,
    logoUrl?: string,
    secondValue?: string | number
}

const Dropdown = <T extends IGenericExtendedProp,>(
    { loading, selected, label, setSelect, list, className, parentClass = '', runFn, selectClass, sx, textClass, displaySelector, textContainerClass }: IProp<T>) => {
    const id = useId()
    const labelId = useId()

    // const props: { value?: T } = {}
    // if (selected) {
    //     props.value = selected
    // }

    return (
        <div className={`relative ${parentClass}`}>
            <FormControl className={`${className} w-full`}>
                {label && <InputLabel id={labelId + "-label"}>{label}</InputLabel>}
                <Select
                    id={id}
                    labelId={labelId + "-label"}
                    value={selected ?? ""}
                    MenuProps={MenuProps}
                    // {...props}
                    renderValue={(selected: T) =>
                        <div className={`${selectClass} flex flex-col items-center `}>
                            <div className="flex items-center">
                                {loading && <span><ClipLoader size={16} /></span>}
                                {selected.coinUrl && !loading && <img className="w-6 h-6 mr-2" src={`${selected.coinUrl}`} />}
                                {selected.logoUrl && !loading && <img className="w-4 h-4 mr-2" src={`${selected.logoUrl}`} />}
                                {selected.logoURI && !loading && <img className="w-4 h-4 mr-2" src={`${selected.logoURI}`} />}
                                {selected.image && !loading && <img className="w-10 h-10 mr-2 rounded-full" src={`${typeof selected.image === "string" ? selected.image : selected.image.imageUrl}`} />}
                                {!loading && <div className={`${textContainerClass} flex flex-col items-start`}>
                                    <span className={`${textClass} text-lg font-sans font-semibold`}>{displaySelector ? selected[displaySelector] : (selected.displayName ?? selected.name)}</span>
                                    {selected.secondValue && <span className="text-left text-sm text-gray-500">{selected.secondValue}</span>}
                                </div>}
                            </div>
                        </div>
                    }
                    sx={sx}
                    label={label}
                    onChange={(e) => {
                        const selected = e.target.value as T;
                        if (setSelect) setSelect(selected)
                        if (selected["onClick"]) selected["onClick"]()
                        if (runFn) {
                            runFn(e.target.value as T)()
                        }
                    }}
                >
                    {list.map(e => {
                        return <MenuItem key={e.name} value={e as any} className="flex items-center z-[100000]">
                            {e.coinUrl && <img className="w-4 h-4 mr-2 rounded-full" src={`${e.coinUrl}`} />}
                            {e.logoUrl && <img className="w-4 h-4 mr-2 rounded-full" src={`${e.logoUrl}`} />}
                            {e.logoURI && <img className="w-4 h-4 mr-2 rounded-full" src={`${e.logoURI}`} />}
                            {e.image && <img className="w-4 h-4 mr-2 rounded-full" src={`${typeof e.image === "string" ? e.image : e.image.imageUrl}`} />}
                            {<span>{e.displayName ?? e.name}</span>}
                        </MenuItem>
                    })}
                </Select>
            </FormControl>
        </div>
    )
}

export default Dropdown;