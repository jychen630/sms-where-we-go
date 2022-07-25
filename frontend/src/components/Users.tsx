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
    const [visible, setVisible] = useState(false);
    const [passwordFormVisible, setPasswordFormVisibile] = useState(false);
    const [currentStudent, setCurrentStudent] = useState<(Student & StudentVerbose)>();

    const handleCancel = () => {
        setVisible(false);
    };

    const StudentItem = (student: Student & StudentVerbose, index: number) => {
        return (
            <List.Item
                key={index}
                actions={[
                    <Button
                        onClick={() => {
                            setVisible(true);
                            setCurrentStudent(student);
                        }}
                    >
                        {t("Edit")}
                    </Button>,
                    <Button
                        onClick={() => {
                            setPasswordFormVisibile(
                                true
                            );
                            setCurrentStudent(student);
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

    const fetchStudent: DataHandler<Student & StudentVerbose, PaginatedQuery> = async ({ limit, offset, value }) => {
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

    return (
        <><List itemLayout="horizontal">
            <PaginatedBox
                item={StudentItem}
                dataHandler={fetchStudent}
            >
                {t("学生列表")}
            </PaginatedBox>
        </List>
            {currentStudent && <>
                <Modal
                    title={t("编辑学生信息:")} //{value.name}
                    visible={visible}
                    okText={<></>}
                    cancelText={t("Close")}
                    onCancel={handleCancel}
                >
                    <InfoUpdateForm
                        showRoleOptions={auth.role !== Role.STUDENT}
                        getStudent={async () => currentStudent}
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
                            currentStudent.uid
                        }
                    />
                </Modal>
            </>}
        </>)
}

export default Users;
