import Loader from './Loader';

export default function Button({ children, version = "main",ref, type = "button", onClick, className, isLoading = false }: { children: JSX.Element | JSX.Element[] | string, version?: "main" | "second", type?: "button" | "submit", onClick?: () => void, className?: string, isLoading?: boolean,ref?: any }) {
    return <button type={type} onClick={onClick} ref={ref} className={`${className} ${version === "main" ? " bg-primary text-white hover:bg-white dark:hover:bg-dark hover:text-primary" : 'bg-white  text-primary hover:bg-primary dark:hover:bg-primary dark:bg-dark hover:text-white'} transition-colors dark:duration-500 border-2 border-primary !shadow-none px-8 py-3 rounded-md`} disabled={isLoading}>{isLoading ? <Loader /> : children} </button>
}
