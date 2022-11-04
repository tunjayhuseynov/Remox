

export const NG = ({ fontSize = 1, number, decimalSize, className }: { number: number, fontSize?: number, decimalSize?: number, className?: string}) => {

    return <>
        <span style={{
            fontSize: `${fontSize}rem`,
        }}>{Math.floor(number).toLocaleString()}
        </span>
        <span
            style={{
                fontSize: `${fontSize * (decimalSize ? decimalSize / 100 : 0.6)}rem`,
            }}
        >.{(+number.toString() - Math.floor(number)).toString().split(".")?.[1]?.substring(0,2) ?? "00"}</span>
    </>
}