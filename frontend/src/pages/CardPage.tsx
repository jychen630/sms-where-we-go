import React from "react";
import { Col, ColProps, Card, Row } from "antd";

const responsive: ColProps = { xs: 22, sm: 22, md: 14, lg: 10, xl: 8, xxl: 6 };
const CardPage = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => {
    return (
        <>
            <Row align="middle" justify="center" style={{ marginTop: "30px" }}>
                <Col {...responsive}>
                    <Card
                        title={title}
                        style={{ boxShadow: "#ebebeb 1px 1px 20px 3px" }}
                    >
                        {children}
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default CardPage;
