import Loader from './Loader';

export default function Button({ children, version = "main",ref, type = "button", onClick, className, isLoading = false }: { children: JSX.Element | JSX.Element[] | string, version?: "main" | "second", type?: "button" | "submit", onClick?: () => void, className?: string, isLoading?: boolean,ref?: any }) {
    return <button type={type} onClick={onClick} ref={ref} className={`${className} ${version === "main" ? " bg-primary border-primary text-white hover:bg-[#ff5413] hover:border-[#ff5413]  dark:hover:bg-dark hover:text-white" : 'bg-white  text-primary border-primary hover:bg-[#f0f0f0] dark:hover:bg-[#f0f0f0] dark:bg-dark hover:text-primary'} transition-colors dark:duration-500 border-2 !shadow-none px-8 py-3 rounded-md`} disabled={isLoading}>{isLoading ? <Loader /> : children} </button>
}
