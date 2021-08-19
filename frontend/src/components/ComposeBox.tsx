import { Button, Checkbox, Form, Input } from "antd";

type Values = { message: string; anonymous: boolean };
export type ComposeBoxProps = {
    sendBtnLabel?: string;
    onSent?: (data: Values) => void;
};
const ComposeBox = ({ sendBtnLabel, onSent }: ComposeBoxProps) => {
    const [form] = Form.useForm<Values>();
    return (
        <Form
            form={form}
            onFinish={(data) => {
                onSent && onSent(data);
                form.resetFields();
            }}
            layout="vertical"
        >
            <Form.Item
                name="message"
                label="消息"
                rules={[
                    {
                        required: true,
                        message: "发送内容不能为空",
                    },
                ]}
            >
                <Input.TextArea placeholder="在此处编辑消息" />
            </Form.Item>
            <Button type="primary" htmlType="submit">
                {sendBtnLabel ?? "发送"}
            </Button>
            <Form.Item name="anonymous" valuePropName="checked">
                <Checkbox>匿名</Checkbox>
            </Form.Item>
        </Form>
    );
};

export default ComposeBox;
