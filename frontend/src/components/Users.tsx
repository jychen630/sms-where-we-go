import { Button, List, Modal } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Student, StudentVerbose, Service, Role } from "wwg-api";
import { useAuth } from "../api/auth";
import { DataHandler, PaginatedQuery } from "../api/hooks";
import { createNotifyError, handleApiError } from "../api/utils";
import InfoUpdateForm from "./InfoUpdateForm";
import PaginatedBox from "./PaginatedCardPage";
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

    const StudentItem = (student: Student, index: number) => {
        return (
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
                    title={student.name}
                    description={
                        <p>
                            {student.class_number}/
                            {student.grad_year} [
                            {t(
                                student.curriculum ??
                                ""
                            )}
                            ]
                        </p>
                    }
                />
            </List.Item>);
    }

    const fetchStudent: DataHandler<Student, PaginatedQuery> = async ({ limit, offset, value }) => {
        return Service.getStudent(false, true, value, undefined, undefined, undefined, undefined, undefined, limit, offset).then((res) => {
            return res.students ?? [];
        })
            .catch((err) => {
                handleApiError(
                    err,
                    createNotifyError(
                        t("Error"),
                        t("未能获取学生数据")
                    )
                );
                return [];
            });
    }

    useEffect(() => {
        Service.getStudent(false, true)
            .then((result) => setStudents(result.students ?? []))
            .catch((err) =>
                handleApiError(
                    err,
                    createNotifyError(
                        t("Error"),
                        t("未能获取学生数据")
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
            <PaginatedBox
                item={StudentItem}
                dataHandler={fetchStudent}
            >
                {t("学生列表")}
            </PaginatedBox>
        </List>
            <Modal
                title={t("编辑学生信息：")} //{value.name}
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
