import { motion, AnimateSharedLayout } from "framer-motion";
import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function AnimatedTabBar({ data }: { data: { to: string, text: string }[] }) {
    const [selected, setSelected] = useState(0);


    return (
        <AnimateSharedLayout>
            {data.map((item, i) => {
                const alltext = item.text.split(" ") as string[];
                const isMultiword = alltext.length > 1;
                const lastWord = alltext.pop()
                const finalText = alltext.join(" ")
                return <NavLink key={i} to={`${item.to}`} end className={'mx-5'}>
                    <motion.div className={`tiflex gap-x-3 pb-3 font-semibold tracking-widertle relative ${i === selected ? "selected" : ""}`} onClick={() => setSelected(i)} >
                        {isMultiword && <span>{`${finalText} `}</span>}
                        <span className="relative">
                            {i === selected && (<motion.span className="absolute w-full h-[3px] bg-primary rounded-[2px] bottom-[-0.625rem]" layoutId="underline" />)}
                            {lastWord}</span>
                    </motion.div>
                </NavLink>
            })}
        </AnimateSharedLayout>
    )
}
