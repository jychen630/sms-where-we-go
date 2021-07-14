import { createNotifyError, handleApiError } from "../api/utils";
import { Button, Form, FormInstance, List, notification, Select, Switch } from "antd";
import { useCallback, useEffect, useState } from 'react';
import { Class, RegistrationKeyInfo, Result, Service } from "wwg-api";
import { useTranslation } from "react-i18next";
import { ClockCircleOutlined, PieChartOutlined, PlusOutlined } from "@ant-design/icons";
import { useHistory } from "react-router";
import Modal from "antd/lib/modal/Modal";

type KeyInfo = RegistrationKeyInfo & {
    registration_key?: string | undefined;
    activated?: boolean | undefined;
};

const RegistrationKeyForm = (props: { form: FormInstance<{ classes: string[] }>, onSuccess?: () => void }) => {
    const history = useHistory();
    const [t] = useTranslation();
    const [classes, setClasses] = useState<Class[]>([]);

    useEffect(() => {
        Service.getClass()
            .then(res => {
                props.form.setFieldsValue({ classes: res.classes.length > 0 ? [JSON.stringify(res.classes[0])] : [] })
                setClasses(res.classes);
            })
            .catch(err => handleApiError(err, createNotifyError(t, '失败', '未能获取可用班级', (err) => err.requireLogin && setTimeout(() => history.push('/login', history.location), 1500))))
    }, [t, props.form, history]);

    const handleFinish = useCallback((data: { classes: string[] }) => {
        let registrationKeys: {
            registrationKey: string,
            classNumber: number,
            gradYear: number
        }[] = [];
        console.log(data);
        Promise.all(data.classes.map(async value => {
            const class_ = JSON.parse(value) as Class;
            return Service.postRegistrationKey({
                class_number: class_.class_number,
                grad_year: class_.grad_year,
            })
                .then(res => {
                    if (res.result !== Result.result.SUCCESS || !!!res.registration_key) {
                        return Promise.reject(res.message);
                    }
                    else {
                        registrationKeys.push({
                            registrationKey: res.registration_key,
                            classNumber: class_.class_number,
                            gradYear: class_.grad_year,
                        });
                    }
                })
                .catch(err => handleApiError(err, createNotifyError(t, '失败', `未能添加${class_.grad_year}届 ${class_.class_number}的注册码`)))
        })).then(
            res => {
                notification.success({
                    message: '成功',
                    description: <>
                        <p>已成功创建注册码:</p>
                        <p>
                            {registrationKeys
                                .map(val => `${val.registrationKey} (${val.gradYear}届 ${val.classNumber}班)`)
                                .join(',')}
                        </p>
                    </>,
                });
                props.onSuccess && props.onSuccess();
            }
        )
    }, [t, props]);

    return (
        <Form
            form={props.form}
            onFinish={handleFinish}
        >
            <Form.Item
                name='classes'
                label='选择班级'
            >
                <Select disabled={classes.length === 0} mode='multiple'>
                    {classes.map((value, index) =>
                        <Select.Option
                            key={index}
                            value={JSON.stringify(value)}
                        >
                            {value.grad_year}届 {value.class_number}班
                        </Select.Option>
                    )}
                </Select>
            </Form.Item>
        </Form>
    )
}

const RegistrationKey = () => {
    const [t] = useTranslation();
    const [visible, setVisible] = useState(false);
    const [keys, setKeys] = useState<KeyInfo[]>([]);
    const [form] = Form.useForm<{ classes: string[] }>();

    const fetchKeys = useCallback(() => {
        Service.getRegistrationKey()
            .then(result => setKeys(result.registration_keys ?? []))
            .catch(err => handleApiError(err, createNotifyError(t, '失败', '未能获取注册码')))
    }, [t])

    useEffect(() => {
        fetchKeys();
    }, [fetchKeys]);

    return (
        <>
            <Button onClick={() => setVisible(true)}><PlusOutlined /> 添加注册码</Button>
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
                                    .catch(err => handleApiError(err, createNotifyError(t, '错误')));
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
            <Modal
                title={t('Add Registration Key')}
                visible={visible}
                onOk={() => {
                    form.submit();
                    setVisible(false);
                }}
                okText={t('Confirm')}
                onCancel={() => setVisible(false)}
                cancelText={t('Cancel')}
            >
                <RegistrationKeyForm form={form} onSuccess={() => fetchKeys()} />
            </Modal>
        </>
    )
}

export default RegistrationKey;
