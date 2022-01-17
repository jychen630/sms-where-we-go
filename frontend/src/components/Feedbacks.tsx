import { Empty, Space, Switch } from "antd";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Service } from "wwg-api";
import { createNotifyError, handleApiError } from "../api/utils";
import FeedbackCard, { FeedbackVerbose } from "./FeedbackCard";

const Feedbacks = ({
    adminView,
    count,
}: {
    adminView: boolean;
    count?: number;
}) => {
    const [t] = useTranslation();
    const [pendingOnly, setPendingOnly] = useState(true);
    const [feedbacks, setFeedbacks] = useState<FeedbackVerbose[]>([]);

    const fetchFeedbacks = useCallback(() => {
        (adminView ? Service.manageGetFeedback : Service.viewGetFeedback)()
            .then((res) => {
                setFeedbacks(res.feedbacks ?? []);
            })
            .catch((err) =>
                handleApiError(
                    err,
                    createNotifyError(t("Error"), t("未能获取反馈列表"))
                )
            );
    }, [t, adminView, setFeedbacks]);

    const updateFeedback = useCallback(
        (uid: string, status: string) => {
            setFeedbacks(
                feedbacks.map((feedback) =>
                    feedback.feedback_uid !== uid
                        ? feedback
                        : Object.assign(feedback, { status: status })
                )
            );
        },
        [feedbacks, setFeedbacks]
    );

    useEffect(() => {
        fetchFeedbacks();
    }, [count, fetchFeedbacks]);

    return (
        <>
            <Space direction="vertical" style={{ width: "100%" }}>
                <Switch
                    defaultChecked={pendingOnly}
                    checkedChildren={t("仅未处理项")}
                    unCheckedChildren={t("所有项")}
                    onChange={(val) => setPendingOnly(val)}
                ></Switch>
                {feedbacks.length > 0 ? (
                    feedbacks.map(
                        (val) =>
                            (!pendingOnly || val.status === "pending") && (
                                <FeedbackCard
                                    key={val.feedback_uid}
                                    onSent={fetchFeedbacks}
                                    onUpdateStatus={(status) => {
                                        updateFeedback(
                                            val.feedback_uid,
                                            status
                                        );
                                    }}
                                    adminView={adminView}
                                    {...val}
                                />
                            )
                    )
                ) : (
                    <Empty description={t("无历史反馈")} />
                )}
            </Space>
        </>
    );
};

export default Feedbacks;
