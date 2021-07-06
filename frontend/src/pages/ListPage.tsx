import { Button, Card, Modal, Space, Layout, Popover, Table, Radio } from "antd";
import { useCallback } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Service } from "wwg-api";
import { createNotifyError, handleApiError } from "../api/utils";
import InfoList, { StudentInfo } from "../components/InfoList";
import AppPage, { menuOptions } from "./AppPage";
import "./ListPage.css"

enum VIEW_MODE {
    TABLE = 'table',
    BUTTONS = 'buttons'
}

const ListPage = () => {
    const [t] = useTranslation();
    const history = useHistory();
    const { innerWidth } = window;
    const [viewMode, setViewMode] = useState<VIEW_MODE>(VIEW_MODE.TABLE);
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
                    <Card style={{ maxWidth: '100%' }}>
                        <div>
                            <Radio.Group value={viewMode} onChange={(e) => { setViewMode(e.target.value) }}>
                                <Radio.Button value={VIEW_MODE.TABLE}>列表</Radio.Button>
                                <Radio.Button value={VIEW_MODE.BUTTONS}>名片</Radio.Button>
                            </Radio.Group>
                        </div>
                        {viewMode === VIEW_MODE.BUTTONS &&
                            <Space className='list-page-flex-box'>
                                {students.map((value, index) =>
                                    <Popover title={value.name} content={Info({ student: value })} key={index} visible={innerWidth > 576 && !visible && currentStudent === value}>
                                        <Button onClick={() => { setCurrentStudent(value); setVisible(true); }} onMouseOver={() => setCurrentStudent(value)}>{value.name}</Button>
                                    </Popover>
                                )}
                            </Space>
                        }
                        {viewMode === VIEW_MODE.TABLE &&
                            <Table
                                scroll={{ x: 1200 }}
                                columns={[{
                                    title: '姓名',
                                    key: 'name',
                                    dataIndex: 'name',
                                },
                                {
                                    title: '学校',
                                    key: 'school_name',
                                    dataIndex: 'school_name',
                                },
                                {
                                    title: '班级',
                                    key: 'class',
                                    dataIndex: 'class_'
                                },
                                {
                                    title: '体系',
                                    key: 'curriculum',
                                    dataIndex: 'curriculumLocale'
                                },
                                {
                                    title: '城市',
                                    key: 'city',
                                    dataIndex: 'city'
                                },
                                {
                                    title: '省/州/郡',
                                    key: 'state_province',
                                    dataIndex: 'school_state_province'
                                },
                                {
                                    title: '国家',
                                    key: 'country',
                                    dataIndex: 'school_country'
                                },
                                {
                                    title: '学院',
                                    key: 'deparment',
                                    dataIndex: 'department',
                                },
                                {
                                    title: '专业',
                                    key: 'major',
                                    dataIndex: 'major',
                                },
                                {
                                    title: t('Details'),
                                    key: 'operation',
                                    fixed: 'right',
                                    width: 100,
                                    render: (a, b) => <Button type='primary' onClick={() => { setCurrentStudent(b); setVisible(true); }}>{t('Details')}</Button>,
                                },
                                ]}
                                dataSource={students.map((val, index) => ({ key: index, class_: `${val.grad_year}届 ${val.class_number}班`, curriculumLocale: t(val.curriculum ?? ''), ...val }))}
                            />
                        }
                    </Card>
                </Layout.Content>
            </Layout>
            <Modal
                title={currentStudent?.name ?? t('Detail')}
                visible={visible}
                onOk={() => setVisible(false)}
                onCancel={() => setVisible(false)}
                okText={t('Confirm')}
                cancelText={<></>}
            >
                <Info student={currentStudent} />
            </Modal>
        </AppPage >
    );
}

export default ListPage;
