import { Dispatch, useId } from 'react'
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { BlockchainType } from 'types/blockchains';


interface IProp<T> {
    parentClass?: string,
    className?: string,
    label: string,
    selected?: T,
    list: Array<T>,
    setSelect?: Dispatch<T>,
    runFn?: (val: T) => () => void,
}

interface IGenericExtendedProp {
    name: string | number,
    onClick?: Function,
    image?: string,
    secondValue?: string | number
}

const Dropdown = <T extends IGenericExtendedProp,>({ selected, label, setSelect, list, parentClass = '', runFn }: IProp<T>) => {
    const id = useId()

    return (
        <div className={`relative ${parentClass} `}>
            <Select
                labelId={id}
                id={id}
                value={selected}
                label={label}
                onChange={(e) => {
                    const selected = e.target.value as T;
                    if (setSelect) setSelect(selected)
                    if (selected["onClick"]) selected["onClick"]()
                    if (runFn) {
                        runFn(e.target.value as T)
                    }
                }}
            >
                {list.map(e => {
                    return <MenuItem key={e.name} value={e as any}>{e.name}</MenuItem>
                })}
            </Select>
        </div>
    )
}

export default Dropdown;