import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { SelectDarkMode } from 'redux/slices/account/remoxData';

export default function App({ children }: { children: JSX.Element }) {
    const darkMode = useSelector(SelectDarkMode)
    const { setTheme } = useTheme()
    useEffect(() => {
        setTheme(darkMode ? 'dark' : 'light')
        document.documentElement.classList.add(darkMode ? "dark" : "light", darkMode ? "tw-dark" : "tw-light")
        document.documentElement.classList.remove(darkMode ? "light" : "dark", darkMode ? "tw-light" : "tw-dark")
    }, [darkMode])

    return (
        <>
            {children}
        </>
    )
}
