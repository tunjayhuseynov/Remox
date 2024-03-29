import { FormControl, Input, InputAdornment } from "@mui/material"
import Loader from "components/Loader";
import { Dispatch, SetStateAction, useState } from "react";
import { MdDone } from "react-icons/md";

interface IProps {
    defaultValue: string;
    onSubmit: (value: string) => Promise<void>;
    placeholder?: string;
    fontSize?: number,
    letterLimit?: number;
}

export default ({ defaultValue, onSubmit, placeholder, fontSize, letterLimit = 999 }: IProps) => {
    const [value, setValue] = useState(defaultValue)
    const [savedDefaultValue, setSavedDefaultValue] = useState(defaultValue)

    const [isLoading, setLoading] = useState(false)

    const submit = async () => {
        setLoading(true)
        await onSubmit(value)
        setSavedDefaultValue(value)
        setLoading(false)
    }

    return <>
        <FormControl sx={{ m: 1 }} variant="filled">
            <Input
                value={value}
                placeholder={placeholder ?? ""}
                fullWidth
                className="leading-none"
                onChange={(e) => {
                    if (e.target.value.length <= letterLimit) {
                        setValue(e.target.value)
                    }
                }}
                inputProps={{
                    style: {
                        fontSize: `${fontSize ? fontSize : 0.875}rem`,
                    }
                }}
                onKeyDownCapture={(e) => {
                    if (e.key === "Enter") {
                        submit()
                    }
                }}
                endAdornment={
                    <InputAdornment position="end">
                        {value !== savedDefaultValue && letterLimit < 999 && <span style={{ fontSize: "0.75rem", marginRight: "0.5rem" }}>{value.length}/{letterLimit}</span>}
                        {value !== savedDefaultValue &&
                            <div className="cursor-pointer" onClick={submit}>
                                {isLoading ? <Loader  /> : <MdDone className="cursor-pointer mb-1 rounded-full bg-primary h-4 w-4 p-[0.15rem] text-white" />}
                            </div>
                        }
                    </InputAdornment>}
                aria-describedby="filled-weight-helper-text"
            />
        </FormControl>
    </>
}