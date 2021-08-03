import { CheckCircleFilled, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Empty, Row, Space, Tooltip } from "antd";
import { SearchProps } from "antd/lib/input";
import Modal from "antd/lib/modal/Modal";
import { useEffect } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Result, School, Service } from "wwg-api";
import { PaginatedQuery } from "../api/hooks";
import { createNotifyError, handleApiError } from "../api/utils";
import AddSchoolForm from "./AddSchoolForm";
import SearchTool from "./SearchTool";

export type QuerySchoolResult = School & {
    uid: number;
    matched_alias?: string | undefined;
};

export const fetchSchool = async ({ offset, limit, value }: PaginatedQuery) => {
    try {
        const result = await Service.getSchool(
            offset,
            limit,
            value
        );
        if (!!result.schools && result.result === Result.result.SUCCESS) {
            return result.schools;
        }
        else {
            throw new Error('Failed to search for the schools');
        }
    }
    catch (err) {
        handleApiError(err).then((res) => {
            console.error(res.message);
        });
    }
}

const SchoolSearchTool = ({ schoolUid, setSchoolUid, initialValue, searchProps, onUpdate }: { schoolUid: number, setSchoolUid: React.Dispatch<React.SetStateAction<number>>, initialValue?: string, searchProps?: SearchProps, onUpdate?: (school?: QuerySchoolResult) => void }) => {
    const [t] = useTranslation();
    const [showSchoolModal, setShowSchoolModal] = useState(false);

    useEffect(() => {
        if (schoolUid) {
            Service.getSchool(0, 1, undefined, undefined, undefined, undefined, schoolUid)
                .then(res => {
                    if (res.result === Result.result.SUCCESS && res.schools && res.schools.length > 0) {
                        onUpdate && onUpdate(res.schools[0])
                    }
                    else {
                        return Promise.reject();
                    }
                })
                .catch(err => handleApiError(err, createNotifyError(t, t("Error"), `ID 为 ${schoolUid} 的学校不存在或者已被删除`)));
        }
    }, []);

    return (
        <>
            <Row>
                <Col span={21}>
                    <SearchTool
                        dataHandler={fetchSchool}
                        item={(value, index) => (
                            <Tooltip key={value.uid} title={`[uid: ${value.uid}] ${value.school_country ?? '无'}/${value.school_state_province ?? '无'}/${value.city ?? '无'}`}>
                                <Button
                                    onClick={() => {
                                        setSchoolUid(value.uid);
                                        onUpdate && onUpdate(value);
                                    }}
                                    type={value.uid === schoolUid ? 'primary' : 'text'}
                                    block
                                >
                                    {value.school_name} {value.matched_alias !== value.school_name && `(${value.matched_alias})`}
                                    {value.uid === schoolUid &&
                                        <CheckCircleFilled />
                                    }
                                </Button>
                            </Tooltip>
                        )}
                        EmptyPlaceholder={() => {
                            return (
                                schoolUid !== -1 ?
                                    <Button
                                        onClick={() => {
                                            setSchoolUid(-1);
                                            onUpdate && onUpdate(undefined);
                                        }}
                                        block
                                    >
                                        清空
                                    </Button>
                                    :
                                    <Empty description="无数据" />
                            )
                        }}
                        initialValue={schoolUid !== -1 ? initialValue : ''}
                        placeholder='输入学校名称'
                        searchProps={searchProps}
                    />
                </Col>
                <Col span={1} />
                <Col span={1}>
                    <Button shape='circle' color='blue' icon={<PlusOutlined />} onClick={() => setShowSchoolModal(true)} />
                </Col>
            </Row>
            <Modal title='添加学校' visible={showSchoolModal} onCancel={() => setShowSchoolModal(false)} footer={null}>
                <Space direction='vertical' style={{ display: 'block' }}>
                    <AddSchoolForm cb={() => { setShowSchoolModal(false) }} />
                </Space>
            </Modal>
        </>
    )
};

export default SchoolSearchTool;
