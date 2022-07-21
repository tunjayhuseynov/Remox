import { toast, ToastOptions } from 'react-toastify';

type Type = "error" | "success" | "warning" | "info"

const config: ToastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    bodyClassName: "dark:border-darkSecond dark:bg-darkSecond",
    className: "dark:bg-darkSecond",
}

export function ToastRun(textElement: JSX.Element, type: Type = "success") {
    if (type === "error") {
        toast.error(textElement, config);
    } else if (type === "success") {
        toast.success(textElement, config);
    } else if (type === "warning") {
        toast.warning(textElement, config);
    }
    else if (type === "info") {
        toast.info(textElement, config);
    }
}