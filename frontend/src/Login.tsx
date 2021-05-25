import React from 'react';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import Card from 'react-bootstrap/Card';
import MyFormInput from './MyFormInput';
import { useForm } from 'react-hook-form';
import { LoginForm } from './api/schemas';
import { login } from './api/auth';

function Login() {
    const {
        handleSubmit,
        control,
        formState: { errors }
    } = useForm<LoginForm>();

    const onSubmit = (data: LoginForm) => {
        console.log(data);
        login(data).then((data) => {
            if (data.loginResult) {
                alert('success');
            }
            else {
                alert('fail to login: ' + data.message);
            }
        })
    };

    return (
        <div className="Login">
            <Card>
                <Card.Header as="h5">登录</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit(onSubmit)} >
                        <MyFormInput
                            control={control as any}
                            name="identifier"
                            displayName="手机号码/邮箱"
                            error={errors.identifier}
                            errorMessage="此项为必填"
                            placeholder="请输入手机号码"
                            required={true}
                        />

                        <MyFormInput
                            control={control as any}
                            name="password"
                            displayName="密码"
                            controlProps={{ type: 'password' }}
                            error={errors.password}
                            errorMessage="此项为必填"
                            placeholder="请输入密码"
                            required={true}
                        />

                        <MyFormInput
                            control={control as any}
                            name="rememberMe"
                            displayName=""
                            required={false}
                            altRender={
                                ({ field: { onChange, value } }) => (
                                    <Form.Check onChange={onChange} value={value} type="checkbox" label="自动登录" />
                                )
                            }
                        />

                        <Form.Row>
                            <Col><Button variant="primary" type="submit">
                                登录
                        </Button></Col>
                            <Col> <Button variant="primary">
                                去注册
                        </Button></Col>
                        </Form.Row>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

export default Login;