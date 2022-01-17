import {
    Button,
    Collapse,
    Checkbox,
    Form,
    Input,
    Space,
    Spin,
    Tooltip,
    Typography,
    notification,
} from "antd";
import {
    FieldTimeOutlined,
    InfoCircleOutlined,
    PlusCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Result, Service } from "wwg-api";
import { createNotifyError, handleApiError, isDemo } from "../api/utils";

import PrivacyPolicy from "./PrivacyPolicy";
import SchoolSearchTool from "./SchoolSearchTool";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useModal } from "../api/modal";

type Values = Parameters<typeof Service.postStudent>[0];
export const phonePattern =
    /^1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[0-35-9]\d{2}|4(?:0\d|1[0-2]|9\d))|9[0-35-9]\d{2}|6[2567]\d{2}|4(?:(?:10|4[01])\d{3}|[68]\d{4}|[579]\d{2}))\d{6}$/;
// https://stackoverflow.com/a/201378/11612399
export const emailPattern =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/; // eslint-disable-line
const { Text } = Typography;

const RegistrationForm = () => {
    const [t] = useTranslation();
    const [form] = Form.useForm<Values>();
    const history = useHistory();
    const location = useLocation();
    const [schoolUid, setSchoolUid] = useState(0);
    const [regInfo, setRegInfo] =
        useState<{
            curriculum: string;
            classNumber: number;
            gradYear: number;
            expDate: Date;
        }>();
    const [PrivacyModal, showPrivacyModal] = useModal({
        content: <PrivacyPolicy />,
        modalProps: {
            title: t("用户隐私协议"),
            footer: null,
        },
    });

    useEffect(() => {
        const regkey = new URLSearchParams(location.search).get("key");
        if (regkey) {
            form.setFieldsValue({ registration_key: regkey });
            form.validateFields(["registration_key"]);
        }
    }, [form, location]);

    const validateKey = async (value: any): Promise<void> => {
        if (!!!value) {
            return Promise.resolve();
        }
        return Service.validate({ registration_key: value })
            .then((res) => {
                if (res.result === Result.result.SUCCESS) {
                    if (
                        !!res.curriculum &&
                        !!res.class_number &&
                        !!res.grad_year
                    ) {
                        setRegInfo({
                            curriculum:
                                t(res.curriculum),
                            classNumber: res.class_number,
                            gradYear: res.grad_year,
                            expDate: new Date(res.expiration_date ?? "-1"),
                        });
                    }
                    return Promise.resolve();
                } else {
                    if (res.message === "The registration key is invalid") {
                        return Promise.reject(t("该注册码不可用"));
                    } else {
                        console.error(res.message);
                        return Promise.reject(t("获取注册码失败"));
                    }
                }
            })
            .catch((err) =>
                handleApiError(err).then((res) =>
                    Promise.reject(t("该注册码不可用" ?? t("验证失败，请联系管理员")))
                )
            );
    };

    const handleFinish = (data: Values) => {
        const preparedData = Object.fromEntries(
            Object.entries(data).filter(
                ([key, value]) => value !== "" && key !== "confirm"
            )
        ) as Values;
        Service.postStudent({
            ...preparedData,
            school_uid: !!schoolUid ? schoolUid : undefined,
        })
            .then((res) => {
                if (res.result === Result.result.SUCCESS) {
                    notification.success({
                        message: t("注册成功"),
                        description: (
                            <Space>
                                {t("即将前往登录页面")} <Spin />
                            </Space>
                        ),
                        duration: 1.5,
                    });
                    setTimeout(() => history.push("/login"), 1500);
                    return Promise.resolve();
                } else {
                    return Promise.reject(res.message);
                }
            })
            .catch((err) =>
                handleApiError(err, createNotifyError(t("注册失败")))
            );
    };

    return (
        <>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                scrollToFirstError
            >
                <Form.Item
                    name="registration_key"
                    label={t("注册码")}
                    tooltip={t("为了保障用户隐私安全，注册需要使用注册码；注册码请向班级管理员索取")}
                    validateFirst
                    rules={[
                        {
                            required: true,
                            message: t("注册码不能为空"),
                        },
                        {
                            len: 14,
                            message: t("注册码长度必须为14位"),
                        },
                        ({ getFieldError }) => ({
                            validator(_, value) {
                                return validateKey(value);
                            },
                        }),
                    ]}
                    hasFeedback
                    required
                >
                    <Input
                        placeholder={t("14位注册码")}
                        onChange={() => {
                            setRegInfo(undefined);
                        }}
                    />
                </Form.Item>
                <Collapse defaultActiveKey={"1"} ghost>
                    <Collapse.Panel
                        header={
                            <>
                                {t("注册码信息")} <InfoCircleOutlined />
                            </>
                        }
                        key={"1"}
                    >
                        <div>
                            {t("毕业年份")}:{" "}
                            <Text type="success" strong>
                                {regInfo?.gradYear ?? t("暂无")}
                            </Text>
                        </div>
                        <div>
                            {t("班级")}:{" "}
                            <Text type="success" strong>
                                {regInfo?.classNumber ?? t("暂无")}
                            </Text>
                        </div>
                        <div>
                            {t("方向")}:{" "}
                            <Text type="success" strong>
                                {regInfo?.curriculum ?? t("暂无")}
                            </Text>
                        </div>
                        <div>
                            <Tooltip
                                placement="bottom"
                                title={t("为了安全性，注册码将会在创建后一段时间过期")}
                            >
                                <span className="underdotted">{t("过期时间")}</span>
                            </Tooltip>
                            :{" "}
                            <Text type="success" strong>
                                {regInfo?.expDate ? (
                                    <Space>
                                        {regInfo?.expDate.toLocaleString()}
                                        <FieldTimeOutlined />
                                    </Space>
                                ) : (
                                    t("暂无")
                                )}
                            </Text>
                        </div>
                    </Collapse.Panel>
                </Collapse>
                <Form.Item
                    name="name"
                    label={t("姓名")}
                    required
                    rules={[
                        {
                            required: true,
                            message: t("姓名不能为空"),
                        },
                    ]}
                >
                    <Input placeholder={t("中文姓名")} />
                </Form.Item>
                <Form.Item
                    name="password"
                    label={t("密码")}
                    tooltip={t("您的密码将会通过bcrypt加密存储，客户端与服务器的所有通讯通过https协议完成")}
                    required
                    rules={[
                        {
                            required: true,
                            message: t("密码不能为空"),
                        },
                    ]}
                >
                    <Input.Password
                        placeholder={t("请输入密码")}
                        autoComplete="new-password"
                    />
                </Form.Item>
                <Form.Item
                    name="confirm"
                    label={t("确认密码")}
                    dependencies={["password"]}
                    rules={[
                        {
                            required: true,
                            message: t("请确认密码"),
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const password = getFieldValue("password");
                                if (!value || password === value) {
                                    return Promise.resolve();
                                } else {
                                    return Promise.reject(
                                        t("两次输入的密码不一致")
                                    );
                                }
                            },
                        }),
                    ]}
                    required
                >
                    <Input.Password
                        placeholder={t("请再次输入密码")}
                        autoComplete="new-password"
                    />
                </Form.Item>
                <Form.Item
                    name="phone_number"
                    label={t("Phone Number")}
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const email = getFieldValue("email");
                                if (!!!email && !!!value) {
                                    return Promise.reject(
                                        t("请在电话号码和邮箱中至少填写一项")
                                    );
                                } else if (
                                    !!value &&
                                    !value.match(phonePattern) &&
                                    !isDemo
                                ) {
                                    return Promise.reject(t("请正确填写电话号码"));
                                } else {
                                    return Promise.resolve();
                                }
                            },
                        }),
                    ]}
                    tooltip={t("电话号码和邮箱请至少填写一项，两者都将能够作为登录的凭证")}
                >
                    <Input placeholder={t("请输入电话号码")} />
                </Form.Item>
                <Form.Item
                    name="email"
                    label={t("Email")}
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const phoneNumber =
                                    getFieldValue("phone_number");
                                if (!!!phoneNumber && !!!value) {
                                    return Promise.reject(
                                        t("请在电话号码和邮箱中至少填写一项")
                                    );
                                } else if (
                                    !!value &&
                                    !value.match(emailPattern)
                                ) {
                                    return Promise.reject(t("请正确填写邮箱"));
                                } else {
                                    return Promise.resolve();
                                }
                            },
                        }),
                    ]}
                >
                    <Input placeholder={t("请输入邮箱")} />
                </Form.Item>
                <Form.Item
                    name="wxid"
                    label={t("微信ID")}
                    tooltip={t("若已填写微信所绑定的电话号码，或无微信ID，此项可不填")}
                >
                    <Input placeholder={t("WECHAT ID TOOLTIP", { exampleId: "asdasdkl202122skwmrt" })} />
                </Form.Item>
                <Form.Item
                    name="school_uid"
                    label={
                        <>
                            {t("REG SCHOOL TOOLTIP (")}{" "}
                            <PlusCircleOutlined
                                style={{ paddingLeft: 2, paddingRight: 2 }}
                            />{" "}
                            {t("REG SCHOOL TOOLTIP )")}
                        </>
                    }
                    tooltip={t("ADD SCHOOL TOOLTIP")}
                >
                    <SchoolSearchTool
                        schoolUid={schoolUid}
                        setSchoolUid={setSchoolUid}
                    />
                </Form.Item>
                <Form.Item name="department" label={t("学院")}>
                    <Input placeholder={t("请输入你的学院名称")} />
                </Form.Item>
                <Form.Item name="major" label={t("专业")}>
                    <Input placeholder={t("请输入你的专业名称")} />
                </Form.Item>
                <Form.Item
                    name="grant"
                    valuePropName="checked"
                    validateTrigger={[]} // Only validate when submitting
                    rules={[
                        {
                            validator(_, value) {
                                if (value) {
                                    return Promise.resolve();
                                } else {
                                    return Promise.reject(
                                        t("请勾选同意用户隐私协议")
                                    );
                                }
                            },
                        },
                    ]}
                >
                    <Checkbox>
                        {t("勾选即代表您同意")}
                        <Button
                            type="link"
                            style={{ padding: "1px" }}
                            onClick={showPrivacyModal}
                        >
                            {t("用户隐私协议")}
                        </Button>
                    </Checkbox>
                </Form.Item>
                <Form.Item>
                    <Space wrap>
                        <Button type="primary" htmlType="submit">
                            {t("注册")}
                        </Button>
                        <Button onClick={() => history.push("/login")}>
                            {t("切换到登录")}
                        </Button>
                        <Button
                            type="link"
                            onClick={() => history.push("/public-feedback")}
                        >
                            {t("无法注册？点此反馈")}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
            <PrivacyModal />
        </>
    );
};

export default RegistrationForm;
