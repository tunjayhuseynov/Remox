import { FilledInput, FormControl, Input, InputAdornment } from "@mui/material"
import Loader from "components/Loader";
import { useState } from "react";
import { AiFillCheckCircle } from "react-icons/ai";

interface IProps {
    defaultValue: string;
    onSubmit: (value: string) => Promise<void>;
    placeholder?: string;
}

export default ({ defaultValue, onSubmit, placeholder }: IProps) => {
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
        <FormControl sx={{ m: 1, width: '25ch' }} variant="filled">
            <Input
                value={value}
                placeholder={placeholder ?? ""}
                onChange={(e) => setValue(e.target.value)}
                onKeyDownCapture={(e) => {
                    if (e.key === "Enter") {
                        submit()
                    }
                }}
                endAdornment={
                    <InputAdornment position="end">
                        {value !== savedDefaultValue &&
                            <div className="cursor-pointer" onClick={submit}>
                                {isLoading ? <Loader size={14} /> : <AiFillCheckCircle color="#FF7348" />}
                            </div>
                        }
                    </InputAdornment>}
                aria-describedby="filled-weight-helper-text"
            />
        </FormControl>
    </>
}