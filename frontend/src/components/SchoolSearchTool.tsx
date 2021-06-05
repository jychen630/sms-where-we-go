import { CheckCircleFilled, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Row, Space, Tooltip } from "antd";
import Modal from "antd/lib/modal/Modal";
import { useState } from "react";
import { Result, Service } from "wwg-api";
import { handleApiError } from "../api/utils";
import AddSchoolForm from "./AddSchoolForm";
import SearchTool, { SearchHandlerProps } from "./SearchTool";

export const fetchSchool = async ({ offset, limit, value }: SearchHandlerProps) => {
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

const SchoolSearchTool = ({ schoolUid, setSchoolUid }: { schoolUid: number, setSchoolUid: React.Dispatch<React.SetStateAction<number>> }) => {
    const [showSchoolModal, setShowSchoolModal] = useState(false);

    return (
        <>
            <Row>
                <Col span={21}>
                    <SearchTool
                        searchHandler={fetchSchool}
                        item={(value, index) => (
                            <Tooltip title={`[uid: ${value.uid}] ${value.school_country ?? '无'}/${value.school_state_province ?? '无'}/${value.city ?? '无'}`}>
                                <Button onClick={() => setSchoolUid(value.uid)} type={value.uid === schoolUid ? 'primary' : 'text'} block>
                                    {value.school_name} {value.matched_alias !== value.school_name && `(${value.matched_alias})`}
                                    {value.uid === schoolUid &&
                                        <CheckCircleFilled />
                                    }
                                </Button>
                            </Tooltip>
                        )}
                        placeholder='输入学校名称'
                    />
                </Col>
                <Col span={1} />
                <Col span={1}>
                    <Button shape='circle' color='blue' icon={<PlusOutlined />} onClick={() => setShowSchoolModal(true)} />
                </Col>
            </Row>
            <Modal title='添加学校' visible={showSchoolModal} onCancel={() => setShowSchoolModal(false)} footer={null}>
                <Space>
                    <AddSchoolForm cb={(uid) => setSchoolUid(uid)} />
                </Space>
            </Modal>
        </>
    )
}

export default SchoolSearchTool;
