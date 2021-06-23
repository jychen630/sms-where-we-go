import { List, Modal, Button, Layout, Card, Tabs } from "antd";
import { Service, StudentVerbose, Student, Role } from "wwg-api";
import AppPage, { menuOptions } from "./AppPage";
import { useCallback, useEffect, useState } from "react";
import { createNotifyError, handleApiError } from "../api/utils";
import InfoUpdateForm from "../components/InfoUpdateForm";
import { useAuth } from "../api/auth";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router";
import PasswordResetForm from "../components/PasswordResetForm";
import RegistrationKey from "../components/Registrationkey";
import Feedbacks from "../components/Feedbacks";
import Classes from "../components/Classes";

enum AdminTab {
    Users = "users",
    Classes = "classes",
    Keys = "keys",
    Feedbacks = "feedbacks",
}

const AdminPage = () => {
    const auth = useAuth();
    const [t] = useTranslation();
    const history = useHistory();
    const [index, setIndex] = useState(-1);
    const [visible, setVisible] = useState(false);
    const match = useRouteMatch<{ tab: string }>("/admin/:tab");
    const [passwordFormVisible, setPasswordFormVisibile] = useState(false);
    const [students, setStudents] = useState<(Student & StudentVerbose)[]>([]);

    const handleCancel = () => {
        setVisible(false);
    };

    useEffect(() => {
        if (match === null || (!Object.values(AdminTab).includes(match.params.tab as AdminTab))) {
            history.replace(`/admin/${AdminTab.Users}`);
        }
    }, [history, match]);

    useEffect(() => {
        Service.getStudent(false, true)
            .then((result) => setStudents(result.students ?? []))
            .catch(err => handleApiError(err, createNotifyError(t, '错误', '未能获取学生数据', (err) => err.requireLogin && setTimeout(() => history.push('/login', history.location), 1500))))
    }, [t, auth, history]);

    const getCurrentStudent = useCallback(
        async () => index === -1 ? undefined : students[index],
        [students, index]
    );

    return (
        <AppPage activeKey={menuOptions.ADMIN}>
            <Layout className='centered-layout'>
                <Layout.Content>
                    <Card>
                        <Tabs activeKey={match !== null && Object.values(AdminTab).includes(match.params.tab as AdminTab) ? match.params.tab : AdminTab.Users} onChange={(key) => history.replace(`/admin/${key}`)}>
                            <Tabs.TabPane tab={t('User List')} key={AdminTab.Users}>
                                <List itemLayout="horizontal">
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
                            </Tabs.TabPane>
                            <Tabs.TabPane tab={t('Class List')} key={AdminTab.Classes}>
                                <Classes />
                            </Tabs.TabPane>
                            <Tabs.TabPane tab={t('Registration Keys')} key={AdminTab.Keys}>
                                <RegistrationKey />
                            </Tabs.TabPane>
                            <Tabs.TabPane tab={t('Feedbacks')} key={AdminTab.Feedbacks}>
                                <Feedbacks />
                            </Tabs.TabPane>
                        </Tabs>
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
