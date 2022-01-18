import { Form, Space, Spin, notification, Input, Button } from "antd";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { Result, Service } from "wwg-api";
import { useAuth } from "../api/auth";
import { createNotifyError, handleApiError, isDemo } from "../api/utils";

// constants
const phonePattern =
    /^1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[0-35-9]\d{2}|4(?:0\d|1[0-2]|9\d))|9[0-35-9]\d{2}|6[2567]\d{2}|4(?:(?:10|4[01])\d{3}|[68]\d{4}|[579]\d{2}))\d{6}$/;
// https://stackoverflow.com/a/201378/11612399
const emailPattern =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/; // eslint-disable-line
type Value = Parameters<typeof Service.login>[0];

// Functions

const LoginForm = () => {
    const [t] = useTranslation();
    const [form] = Form.useForm<Value>();
    const location = useLocation();
    const history = useHistory();
    const auth = useAuth();

    const validateLogin = useCallback(
        async ({ password, identifier, use_uid }: Value): Promise<any> => {
            if (!!!password || !!!identifier) {
                return;
            }
            return auth
                .login(password, identifier, use_uid)
                .then(async (res) => {
                    if (res.result === Result.result.SUCCESS) {
                        try {
                            await auth.update();
                        } catch (err) {
                            console.error(err);
                            return Promise.reject(t("Connection Failure"));
                        }
                        notification.success({
                            message: t("Login Success"),
                            description: (
                                <Space>
                                    {t("Loading")} <Spin />
                                </Space>
                            ),
                            duration: 1,
                        });
                        const dest =
                            typeof location.state === "object" &&
                                location.state !== null &&
                                "pathname" in location.state &&
                                (location.state as any).pathname !== "login"
                                ? (location.state as any).pathname
                                : "/map";
                        setTimeout(() => history.push(dest), 1500);
                        return Promise.resolve();
                    }
                    // fail
                    else {
                        console.error(res.message);
                        return Promise.reject(res.message);
                    }
                })
                .catch((err) =>
                    handleApiError(err, createNotifyError(t("Login Failure")))
                );
        },
        [t, auth, history, location]
    );

    return (
        <>
            <Form form={form} layout="vertical" onFinish={validateLogin}>
                {isDemo && <p>{t("DEMO USER", {
                    email: "jychen630@wherewego.cn",
                    password: "asd"
                })}</p>}
                <Form.Item
                    name="identifier" //or uid?
                    label={t("phone number/email")}
                    tooltip={t("REGISTRATION METHOD TIP")}
                    required
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: t("EMPTY IDENTIFIER"),
                        },
                        {
                            validator(_, value) {
                                if (
                                    !!value &&
                                    !value.match(phonePattern) &&
                                    !value.match(emailPattern) &&
                                    !isDemo &&
                                    process.env.NODE_ENV !== "development"
                                ) {
                                    return Promise.reject(
                                        t("FILL IN CORRECTLY")
                                    );
                                } else {
                                    return Promise.resolve();
                                }
                            },
                        },
                    ]}
                >
                    <Input placeholder="e.g: 9298889999" />
                </Form.Item>
                <Form.Item
                    name="password"
                    label={t("Password")}
                    required
                    rules={[
                        {
                            required: true,
                            message: t("EMPTY PW"),
                        },
                    ]}
                >
                    <Input.Password placeholder={t("ENTER PW")} />
                </Form.Item>
                <Form.Item>
                    <Space wrap>
                        <Button type="primary" htmlType="submit">
                            {t("Login")}
                        </Button>
                        <Button onClick={() => history.push("/register")}>
                            {t("SWITCH SIGN UP")}
                        </Button>
                        <Button
                            type="link"
                            onClick={() => history.push("/public-feedback")}
                        >
                            {t("LOGIN FEEDBACK")}
                        </Button>
                        {(process.env.NODE_ENV === "development" || isDemo) && <Button
                            type="link"
                            onClick={() => history.push("/dev-login")}
                        >
                            {t("SWITCH DEV LOGIN")}
                        </Button>}
                    </Space>
                </Form.Item>
            </Form>
        </>
    );
};

export default LoginForm;
