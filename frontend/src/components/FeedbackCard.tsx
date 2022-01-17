import { Button, Card, Collapse, Divider, Empty } from "antd";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
    Feedback,
    FeedbackComment,
    FeedbackInfo,
    Result,
    Service,
} from "wwg-api";
import { createNotifyError, handleApiError } from "../api/utils";
import ComposeBox from "./ComposeBox";
import CommentBox from "./CommentBox";
import { Optional } from "./InfoList";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    Loading3QuartersOutlined,
} from "@ant-design/icons";

export type FeedbackVerbose = Feedback &
    FeedbackInfo & {
        feedback_uid: string;
        sender_uid?: number;
        status: string;
        comments: FeedbackComment[];
        onSent?: (content: string) => void;
        onUpdateStatus?: (status: "resolved" | "pending" | "closed") => void;
    };

const FeedbackCard = (props: FeedbackVerbose & { adminView: boolean }) => {
    const [t] = useTranslation();
    const { feedback_uid, onSent, onUpdateStatus } = props;

    const handleUpdateState = useCallback(
        (status: "resolved" | "pending" | "closed") => {
            Service.updateFeedback(feedback_uid, {
                status: status,
            })
                .then((result) => {
                    if (result.result !== Result.result.SUCCESS) {
                        return Promise.reject(result.message);
                    } else {
                        onUpdateStatus && onUpdateStatus(status);
                    }
                })
                .catch((err) =>
                    handleApiError(
                        err,
                        createNotifyError(t, "Error", "未能更新反馈状态")
                    )
                );
        },
        [t, feedback_uid, onUpdateStatus]
    );

    const ManageButton = useCallback(() => {
        if (props.status === "resolved") {
            return (
                <Button
                    type="ghost"
                    onClick={() => handleUpdateState("pending")}
                >
                    <Loading3QuartersOutlined /> {t("标记为处理中")}
                </Button>
            );
        } else if (props.status === "pending") {
            return (
                <Button
                    type="primary"
                    onClick={() => handleUpdateState("resolved")}
                >
                    <CheckCircleOutlined />
                    {t("标记为解决")}
                </Button>
            );
        } else {
            return (
                <Button disabled>
                    <CloseCircleOutlined />
                    {t("关闭")}
                </Button>
            );
        }
    }, [t, props.status, handleUpdateState]);

    const handleSendComment = useCallback(
        (data) => {
            Service.commentFeedback(feedback_uid, {
                content: data.message,
                anonymous: data.anonymous,
            })
                .then((res) => {
                    if (res.result !== Result.result.SUCCESS) {
                        Promise.reject(res.message);
                    } else {
                        onSent && onSent(data.content);
                    }
                })
                .catch((err) =>
                    handleApiError(
                        err,
                        createNotifyError(t, "Error", "发送评论失败")
                    )
                );
        },
        [t, feedback_uid, onSent]
    );

    return (
        <Card>
            <Optional content={props.feedback_uid} label={t("反馈码")} />
            <Optional
                content={t("CLASS SPECIFIC", { gradYear: props.grad_year, classNumber: props.class_number })}
                dependencies={[props.grad_year, props.class_number]}
                label={t("Class")}
                nullAlt={<h3>{t("PUBLIC FEEDBACK TITLE")})</h3>}
            />
            <Optional content={props.name} label={t("Name")} />
            <Optional content={props.phone_number} label={t("Phone Number")} />
            <Optional content={props.email} label={t("Email")} />
            <Optional content={t(props.reason)} label={t("Reason")} />
            <Optional content={t(props.status)} label={t("Status")} />
            <Optional content={props.title} label={t("Title")} />
            <Optional content={props.content} label={t("Content")} />
            <Collapse ghost>
                <Collapse.Panel header={t("留言")} key={0}>
                    {props.comments.length !== 0 ? (
                        <div
                            style={{
                                maxHeight: 300,
                                overflowX: "hidden",
                                overflowY: "scroll",
                                marginRight: -57,
                            }}
                        >
                            {props.comments.map((val, index) => (
                                <CommentBox key={index} comment={val} />
                            ))}
                        </div>
                    ) : (
                        <Empty description={t("无数据")} />
                    )}
                    <Divider />
                    <ComposeBox
                        sendBtnLabel={t("添加评论")}
                        onSent={handleSendComment}
                    />
                </Collapse.Panel>
            </Collapse>
            {props.adminView && <ManageButton />}
        </Card>
    );
};

export default FeedbackCard;
