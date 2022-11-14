import React from 'react'
import { BeatLoader, ClipLoader } from 'react-spinners'
import { useAppSelector } from 'redux/hooks'
import { SelectDarkMode } from 'redux/slices/account/selector'

export default function Loader({ size }: { size?: number }) {
    const dark = useAppSelector(SelectDarkMode)
    return (
        <BeatLoader size={size ?? "8px"} color={dark ? "#f9f9f9" : "#252525"} />
    )
}
