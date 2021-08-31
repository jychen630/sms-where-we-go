import { Button, List, Modal } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Student, StudentVerbose, Service, Role } from "wwg-api";
import { useAuth } from "../api/auth";
import { createNotifyError, handleApiError } from "../api/utils";
import InfoUpdateForm from "./InfoUpdateForm";
import PasswordResetForm from "./PasswordResetForm";

const Users = () => {
    const auth = useAuth();
    const [t] = useTranslation();
    const [index, setIndex] = useState(-1);
    const [visible, setVisible] = useState(false);
    const [passwordFormVisible, setPasswordFormVisibile] = useState(false);
    const [students, setStudents] = useState<(Student & StudentVerbose)[]>([]);

    const handleCancel = () => {
        setVisible(false);
    };

    useEffect(() => {
        Service.getStudent(false, true)
            .then((result) => setStudents(result.students ?? []))
            .catch((err) =>
                handleApiError(
                    err,
                    createNotifyError(
                        t,
                        "错误",
                        "未能获取学生数据"
                    )
                )
            );
    }, [t]);

    const getCurrentStudent = useCallback(
        async () => (index === -1 ? undefined : students[index]),
        [students, index]
    );

    return (
        <><List itemLayout="horizontal">
            {students.map((value, index) => (
                <List.Item
                    key={index}
                    actions={[
                        <Button
                            onClick={() => {
                                setVisible(true);
                                setIndex(index);
                            }}
                        >
                            {t("Edit")}
                        </Button>,
                        <Button
                            onClick={() => {
                                setPasswordFormVisibile(
                                    true
                                );
                                setIndex(index);
                            }}
                            type="link"
                        >
                            {t("Password Reset")}
                        </Button>,
                    ]}
                >
                    <List.Item.Meta
                        title={value.name}
                        description={
                            <p>
                                {value.class_number}/
                                {value.grad_year} [
                                {t(
                                    value.curriculum ??
                                    ""
                                )}
                                ]
                            </p>
                        }
                    />
                </List.Item>
            ))}
        </List>
            <Modal
                title="编辑学生信息：" //{value.name}
                visible={visible}
                okText={<></>}
                cancelText={t("Close")}
                onCancel={handleCancel}
            >
                <InfoUpdateForm
                    showRoleOptions={auth.role !== Role.STUDENT}
                    getStudent={getCurrentStudent}
                />
            </Modal>
            <Modal
                visible={passwordFormVisible}
                okText={<></>}
                cancelText={t("Close")}
                onCancel={() => setPasswordFormVisibile(false)}
            >
                <PasswordResetForm
                    studentUid={
                        !!students && index >= 0 && students.length > 0
                            ? students[index].uid
                            : undefined
                    }
                />
            </Modal>
        </>)
}

export default Users;
