import { forwardRef } from 'react';
import Loader from './Loader';

interface IProps {
    children: JSX.Element | JSX.Element[] | string,
    version?: "main" | "second" | "reject" | "transparent" | "half",
    type?: "button" | "submit",
    onClick?: () => void,
    className?: string,
    isLoading?: boolean,
}

export default forwardRef<HTMLButtonElement, IProps>(function Button({ children, version = "main", type = "button", onClick, className, isLoading = false }, ref) {
    return (
        <button
            type={type}
            onClick={onClick}
            ref={ref}
            className={`
            ${className} 
            ${version === "main" && "bg-primary border-primary tracking-wide font-medium text-white hover:bg-[#ff4513] dark:hover:bg-[#ff4513] hover:border-[#ff4513] hover:text-white"}
            ${version === "second" && 'bg-white  text-primary tracking-wide font-medium border-primary hover:bg-[#f0f0f0] dark:bg-darkSecond dark:hover:bg-[#2e2e2e] hover:text-primary'}
            ${version === "reject" && 'bg-white  text-[#A60000] tracking-wide font-medium border-[#A60000] hover:bg-[#f0f0f0] dark:bg-darkSecond dark:hover:bg-[#2e2e2e] hover:text-[#A60000]' }
            ${version === "transparent" && 'bg-transparent text-primary tracking-wide font-medium border-primary hover:bg-[#f0f0f0] dark:hover:bg-[#2e2e2e] hover:text-primary'}
            ${version === "half" && 'bg-primary text-primary tracking-wide font-medium bg-opacity-30 border-primary hover:bg-[#f0f0f0] dark:hover:bg-[#2e2e2e] hover:text-primary'}
             
            transition-colors dark:duration-500 border-2 !shadow-none px-8 py-2 !rounded-[5px] !text-sm
            `}
            disabled={isLoading}
        >
            {isLoading ? <Loader /> : children}
        </button>)
})
