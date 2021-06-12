import { handleApiError } from "../api/utils";
import { List, notification, Switch } from "antd";
import { useEffect, useState } from 'react';
import { RegistrationKeyInfo, Result, Service } from "wwg-api";
import { useTranslation } from "react-i18next";
import { ClockCircleOutlined, PieChartOutlined } from "@ant-design/icons";

type KeyInfo = RegistrationKeyInfo & {
    registration_key?: string | undefined;
    activated?: boolean | undefined;
};

const RegistrationKey = () => {
    const [t] = useTranslation();
    const [keys, setKeys] = useState<KeyInfo[]>([]);

    useEffect(() => {
        Service.getRegistrationKey()
            .then(result => setKeys(result.registration_keys ?? []))
            .catch(err => handleApiError(err)
                .then(res => {
                    notification.error({
                        message: '错误',
                        description: <>未能获取注册码<p>错误信息：{res.message}</p></>
                    });
                }))
    }, []);

    return (
        <List>
            {keys.map((value, index) =>
                <List.Item
                    key={index}
                    actions={[<Switch
                        checkedChildren='已激活'
                        unCheckedChildren='已禁用'
                        defaultChecked={value.activated}
                        onChange={(checked) => {
                            Service.updateRegistrationKey({
                                registration_key: value.registration_key,
                                expiration_date: value.expiration_date,
                                activate: checked,
                            })
                                .then(result => {
                                    if (result.result === Result.result.ERROR) {
                                        return Promise.reject(result.message);
                                    }
                                })
                                .catch(err => handleApiError(err)
                                    .then(err => notification.error({
                                        message: '错误',
                                        description: err.message
                                    })));
                        }}
                    ></Switch>]}
                >
                    <List.Item.Meta
                        title={value.registration_key}
                        description={
                            <>
                                <p><ClockCircleOutlined /> 过期时间: {new Date(value.expiration_date ?? '').toLocaleString()}</p>
                                <p><PieChartOutlined /> 适用范围: {value.class_number}/{value.grad_year} [{t(value.curriculum ?? '')}]</p>
                            </>
                        }
                    />
                </List.Item>
            )}
        </List>
    )
}

export default RegistrationKey;
