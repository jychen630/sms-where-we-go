import { CheckCircleFilled } from '@ant-design/icons';
import { Button, Divider, Form, Input, Space, Tabs, notification } from 'antd';
import { useState } from 'react';
import { Result, Service } from 'wwg-api';
import { handleApiError } from '../api/utils';
import SearchTool, { SearchHandlerProps } from './SearchTool';

type Values = Parameters<typeof Service.postSchool>[0];

const fetchCity = async (props: SearchHandlerProps) => {
    try {
        const result = await Service.getCity(props.offset, props.limit, props.value);
        if (!!result.cities && result.result === Result.result.SUCCESS) {
            return result.cities;
        }
        else {
            throw new Error('Failed to search for the cities');
        }
    }
    catch (err) {
        handleApiError(err).then((res) => {
            console.error(res.message);
        });
    }
}

const AddSchoolForm = (props: { cb?: (schoolUid: number) => void }) => {
    const [form] = Form.useForm<Values>();
    const [currentTab, setCurrentTab] = useState('select');
    const [cityUid, setCityUid] = useState(-1);

    const handleFinish = (data: Values) => {
        Service.postSchool(currentTab === 'select' ? {
            ...data,
            city_uid: cityUid
        } : data)
            .then((res) => {
                if (res.result === Result.result.SUCCESS) {
                    notification.success({
                        message: '添加成功',
                        description: <>已添加{data.school_name} (uid {res.school_uid})</>,
                    })
                    if (props.cb) props.cb(res.school_uid ?? 0);
                }
                else {
                    return Promise.reject(res.message);
                }
            }).catch((err) => handleApiError(err).then((res) => {
                notification.error({
                    message: '添加学校失败',
                    description: res.message ?? '添加学校时发生未知错误'
                });
            }))
    }

    return (
        <Form
            form={form}
            onFinish={handleFinish}
        >
            <Form.Item
                name='school_name'
                label='学校名'
                required
                rules={[
                    {
                        required: true,
                        message: '请填写学校名称'
                    }
                ]}
            >
                <Input placeholder='学校的正式名称（非缩写，昵称）' />
            </Form.Item>
            <Tabs defaultActiveKey='select' onChange={(key) => { setCurrentTab(key) }}>
                <Tabs.TabPane key='select' tab='选择城市'>
                    <SearchTool
                        searchHandler={fetchCity}
                        item={(value, index) =>
                            <Button onClick={() => setCityUid(value.city_uid)} type={value.city_uid === cityUid ? 'primary' : 'text'} block>
                                {value.city}, {value.state_province}, {value.country}
                                {value.city_uid === cityUid &&
                                    <CheckCircleFilled />
                                }
                            </Button>
                        }
                        placeholder='输入城市名'
                    />
                </Tabs.TabPane>
                <Tabs.TabPane key='add' tab='添加城市'>
                    <Form.Item
                        name='city'
                        label='城市'
                        required
                        rules={[
                            {
                                validator(_, value) {
                                    if (!!!value && currentTab === 'add') {
                                        return Promise.reject("学校所在的城市不能为空")
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input placeholder='学校所在的城市' />
                    </Form.Item>
                    <Form.Item
                        name='school_state_province'
                        label='省份/州'
                    >
                        <Input placeholder='学校所在的省份或州' />
                    </Form.Item>
                    <Form.Item
                        name='school_country'
                        label='国家'
                        required
                        rules={[
                            {
                                validator(_, value) {
                                    if (!!!value && currentTab === 'add') {
                                        return Promise.reject("学校所在的国家不能为空")
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input placeholder='学校的所在的国家' />
                    </Form.Item>
                </Tabs.TabPane>
            </Tabs>
            <Divider>坐标</Divider>
            <Space>
                <Form.Item
                    name='longtitude'
                    label='经度'
                >
                    <Input placeholder='经度，如 114.1216' />
                </Form.Item>
                <Form.Item
                    name='latitude'
                    label='纬度'
                >
                    <Input placeholder='纬度，如 22.5514' />
                </Form.Item>
            </Space>
            <Form.Item>
                <Space>
                    <Button type='ghost' htmlType='submit'>
                        预览
                    </Button>
                    <Button type='primary' htmlType='submit'>
                        添加
                    </Button>
                </Space>
            </Form.Item>
            <a href='https://lbs.amap.com/tools/picker' target='new'>通过高德API搜索坐标</a>
        </Form>
    )
}

export default AddSchoolForm;