import { useAppDispatch } from "../../redux/hooks"
import { setMenu } from "../../redux/slices/toggles"
import {motion} from 'framer-motion'
import { useEffect } from "react"


const MobileMenu = ({ children }: { children: JSX.Element | JSX.Element[] | string }) => {
    const dispatch = useAppDispatch()
    useEffect(() => {
        document.querySelector('body')!.style.overflowY = "hidden"
        document.querySelector('body')!.style.height = "100vh"
        return () => {
            document.querySelector('body')!.style.overflowY = ""
            document.querySelector('body')!.style.height = "auto"
        }
    }, [])
    return <>
        <div className="absolute w-screen h-screen z-50 bg-white bg-opacity-60" onClick={()=>{
            dispatch(setMenu(false))
        }}></div>
        <motion.div initial={{x: -500}} animate={{x: 0}} transition={{type: 'tween'}} exit={{x: -500}} className="w-[50vw] fixed -translate-x-50 h-full bg-white z-[100] border-r-2">
            <div className="h-full flex flex-col items-center justify-center">
                {children}
            </div>
        </motion.div>
    </>
}

export default MobileMenu