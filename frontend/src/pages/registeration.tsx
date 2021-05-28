import { Col, Card, Row } from 'antd';
import RegistrationForm from '../components/RegistrationForm';

const responsive = { xs: 22, sm: 22, md: 14, lg: 10, };

const Registration = () => {
    return (
        <>
            <Row
                align='middle'
                justify='center'
                style={{ marginTop: '30px' }}>
                <Col {...responsive}>
                    <Card title='Where We Go 注册'>
                        <RegistrationForm />
                    </Card>
                </Col>
            </Row>
        </>
    );
}

export default Registration;
