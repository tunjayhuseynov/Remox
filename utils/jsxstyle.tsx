

export const NG = ({ fontSize = 1, number }: { number: number, fontSize?: number }) => {

    return <>
        <span style={{
            fontSize: `${fontSize}rem`,
        }}>{number.toFixed(0)}</span>
        <span
            style={{
                fontSize: `${fontSize * 0.6}rem`,
            }}
        >,{(+number.toFixed(2) - +number.toFixed(0)).toFixed(2).split(".")?.[1] ?? "00"}</span>
    </>
}