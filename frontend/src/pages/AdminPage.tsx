import { List, Modal, Button, Layout, Card, notification } from "antd";
import { Service, StudentVerbose, Student, Role } from "wwg-api";
import AppPage, { menuOptions } from "./AppPage";
import { useCallback, useEffect, useState } from "react";
import { handleApiError } from "../api/utils";
import InfoUpdateForm from "../components/InfoUpdateForm";
import { useAuth } from "../api/auth";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import PasswordResetForm from "../components/PasswordResetForm";

const AdminPage = () => {
    const auth = useAuth();
    const [t] = useTranslation();
    const history = useHistory();
    const [index, setIndex] = useState(-1);
    const [visible, setVisible] = useState(false);
    const [passwordFormVisible, setPasswordFormVisibile] = useState(false);
    const [students, setStudents] = useState<(Student & StudentVerbose)[]>([]);

    const handleCancel = () => {
        setVisible(false);
    };

    useEffect(() => {
        Service.getStudent()
            .then((result) => setStudents(result.students ?? []))
            .catch((err) => handleApiError(err)
                .then((result) => {
                    notification.error({
                        message: '错误',
                        description: <>未能获取学生数据<p>错误信息：{result.message}</p></>
                    });
                    if (result.requireLogin) {
                        setTimeout(() => history.push('/login', history.location), 1500);
                    }
                })
            );
    }, [auth, history]);

    const getCurrentStudent = useCallback(
        async () => index === -1 ? undefined : students[index],
        [students, index]
    );

    return (
        <AppPage activeKey={menuOptions.ADMIN}>
            <Layout className='centered-layout'>
                <Layout.Content>
                    <Card>
                        <List itemLayout="horizontal">
                            {students.map((value, index) => (
                                <List.Item
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
                                                setPasswordFormVisibile(true);
                                                setIndex(index);
                                            }}
                                            type='link'
                                        >
                                            {t("Password Reset")}
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={value.name}
                                        description={<p>{value.class_number}/{value.grad_year} [{t(value.curriculum ?? '')}]</p>}
                                    />
                                </List.Item>
                            ))}
                        </List>
                    </Card>
                </Layout.Content>
            </Layout>
            <Modal
                title="编辑学生信息：" //{value.name}
                visible={visible}
                okText={<></>}
                cancelText={t('Close')}
                onCancel={handleCancel}
            >
                <InfoUpdateForm showRoleOptions={auth.role !== Role.STUDENT} getStudent={getCurrentStudent} />
            </Modal>
            <Modal
                visible={passwordFormVisible}
                okText={<></>}
                cancelText={t('Close')}
                onCancel={() => setPasswordFormVisibile(false)}
            >
                <PasswordResetForm studentUid={(!!students && index >= 0 && students.length > 0) ? students[index].uid : undefined} />
            </Modal>
        </AppPage>
    );
};

export default AdminPage;
