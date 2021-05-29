import { Button, Divider, Form, Input, Space, notification } from 'antd';
import { Result, Service } from 'wwg-api';
import { handleApiError } from '../api/utils';

type Values = Parameters<typeof Service.postSchool>[0];

const AddSchoolForm = (props: { cb?: (schoolUid: number) => void }) => {
    const [form] = Form.useForm<Values>();

    const handleFinish = (data: Values) => {
        Service.postSchool(data)
            .then((res) => {
                if (res.result === Result.result.SUCCESS) {
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
            <Form.Item
                name='school_country'
                label='国家'
            >
                <Input placeholder='学校的所在的国家' />
            </Form.Item>
            <Form.Item
                name='school_state_province'
                label='省份/州'
            >
                <Input placeholder='学校所在的省份或州' />
            </Form.Item>
            <Form.Item
                name='city'
                label='城市'
            >
                <Input placeholder='学校所在的城市' />
            </Form.Item>
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