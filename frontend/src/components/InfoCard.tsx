import { Button, Card, CardProps, Col, Row } from "antd";
import { useState } from "react";
import { MapItem } from "./Map";
import { useTranslation } from "react-i18next";
import "./InfoCard.css";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { School, Student, StudentVerbose } from "wwg-api";
import InfoList from "./InfoList";

const InfoCard = (props: { items: MapItem[] } & CardProps) => {
    const [t] = useTranslation();
    const [index, setIndex] = useState(0);

    const students = props.items.flatMap(
        (school) =>
            school.students?.map((student) => ({
                school_name: school.school_name,
                school_country: school.school_country,
                school_state_province: school.school_state_province,
                city: school.city,
                ...student,
            })) ?? []
    );

    const currentStudent = (): Partial<Student & StudentVerbose & School> => {
        if (!!!students || students.length === 0) {
            return {};
        }

        if (index < students?.length) {
            return students[index];
        } else {
            setIndex(0);
            return students[0];
        }
    };

    return (
        <Card
            className="info-card"
            title={
                students !== undefined &&
                students?.length > 0 && (
                    <Row style={{ marginBottom: 10 }}>
                        <>
                            <Col span={4}>
                                <Button
                                    shape="circle"
                                    icon={<LeftOutlined />}
                                    onClick={() =>
                                        setIndex(
                                            index > 0
                                                ? index - 1
                                                : (students?.length ?? 1) - 1
                                        )
                                    }
                                    disabled={(students?.length ?? 0) <= 1}
                                ></Button>
                            </Col>
                            <Col
                                span={16}
                                style={{
                                    textAlign: "center",
                                    verticalAlign: "center",
                                }}
                            >
                                {index + 1}/{students?.length}
                            </Col>
                            <Col span={4} style={{ textAlign: "right" }}>
                                <Button
                                    shape="circle"
                                    icon={<RightOutlined />}
                                    onClick={() =>
                                        setIndex(
                                            index < (students?.length ?? 0) - 1
                                                ? index + 1
                                                : 0
                                        )
                                    }
                                    disabled={(students?.length ?? 0) <= 1}
                                ></Button>
                            </Col>
                        </>
                    </Row>
                )
            }
            {...(() => {
                const { items, ...rest } = props;
                return rest;
            })()}
        >
            <InfoList
                hideName={false}
                name={currentStudent().name}
                phone_number={currentStudent().phone_number}
                email={currentStudent().email}
                wxid={currentStudent().wxid}
                class_number={currentStudent().class_number}
                grad_year={currentStudent().grad_year}
                curriculum={t(currentStudent().curriculum ?? "")}
                department={currentStudent().department}
                major={currentStudent().major}
                school_name={currentStudent().school_name}
                school_country={currentStudent().school_country}
                school_state_province={currentStudent().school_state_province}
                city={currentStudent().city}
            />
        </Card>
    );
};

export default InfoCard;
