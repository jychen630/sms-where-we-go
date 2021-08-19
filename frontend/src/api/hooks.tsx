import { Dispatch, SetStateAction } from "react";
import { useState, useEffect, useCallback } from "react";

type Key = string | number | symbol;
export const useDict = <V extends any, R extends Record<Key, V>>(
    obj?: R
): [
    R | undefined,
    (key: Key, val: V) => void,
    Dispatch<SetStateAction<R | undefined>>
] => {
    const [dict, setDict] = useState<R | undefined>(obj);

    const update = useCallback(
        (key: Key, val: V) => {
            let temp: any = {};
            temp[key] = val;
            setDict(Object.assign({}, Object.assign(dict, temp)));
        },
        [dict, setDict]
    );

    return [dict, update, setDict];
};

/**
 * Contains query information of paginated resources
 * @param value A general query keyword for the resources
 */
export type PaginatedQuery = {
    value: string;
} & PaginatedFetch;

/**
 * Contains fetch information of paginated resources
 * @param offset The offset to denote the start of a range of resources
 * @param limit The maximum number of resources to fetch after offset
 */
export type PaginatedFetch = {
    offset: number;
    limit: number;
};

export type DataHandler<T, V> = (props: V) => Promise<T[] | undefined>;

/**
 * Fetch a list of items from a data source, and render them in a list
 * @param item Determine the way to play with the data
 * @param dataHandler An async function that fetches the data
 */
export type DataHandlerProps<T, V> = {
    item: (value: T, index: number) => JSX.Element;
    dataHandler: DataHandler<T, V>;
    onFetch?: (props: T[] | undefined) => void;
};

export const useData = <T, V>({
    query,
    item,
    dataHandler,
    onFetch,
}: DataHandlerProps<T, V> & { query: V }) => {
    const [data, setData] = useState<T[] | undefined>(undefined);

    useEffect(() => {
        dataHandler(query).then((result) => {
            setData(result);
            onFetch && onFetch(result);
        });
    }, [query, dataHandler, onFetch]);

    const items = useCallback(
        () => <>{data?.map((value, index) => item(value, index))}</>,
        [data, item]
    );

    return { data, items };
};
