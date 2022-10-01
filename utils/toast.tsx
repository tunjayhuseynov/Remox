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

export function ToastRun(textElement: JSX.Element | string, type: Type = "success") {
    if (type === "error") {
        toast.error(typeof textElement === "string" ? <>{textElement}</> : textElement, config);
    } else if (type === "success") {
        toast.success(typeof textElement === "string" ? <>{textElement}</> : textElement, config);
    } else if (type === "warning") {
        toast.warning(typeof textElement === "string" ? <>{textElement}</> : textElement, config);
    }
    else if (type === "info") {
        toast.info(typeof textElement === "string" ? <>{textElement}</> : textElement, config);
    }
}