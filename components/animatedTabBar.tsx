import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AnimatedTabBar({ data, index, className }: { data: { to: string, text: string }[], index: number, className?: string }) {
    const [selected, setSelected] = useState(index);

    useEffect(() => setSelected(index), [index])

    return (
        <>
            {
                data.map((item, i) => {
                    return <div key={i}>
                        <Link href={`${item.to}`} replace={true}>
                            <span className="relative">
                                <motion.div className={`${className} transition-all hover:!text-primary hover:transition-all tiflex gap-x-3  cursor-pointer pb-2 text-base font-bold  tracking-widertle relative  ${i === selected ? "selected text-primary" : "text-[#aaaaaa]   dark:text-[#aaaaaa] "}`} onClick={() => setSelected(i)} >
                                    <span className="">{item.text}</span>
                                    {i === selected && (<motion.span className="absolute w-full h-[3px] left-0 bg-primary rounded-[2px] bottom-0" layoutId="underline" />)}
                                </motion.div>
                            </span>
                        </Link>
                    </div>
                })
            }
        </>
    )
}
