import { forwardRef } from 'react';
import Loader from './Loader';

interface IProps {
    children: JSX.Element | JSX.Element[] | string,
    version?: "main" | "second",
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
            ${version === "main" && "bg-primary border-primary text-white hover:bg-[#ff5413] dark:hover:bg-[#ff5413] hover:border-[#ff5413] hover:text-white"}
            ${version === "second" && 'bg-white  text-primary border-primary hover:bg-[#f0f0f0] dark:bg-darkSecond dark:hover:bg-[#2e2e2e] hover:text-primary'}
             
            transition-colors dark:duration-500 border-2 !shadow-none px-8 py-3 !rounded-md
            `}
            disabled={isLoading}
        >
            {isLoading ? <Loader /> : children}
        </button>)
})
