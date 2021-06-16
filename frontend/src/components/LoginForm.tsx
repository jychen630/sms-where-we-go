import { Form, Space, Spin, notification, Input, Button } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { Result, Service } from 'wwg-api';
import { useAuth } from '../api/auth';
import { createNotifyError, handleApiError } from '../api/utils';

// constants
const phonePattern = /^1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[0-35-9]\d{2}|4(?:0\d|1[0-2]|9\d))|9[0-35-9]\d{2}|6[2567]\d{2}|4(?:(?:10|4[01])\d{3}|[68]\d{4}|[579]\d{2}))\d{6}$/;
// https://stackoverflow.com/a/201378/11612399
const emailPattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/ // eslint-disable-line
type Value = Parameters<typeof Service.login>[0];

// Functions

const LoginForm = () => {
    const [form] = Form.useForm<Value>();
    const location = useLocation();
    const history = useHistory();
    const auth = useAuth();
    const validateLogin = async (
        { password,
            identifier,
            use_uid }: Value
    ): Promise<any> => {
        if (!!!password || !!!identifier) {
            return;
        }
        return auth.login(
            password,
            identifier,
            use_uid,
        )
            .then((res) => {
                // success
                if (res.result === Result.result.SUCCESS) {
                    notification.success({
                        message: '登录成功',
                        description: <Space>加载中 <Spin /></Space>,
                        duration: 1
                    });
                    console.log(location.state);
                    const dest = (typeof location.state === 'object' && location.state !== null && 'pathname' in (location.state)) ? (location.state as any).pathname : '/map';
                    setTimeout(() => history.push(dest), 1500);
                    return Promise.resolve();
                }
                // fail
                else {
                    console.error(res.message);
                    return Promise.reject(res.message);
                }
            })
            .catch((err) => handleApiError(err, createNotifyError('登录失败')))
    };

    return (
        <>
            <Form
                form={form}
                layout='vertical'
                onFinish={validateLogin}
            >
                <Form.Item
                    name='identifier' //or uid?
                    label='手机号/邮箱'
                    tooltip='注册时填写的手机号或邮箱，任选一种即可'
                    required
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: '手机号/邮箱不能为空'
                        },
                        {
                            validator(_, value) {
                                if (!!value && !value.match(phonePattern) && !value.match(emailPattern)) {
                                    return Promise.reject('请正确填写电话号码或者邮箱');
                                }
                                else {
                                    return Promise.resolve();
                                }
                            }
                        }

                    ]}
                >
                    <Input placeholder='e.g: 13666666660' />
                </Form.Item>
                <Form.Item
                    name='password'
                    label='密码'
                    required
                    rules={[
                        {
                            required: true,
                            message: '密码不能为空'
                        }
                    ]}>
                    <Input.Password placeholder='请输入密码' />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type='primary' htmlType='submit'>登录</Button>
                        <Button type='link' onClick={() => history.push('/register')}>切换到注册</Button>
                    </Space>
                </Form.Item>
            </Form>
        </>
    )
}


export default LoginForm;
