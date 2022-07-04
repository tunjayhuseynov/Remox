import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectDarkMode } from 'redux/slices/notificationSlice'

export default function App({ children }: { children: JSX.Element }) {
    const darkMode = useSelector(selectDarkMode)
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
