import { Dispatch, useId } from 'react'
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { BlockchainType } from 'types/blockchains';


interface IProp<T> {
    parentClass?: string,
    className?: string,
    label: string,
    selected: T,
    list: Array<T>,
    setSelect?: Dispatch<T>,
    runFn?: (val: T) => () => void,
}

const Dropdown = <T extends { name: string },>({ selected, label, setSelect, list, parentClass = '', runFn }: IProp<T>) => {
    const id = useId()
    type S = T extends Pick<BlockchainType, "logoUrl"> ? { name: string } : T;

    return (
        <div className={`relative ${parentClass} `}>
            <Select
                labelId={id}
                id={id}
                value={selected}
                label={label}
                onChange={(e) => {
                    if (setSelect) setSelect(e.target.value as T)
                    if (runFn) {
                        runFn(e.target.value as T)
                    }
                }}
            >
                {list.map(e => {
                    return <MenuItem value={e as any}>{e.name}</MenuItem>
                })}
            </Select>
        </div>
    )
}

export default Dropdown;