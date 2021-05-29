import { Col, Card, Row } from 'antd';
import LoginForm from '../components/LoginForm';

const responsive = { xs: 22, sm: 22, md: 14, lg: 10, };

const Login = () => {
    return (
        <>
            <Row
                align='middle'
                justify='center'
                style={{ marginTop: '30px' }}>
                <Col {...responsive}>
                    <Card title='Where We Go 登录'>
                        <LoginForm />
                    </Card>
                </Col>
            </Row>
        </>
    );
}

export default Login;
