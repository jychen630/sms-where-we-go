import { WarningOutlined } from "@ant-design/icons";
import { Alert, Button, Divider, Form, Input, notification, Select, Space, Switch, Tooltip } from "antd"
import throttle from "lodash/throttle";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Result, Role, School, Service, Student, StudentFieldsVisibility, StudentVerbose, Visibility } from "wwg-api";
import { useDict } from "../api/useDict";
import { handleApiError, ThenType } from "../api/utils";
import { emailPattern, phonePattern } from "./RegistrationForm";
import SchoolSearchTool from "./SchoolSearchTool";

type Values = Parameters<typeof Service.updateStudent>[0];
const { Item } = Form;

const InfoUpdateForm = ({ getStudent, showRoleOptions = false }: { showRoleOptions?: boolean, getStudent: () => Promise<Partial<Student & StudentVerbose & School & { role?: Role, visibility?: Visibility, field_visibility?: StudentFieldsVisibility }> | undefined> }) => {
    const [t] = useTranslation();
    const [form] = Form.useForm<Values>();
    const [role, setRole] = useState<Role | undefined>(undefined);
    const [schoolUid, setSchoolUid] = useState(-1);
    const [studentUid, setStudentUid] = useState(-1);
    const [initialSchool, setInitialSchool] = useState('');
    const [, setFields] = useState<ThenType<ReturnType<typeof getStudent>>>(undefined);
    const [saving, setSaving] = useState(false);
    const [fieldVisibility, updateFieldVisibility, setFieldVisibility] = useDict<boolean, StudentFieldsVisibility>({});
    const getVisibilityDescription = useCallback((visibility: Visibility) => {
        switch (visibility) {
            case Visibility.PRIVATE:
                return t('Only visible to the user');
            case Visibility.CLASS:
                return t('Only visible to the students in the same class');
            case Visibility.CURRICULUM:
                return t('Only visible to the students in the same curriculum');
            case Visibility.YEAR:
                return t('Only visible to the students graduating in the same year');
            case Visibility.STUDENTS:
                return t('Visible to every registered user');
            default:
                return t('');
        }
    }, [t]);
    const getRoleDescription = useCallback((role: Role) => {
        switch (role) {
            case Role.STUDENT:
                return t('ROLE TIP STUDENT');
            case Role.CLASS:
                return t('ROLE TIP CLASS');
            case Role.CURRICULUM:
                return t('ROLE TIP CURRICULUM');
            case Role.YEAR:
                return t('ROLE TIP YEAR');
            case Role.SYSTEM:
                return t('ROLE TIP SYSTEM');
            default:
                return t('');
        }
    }, [t]);

    const getFields = useCallback(async () => {
        return getStudent().then(res => {
            const data = {
                name: res?.name,
                class_number: res?.class_number,
                grad_year: res?.grad_year,
                curriculum: res?.curriculum,
                phone_number: res?.phone_number,
                email: res?.email,
                wxid: res?.wxid,
                department: res?.department,
                major: res?.major,
                visibility: res?.visibility,
                role: res?.role,
                school_uid: res?.school_uid ?? -1,
                school_name: res?.school_name
            };
            setRole(res?.role);
            setStudentUid(res?.uid ?? -1);
            setFieldVisibility(res?.field_visibility);
            setFields(data);
            return data
        });
    }, [setFields, getStudent, setFieldVisibility]);

    const createToggleSuffix = useCallback((name: keyof StudentFieldsVisibility) => {
        if (!!!fieldVisibility) {
            return {};
        }
        const checked = fieldVisibility[name] !== undefined ? !fieldVisibility[name] : false;
        return {
            suffix: <Switch
                checked={checked}
                onChange={val => { updateFieldVisibility(name, !val) }}
                checkedChildren='已隐藏'
                unCheckedChildren='他人可见'
            />
        };
    }, [fieldVisibility, updateFieldVisibility]);

    const initialize = useCallback(() => {
        getFields()
            .then(res => {
                form.setFieldsValue(res);
                setSchoolUid(res?.school_uid ?? -1);
                setInitialSchool(res?.school_name ?? '');
            });
    }, [getFields, form])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const doUpdate = useCallback(throttle((data: Values) => {
        let toClear: Parameters<typeof Service.updateStudent>[0]['clear'] = [];
        if (schoolUid === -1) {
            delete data.school_uid;
            toClear.push('school_uid');
        }
        if (!!!data.phone_number) {
            delete data.phone_number;
            toClear.push('phone_number')
        }
        if (!!!data.email) {
            delete data.email;
            toClear.push('email');
        }
        if (data.role === role) {
            // Avoid updating role if the user doesn't change it at all
            delete data.role;
        }
        Service.updateStudent({
            ...data,
            school_uid: schoolUid,
            clear: toClear,
            student_uid: studentUid !== -1 ? studentUid : undefined,
            field_visibility: fieldVisibility
        })
            .then((res) => {
                if (res.result === Result.result.SUCCESS) {
                    notification.success({
                        message: '成功',
                        description: '数据已保存',
                        duration: 0.5
                    });
                    setFields(undefined);
                }
                else {
                    return Promise.reject(res.message);
                }
            })
            .catch((err) => {
                handleApiError(err)
                    .then((res) => {
                        notification.error({
                            message: '错误',
                            description: `未能更新学生数据。错误信息：${res.message ?? '未知错误'}`
                        })
                    })
            })
            .finally(() => {
                setSaving(false);
            });
    }, 1500), [schoolUid, studentUid, setFields, setSaving, fieldVisibility]);

    const handleFinished = useCallback((data: Values) => {
        if (!saving) {
            setSaving(true);
        }
        doUpdate(data);
    }, [doUpdate, saving]);

    const handleReset = () => {
        initialize();
    };

    useEffect(initialize, [initialize]);

    return <>
        <Form
            form={form}
            onFinish={handleFinished}
            layout='vertical'
        >
            <Divider>更新个人信息</Divider>
            <Alert message={<Space><WarningOutlined />注意：你的任何改动在<b>保存后</b>才会生效</Space>} />
            <Item
                name="name"
                label={t("name")}
                rules={[
                    {
                        required: true,
                        message: '姓名不能为空'
                    }
                ]}
            >
                <Input placeholder='中文姓名' />
            </Item>
            <Form.Item
                name='phone_number'
                label='电话号码'
                rules={[
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            const email = getFieldValue('email');
                            if (!!!email && !!!value) {
                                return Promise.reject('请在电话号码和邮箱中至少填写一项');
                            }
                            else if (!!value && !value.match(phonePattern)) {
                                return Promise.reject('请正确填写电话号码');
                            }
                            else {
                                return Promise.resolve();
                            }
                        }
                    })
                ]}
                tooltip='电话号码和邮箱请至少填写一项，两者都将能够作为登录的凭证'
            >
                <Input placeholder='请输入电话号码' {...createToggleSuffix('phone_number')} />
            </Form.Item>
            <Form.Item
                name='email'
                label='邮箱'
                rules={[
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            const phoneNumber = getFieldValue('phone_number');
                            if (!!!phoneNumber && !!!value) {
                                return Promise.reject('请在电话号码和邮箱中至少填写一项');
                            }
                            else if (!!value && !value.match(emailPattern)) {
                                return Promise.reject('请正确填写邮箱');
                            }
                            else {
                                return Promise.resolve();
                            }
                        }
                    })
                ]}
            >
                <Input placeholder='请输入邮箱'  {...createToggleSuffix('email')} />
            </Form.Item>
            <Form.Item
                name='wxid'
                label='微信ID'
                tooltip='若已填写微信所绑定的电话号码，或无微信ID，此项可不填'
            >
                <Input placeholder='微信唯一ID (如 asdasdkl202122skwmrt)'  {...createToggleSuffix('wxid')} />
            </Form.Item>
            <Form.Item
                name='school_uid'
                label='去向院校'
                tooltip='没有找到你的学校？点击右方 + 来添加一个学校。若目前未定去向，此项可不填。海外院校请输入英文名'
            >
                <SchoolSearchTool schoolUid={schoolUid} setSchoolUid={setSchoolUid} initialValue={initialSchool} searchProps={{ ...createToggleSuffix('school_uid') }} />
            </Form.Item>
            <Form.Item
                name='department'
                label='学院'
            >
                <Input placeholder='请输入你的学院名称'  {...createToggleSuffix('department')} />
            </Form.Item>
            <Form.Item
                name='major'
                label='专业'
            >
                <Input placeholder='请输入你的专业名称'  {...createToggleSuffix('major')} />
            </Form.Item>
            <Form.Item
                name='visibility'
                label='隐私设置'
                tooltip={t('This setting determines the scope of users who can access your personal information (admin users excluded)')}
            >
                <Select>
                    {Object.entries(Visibility).map(([key, value]) => (
                        <Select.Option key={key} value={value}>
                            <Tooltip title={getVisibilityDescription(value)} className='underdotted'>
                                {t(key.toString())}
                            </Tooltip>
                        </Select.Option>
                    ))
                    }
                </Select>
            </Form.Item>
            {showRoleOptions && role !== undefined &&
                < Form.Item
                    name='role'
                    label='权限设置'
                    tooltip={t('This setting determines the scope of users who can access your personal information (admin users excluded)')}
                >
                    <Select>
                        {Object.entries(Role).map(([key, value]) => (
                            <Select.Option key={key} value={value}>
                                <Tooltip title={getRoleDescription(value)} className='underdotted'>
                                    {t(key.toString())}
                                </Tooltip>
                            </Select.Option>
                        ))
                        }
                    </Select>
                </Form.Item>
            }
            <Form.Item>
                <Space>
                    <Button type='primary' htmlType='submit'>保存更改</Button>
                    <Button onClick={handleReset}>重置</Button>
                </Space>
            </Form.Item>
        </Form>
    </>;
}

export default InfoUpdateForm;
