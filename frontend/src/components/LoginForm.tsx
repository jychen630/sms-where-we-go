import { Button, Form, Space, Spin, notification, Input } from 'antd';
import { FieldTimeOutlined, InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Result, Service } from 'wwg-api';
import { handleApiError } from '../api/utils';

// States
const phonePattern = /^1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[0-35-9]\d{2}|4(?:0\d|1[0-2]|9\d))|9[0-35-9]\d{2}|6[2567]\d{2}|4(?:(?:10|4[01])\d{3}|[68]\d{4}|[579]\d{2}))\d{6}$/;
// https://stackoverflow.com/a/201378/11612399
const emailPattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/ // eslint-disable-line


// Functions

const LoginForm = () => {

    const validateLogin = async (
        password: any,
        identifier: any,
        use_uid?: any,

    ): Promise<void> => {
        return Service.login({
            password: password,
            identifier: identifier,
            use_uid: use_uid ?? false,
        })
            .then((res) => {
                // success
                if (res.result === Result.result.SUCCESS) {
                    notification.success({
                        message: '登录成功',
                        description: <Space>即将前往登录页面 <Spin /></Space>,
                        duration: 1.5
                    });
                    return Promise.resolve();
                }
                // fail
                else {
                    console.error(res.message);
                    return Promise.reject('登录错误1');
                }
            })
            .catch((err) => handleApiError(err).then((res) => {
                notification.error({
                    message: '登录失败',
                    description: res.message ?? '登录时发生未知错误'
                });
            }
            ))
    };

    return (
        <>
            <Form  >
                <Form.Item
                    name='identifier' //or uid?
                    label='手机号/邮箱'
                    tooltip='注册时填写的手机号或邮箱，任选一种即可'
                    required 
                    rules={[
                        {
                            required: true,
                            message: '手机号/邮箱不能为空'
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const email = getFieldValue('email');
                                if (!!value && !value.match(phonePattern) && !value.match(emailPattern)) {
                                    return Promise.reject('请正确填写电话号码或者邮箱');
                                }
                                else {
                                    return Promise.resolve();
                                }
                            }
                        })

                    ]}
                    hasFeedback
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


            </Form>
        </>
    )


}


export default LoginForm;
