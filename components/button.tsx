import { ClipLoader } from 'react-spinners';

export default function Button({ children, version = "main", type = "button", onClick, className, isLoading = false }: { children: JSX.Element | JSX.Element[] | string, version?: "main" | "second", type?: "button" | "submit", onClick?: () => void, className?: string, isLoading?: boolean}) {
    return <button type={type} onClick={onClick} className={`${className} ${version === "main" ? " bg-primary text-white hover:bg-light dark:hover:bg-dark hover:text-primary" : 'bg-light  text-primary hover:bg-primary dark:hover:bg-primary dark:bg-dark hover:text-white'} transition-colors dark:duration-500 border-2 border-primary shadow-xl px-8 py-3 rounded-xl`} disabled={isLoading}>{isLoading ? <ClipLoader size="18px"/> : children} </button>
}
