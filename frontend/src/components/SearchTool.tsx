import { LoadingOutlined } from "@ant-design/icons";
import { Button, Collapse, Empty, Input, Row, Space, Spin } from "antd";
import throttle from "lodash/throttle";
import React, { useCallback, useEffect, useState } from "react";

export type SearchToolProps<T> = {
    searchHandler: (props: SearchHandlerProps) => Promise<T[] | undefined>,
    EmptyPlaceholder?: () => JSX.Element,
    placeholder: string,
    item: (value: T, index: number) => JSX.Element,
    initialValue?: string,
    searchLimit?: number,
    inputRef?: React.Ref<Input>,
}

export type SearchHandlerProps = {
    offset: number,
    limit: number,
    value: string,
}

// See also for why we don't use forwardRef: https://github.com/microsoft/TypeScript/pull/30215
const SearchTool = <T extends unknown>({ searchHandler, placeholder, item, initialValue, inputRef, searchLimit = 5, EmptyPlaceholder = () => <Empty /> }: SearchToolProps<T>) => {
    const [value, setValue] = useState('');
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [resultList, setResultList] = useState<T[]>([]);

    const search = useCallback(throttle(async ({ offset, limit, value, append, resultList }: SearchHandlerProps & { append: boolean, resultList?: T[] }) => { // eslint-disable-line react-hooks/exhaustive-deps
        if (!!!value) {
            setResultList([]);
            setLoading(false);
            return;
        }
        setOffset(offset);
        const result = await searchHandler({ offset: offset, limit: limit, value: value });
        setLoading(false);
        if (result === undefined || result?.length < searchLimit) {
            setOffset(-1);
        }
        if (append) {
            setResultList(!!resultList ? resultList.concat(result ?? []) : result ?? []);
        }
        else {
            setResultList(result ?? []);
        }
    }, 1000), []);

    const handleSearch = useCallback(({ offset, limit, value, append = false }: Partial<SearchHandlerProps> & { value: string, append?: boolean }) => {
        setLoading(true);
        search({
            offset: offset ?? 0,
            limit: limit ?? searchLimit,
            value: value,
            append: append,
            resultList: resultList
        });
    }, [setLoading, resultList, search, searchLimit]);

    useEffect(() => {
        if (initialValue !== undefined) {
            setValue(initialValue);
            search({ value: initialValue, offset: 0, limit: 1, append: false });
        }
    }, [initialValue, search]);

    return (
        <>
            <Input.Search
                ref={inputRef}
                placeholder={placeholder}
                value={value}
                onSearch={(val) => handleSearch({ value: val })}
                onChange={(e) => {
                    setValue(e.target.value);
                    handleSearch({ value: e.target.value });
                }}
            />
            <Collapse defaultActiveKey={0} ghost>
                <Collapse.Panel
                    key={0}
                    header={
                        <Space>
                            匹配结果
                            {loading &&
                                <Spin indicator={<LoadingOutlined />} />
                            }
                        </Space>
                    }
                    className='collapse-panel'
                >
                    {resultList.length === 0 &&
                        <EmptyPlaceholder />
                    }

                    {
                        resultList.map((value, index) => {
                            return (
                                <Row key={index}>
                                    {item(value, index)}
                                </Row>
                            )
                        })
                    }

                    {resultList.length >= searchLimit && offset !== -1 &&
                        <Button
                            onClick={() => handleSearch({ value: value ?? "", offset: offset + searchLimit, append: true })}
                            loading={loading}
                            disabled={loading}
                            block
                        >
                            加载更多
                        </Button>
                    }
                </Collapse.Panel>
            </Collapse>
        </>
    )
};

export default SearchTool;
