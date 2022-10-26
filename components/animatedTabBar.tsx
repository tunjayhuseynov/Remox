import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppSelector } from "redux/hooks";
import { SelectDarkMode } from "redux/slices/account/selector";

export default function AnimatedTabBar({ data, index, className, fontSize }: { data: { to: string, text: string, count?: string }[], index: number, className?: string, fontSize?: string }) {
    const [selected, setSelected] = useState(index);
    const isDark = useAppSelector(SelectDarkMode)

    useEffect(() => setSelected(index), [index])

    return (
        <>
            {
                data.map((item, i) => {
                    return <div key={i}>
                        <Link href={`${item.to}`} replace={true}>
                            <span className="relative">
                                <motion.div className={`${className} transition-all hover:!text-primary hover:transition-all gap-x-3  cursor-pointer pb-2 text-base font-semibold  tracking-widertle relative  ${i === selected ? "selected text-primary" : "text-[#aaaaaa] dark:text-[#aaaaaa]"}`} onClick={() => {
                                    setSelected(i)
                                    window.scrollTo({
                                        top: 0,
                                        behavior: "smooth"
                                    })
                                }}
                                >
                                    <span className={`${fontSize} !font-semibold text-xl`}>{item.text}</span>
                                    {i === selected && (<motion.span className="absolute w-full h-[2px] left-0 bg-primary rounded-[2px] bottom-1" layoutId="underline" />)}
                                    {item.count &&
                                        <div className={`ml-2 px-1 h-[20px] absolute mt-[0.4rem] inline text-sm rounded-sm font-semibold  ${i === selected ? `selected !bg-[#FF7348] text-white ` : `${isDark ? "bg-[#707070] !text-white" : "bg-[#D9D9D9] "} text-black `}  `}>
                                            <div className="flex items-center justify-center w-full h-full">{item.count}</div>
                                        </div>
                                    }
                                </motion.div>
                            </span>
                        </Link>
                    </div>
                })
            }
        </>
    )
}
