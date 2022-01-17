import QuestionCircleOutlined from "@ant-design/icons/QuestionCircleOutlined";
import WarningOutlined from "@ant-design/icons/WarningOutlined";
import {
    Button,
    Card,
    Collapse,
    Divider,
    Layout,
    notification,
    Tooltip,
} from "antd";
import Modal from "antd/lib/modal/Modal";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Result, Service } from "wwg-api";
import { useAuth } from "../api/auth";
import { createNotifyError, handleApiError } from "../api/utils";
import InfoUpdateForm from "../components/InfoUpdateForm";
import PasswordResetForm from "../components/PasswordResetForm";
import AppPage, { menuOptions } from "./AppPage";

const { Content } = Layout;
const UserPage = () => {
    const auth = useAuth();
    const [t] = useTranslation();
    const history = useHistory();
    const [showModal, setShowModal] = useState(false);

    const getCurrentStudent = useCallback(async () => {
        try {
            const res = await Service.getStudent(true);
            if (res.students !== undefined && res.students?.length > 0) {
                return res.students[0];
            } else {
                return;
            }
        } catch (err) {
            handleApiError(
                err,
                createNotifyError(
                    t,
                    "错误",
                    undefined,
                    (err) =>
                        err.requireLogin &&
                        setTimeout(
                            () => history.push("/login", history.location),
                            1500
                        )
                )
            );
        }
    }, [t, history]);

    const deleteAccount = useCallback(async () => {
        if (auth.studentUid === undefined) {
            notification.error({
                message: t("失败"),
                description: t("This user is invalid, please login again"),
            });
            return;
        }
        Service.deleteStudent({ student_uid: auth.studentUid })
            .then((res) => {
                if (res.result === Result.result.SUCCESS) {
                    notification.success({
                        message: t("成功"),
                        description: t("你的账户已经从系统中移除"),
                    });
                    history.push("/login");
                } else {
                    return Promise.reject(res);
                }
            })
            .catch((err) => {
                handleApiError(
                    err,
                    createNotifyError(t, "失败", "未能将你的账户移除")
                );
            });
    }, [t, history, auth.studentUid]);

    return (
        <AppPage activeKey={menuOptions.SETTINGS}>
            <Layout className="centered-layout">
                <Content>
                    <Card>
                        <InfoUpdateForm getStudent={getCurrentStudent} />
                        <Collapse ghost>
                            <Collapse.Panel
                                key={0}
                                header={
                                    <span>
                                        <WarningOutlined />{" "}
                                        {t("Advanced Options")}
                                    </span>
                                }
                            >
                                <Divider orientation="center" plain>
                                    {t("Password Reset")}
                                </Divider>
                                <PasswordResetForm />
                                <Divider orientation="center" plain>
                                    {t("Delete Account")}
                                </Divider>
                                <Button
                                    onClick={() => setShowModal(true)}
                                    style={{
                                        backgroundColor: "red",
                                        color: "white",
                                    }}
                                >
                                    {t("Delete Account")}
                                    <Tooltip title={t("DELETE ACCOUNT")}>
                                        <QuestionCircleOutlined />
                                    </Tooltip>
                                </Button>
                            </Collapse.Panel>
                        </Collapse>
                    </Card>
                </Content>
            </Layout>
            <Modal
                visible={showModal}
                okType="danger"
                okText={t("确认删除")}
                onOk={() => {
                    setShowModal(false);
                    deleteAccount();
                }}
                onCancel={() => setShowModal(false)}
                cancelText={t("Cancel")}
                style={{ maxWidth: "300px" }}
                title={t("Delete Account")}
            >
                {t("DELETE ACCOUNT")}
            </Modal>
        </AppPage>
    );
};

export default UserPage;
