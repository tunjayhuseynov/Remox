import { motion, AnimateSharedLayout } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function AnimatedTabBar({ data }: { data: { to: string, text: string }[] }) {
    const [selected, setSelected] = useState(0);
    

    return (
        <>
            {
                data.map((item, i) => {
                    const alltext = item.text.split(" ") as string[];
                    const isMultiword = alltext.length > 1;
                    const lastWord = alltext.pop()
                    const finalText = alltext.join(" ")
                    return <Link key={i} href={`${item.to}`}>
                        <motion.div className={`tiflex gap-x-3 mx-5 cursor-pointer pb-3 font-semibold tracking-widertle relative ${i === selected ? "selected" : ""}`} onClick={() => setSelected(i)} >
                            {isMultiword && <span>{`${finalText} `}</span>}
                            <span className="relative">
                                {i === selected && (<motion.span className="absolute w-full h-[3px] bg-primary rounded-[2px] bottom-[-0.625rem]" layoutId="underline" />)}
                                {lastWord}</span>
                        </motion.div>
                    </Link>
                })
            }
        </>
    )
}
