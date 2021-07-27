import { CheckCircleFilled, EnvironmentOutlined } from '@ant-design/icons';
import { faAddressCard, faMap, faMapPin } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Card, Divider, Form, Input, Modal, Space, Tabs, notification, Switch } from 'antd';
import { useEffect } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Coordinate, Result, Service } from 'wwg-api';
import { createNotifyError, handleApiError } from '../api/utils';
import InfoCard from './InfoCard';
import { Optional } from './InfoList';
import Map, { MapItem } from './Map';
import SearchTool, { SearchHandlerProps } from './SearchTool';

type Values = Parameters<typeof Service.postSchool>[0];

type Location = Coordinate & {
    name: string;
    city?: string | undefined;
    address?: string | undefined;
}

enum Provider {
    AMAP = 'amap',
    MAPBOX = 'mapbox'
};

const AddSchoolForm = (props: { cb?: (schoolUid: number) => void }) => {
    const [t] = useTranslation();
    const [page, setPage] = useState(0);
    const [form] = Form.useForm<Values>();
    const [cityUid, setCityUid] = useState(-1);
    const [visible, setVisible] = useState(false);
    const [location, setLocation] = useState<Location>();
    const [currentTab, setCurrentTab] = useState('select');
    const [provider, setProvider] = useState<Provider>(Provider.AMAP);

    const fetchCity = useCallback(async (props: SearchHandlerProps) => {
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
            handleApiError(err, createNotifyError(t, '错误', '获取城市列表失败'));
        }
    }, [t]);

    const handleFinish = (data: Values) => {
        if (data.longitude === undefined || data.latitude === undefined) {
            notification.error({
                message: '错误',
                description: '坐标不能为空',
                duration: 1.5
            });
            return;
        }
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
    useEffect(() => {
        form.setFieldsValue({
            longitude: location?.longitude,
            latitude: location?.latitude
        });
    }, [form, location])

    const mockStudentData = useCallback(async (): Promise<MapItem[]> => {
        return [{
            students: [{
                uid: 0,
                name: "示例学生",
                class_number: 2,
                grad_year: 2020,
            }],
            longitude: location?.longitude,
            latitude: location?.latitude,
            school_name: location?.name ?? '示例学校',
            city: location?.city ?? '',
        }];
    }, [location]);

    const getPreview = useCallback(async (props: SearchHandlerProps): Promise<Location[]> => {
        return Service.getLocation(props.value, props.offset + 1, "", "", provider)
            .then(res => {
                return res.locations;
            })
            .catch(err => {
                return [];
            });
    }, [provider]);

    return (
        <Form
            form={form}
            onFinish={handleFinish}
            scrollToFirstError
        >
            <div style={page !== 0 ? { display: 'none' } : {}}>
                <Form.Item
                    name='school_name'
                    label='学校名'
                    required
                    rules={[
                        {
                            required: true,
                            message: '请填写学校名称 (海外大学请填写英文名)'
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
                            placeholder='输入城市名 (已收录国内大部分城市)'
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane key='add' tab='添加城市 (国外/国内未收录地区)'>
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
                            <Input placeholder='学校所在的城市 (海外地区请填写英文)' />
                        </Form.Item>
                        <Form.Item
                            name='school_state_province'
                            label='省份/州/郡'
                        >
                            <Input placeholder='学校所在的省份，州或郡 (海外地区请填写英文)' />
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
                            <Input placeholder='学校的所在的国家 (海外地区请填写英文)' />
                        </Form.Item>
                    </Tabs.TabPane>
                </Tabs>
                <Form.Item>
                    <Button type='primary' onClick={() => {
                        if (currentTab === 'select' && cityUid === -1) {
                            notification.error({
                                message: '错误',
                                description: '城市不能为空',
                                duration: 1.5
                            })
                            return;
                        }
                        form.validateFields(['school_name', 'city', 'school_country'])
                            .then(() => {
                                setPage(1);
                            })
                    }}>下一步</Button>
                </Form.Item>
            </div>
            <div style={page !== 1 ? { display: 'none' } : {}}>
                <Divider>坐标</Divider>
                <p>为了使得你添加的学校能够在地图上显示，我们需要录入学校的坐标</p>
                <p>你可以使用搜索功能自动填入学校的坐标，也可以在其他网站上查询后手动输入</p>
                <Space>
                    <Form.Item
                        name='longitude'
                        label='经度'
                        validateFirst
                        rules={[
                            { type: 'number', message: '经度必须为数字', transform: (val) => Number.parseFloat(val) },
                            { required: true, message: '经度不能为空' },
                            {
                                validator(_, val) {
                                    if (val > 180 || val < -180) {
                                        return Promise.reject("经度必须在-180和180之间");
                                    }
                                    else {
                                        return Promise.resolve();
                                    }
                                }
                            }]}
                    >
                        <Input type='number' placeholder='经度，如 114.1216' />
                    </Form.Item>
                    <Form.Item
                        name='latitude'
                        label='纬度'
                        validateFirst
                        rules={[
                            { type: 'number', message: '纬度必须为数字', transform: (val) => Number.parseFloat(val) },
                            { required: true, message: '纬度不能为空' },
                            {
                                validator(_, val) {
                                    if (val > 90 || val < -90) {
                                        return Promise.reject("纬度必须在-90和90之间");
                                    }
                                    else {
                                        return Promise.resolve();
                                    }
                                }
                            }
                        ]}
                    >
                        <Input type='number' placeholder='纬度，如 22.5514' />
                    </Form.Item>
                </Space>
                <h3>搜索 & 预览</h3>
                <Map initialZoom={8} getData={mockStudentData} getPopup={(props) => <InfoCard items={props} />} zoom={8} startingCoordinate={!!location?.latitude && !!location.longitude ? { longitude: location.longitude, latitude: location.latitude - 0.005 } : undefined} responsive></Map>
                {!!location && <Card>
                    <Optional content={location.name} icon={<FontAwesomeIcon icon={faAddressCard} />} />
                    <Optional content={<>({location.longitude?.toFixed(5)}, {location.latitude?.toFixed(5)})</>} icon={<FontAwesomeIcon icon={faMapPin} />} dependencies={[location.longitude, location.latitude]} />
                    <Optional content={location.city} icon={<EnvironmentOutlined />} />
                    <Optional content={location.address} icon={<FontAwesomeIcon icon={faMap} />} />
                </Card>
                }
                <Form.Item label="搜索范围">
                    <Switch
                        checkedChildren="国际"
                        unCheckedChildren="仅国内"
                        onChange={(checked) => { setProvider(checked ? Provider.MAPBOX : Provider.AMAP) }}
                    />
                </Form.Item>
                <SearchTool
                    initialValue={form.getFieldValue('school_name')}
                    placeholder='输入学校名称'
                    searchHandler={getPreview}
                    searchLimit={1}
                    item={(value, index) =>
                        <Button style={{ textAlign: 'left', width: '100%', overflowX: 'hidden' }} onClick={() => setLocation(value)} type={(value.name === location?.name && value.address === location?.address) ? 'primary' : 'text'} block>
                            {value.name === location?.name && value.address === location?.address &&
                                <CheckCircleFilled />
                            }
                            {value.name}
                            <span style={{ fontSize: '0.5rem' }}>{value.city} {value.address} ({value.longitude?.toFixed(5)}, {value.latitude?.toFixed(5)})</span>
                        </Button>
                    }
                />
                <p>或者手动搜索坐标：</p>
                <p><a href='https://lbs.amap.com/tools/picker' target='new'>使用高德地图</a></p>
                <p><a href='https://www.google.com/maps' target='new'>使用 Google Maps (需要科学上网)</a></p>
                <Form.Item>
                    <Space>
                        <Button type='ghost' onClick={() => {
                            setPage(0);
                        }}>上一步</Button>`
                        <Button type='primary' htmlType='submit'>
                            添加
                        </Button>
                    </Space>
                </Form.Item>
            </div>
            <Modal title='预览' visible={visible} okText={t('Save')} cancelText={t('Cancel')} onCancel={() => setVisible(false)} width={600}>
                <Map getData={mockStudentData} getPopup={(props) => <InfoCard items={props} />} zoom={10.5} startingCoordinate={!!location?.latitude && !!location.longitude ? { longitude: location.longitude, latitude: location.latitude - 0.005 } : undefined} responsive></Map>
                {!!location && <Card>
                    <Optional content={location.name} icon={<FontAwesomeIcon icon={faAddressCard} />} />
                    <Optional content={<>({location.longitude?.toFixed(5)}, {location.latitude?.toFixed(5)})</>} icon={<FontAwesomeIcon icon={faMapPin} />} dependencies={[location.longitude, location.latitude]} />
                    <Optional content={location.city} icon={<EnvironmentOutlined />} />
                    <Optional content={location.address} icon={<FontAwesomeIcon icon={faMap} />} />
                </Card>
                }
                <SearchTool
                    initialValue={form.getFieldValue('school_name')}
                    placeholder='输入关键词'
                    searchHandler={getPreview}
                    searchLimit={1}
                    item={(value, index) =>
                        <Button style={{ textAlign: 'left', width: '100%', overflowX: 'hidden' }} onClick={() => setLocation(value)} type={(value.name === location?.name && value.address === location?.address) ? 'primary' : 'text'} block>
                            {value.name === location?.name && value.address === location?.address &&
                                <CheckCircleFilled />
                            }
                            {value.name}
                            <span style={{ fontSize: '0.5rem' }}>{value.city} {value.address} ({value.longitude?.toFixed(5)}, {value.latitude?.toFixed(5)})</span>
                        </Button>
                    }
                />
            </Modal>
        </Form>
    )
}

export default AddSchoolForm;