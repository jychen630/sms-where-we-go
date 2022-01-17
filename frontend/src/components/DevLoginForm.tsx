import { Badge, Button, Form, Select } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Service } from "wwg-api";
import { useAuth } from "../api/auth";
import { createNotifyError, handleApiError, ThenType } from "../api/utils";

type Values = { uid: number };
const DevLoginForm = () => {
    const [t] = useTranslation();
    const { devLogin, studentUid } = useAuth();
    const history = useHistory();
    const [form] = Form.useForm<Values>();
    const [users, setUsers] = useState<
        NonNullable<ThenType<ReturnType<typeof Service.getDevLogin>>["users"]>
    >([]);

    useEffect(() => {
        Service.getDevLogin()
            .then((result) => setUsers(result.users ?? []))
            .catch((err) =>
                handleApiError(
                    err,
                    createNotifyError(
                        t("Error"),
                        t("Failed to fetch available users")
                    )
                )
            );
    }, [t, setUsers]);

    useEffect(() => {
        if (studentUid !== undefined) history.push("/map");
    }, [history, studentUid]);

    const handleFinish = (data: Values) => {
        devLogin(data.uid)
            .catch((err) =>
                handleApiError(
                    err,
                    createNotifyError(
                        t("Error"),
                        t("Failed to login as dev")
                    )
                )
            );
    };

    return (
        <Form form={form} onFinish={handleFinish}>
            <Form.Item name="uid" label={t("SELECT LOGIN")}>
                <Select>
                    {users.map((value) => (
                        <Select.Option key={value.uid} value={value.uid}>
                            {value.name} <Badge>{value.uid}</Badge>
                            <p>{t("权限")}: {t(value.role.toUpperCase())}</p>
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
            <Button type="primary" htmlType="submit">
                {t("Login")}
            </Button>
        </Form>
    );
};

export default DevLoginForm;
