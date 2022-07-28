import { useTheme } from 'next-themes'
import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { SelectDarkMode } from 'redux/slices/account/remoxData';
import { ThemeProvider as MuiTheme, createTheme } from '@mui/material/styles';

export default function App({ children }: { children: JSX.Element }) {
    const darkMode = useSelector(SelectDarkMode)
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                },
                components: {
                    MuiSelect: {
                        styleOverrides: {
                            select: {
                                paddingTop: "8px",
                                paddingBottom: "8px",
                                height: "40px", 
                                display: "flex",
                                alignItems: "center",
                            }
                        }
                    }
                }
            }),
        [darkMode],
    );

    const { setTheme } = useTheme()
    useEffect(() => {
        setTheme(darkMode ? 'dark' : 'light')
        document.documentElement.classList.add(darkMode ? "dark" : "light", darkMode ? "tw-dark" : "tw-light")
        document.documentElement.classList.remove(darkMode ? "light" : "dark", darkMode ? "tw-light" : "tw-dark")
    }, [darkMode])

    return (
        <>
            <MuiTheme theme={theme}>
                {children}
            </MuiTheme>
        </>
    )
}
