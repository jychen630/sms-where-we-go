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
        limit?: number;
        altBox?: (props: HasChildren) => JSX.Element;
    } & DataHandlerProps<T, PaginatedQuery>
>;

export type PaginatedDataHandler<T> = DataHandler<T, PaginatedQuery>;

const DEFAULT_LIMIT = 20;

const PaginatedBox = <T extends unknown>({
    dataHandler,
    onFetch,
    ...props
}: PaginatedBoxProps<T>) => {
    const limit = props.limit ?? DEFAULT_LIMIT;
    const ItemContainer = props.altBox ?? Card;

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(1);
    // TODO: Implement caching
    const [cache] = useState<T[]>([]);
    const [keywords, setKeywords] = useState("");
    const [exhausted, setExhausted] = useState(false);

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
        setPage(1);
        setTotal(1);
        setExhausted(false);
    }, [setPage, setTotal, setExhausted, keywords]);

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
            return <ItemContainer>{props.item(value, index)}</ItemContainer>;
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
