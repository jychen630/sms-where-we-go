import { Dispatch, SetStateAction, useCallback } from "react";
import { useState } from "react"

type Key = string | number | symbol
export const useDict = <V extends any, R extends Record<Key, V>>(obj?: R): [R | undefined, (key: Key, val: V) => void, Dispatch<SetStateAction<R | undefined>>] => {
    const [dict, setDict] = useState<R | undefined>(obj);

    const update = useCallback((key: Key, val: V) => {
        let temp: any = {};
        temp[key] = val;
        setDict(Object.assign({}, Object.assign(dict, temp)))
    }, [dict, setDict]);

    return [dict, update, setDict];
}