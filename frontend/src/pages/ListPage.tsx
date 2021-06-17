import { Button, Modal, Space, Layout, Popover } from "antd";
import { useCallback } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Service } from "wwg-api";
import { createNotifyError, handleApiError } from "../api/utils";
import InfoList, { StudentInfo } from "../components/InfoList";
import AppPage, { menuOptions } from "./AppPage";
import "./ListPage.css"

const ListPage = () => {
    const [t] = useTranslation();
    const history = useHistory();
    const [visible, setVisible] = useState(false);
    const [students, setStudents] = useState<StudentInfo[]>([]);
    const [currentStudent, setCurrentStudent] = useState<StudentInfo>()

    useEffect(() => {
        Service.getStudent()
            .then((result) => {
                setStudents(result.students ?? []);
            })
            .catch((err) => handleApiError(err, createNotifyError(t, '错误', undefined, (err) => err.requireLogin && setTimeout(() => history.push('/login', history.location), 1500))));
    }, [t, history]);

    const Info = useCallback(({ student }: { student?: StudentInfo }) =>
        student !== undefined ? <InfoList
            hideName={true}
            name={student?.name}
            phone_number={student?.phone_number}
            email={student?.email}
            wxid={student?.wxid}
            grad_year={student?.grad_year}
            class_number={student?.class_number}
            curriculum={t(student?.curriculum ?? '')}
            department={student?.department}
            major={student?.major}
            school_name={student?.school_name}
            school_country={student?.school_country}
            school_state_province={student?.school_state_province}
            city={student?.city}
        /> : <></>,
        [t]
    );

    return (
        <AppPage activeKey={menuOptions.LIST}>
            <Layout className='centered-layout'>
                <Layout.Content>
                    <Space className='list-page-flex-box'>
                        {students.map((value) =>
                            <Popover title={value.name} content={Info({ student: value })}>
                                <Button onClick={() => { setCurrentStudent(value); setVisible(true); }}>{value.name}</Button>
                            </Popover>
                        )}
                    </Space>
                </Layout.Content>
            </Layout>
            <Modal
                title={currentStudent?.name ?? t('Detail')}
                visible={visible}
                onOk={() => setVisible(false)}
                onCancel={() => setVisible(false)}
                cancelText=''
            >
                <Info student={currentStudent} />
            </Modal>
        </AppPage>
    );
}

export default ListPage;
