import { Button, Card, notification } from "antd";
import { Result, School, Service } from "wwg-api";
import PaginatedBox, { PaginatedDataHandler } from "./PaginatedCardPage";
import { createNotifyError, handleApiError } from "../api/utils";
import { useTranslation } from "react-i18next";
import InfoList from "./InfoList";
import { useCallback } from "react";
import AddSchoolForm from "./AddSchoolForm";

const Schools = () => {
    const [t] = useTranslation();
    const fetchSchools: PaginatedDataHandler<
        School & { uid: number; matched_alias?: string }
    > = useCallback(
        async (props) => {
            return Service.getSchool(props.offset, props.limit, props.value)
                .then((res) => {
                    return res.schools;
                })
                .catch((err) => {
                    handleApiError(
                        err,
                        createNotifyError(t("Error"), t("未能获取学校"))
                    );
                    return [];
                });
        },
        [t]
    );

    const handleDelete = (school: School & { uid: number }) => {
        Service.deleteSchool({ school_uid: school.uid })
            .then((res) => {
                if (res.result === Result.result.SUCCESS) {
                    notification.success({
                        message: t("成功"),
                        description: t("REMOVE SCHOOL SUCCESS", {
                            schooName: school.school_name,
                            schoolUid: school.uid
                        }),
                    });
                } else {
                    return Promise.reject(res.message);
                }
            })
            .catch((err) =>
                handleApiError(
                    err,
                    createNotifyError(t("Error"), t("未能移除学校"))
                )
            );
    };

    return (
        <PaginatedBox
            dataHandler={fetchSchools}
            item={(value, _) => (
                <>
                    <InfoList {...value} />
                    <Button onClick={() => handleDelete(value)} danger>
                        {t("删除")}
                    </Button>
                </>
            )}
        >
            <Card title={t("添加学校")}>
                <AddSchoolForm />
            </Card>
        </PaginatedBox>
    );
};

export default Schools;
