import { WarningOutlined } from "@ant-design/icons";
import {
    Alert,
    Button,
    Divider,
    Form,
    Input,
    InputNumber,
    notification,
    Select,
    Space,
    Switch,
    Tooltip,
} from "antd";
import throttle from "lodash/throttle";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Result,
    Role,
    School,
    Service,
    Student,
    StudentFieldsVisibility,
    StudentVerbose,
    Visibility,
} from "wwg-api";
import { useAuth } from "../api/auth";
import { useDict } from "../api/hooks";
import { handleApiError, isDemo, ThenType } from "../api/utils";
import { emailPattern, phonePattern } from "./RegistrationForm";
import SchoolSearchTool, { QuerySchoolResult } from "./SchoolSearchTool";

type Values = Parameters<typeof Service.updateStudent>[0];
const { Item } = Form;

const InfoUpdateForm = ({
    getStudent,
    showRoleOptions = false,
}: {
    showRoleOptions?: boolean;
    getStudent: () => Promise<
        | Partial<
            Student &
            StudentVerbose &
            School & {
                role?: Role;
                visibility?: Visibility;
                field_visibility?: StudentFieldsVisibility;
            }
        >
        | undefined
    >;
}) => {
    const [t] = useTranslation();
    const auth = useAuth();
    const [form] = Form.useForm<Values>();
    const [role, setRole] = useState<Role | undefined>(undefined);
    const [currentSchool, setCurrentSchool] = useState<
        QuerySchoolResult | undefined
    >();
    const [schoolUid, setSchoolUid] = useState(-1);
    const [studentUid, setStudentUid] = useState(-1);
    const [initialSchool, setInitialSchool] = useState("");
    const [, setFields] =
        useState<ThenType<ReturnType<typeof getStudent>>>(undefined);
    const [saving, setSaving] = useState(false);
    const [fieldVisibility, updateFieldVisibility, setFieldVisibility] =
        useDict<boolean, StudentFieldsVisibility>({});
    const getVisibilityDescription = useCallback(
        (visibility: Visibility) => {
            switch (visibility) {
                case Visibility.PRIVATE:
                    return t("Only visible to the user");
                case Visibility.CLASS:
                    return t("Only visible to the students in the same class");
                case Visibility.CURRICULUM:
                    return t(
                        "Only visible to the students in the same curriculum"
                    );
                case Visibility.YEAR:
                    return t(
                        "Only visible to the students graduating in the same year"
                    );
                case Visibility.STUDENTS:
                    return t("Visible to every registered user");
                default:
                    return t("");
            }
        },
        [t]
    );
    const getRoleDescription = useCallback(
        (role: Role) => {
            switch (role) {
                case Role.STUDENT:
                    return t("ROLE TIP STUDENT");
                case Role.CLASS:
                    return t("ROLE TIP CLASS");
                case Role.CURRICULUM:
                    return t("ROLE TIP CURRICULUM");
                case Role.YEAR:
                    return t("ROLE TIP YEAR");
                case Role.SYSTEM:
                    return t("ROLE TIP SYSTEM");
                default:
                    return t("");
            }
        },
        [t]
    );

    const getFields = useCallback(async () => {
        return getStudent().then((res) => {
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
                school_name: res?.school_name,
            };
            setRole(res?.role);
            setStudentUid(res?.uid ?? -1);
            setFieldVisibility(res?.field_visibility);
            setFields(data);
            return data;
        });
    }, [setFields, getStudent, setFieldVisibility]);

    const createToggleSuffix = useCallback(
        (name: keyof StudentFieldsVisibility) => {
            if (!!!fieldVisibility) {
                return {};
            }
            const checked =
                fieldVisibility[name] !== undefined
                    ? fieldVisibility[name]
                    : true;
            return {
                suffix: (
                    <Switch
                        checked={checked}
                        onChange={(val) => {
                            updateFieldVisibility(name, val);
                        }}
                        checkedChildren={t("已公开")}
                        unCheckedChildren={t("已隐藏")}
                    />
                ),
            };
        },
        [t, fieldVisibility, updateFieldVisibility]
    );

    const initialize = useCallback(() => {
        getFields().then((res) => {
            form.setFieldsValue(res);
            setSchoolUid(res?.school_uid ?? -1);
            setInitialSchool(res?.school_name ?? "");
        });
    }, [getFields, form]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const doUpdate = useCallback(
        throttle((data: Values) => {
            let toClear: Parameters<typeof Service.updateStudent>[0]["clear"] =
                [];
            if (schoolUid === -1) {
                delete data.school_uid;
                toClear.push("school_uid");
            }
            if (!!!data.phone_number) {
                delete data.phone_number;
                toClear.push("phone_number");
            }
            if (!!!data.email) {
                delete data.email;
                toClear.push("email");
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
                field_visibility: fieldVisibility,
            })
                .then((res) => {
                    if (res.result === Result.result.SUCCESS) {
                        notification.success({
                            message: t("成功"),
                            description: t("数据已保存"),
                            duration: 0.5,
                        });
                        setFields(undefined);
                    } else {
                        return Promise.reject(res.message);
                    }
                })
                .catch((err) => {
                    handleApiError(err).then((res) => {
                        notification.error({
                            message: t("Error"),
                            description: t("UPDATE STUDENT INFO FAILURE", {
                                message: res.message ?? t("ERR UNKNOWN"),
                            }),
                        });
                    });
                })
                .finally(() => {
                    setSaving(false);
                });
        }, 1500),
        [schoolUid, studentUid, setFields, setSaving, fieldVisibility]
    );

    const handleFinished = useCallback(
        (data: Values) => {
            if (!saving) {
                setSaving(true);
            }
            doUpdate(data);
        },
        [doUpdate, saving]
    );

    const handleReset = () => {
        initialize();
    };

    const handleSchoolUpdate = (school?: QuerySchoolResult) => {
        setCurrentSchool(school);
    };

    useEffect(initialize, [initialize]);

    return (
        <>
            <Form form={form} onFinish={handleFinished} layout="vertical">
                <Divider>{t("更新个人信息")}</Divider>
                <Alert
                    message={
                        <Space>
                            <WarningOutlined />
                            {t("SAVE WARNING TIP")}
                        </Space>
                    }
                />
                <Item
                    name="name"
                    label={t("Name")}
                    rules={[
                        {
                            required: true,
                            message: t("姓名不能为空"),
                        },
                    ]}
                >
                    <Input placeholder={t("中文姓名")} />
                </Item>
                <Form.Item
                    name="phone_number"
                    label={t("Phone Number")}
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const email = getFieldValue("email");
                                if (!!!email && !!!value) {
                                    return Promise.reject(
                                        t("请在电话号码和邮箱中至少填写一项")
                                    );
                                } else if (
                                    !!value &&
                                    !value.match(phonePattern) &&
                                    !isDemo
                                ) {
                                    return Promise.reject(t("请正确填写电话号码"));
                                } else {
                                    return Promise.resolve();
                                }
                            },
                        }),
                    ]}
                    tooltip={t("电话号码和邮箱请至少填写一项，两者都将能够作为登录的凭证")}
                >
                    <Input
                        placeholder={t("请输入电话号码")}
                        {...createToggleSuffix("phone_number")}
                    />
                </Form.Item>
                <Form.Item
                    name="email"
                    label={t("邮箱")}
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const phoneNumber =
                                    getFieldValue("phone_number");
                                if (!!!phoneNumber && !!!value) {
                                    return Promise.reject(
                                        t("请在电话号码和邮箱中至少填写一项")
                                    );
                                } else if (
                                    !!value &&
                                    !value.match(emailPattern)
                                ) {
                                    return Promise.reject(t("请正确填写邮箱"));
                                } else {
                                    return Promise.resolve();
                                }
                            },
                        }),
                    ]}
                >
                    <Input
                        placeholder={t("请输入邮箱")}
                        {...createToggleSuffix("email")}
                    />
                </Form.Item>
                <Form.Item
                    name="wxid"
                    label={t("微信ID")}
                    tooltip={t("若已填写微信所绑定的电话号码，或无微信ID，此项可不填")}
                >
                    <Input
                        placeholder={t("WECHAT ID TOOLTIP", { exampleId: "asdasdkl202122skwmrt" })}
                        {...createToggleSuffix("wxid")}
                    />
                </Form.Item>
                <Form.Item
                    name="school_uid"
                    label={t("去向院校")}
                    tooltip={t("ADD SCHOOL TOOLTIP")}
                >
                    <SchoolSearchTool
                        schoolUid={schoolUid}
                        setSchoolUid={setSchoolUid}
                        initialValue={initialSchool}
                        searchProps={{ ...createToggleSuffix("school_uid") }}
                        onUpdate={handleSchoolUpdate}
                    />
                </Form.Item>
                {currentSchool && (
                    <>
                        <Form.Item label={t("国家")}>
                            <Input
                                value={currentSchool?.school_country}
                                disabled
                                {...createToggleSuffix("school_country")}
                            />
                        </Form.Item>
                        <Form.Item label={t("省/州/郡")}>
                            <Input
                                value={currentSchool?.school_state_province}
                                disabled
                                {...createToggleSuffix("school_state_province")}
                            />
                        </Form.Item>
                        <Form.Item label={t("城市")}>
                            <Input
                                value={currentSchool?.city}
                                disabled
                                {...createToggleSuffix("city")}
                            />
                        </Form.Item>
                    </>
                )}
                <Form.Item name="department" label={t("学院")}>
                    <Input
                        placeholder={t("请输入你的学院名称")}
                        {...createToggleSuffix("department")}
                    />
                </Form.Item>
                <Form.Item name="major" label={t("专业")}>
                    <Input
                        placeholder={t("请输入你的专业名称")}
                        {...createToggleSuffix("major")}
                    />
                </Form.Item>
                <Form.Item
                    name="visibility"
                    label={t("隐私设置")}
                    tooltip={t(
                        "This setting determines the scope of users who can access your personal information (admin users excluded)"
                    )}
                >
                    <Select>
                        {Object.entries(Visibility).map(([key, value]) => (
                            <Select.Option key={key} value={value}>
                                <Tooltip
                                    title={getVisibilityDescription(value)}
                                    className="underdotted"
                                >
                                    {t(key.toString())}
                                </Tooltip>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                {showRoleOptions && role !== undefined && (
                    <Form.Item
                        name="role"
                        label={t("权限设置")}
                        tooltip={t(
                            "This setting determines the scope of users who can access your personal information (admin users excluded)"
                        )}
                    >
                        <Select>
                            {Object.entries(Role).map(([key, value]) => (
                                <Select.Option key={key} value={value}>
                                    <Tooltip
                                        title={getRoleDescription(value)}
                                        className="underdotted"
                                    >
                                        {t(key.toString())}
                                    </Tooltip>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}
                {showRoleOptions && auth.role === Role.SYSTEM && (
                    <>
                        <Form.Item name="class_number" label={t("Class")}>
                            <InputNumber
                                min={1}
                                placeholder={t("请输入要变更的班级号码")}
                            ></InputNumber>
                        </Form.Item>
                        <Form.Item
                            name="grad_year"
                            label={t("Year of Graduation")}
                        >
                            <InputNumber
                                min={2019}
                                placeholder={t("请输入要变更的毕业年份")}
                            ></InputNumber>
                        </Form.Item>
                    </>
                )}
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            {t("保存更改")}
                        </Button>
                        <Button onClick={handleReset}>{t("重置")}</Button>
                    </Space>
                </Form.Item>
            </Form>
        </>
    );
};

export default InfoUpdateForm;
