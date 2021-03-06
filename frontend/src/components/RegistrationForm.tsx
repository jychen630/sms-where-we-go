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
            title: t("??????????????????"),
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
                        return Promise.reject(t("?????????????????????"));
                    } else {
                        console.error(res.message);
                        return Promise.reject(t("?????????????????????"));
                    }
                }
            })
            .catch((err) =>
                handleApiError(err).then((res) =>
                    Promise.reject(t("?????????????????????" ?? t("?????????????????????????????????")))
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
                        message: t("????????????"),
                        description: (
                            <Space>
                                {t("????????????????????????")} <Spin />
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
                handleApiError(err, createNotifyError(t("????????????")))
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
                {isDemo && <p>{t("DEMO REGKEY", {
                    registrationKey: "demoregkey2022"
                })}</p>}
                <Form.Item
                    name="registration_key"
                    label={t("?????????")}
                    tooltip={t("???????????????????????????????????????????????????????????????????????????????????????????????????")}
                    validateFirst
                    rules={[
                        {
                            required: true,
                            message: t("?????????????????????"),
                        },
                        {
                            len: 14,
                            message: t("????????????????????????14???"),
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
                        placeholder={t("14????????????")}
                        onChange={() => {
                            setRegInfo(undefined);
                        }}
                    />
                </Form.Item>
                <Collapse defaultActiveKey={"1"} ghost>
                    <Collapse.Panel
                        header={
                            <>
                                {t("???????????????")} <InfoCircleOutlined />
                            </>
                        }
                        key={"1"}
                    >
                        <div>
                            {t("????????????")}:{" "}
                            <Text type="success" strong>
                                {regInfo?.gradYear ?? t("??????")}
                            </Text>
                        </div>
                        <div>
                            {t("??????")}:{" "}
                            <Text type="success" strong>
                                {regInfo?.classNumber ?? t("??????")}
                            </Text>
                        </div>
                        <div>
                            {t("??????")}:{" "}
                            <Text type="success" strong>
                                {regInfo?.curriculum ?? t("??????")}
                            </Text>
                        </div>
                        <div>
                            <Tooltip
                                placement="bottom"
                                title={t("???????????????????????????????????????????????????????????????")}
                            >
                                <span className="underdotted">{t("????????????")}</span>
                            </Tooltip>
                            :{" "}
                            <Text type="success" strong>
                                {regInfo?.expDate ? (
                                    <Space>
                                        {regInfo?.expDate.toLocaleString()}
                                        <FieldTimeOutlined />
                                    </Space>
                                ) : (
                                    t("??????")
                                )}
                            </Text>
                        </div>
                    </Collapse.Panel>
                </Collapse>
                <Form.Item
                    name="name"
                    label={t("??????")}
                    required
                    rules={[
                        {
                            required: true,
                            message: t("??????????????????"),
                        },
                    ]}
                >
                    <Input placeholder={t("????????????")} />
                </Form.Item>
                <Form.Item
                    name="password"
                    label={t("??????")}
                    tooltip={t("????????????????????????bcrypt?????????????????????????????????????????????????????????https????????????")}
                    required
                    rules={[
                        {
                            required: true,
                            message: t("??????????????????"),
                        },
                    ]}
                >
                    <Input.Password
                        placeholder={t("???????????????")}
                        autoComplete="new-password"
                    />
                </Form.Item>
                <Form.Item
                    name="confirm"
                    label={t("????????????")}
                    dependencies={["password"]}
                    rules={[
                        {
                            required: true,
                            message: t("???????????????"),
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const password = getFieldValue("password");
                                if (!value || password === value) {
                                    return Promise.resolve();
                                } else {
                                    return Promise.reject(
                                        t("??????????????????????????????")
                                    );
                                }
                            },
                        }),
                    ]}
                    required
                >
                    <Input.Password
                        placeholder={t("?????????????????????")}
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
                                        t("????????????????????????????????????????????????")
                                    );
                                } else if (
                                    !!value &&
                                    !value.match(phonePattern) &&
                                    !isDemo
                                ) {
                                    return Promise.reject(t("???????????????????????????"));
                                } else {
                                    return Promise.resolve();
                                }
                            },
                        }),
                    ]}
                    tooltip={t("????????????????????????????????????????????????????????????????????????????????????")}
                >
                    <Input placeholder={t("?????????????????????")} />
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
                                        t("????????????????????????????????????????????????")
                                    );
                                } else if (
                                    !!value &&
                                    !value.match(emailPattern)
                                ) {
                                    return Promise.reject(t("?????????????????????"));
                                } else {
                                    return Promise.resolve();
                                }
                            },
                        }),
                    ]}
                >
                    <Input placeholder={t("???????????????")} />
                </Form.Item>
                <Form.Item
                    name="wxid"
                    label={t("??????ID")}
                    tooltip={t("?????????????????????????????????????????????????????????ID??????????????????")}
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
                <Form.Item name="department" label={t("??????")}>
                    <Input placeholder={t("???????????????????????????")} />
                </Form.Item>
                <Form.Item name="major" label={t("??????")}>
                    <Input placeholder={t("???????????????????????????")} />
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
                                        t("?????????????????????????????????")
                                    );
                                }
                            },
                        },
                    ]}
                >
                    <Checkbox>
                        {t("????????????????????????")}
                        <Button
                            type="link"
                            style={{ padding: "1px" }}
                            onClick={showPrivacyModal}
                        >
                            {t("??????????????????")}
                        </Button>
                    </Checkbox>
                </Form.Item>
                <Form.Item>
                    <Space wrap>
                        <Button type="primary" htmlType="submit">
                            {t("??????")}
                        </Button>
                        <Button onClick={() => history.push("/login")}>
                            {t("???????????????")}
                        </Button>
                        <Button
                            type="link"
                            onClick={() => history.push("/public-feedback")}
                        >
                            {t("???????????????????????????")}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
            <PrivacyModal />
        </>
    );
};

export default RegistrationForm;
