import { Space } from "antd";
import { School, Student, StudentVerbose } from "wwg-api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBook,
    faBuilding,
    faMap,
    faUniversity,
    faMapSigns,
} from "@fortawesome/free-solid-svg-icons";
import {
    EnvironmentFilled,
    FlagFilled,
    HomeFilled,
    MailOutlined,
    PhoneFilled,
    WechatFilled,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

/**
 * A util component that will render nothing if the content is empty
 */
export const Optional = ({
    content,
    label,
    dependencies,
    icon,
    nullAlt,
}: {
    content: string | number | undefined | null | object;
    label?: string;
    dependencies?: any[];
    icon?: JSX.Element;
    nullAlt?: JSX.Element;
}) => {
    if (
        (!!!content && content !== 0) ||
        (dependencies &&
            dependencies.some(
                (value) => value === undefined || value === null || value === ""
            ))
    ) {
        return nullAlt ?? <></>;
    }

    return (
        <div>
            <Space>
                {icon}
                {label !== undefined && `${label}: `}
                {content}
            </Space>
        </div>
    );
};

export type StudentInfo = Partial<
    Omit<Student & StudentVerbose & School, "latitude" | "longitude" | "uid">
>;

const InfoList = (props: StudentInfo & { hideName?: boolean }) => {
    const [t] = useTranslation();
    return (
        <>
            {!props.hideName && <h2>{props.name}</h2>}
            <Optional content={props.phone_number} icon={<PhoneFilled />} />
            <Optional content={props.email ?? ""} icon={<MailOutlined />} />
            <Optional content={props.wxid} icon={<WechatFilled />} />
            <Optional
                content={
                    !!props.grad_year && !!props.class_number
                        ? props.grad_year + "届" + props.class_number + "班"
                        : ""
                }
                icon={<HomeFilled />}
            />
            <Optional
                content={t(props.curriculum ?? "")}
                icon={<FontAwesomeIcon icon={faMapSigns} />}
            />
            <Optional
                content={props.department ?? ""}
                icon={<FontAwesomeIcon icon={faBuilding} />}
            />
            <Optional
                content={props.major ?? ""}
                icon={<FontAwesomeIcon icon={faBook} />}
            />
            <Optional
                content={props.school_name}
                icon={<FontAwesomeIcon icon={faUniversity} />}
            />
            <Optional content={props.school_country} icon={<FlagFilled />} />
            <Optional
                content={props.school_state_province}
                icon={<EnvironmentFilled />}
            />
            <Optional
                content={props.city}
                icon={<FontAwesomeIcon icon={faMap} />}
            />
        </>
    );
};

export default InfoList;
