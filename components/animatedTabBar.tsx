import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function AnimatedTabBar({ data, index, setText, className }: { data: { to: string, text: string }[], index: number, setText?: React.Dispatch<React.SetStateAction<string>>, className?: string }) {
    const [selected, setSelected] = useState(index);

    return (
        <>
            {
                data.map((item, i) => {
                    // const alltext = item.text.split(" ") as string[];
                    // const isMultiword = alltext.length > 1;
                    // const lastWord = alltext.pop()
                    // const finalText = alltext.join(" ")
                    return <div key={i}>
                        {item.to !== "" ? < Link href={`${item.to}`}>
                            <span className="relative">
                                <motion.div className={`${className} transition-all hover:!text-primary hover:transition-all tiflex gap-x-3  cursor-pointer pb-2 text-base font-bold  tracking-widertle relative  ${i === selected ? "selected text-primary" : "text-[#aaaaaa]   dark:text-[#aaaaaa] "}`} onClick={() => setSelected(i)} >
                                    <span className="">{item.text}</span>
                                    {i === selected && (<motion.span className="absolute w-full h-[3px] left-0 bg-primary rounded-[2px] bottom-0" layoutId="underline" />)}
                                </motion.div>
                            </span>
                        </Link> : <div onClick={() => { if (setText) setText(item.text);}}><span className="relative">
                            <motion.div className={`${className} transition-all hover:!text-primary hover:transition-all tiflex gap-x-3  cursor-pointer pb-2 font-bold  tracking-widertle relative   ${i === selected ? "selected text-primary" : "text-[#aaaaaa]  dark:text-[#aaaaaa]"}`} onClick={() => setSelected(i)} >
                                <span className="">{item.text}</span>
                                {i === selected && (<motion.span className="absolute w-full h-[3px] left-0 bg-primary rounded-[2px] bottom-0" layoutId="underline" />)}
                            </motion.div>
                        </span>
                        </div>}
                    </div>
                })
            }
        </>
    )
}
