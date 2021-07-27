import { InfoOutlined } from "@ant-design/icons";
import { Button, Card, Form, Modal, Input, Space, Layout, Popover, Table, Tabs, Switch } from "antd";
import { useCallback } from "react";
import { useMemo } from "react";
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

const createFilter = ({ title, key, dataIndex, filters }: { title: string, key: string, dataIndex?: string, filters?: any[] }) => {
    return {
        onFilter: filters ? (value: string | number | boolean, record: any) => {
            return !!record[dataIndex ?? key] && value.toString() === record[dataIndex ?? key];
        } : undefined,
        filters: filters?.map(val => ({ text: val, value: val })),
        key: key,
        dataIndex: dataIndex ?? key,
        title: title,
    }
}

const ListPage = () => {
    const [t] = useTranslation();
    const history = useHistory();
    const [buttonMode, setButtonMode] = useState(true);
    const isMobile = window.innerWidth <= 576;
    const [popupDisabled, setPopupDisabled] = useState(false);
    const [searchString, setSearchString] = useState("");
    const searchStringLower = searchString.toLowerCase();
    const [visible, setVisible] = useState(false);
    const [students, setStudents] = useState<StudentInfo[]>([]);
    const [currentStudent, setCurrentStudent] = useState<StudentInfo>()

    const studentsData = students.map((val, index) => ({ key: index, class_: `${val.grad_year}届 ${val.class_number}班`, curriculumLocale: t(val.curriculum ?? ''), ...val }));

    const filters = useMemo(() => {
        return studentsData.reduce((accu, student) => {
            Object.entries(student).forEach(([key, value]) => {
                if (!Object.keys(accu).includes(key)) {
                    accu[key] = [];
                }
                if (value !== undefined && !accu[key].includes(value)) {
                    accu[key].push(value);
                }
            });
            return accu;
        }, {} as any);
    }, [studentsData]);

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
                        <Tabs
                            activeKey={buttonMode ? VIEW_MODE.BUTTONS : VIEW_MODE.TABLE}
                            onChange={() => setButtonMode(btn => !btn)}
                        >
                            <Tabs.TabPane tab="名片" key={VIEW_MODE.BUTTONS}>
                                <Form
                                    layout={isMobile ? 'vertical' : 'horizontal'}
                                >
                                    <Form.Item label="搜索">
                                        <Input.Search
                                            placeholder='输入学生姓名'
                                            onSearch={value => setSearchString(value)}
                                        />
                                    </Form.Item>
                                    {!isMobile &&
                                        <Form.Item label="禁用提示框">
                                            <Switch
                                                onChange={value => setPopupDisabled(value)}
                                            />
                                        </Form.Item>
                                    }
                                </Form>
                                <Space className="list-page-flex-box">
                                    {students
                                        .filter(value => !!!searchString || (value.name && value.name.toLowerCase().includes(searchStringLower)))
                                        .map((value, index) =>
                                            <Popover
                                                title={value.name}
                                                content={Info({ student: value })}
                                                key={index}
                                                visible={buttonMode && !popupDisabled && !isMobile && !visible && currentStudent === value}
                                            >
                                                <Button
                                                    // We toggle the style here according to the search string to save rerendering
                                                    onClick={() => { setCurrentStudent(value); setVisible(true); }}
                                                    onMouseOver={() => setCurrentStudent(value)}
                                                >
                                                    {value.name}
                                                </Button>
                                            </Popover>
                                        )
                                    }
                                </Space>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="列表" key={VIEW_MODE.TABLE}>
                                <Table
                                    locale={
                                        {
                                            filterConfirm: "确定",
                                            filterReset: "重置",
                                        }
                                    }
                                    scroll={{ x: isMobile ? 1000 : 1200 }}
                                    columns={[{
                                        title: '姓名',
                                        key: 'name',
                                        dataIndex: 'name',
                                    },
                                    createFilter({ title: '学校', key: 'school_name', filters: filters.school_name }),
                                    createFilter({ title: '班级', key: 'class', dataIndex: 'class_', filters: filters.class_ }),
                                    createFilter({ title: '体系', key: 'curriculum', dataIndex: 'curriculumLocale', filters: filters.curriculumLocale }),
                                    createFilter({ title: '城市', key: 'city', filters: filters.city }),
                                    createFilter({ title: '省/州/郡', key: 'state_province', dataIndex: 'school_state_province', filters: filters.school_state_province }),
                                    createFilter({ title: '国家', key: 'country', dataIndex: 'school_country', filters: filters.school_country }),
                                    createFilter({ title: '学院', key: 'department', dataIndex: 'department', filters: filters.department }),
                                    createFilter({ title: '专业', key: 'major', dataIndex: 'major', filters: filters.major }),
                                    {
                                        title: t('Details'),
                                        key: 'operation',
                                        fixed: 'right',
                                        width: isMobile ? 50 : 80,
                                        render: (a, b) => <Button
                                            type='ghost'
                                            onClick={() => { setCurrentStudent(b); setVisible(true); }}
                                            shape="circle"
                                        >
                                            <InfoOutlined />
                                        </Button>,
                                    },
                                    ]}
                                    dataSource={studentsData}
                                />
                            </Tabs.TabPane>
                        </Tabs>
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
