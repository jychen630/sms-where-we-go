import { Button, Card, Divider, Form, Input, notification, Select, Space } from 'antd';
import { useCallback } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Class, Result, Role, Service } from 'wwg-api';
import { useAuth } from '../api/auth';
import { createNotifyError, handleApiError } from '../api/utils';
import InfoList from './InfoList';

const classFormProps = (name: string) => ({
    name: name,
    required: true,
    noStyle: true,
})

type Values = { class_number_lower: string, class_number_upper: string, curriculum: string, grad_year: string };
const Classes = () => {
    const auth = useAuth();
    const [t] = useTranslation();
    const [form] = Form.useForm<Values>();
    const [classes, setClasses] = useState<Class[]>();

    const fetchClasses = useCallback(() => {
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

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    const handleFinish = useCallback((data: Values) => {
        let [lower, upper] = [parseInt(data.class_number_lower), parseInt(data.class_number_upper)]
        if (isNaN(upper)) { upper = lower; }
        let successes: string[] = [];
        let errors: string[] = [];

        Promise.all(new Array(upper - lower + 1).fill(0).map(async (_, index) => {
            console.log(index)
            return Service.postClass({
                class_number: lower + index,
                grad_year: Number.parseInt(data.grad_year),
                curriculum: data.curriculum
            })
                .then(res => {
                    if (res.result === Result.result.SUCCESS) {
                        successes.push(`${data.grad_year}届 ${lower + index}班`);
                        return Promise.resolve();
                    }
                    else {
                        errors.push(res.message);
                    }
                })
                .catch(err => handleApiError(err, (error) => {
                    errors.push(error.message);
                }));
        }))
            .then(_ => {
                if (errors.length > 0) return Promise.reject();
                notification.success({
                    message: '成功',
                    description: `已添加${successes.join(', ')} ${t(data.curriculum)}`,
                    duration: 2,
                });
                fetchClasses();
            })
            .catch(_ => {
                notification.error({
                    message: '失败',
                    description: <>
                        未能创建部分班级
                        <ul>
                            {errors.map(error =>
                                <li>{error}</li>
                            )}
                        </ul>
                    </>,
                    style: { maxHeight: 200, overflow: "hidden scroll" }
                });
            });

    }, [t, fetchClasses]);

    const handleDeleteClass = (classNumber: number, gradYear: number) => {
        Service.deleteClass({
            class_number: classNumber,
            grad_year: gradYear,
            force: false,
        }).then(res => {
            if (res.result === Result.result.SUCCESS) {
                notification.success({
                    message: '成功',
                    description: `已移除${gradYear}届 ${classNumber}班`,
                    duration: 1,
                });
                fetchClasses();
            }
            else {
                return Promise.reject(res.message);
            }
        }).catch(err => handleApiError(err, createNotifyError(t, '错误', '班级删除失败')))
    };

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
                {auth.role === Role.CURRICULUM || auth.role === Role.YEAR || auth.role === Role.SYSTEM ?
                    <Form.Item
                        name='class_number'
                        label='班级号码'
                        rules={[
                            ({ getFieldsValue }) => ({
                                transform: (val) => {
                                    return getFieldsValue(['class_number_lower', 'class_number_upper'])
                                },
                                validator(_, val) {
                                    if (val['class_number_upper'] === '') return Promise.resolve();
                                    let [lower, upper]: Partial<[number, number]> = [undefined, undefined]
                                    lower = parseInt(val['class_number_lower']);
                                    upper = parseInt(val['class_number_upper']);
                                    if (isNaN(lower) || isNaN(upper)) {
                                        return Promise.reject('班级区间必须为整数');
                                    }
                                    if (lower < 1 || lower > 99 || upper < 1 || upper > 99) {
                                        return Promise.reject('班级区间必须为 1~99 的整数');
                                    }
                                    if (lower > upper) {
                                        return Promise.reject('班级上限不能小于下限');
                                    }
                                    return Promise.resolve()
                                }
                            })
                        ]}
                    >
                        <Input.Group compact>
                            <Form.Item {...classFormProps('class_number_lower')}>
                                <Input type='number' style={{ width: 100 }} placeholder='下限'></Input>
                            </Form.Item>
                            <Input style={{ width: 35 }} placeholder='~' disabled></Input>
                            <Form.Item {...classFormProps('class_number_upper')}>
                                <Input type='number' style={{ width: 100 }} placeholder='上限'></Input>
                            </Form.Item>
                        </Input.Group>
                    </Form.Item>
                    :
                    <Select disabled defaultActiveFirstOption>
                        {auth.classNumber &&
                            <Select.Option value={auth.classNumber}>{auth.classNumber}</Select.Option>
                        }
                    </Select>
                }
                <Form.Item name='curriculum' label='体系' required rules={[
                    {
                        required: true,
                        message: '体系为必填项'
                    }
                ]}>
                    {auth.role === Role.YEAR || auth.role === Role.SYSTEM ?
                        <Select defaultActiveFirstOption>
                            <Select.Option value='gaokao'>{t('gaokao')}</Select.Option>
                            <Select.Option value='international'>{t('international')}</Select.Option>
                        </Select>
                        :
                        <Select disabled defaultActiveFirstOption>
                            {auth.curriculum &&
                                <Select.Option value={auth.curriculum}>{auth.curriculum}</Select.Option>
                            }
                        </Select>
                    }
                </Form.Item>
                <Button type='primary' htmlType='submit'>提交</Button>
            </Form>
            <Divider>查看班级</Divider>
            {!!classes && classes.map((class_) =>
                <Card key={`${class_.grad_year} ${class_.class_number}`}>
                    <Space direction='vertical'>
                        <InfoList {...class_} key={`${class_.grad_year} ${class_.class_number}`} />
                        <Button onClick={() => handleDeleteClass(class_.class_number, class_.grad_year)} danger>删除</Button>
                    </Space>
                </Card>
            )}
        </>
    )
}

export default Classes;