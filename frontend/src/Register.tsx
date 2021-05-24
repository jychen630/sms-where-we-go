import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import MyFormInput from './MyFormInput';
import { useForm } from 'react-hook-form';

function Register() {
    const {
        handleSubmit,
        control,
        formState: { errors },
        watch
    } = useForm();

    const onSubmit = (data: any) => {
        console.log(data);
    };

    const watchSchoolName = watch("schoolName");

    return (
        <div className="Register"> 
        <Card>
            <Card.Header as="h5">注册</Card.Header>
            <Card.Body>

                <Form onSubmit={handleSubmit(onSubmit)} >
                    <MyFormInput
                        control={control as any}
                        name="name"
                        displayName="姓名"
                        error={errors.name}
                        errorMessage="此项为必填"
                        placeholder="请输入姓名"
                        required={true}
                    />

                    <MyFormInput
                        control={control as any}
                        name="registration_key"
                        displayName="注册码"
                        error={errors.registration_key}
                        errorMessage="此项为必填"
                        placeholder="请输入注册码（where）"
                        required={true}
                    />

                    <MyFormInput
                        control={control as any}
                        name="phone_number"
                        displayName="请输入手机号码（选填）"
                        placeholder="186******60"
                        required={false}

                    />
                    <MyFormInput
                        control={control as any}
                        name="email"
                        displayName="请输入邮箱（选填）"
                        placeholder="abc@123.com"
                        required={false}

                    />

                    <MyFormInput
                        control={control as any}
                        name="wxid"
                        displayName="请输入微信账号（选填）"
                        placeholder="wxid123"
                        required={false}

                    /><MyFormInput
                        control={control as any}
                        name="schoolName"
                        displayName="就读大学"
                        required={false}
                        controlProps={{ className: "search-input" }}
                    />
                    {watchSchoolName &&
                        <ListGroup className="dropdown">
                            <ListGroup.Item action>Cras justo odio</ListGroup.Item>
                            <ListGroup.Item action>Dapibus ac facilisis in</ListGroup.Item>
                        </ListGroup>
                    }
                    <MyFormInput
                        control={control as any}
                        name="wxid"
                        displayName="请输入学院名称（选填）"
                        placeholder=""
                        required={false}

                    />
                    <MyFormInput
                        control={control as any}
                        name="wxid"
                        displayName="请输入专业全称（选填）"
                        required={false}

                    />
                    <Form.Row>
                        <Col>
                            <Button variant="primary">
                                注册
                        </Button>
                        </Col>
                        <Col>
                            <Button variant="primary" type="submit">
                                已注册，去登录
                        </Button>
                        </Col>
                    </Form.Row>


                </Form>

            </Card.Body>
        </Card>
        </div>
    );
}

export default Register;