import {
    Button,
    Divider,
    Form,
    Input,
    Select,
    Space,
    notification,
    InputNumber,
} from "antd";
import { useState } from "react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Service } from "wwg-api";
import { useModal } from "../api/modal";
import { createNotifyError, handleApiError } from "../api/utils";

type Values = Parameters<typeof Service.publicReportFeedback>[0];

const reasons = [
    "registration",
    "reset password",
    "update info",
    "improvement",
    "general",
];
const FeedbackForm = ({
    isPublic,
    cb,
}: {
    isPublic: boolean;
    cb?: () => void;
}) => {
    const [t] = useTranslation();
    const [form] = Form.useForm<Values>();
    const [feedbackUid, setFeedbackUid] = useState("");
    const [SuccessModal, showModal] = useModal({
        content: (
            <>
                {t("你的反馈码")}
                <p
                    style={{
                        textAlign: "center",
                        backgroundColor: "antiquewhite",
                        fontSize: "1.5rem",
                    }}
                >
                    {feedbackUid}
                </p>
                <p>{t("请复制保留以备参考")}</p>
                {!isPublic && (
                    <p>
                        {t("你也可以在 反馈-查看 一栏查看你过往的反馈信息及处理结果")}
                    </p>
                )}
                {form.getFieldValue("email") !== undefined ||
                    form.getFieldValue("phone_number") !== undefined ? (
                    <p>
                        {t("我们会通过你留下的电话号码或电子邮箱，尽快联系告知处理结果")}
                    </p>
                ) : (
                    <p>
                        {t("由于你未填写电话号码或电子邮箱，我们将不会主动进行联系")}
                    </p>
                )}
            </>
        ),
        modalProps: {
            title: "提交成功!",
            footer: null,
        },
    });

    const handleSubmit = useCallback(
        (data: Values) => {
            (isPublic
                ? Service.publicReportFeedback
                : Service.userReportFeedback)(data)
                .then((result) => {
                    if (isPublic && result.feedback_uid !== undefined) {
                        showModal();
                        setFeedbackUid(result.feedback_uid);
                    }
                    form.resetFields();
                    cb && cb();
                    notification.success({
                        message: t("成功"),
                        description: t("你的反馈已提交，管理员将会尽快处理"),
                    });
                })
                .catch((err) =>
                    handleApiError(
                        err,
                        createNotifyError(t, "Error", "未能提交反馈")
                    )
                );
        },
        [t, cb, form, isPublic, showModal, setFeedbackUid]
    );

    return (
        <>
            <Form form={form} onFinish={handleSubmit}>
                {isPublic && (
                    <>
                        <Form.Item name="name" label={t("姓名")}>
                            <Input placeholder="请输入你的姓名 (选填)" />
                        </Form.Item>
                        <Divider>联系方式 (若无需回复可不填)</Divider>
                        <Form.Item name="email" label={t("邮箱")}>
                            <Input placeholder="请输入你的邮箱 (选填)" />
                        </Form.Item>
                        <Form.Item name="phone_number" label={t("电话号码")}>
                            <Input placeholder="请输入你的电话号码 (选填)" />
                        </Form.Item>
                        <Form.Item name="class_number" label={t("班级号码")}>
                            <InputNumber
                                min={1}
                                placeholder="请输入你的班级号码 (如高三 (3)班请填3) (选填)"
                            />
                        </Form.Item>
                        <Form.Item name="grad_year" label={t("毕业年份")}>
                            <InputNumber
                                min={2019}
                                placeholder="请输入你的毕业年份 (如2021) (选填)"
                            />
                        </Form.Item>
                    </>
                )}
                <Divider>{t("反馈")}</Divider>
                <Form.Item
                    name="reason"
                    label={t("反馈原因")}
                    rules={[{ required: true, message: t("请选择反馈原因") }]}
                    required
                >
                    <Select>
                        {reasons.map((val) => (
                            <Select.Option key={val} value={val}>
                                {t(val)}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="title" label={t("标题")}>
                    <Input placeholder={t("反馈信息的标题 (选填)")} />
                </Form.Item>
                <Form.Item name="content" label={t("备注")}>
                    <Input.TextArea placeholder={t("对标题和反馈原因的补充信息 (选填)")} />
                </Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit">
                        {t("提交")}
                    </Button>
                    {!!feedbackUid && (
                        <Button type="default" onClick={showModal}>
                            {t("显示反馈码")}
                        </Button>
                    )}
                </Space>
            </Form>
            <SuccessModal />
        </>
    );
};

export default FeedbackForm;
