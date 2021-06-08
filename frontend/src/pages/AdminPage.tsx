import { List, Modal, Button, Layout } from "antd";
import { Service, StudentVerbose, Student } from "wwg-api";
import AppPage, { menuOptions } from "./AppPage";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import { handleApiError } from "../api/utils";
import { result, values } from "lodash";
import InfoUpdateForm from "../components/InfoUpdateForm";

const AdminPage = () => {
    const [students, setStudents] = useState<(Student & StudentVerbose)[]>([]);
    const [visible, setVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState("Content of the modal");
    const [index, setIndex] = useState(-1);

    const showModal = () => {
        setVisible(true);
    };

    const handleOk = () => {
        setModalText("保存中...");
        setConfirmLoading(true);
        setTimeout(() => {
            setVisible(false);
            setConfirmLoading(false);
        }, 500);
    };

    const handleCancel = () => {
        setVisible(false);
    };

    useEffect(() => {
        Service.getStudent()
            .then((result) => setStudents(result.students ?? []))
            .catch((err) =>
                handleApiError(err).then((result) =>
                    console.log(result.message)
                )
            );
    });

    const getCurrentStudent = useCallback(
        async () => (index === -1 ? undefined : students[index]),
        [students, index]
    );

    return (
        <AppPage activeKey={menuOptions.ADMIN}>
            <Layout>
                <Layout.Content>
                    <List  itemLayout="horizontal">
                    {students.map((value, index) => (
                        <List.Item
                            actions={[
                                <Button
                                    onClick={() => {
                                        setVisible(true);
                                        setIndex(index);
                                    }}
                                >
                                    edit
                                </Button>,
                            ]}
                        >
                            <List.Item.Meta
                                title={<a href="">{value.name}</a>}
                                description={<p>info </p>}
                            />
                        </List.Item>
                    ))}

                    <Modal
                        title="编辑学生信息：" //{value.name}
                        visible={visible}
                        onOk={handleOk}
                        confirmLoading={confirmLoading}
                        onCancel={handleCancel}
                    >
                        <InfoUpdateForm getStudent={getCurrentStudent} />
                    </Modal></List>
                </Layout.Content>
            </Layout>
        </AppPage>
    );
};

export default AdminPage;
