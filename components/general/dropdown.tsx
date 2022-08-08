import { Dispatch, useId } from 'react'
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { BlockchainType } from 'types/blockchains';
import { CoinsURL } from 'types';
import { FormControl, InputLabel } from '@mui/material';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
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
    selected?: T,
    list: Array<T>,
    setSelect?: Dispatch<T>,
    runFn?: (val: T) => () => any,
}

interface IGenericExtendedProp {
    name: string | number,
    onClick?: Function,
    image?: string,
    coinUrl?: CoinsURL,
    logoUrl?: string,
    secondValue?: string | number
}

const Dropdown = <T extends IGenericExtendedProp,>({ selected, label, setSelect, list, className, parentClass = '', runFn, selectClass }: IProp<T>) => {
    const id = useId()
    const labelId = useId()

    // const props: { value?: T } = {}
    // if (selected) {
    //     props.value = selected
    // }

    return (
        <div className={`relative ${parentClass} `}>
            <FormControl className={`${className} w-full`}>
                {label && <InputLabel id={labelId + "-label"}>{label}</InputLabel>}
                <Select
                    id={id}
                    labelId={labelId + "-label"}
                    MenuProps={MenuProps}
                    value={selected ?? ""}
                    // {...props}
                    renderValue={(selected: T) =>
                        <div className={`${selectClass} flex flex-col items-center`}>
                            <div className="flex items-center">
                                {selected.coinUrl && <img className="w-4 h-4 mr-2" src={`${selected.coinUrl}`} />}
                                {selected.logoUrl && <img className="w-4 h-4 mr-2" src={`${selected.logoUrl}`} />}
                                {selected.image && <img className="w-4 h-4 mr-2" src={`${selected.image}`} />}
                                <span>{selected.name}</span>
                            </div>
                            {selected.secondValue && <span className="text-[.75rem]">{selected.secondValue}</span>}
                        </div>
                    }
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
                        return <MenuItem key={e.name} value={e as any} className="flex items-center">
                            {e.coinUrl && <img className="w-4 h-4 mr-2" src={`${e.coinUrl}`} />}
                            {e.logoUrl && <img className="w-4 h-4 mr-2" src={`${e.logoUrl}`} />}
                            {e.image && <img className="w-4 h-4 mr-2" src={`${e.image}`} />}
                            <span>{e.name}</span>
                        </MenuItem>
                    })}
                </Select>
            </FormControl>
        </div>
    )
}

export default Dropdown;