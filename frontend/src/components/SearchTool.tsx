import { LoadingOutlined } from "@ant-design/icons";
import { Button, Collapse, Empty, Input, Row, Space, Spin } from "antd";
import _ from "lodash";
import { useCallback, useEffect, useState } from "react";

export type SearchToolProps<T> = {
    searchHandler: (props: SearchHandlerProps) => Promise<T[] | undefined>,
    placeholder: string,
    item: (value: T, index: number) => JSX.Element,
    initialValue?: string,
    searchLimit?: number,
}

export type SearchHandlerProps = {
    offset: number,
    limit: number,
    value: string,
}

const SearchTool = <T extends unknown>({ searchHandler, placeholder, item, initialValue, searchLimit = 5 }: SearchToolProps<T>) => {
    const [value, setValue] = useState('');
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [resultList, setResultList] = useState<T[]>([]);

    const search = useCallback(_.throttle(async ({ offset, limit, value, append, resultList }: SearchHandlerProps & { append: boolean, resultList?: T[] }) => { // eslint-disable-line react-hooks/exhaustive-deps
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
        if (!!initialValue) {
            setValue(initialValue);
            search({ value: initialValue, offset: 0, limit: 1, append: false });
        }
    }, [initialValue, search]);

    return (
        <>
            <Input.Search
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
                >
                    {resultList.length === 0 &&
                        <Empty />
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
}

export default SearchTool;
