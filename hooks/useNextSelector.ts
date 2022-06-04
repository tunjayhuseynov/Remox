
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';

export default function useNextSelector<Type>(selector: (state: RootState) => Type): Type | undefined;
export default function useNextSelector<Type>(selector: (state: RootState) => Type, placeholder: Type): Type;
export default function useNextSelector<Type>(selector: (state: RootState) => Type, placeholder?: Type) {
    const selection = useSelector(selector);
    const [data, setData] = useState<Type>()
    useEffect(() => setData(selection), [selection])

    if (placeholder) {
        return data ?? placeholder
    }

    return data;
}

//useSelector<unknown, unknown>(selector: (state: unknown) => unknown, equalityFn?: EqualityFn<unknown> | undefined)