import { createNotifyError, handleApiError } from "../api/utils";
import {
    Button,
    Form,
    FormInstance,
    List,
    notification,
    Select,
    Space,
    Switch,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { Class, RegistrationKeyInfo, Result, Service } from "wwg-api";
import { useTranslation } from "react-i18next";
import {
    ClockCircleOutlined,
    PieChartOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { useHistory } from "react-router";
import { useModal } from "../api/modal";

type KeyInfo = RegistrationKeyInfo & {
    registration_key?: string | undefined;
    activated?: boolean | undefined;
};

const RegistrationKeyForm = (props: {
    form: FormInstance<{ classes: string[] }>;
    onSuccess?: () => void;
}) => {
    const history = useHistory();
    const [t] = useTranslation();
    const [classes, setClasses] = useState<Class[]>([]);

    useEffect(() => {
        Service.getClass()
            .then((res) => {
                props.form.setFieldsValue({
                    classes:
                        res.classes.length > 0
                            ? [JSON.stringify(res.classes[0])]
                            : [],
                });
                setClasses(res.classes);
            })
            .catch((err) =>
                handleApiError(
                    err,
                    createNotifyError(
                        t,
                        t("失败"),
                        t("未能获取可用班级"),
                        (err) =>
                            err.requireLogin &&
                            setTimeout(
                                () => history.push("/login", history.location),
                                1500
                            )
                    )
                )
            );
    }, [t, props.form, history]);

    const handleFinish = useCallback(
        (data: { classes: string[] }) => {
            let registrationKeys: {
                registrationKey: string;
                classNumber: number;
                gradYear: number;
            }[] = [];
            Promise.all(
                data.classes.map(async (value) => {
                    const class_ = JSON.parse(value) as Class;
                    return Service.postRegistrationKey({
                        class_number: class_.class_number,
                        grad_year: class_.grad_year,
                    })
                        .then((res) => {
                            if (
                                res.result !== Result.result.SUCCESS ||
                                !!!res.registration_key
                            ) {
                                return Promise.reject(res.message);
                            } else {
                                registrationKeys.push({
                                    registrationKey: res.registration_key,
                                    classNumber: class_.class_number,
                                    gradYear: class_.grad_year,
                                });
                            }
                        })
                        .catch((err) =>
                            handleApiError(
                                err,
                                createNotifyError(
                                    t,
                                    "Error",
                                    `未能添加${class_.grad_year}届 ${class_.class_number}的注册码`
                                )
                            )
                        );
                })
            ).then((res) => {
                if (registrationKeys.length > 0) {
                    notification.success({
                        message: t("成功"),
                        description: (
                            <>
                                <p>{t("已成功创建注册码")}:</p>
                                <p>
                                    {registrationKeys
                                        .map(
                                            (val) =>
                                                `${val.registrationKey} (${val.gradYear}届 ${val.classNumber}班)`
                                        )
                                        .join(",")}
                                </p>
                            </>
                        ),
                    });
                    props.onSuccess && props.onSuccess();
                }
            });
        },
        [t, props]
    );

    return (
        <Form form={props.form} onFinish={handleFinish}>
            <Form.Item name="classes" label={t("选择班级")}>
                <Select disabled={classes.length === 0} mode="multiple">
                    {classes.map((value, index) => (
                        <Select.Option
                            key={index}
                            value={JSON.stringify(value)}
                        >
                            {value.grad_year}届 {value.class_number}班
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
        </Form>
    );
};

const RegistrationKey = () => {
    const [t] = useTranslation();
    const [notExpired, setNotExpired] = useState(true);
    const [keys, setKeys] = useState<KeyInfo[]>([]);
    const [form] = Form.useForm<{ classes: string[] }>();

    const fetchKeys = useCallback(() => {
        Service.getRegistrationKey(0, 100, notExpired)
            .then((result) => setKeys(result.registration_keys ?? []))
            .catch((err) =>
                handleApiError(
                    err,
                    createNotifyError(t, "失败", "未能获取注册码")
                )
            );
    }, [t, notExpired]);

    const [FormModal, showModal] = useModal({
        content: (
            <RegistrationKeyForm form={form} onSuccess={() => fetchKeys()} />
        ),
        onOk: () => {
            form.submit();
        },
        modalProps: {
            title: t("Add Registration Key"),
        },
    });

    useEffect(() => {
        fetchKeys();
    }, [fetchKeys]);

    return (
        <>
            <Space direction="vertical">
                <Button onClick={showModal}>
                    <PlusOutlined /> 添加注册码
                </Button>
                <Switch
                    defaultChecked={notExpired}
                    checkedChildren={t("未过期")}
                    unCheckedChildren={t("全部")}
                    onChange={(val) => setNotExpired(val)}
                    style={{ display: "block" }}
                ></Switch>
            </Space>
            <List>
                {keys.map((value, index) => (
                    <List.Item
                        key={index}
                        actions={[
                            <Switch
                                checkedChildren={t("已激活")}
                                unCheckedChildren={t("已禁用")}
                                defaultChecked={value.activated}
                                onChange={(checked) => {
                                    Service.updateRegistrationKey({
                                        registration_key:
                                            value.registration_key,
                                        expiration_date: value.expiration_date,
                                        activate: checked,
                                    })
                                        .then((result) => {
                                            if (
                                                result.result ===
                                                Result.result.ERROR
                                            ) {
                                                return Promise.reject(
                                                    result.message
                                                );
                                            }
                                        })
                                        .catch((err) =>
                                            handleApiError(
                                                err,
                                                createNotifyError(t, "错误")
                                            )
                                        );
                                }}
                            ></Switch>,
                        ]}
                    >
                        <List.Item.Meta
                            title={value.registration_key}
                            description={
                                <>
                                    <p>
                                        <ClockCircleOutlined /> {t("过期时间")}:{" "}
                                        {new Date(
                                            value.expiration_date ?? ""
                                        ).toLocaleString()}
                                    </p>
                                    <p>
                                        <PieChartOutlined /> {t("适用范围")}:{" "}
                                        {value.class_number}/{value.grad_year} [
                                        {t(value.curriculum ?? "")}]
                                    </p>
                                </>
                            }
                        />
                    </List.Item>
                ))}
            </List>
            <FormModal />
        </>
    );
};

export default RegistrationKey;
