import { Button, Card, Col, Empty, Row, Space } from "antd";
import { useState } from "react";
import { MapItem } from "./Map";
import { useTranslation } from "react-i18next";
import "./InfoCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faBuilding, faMap, faUniversity, faMapSigns } from "@fortawesome/free-solid-svg-icons";
import { EnvironmentFilled, FlagFilled, HomeFilled, LeftOutlined, MailOutlined, PhoneFilled, RightOutlined, WechatFilled } from "@ant-design/icons";
import { Student, StudentVerbose } from "wwg-api";

/**
 * A util component that will render nothing if the content is empty
 */
const Optional = ({ content, icon }: { content: string | number | undefined | null | object, icon: JSX.Element }) => {
    if (!!!content && content !== 0) {
        return <></>;
    }

    return (
        <div><Space>{icon}{content}</Space></div>
    )
}


const InfoCard = (props: MapItem) => {
    const [t] = useTranslation();
    const [index, setIndex] = useState(0);

    const currentStudent = (): Partial<Student & StudentVerbose> => {
        if (!!!props.students || props.students.length === 0) {
            return {}
        }

        if (index < props.students?.length) {
            return props.students[index];
        }
        else {
            setIndex(0);
            return props.students[0];
        }
    }

    return (
        <Card
            className="info-card"
            title={
                <Row style={{ marginBottom: 10 }}>
                    <Col span={4}>
                        <Button shape='circle' icon={<LeftOutlined />} onClick={() => setIndex(index > 0 ? index - 1 : (props.students?.length ?? 1) - 1)} disabled={(props.students?.length ?? 0) <= 1}></Button>
                    </Col>
                    <Col span={16} style={{ textAlign: "center", verticalAlign: "center" }}>
                        {index + 1}/{props.students?.length}
                    </Col>
                    <Col span={4} style={{ textAlign: "right" }}>
                        <Button shape='circle' icon={<RightOutlined />} onClick={() => setIndex(index < (props.students?.length ?? 0) - 1 ? index + 1 : 0)} disabled={(props.students?.length ?? 0) <= 1}></Button>
                    </Col>
                </Row>
            }
        >
            {props.students !== undefined && props.students.length > 0 ?
                <>
                    <h1>{currentStudent().name}</h1>
                    <Optional content={currentStudent().phone_number} icon={<PhoneFilled />} />
                    <Optional content={currentStudent().email ?? ""} icon={<MailOutlined />} />
                    <Optional content={currentStudent().wxid} icon={<WechatFilled />} />
                    <Optional content={currentStudent().grad_year + "届" + currentStudent().class_number + "班"} icon={<HomeFilled />} />
                    <Optional content={t(currentStudent().curriculum ?? "")} icon={<FontAwesomeIcon icon={faMapSigns} />} />
                    <Optional content={currentStudent().department ?? ""} icon={<FontAwesomeIcon icon={faBuilding} />} />
                    <Optional content={currentStudent().major ?? ""} icon={<FontAwesomeIcon icon={faBook} />} />
                </>
                :
                <Empty description="暂无学生数据" />
            }
            <Optional content={props.school_name} icon={<FontAwesomeIcon icon={faUniversity} />} />
            <Optional content={props.school_country} icon={<FlagFilled />} />
            <Optional content={props.school_state_province} icon={<EnvironmentFilled />} />
            <Optional content={props.city} icon={<FontAwesomeIcon icon={faMap} />} />
        </Card>
    )
}

export default InfoCard;
