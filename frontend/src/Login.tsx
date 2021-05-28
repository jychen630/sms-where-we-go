import React from 'react';

function Login() {
    return <></>;
    /*
    return (
        <div className="Login">
            <Card>
                <Card.Header as="h5">登录</Card.Header>
                <Card.Body>
                    <Form >
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
            </Card>-->
        </div>
    );*/
}

export default Login;