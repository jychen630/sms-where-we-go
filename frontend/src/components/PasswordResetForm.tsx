import { Button, Form, Input, notification } from "antd"
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Result, Service } from "wwg-api";
import { createNotifyError, handleApiError } from "../api/utils";

const { Item } = Form;
type Values = { password: string }
const PasswordResetForm = ({ studentUid }: { studentUid?: number }) => {
    const [t] = useTranslation();
    const [form] = Form.useForm<Values>();

    const handleFinish = useCallback((data: Values) => {
        Service.updateStudent({
            student_uid: studentUid,
            password: data.password
        })
            .then(res => {
                if (res.result === Result.result.SUCCESS) {
                    notification.success({
                        message: '成功',
                        description: '成功更改密码'
                    });
                }
                else {
                    return Promise.reject(res.message);
                }
            })
            .catch(err => handleApiError(err, createNotifyError(t, '失败', '更改密码失败')))
    }, [t, studentUid]);

    return (
        <Form
            form={form}
            onFinish={handleFinish}
        >
            <Item name='password' label='密码' tooltip='您的密码将会通过bcrypt加密存储，客户端与服务器的所有通讯通过https协议完成' required rules={[
                {
                    required: true,
                    message: '密码不能为空'
                }
            ]}>
                <Input.Password placeholder='请输入密码' />
            </Item>
            <Item name='confirm' label='确认密码' dependencies={['password']} rules={[
                {
                    required: true,
                    message: '请确认密码'
                },
                ({ getFieldValue }) => ({
                    validator(_, value) {
                        const password = getFieldValue('password')
                        if (!value || password === value) {
                            return Promise.resolve();
                        }
                        else {
                            return Promise.reject('两次输入的密码不一致');
                        }
                    }
                })
            ]} required>
                <Input.Password placeholder='请再次输入密码' />
            </Item>
            <Item>
                <Button htmlType='submit' type='primary'>更改密码</Button>
            </Item>
        </Form>
    )
}

export default PasswordResetForm;
