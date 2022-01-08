import { Card, Pagination, Input } from "antd";
import { useMemo } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";
import {
    DataHandler,
    DataHandlerProps,
    PaginatedQuery,
    useData,
} from "../api/hooks";
import { HasChildren } from "../api/utils";

/**
 * A general template for card pages
 */

/**
 * @param altBox The alternative for the placeholder for items
 */
export type PaginatedBoxProps<T> = HasChildren<
    {
        defaultSize?: number;
        limit?: number;
        fixedSize?: boolean,
        altBox?: (props: HasChildren) => JSX.Element;
    } & DataHandlerProps<T, PaginatedQuery>
>;

export type PaginatedDataHandler<T> = DataHandler<T, PaginatedQuery>;

const DEFAULT_LIMIT = 20;

const PaginatedBox = <T extends unknown>({
    dataHandler,
    onFetch,
    defaultSize,
    fixedSize,
    ...props
}: PaginatedBoxProps<T>) => {
    const limit = props.limit ?? DEFAULT_LIMIT;
    const ItemContainer = props.altBox ?? Card;
    const compuatedDefaultTotal = Math.ceil((defaultSize ?? limit) / limit)

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(compuatedDefaultTotal);
    // TODO: Implement caching
    const [cache] = useState<T[]>([]);
    const [keywords, setKeywords] = useState("");
    const [exhausted, setExhausted] = useState(!!fixedSize);

    const offset = (page - 1) * limit;

    const query = useMemo(
        () => ({
            limit: limit,
            offset: offset,
            value: keywords,
        }),
        [limit, offset, keywords]
    );

    useEffect(() => {
        setTotal(compuatedDefaultTotal);
        setPage(page => page > compuatedDefaultTotal ? compuatedDefaultTotal : page !== 0 ? page : 1);
        setExhausted(!!fixedSize);
    }, [limit, fixedSize, compuatedDefaultTotal, setPage, setTotal, setExhausted, keywords]);

    const wrappedDataHandler: PaginatedDataHandler<T> = useCallback(
        async (query) => {
            if (cache.length > query.offset + query.limit) {
                return cache.slice(query.offset, query.limit);
            } else {
                return dataHandler(query);
            }
        },
        [dataHandler, cache]
    );

    const handleDataFetch = useCallback((data?: T[]) => {
        onFetch && onFetch(data);
        if (!!data && data?.length > 0) {
            setTotal(total => total > page ? total : page);
        }
        if (!!!data || data?.length < limit) {
            setExhausted(true);
        }
    }, [page, limit, onFetch, setTotal, setExhausted])

    const { items } = useData<T, PaginatedQuery>({
        query: query,
        item(value, index) {
            return <ItemContainer key={query.offset + index}>{props.item(value, query.offset + index)}</ItemContainer>;
        },
        dataHandler: wrappedDataHandler,
        onFetch: handleDataFetch,
    });

    return (
        <>
            {props.children}
            <Input.Search
                onSearch={(value) => setKeywords(value)}
            />
            {items()}
            <Pagination
                total={total * limit + (exhausted ? 0 : 1)}
                current={page}
                onChange={(page) => setPage(page)}
                pageSize={limit}
                showSizeChanger={false}
            />
        </>
    );
};

export default PaginatedBox;
