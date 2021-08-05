import { Result, Service } from "wwg-api";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { PaginatedQuery } from "./hooks";
import { createNotifyError, handleApiError } from "./utils";
import SearchTool from "../components/SearchTool";
import { Button } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";

const useSearchCity: () => [() => JSX.Element, number] = () => {
    const [t] = useTranslation();
    const [cityUid, setCityUid] = useState(-1);
    console.log("asd")
    const fetchCity = useCallback(async (props: PaginatedQuery) => {
        try {
            const result = await Service.getCity(props.offset, props.limit, props.value);
            if (!!result.cities && result.result === Result.result.SUCCESS) {
                return result.cities;
            }
            else {
                throw new Error('Failed to search for the cities');
            }
        }
        catch (err) {
            handleApiError(err, createNotifyError(t, '错误', '获取城市列表失败'));
        }
    }, [t]);

    const renderSearchTool = useCallback(() => {
        return (
            <SearchTool
                dataHandler={fetchCity}
                item={(value, index) =>
                    <Button onClick={() => setCityUid(value.city_uid)} type={value.city_uid === cityUid ? 'primary' : 'text'} block>
                        {value.city}, {value.state_province}, {value.country}
                        {value.city_uid === cityUid &&
                            <CheckCircleFilled />
                        }
                    </Button>
                }
                placeholder='输入城市名 (已收录国内大部分城市)'
            />
        )
    }, [cityUid, fetchCity]);

    return [renderSearchTool, cityUid];
}

export default useSearchCity;