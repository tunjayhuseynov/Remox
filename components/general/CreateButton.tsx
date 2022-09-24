import { BsPlusLg } from "react-icons/bs";


export default function CreateButton({ onClick }: { onClick?: Function }) {

    return <div className={`
       w-32 h-14 border-2 rounded-[40px] flex items-center justify-center cursor-pointer
     dark:hover:border-white hover:dark:bg-white dark:hover:bg-opacity-5 hover:bg-opacity-5 hover:bg-black
    `} onClick={() => onClick?.()}>
        <BsPlusLg color="#dad8d8" size={20} />
    </div>
}