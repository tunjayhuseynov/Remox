

export const NG = ({ fontSize = 1, number, decimalSize, className }: { number: number, fontSize?: number, decimalSize?: number, className?: string }) => {
    let decimal = 0;
    let friction = (number - Math.floor(number)).toString().split(".")?.[1];
    if (friction) {
        decimal = +friction;
    }
    // number = 1700083.56;
    return <>
        <span style={{
            fontSize: `${fontSize}rem`,
        }}>{Math.floor(number).toString().length > 6 ? Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(Math.floor(number)) : Math.floor(number).toLocaleString()}
        </span>
        {Math.floor(number).toString().length <= 6 && <span
            style={{
                fontSize: `${fontSize * (decimalSize ? decimalSize / 100 : 0.6)}rem`,
            }}
        >.{(+(number.toFixed(2)) - Math.floor(number)).toString().split(".")?.[1]?.substring(0, 2) ?? "00"}</span>}
    </>
}