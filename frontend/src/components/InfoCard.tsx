import { Button, Card, CardProps, Col, Row } from "antd";
import { useState } from "react";
import { MapItem } from "./Map";
import { useTranslation } from "react-i18next";
import "./InfoCard.css";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Student, StudentVerbose } from "wwg-api";
import InfoList from "./InfoList";


const InfoCard = (props: MapItem & CardProps) => {
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
                props.students !== undefined && props.students?.length > 0 &&
                <Row style={{ marginBottom: 10 }}>
                    <>
                        <Col span={4}>
                            <Button shape='circle' icon={<LeftOutlined />} onClick={() => setIndex(index > 0 ? index - 1 : (props.students?.length ?? 1) - 1)} disabled={(props.students?.length ?? 0) <= 1}></Button>
                        </Col>
                        <Col span={16} style={{ textAlign: "center", verticalAlign: "center" }}>
                            {index + 1}/{props.students?.length}
                        </Col>
                        <Col span={4} style={{ textAlign: "right" }}>
                            <Button shape='circle' icon={<RightOutlined />} onClick={() => setIndex(index < (props.students?.length ?? 0) - 1 ? index + 1 : 0)} disabled={(props.students?.length ?? 0) <= 1}></Button>
                        </Col>
                    </>
                </Row>
            }
            {...props}
        >
            <InfoList
                hideName={false}
                name={currentStudent().name}
                phone_number={currentStudent().phone_number}
                email={currentStudent().email}
                wxid={currentStudent().wxid}
                class_number={currentStudent().class_number}
                grad_year={currentStudent().grad_year}
                curriculum={t(currentStudent().curriculum ?? '')}
                department={currentStudent().department}
                major={currentStudent().major}
                school_name={props.school_name}
                school_country={props.school_country}
                school_state_province={props.school_state_province}
                city={props.city}
            />
        </Card>
    )
}

export default InfoCard;
