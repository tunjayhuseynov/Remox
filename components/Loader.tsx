import React from 'react'
import { ClipLoader } from 'react-spinners'
import { useAppSelector } from 'redux/hooks'
import { SelectDarkMode } from 'redux/slices/account/selector'

export default function Loader({ size }: { size?: number }) {
    const dark = useAppSelector(SelectDarkMode)
    return (
        <ClipLoader size={size ?? "18px"} color={dark ? "#f9f9f9" : "#252525"} />
    )
}
