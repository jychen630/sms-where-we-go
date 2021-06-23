import { Button, Card, Divider, Form, Input, notification, Select } from 'antd';
import { useCallback } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Class, Result, Role, Service } from 'wwg-api';
import { useAuth } from '../api/auth';
import { createNotifyError, handleApiError } from '../api/utils';
import InfoList from './InfoList';

type Values = { class_number: number, curriculum: string, grad_year: number };
const Classes = () => {
    const auth = useAuth();
    const [t] = useTranslation();
    const [form] = Form.useForm<Values>();
    const [classes, setClasses] = useState<Class[]>();

    useEffect(() => {
        Service.getClass()
            .then((res) => {
                if (res.result === Result.result.SUCCESS) {
                    setClasses(res.classes);
                }
                else {
                    return Promise.reject(res.message);
                }
            })
            .catch(err => handleApiError(err, createNotifyError(t, t('Error'), '未能获取可用班级')));
    }, [t, setClasses]);

    const handleFinish = useCallback((data: Values) => {
        Service.postClass(data)
            .then(res => {
                if (res.result === Result.result.SUCCESS) {
                    notification.success({
                        message: '成功',
                        description: `已添加${data.grad_year}届 ${data.class_number}班 ${t(data.curriculum)}`,
                        duration: 1
                    });
                }
                else {
                    return Promise.reject(res.message);
                }
            })
            .catch(err => handleApiError(err, createNotifyError(t, '错误', '未能添加新班级')));
    }, [t]);

    return (
        <>
            <Divider>添加班级</Divider>
            <Form
                form={form}
                title='添加班级'
                onFinish={handleFinish}
            >
                <Form.Item name='grad_year' label='毕业年份' required rules={[
                    {
                        required: true,
                        message: '毕业年份为必填项'
                    },
                    {
                        len: 4,
                        message: '请正确填写毕业年份'
                    }
                ]}>
                    {auth.role === Role.SYSTEM ?
                        <Input type='number' placeholder='请输入毕业年份'></Input>
                        :
                        <Select disabled defaultActiveFirstOption>
                            {auth.gradYear &&
                                <Select.Option value={auth.gradYear}>{auth.gradYear}</Select.Option>
                            }
                        </Select>
                    }
                </Form.Item>
                <Form.Item name='class_number' label='班级号码' required rules={[
                    {
                        required: true,
                        message: '班级号码为必填项'
                    },
                    {
                        min: 1,
                        max: 2,
                        message: '班级号码必须在 1~99 的区间内'
                    }
                ]}>
                    {auth.role === Role.CURRICULUM || auth.role === Role.YEAR || auth.role === Role.SYSTEM ?
                        <Input type='number' placeholder='请输入班级号码'></Input>
                        :
                        <Select disabled defaultActiveFirstOption>
                            {auth.classNumber &&
                                <Select.Option value={auth.classNumber}>{auth.classNumber}</Select.Option>
                            }
                        </Select>
                    }
                </Form.Item>
                <Button type='primary' htmlType='submit'>提交</Button>
            </Form>
            <Divider>查看班级</Divider>
            {!!classes && classes.map((class_) =>
                <Card>
                    <InfoList {...class_} key={`${class_.grad_year} ${class_.class_number}`} />
                </Card>
            )}
        </>
    )
}

export default Classes;