import { CheckCircleFilled, EnvironmentOutlined } from "@ant-design/icons";
import {
    faAddressCard,
    faMap,
    faMapPin,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    Button,
    Card,
    Divider,
    Form,
    Input,
    Space,
    Tabs,
    notification,
    Switch,
    InputNumber,
} from "antd";
import { useEffect } from "react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Coordinate, Result, Service } from "wwg-api";
import useSearchCity from "../api/citySearchTool";
import { PaginatedQuery } from "../api/hooks";
import { handleApiError } from "../api/utils";
import InfoCard from "./InfoCard";
import { Optional } from "./InfoList";
import Map, { MapItem } from "./Map";
import SearchTool from "./SearchTool";


type Values = Parameters<typeof Service.postSchool>[0];

type Location = Coordinate & {
    name: string;
    city?: string | undefined;
    address?: string | undefined;
};

enum Provider {
    AMAP = "amap",
    MAPBOX = "mapbox",
}

const AddSchoolForm = (props: { cb?: (schoolUid: number) => void }) => {
    const [t] = useTranslation();
    const [page, setPage] = useState(0);
    const [form] = Form.useForm<Values>();
    const [renderSearchTool, cityUid] = useSearchCity();
    const [location, setLocation] = useState<Location>();
    const [currentTab, setCurrentTab] = useState("select");
    const [provider, setProvider] = useState<Provider>(Provider.AMAP);

    const handleFinish = (data: Values) => {
        if (data.longitude === undefined || data.latitude === undefined) {
            notification.error({
                message: t("Error"),
                description: t("Coordinates required"),
                duration: 1.5,
            });
            return;
        }
        Service.postSchool(
            currentTab === "select"
                ? {
                    ...data,
                    city_uid: cityUid,
                }
                : data
        )
            .then((res) => {
                if (res.result === Result.result.SUCCESS) {
                    notification.success({
                        message: t("ADD SCHOOL SUCCESS"),
                        description: (
                            <>
                                {t("Added")} {data.school_name} (uid {res.school_uid})
                            </>
                        ),
                    });
                    if (props.cb) props.cb(res.school_uid ?? 0);
                } else {
                    return Promise.reject(res.message);
                }
            })
            .catch((err) =>
                handleApiError(err).then((res) => {
                    notification.error({
                        message: t("Failed to add the school"),
                        description: res.message ?? t("ERROR ADD SCHOOL"),
                    });
                })
            );
    };
    useEffect(() => {
        form.setFieldsValue({
            longitude: location?.longitude,
            latitude: location?.latitude,
        });
    }, [form, location]);

    const mockStudentData = useCallback(async (): Promise<MapItem[]> => {
        return [
            {
                students: [
                    {
                        uid: 0,
                        name: t("Sample student"),
                        class_number: 2,
                        grad_year: 2020,
                    },
                ],
                longitude: location?.longitude,
                latitude: location?.latitude,
                school_name: location?.name ?? t("Sample school"),
                city: location?.city ?? "",
            },
        ];
    }, [t, location]);

    const getPreview = useCallback(
        async (props: PaginatedQuery): Promise<Location[]> => {
            return Service.getLocation(
                props.value,
                props.offset + 1,
                "",
                "",
                provider
            )
                .then((res) => {
                    return res.locations;
                })
                .catch((err) => {
                    return [];
                });
        },
        [provider]
    );

    return (
        <Form form={form} onFinish={handleFinish} scrollToFirstError>
            <div style={page !== 0 ? { display: "none" } : {}}>
                <Form.Item
                    name="school_name"
                    label={t("School name")}
                    required
                    rules={[
                        {
                            required: true,
                            message: t("Fill in the official school name"),
                        },
                    ]}
                >
                    <Input placeholder={t("Fill in the official school name")} />
                </Form.Item>
                <Tabs
                    defaultActiveKey="select"
                    onChange={(key) => {
                        setCurrentTab(key);
                    }}
                >
                    <Tabs.TabPane key="select" tab={t("Select city")}>
                        {renderSearchTool()}
                    </Tabs.TabPane>
                    <Tabs.TabPane
                        key="add"
                        tab={t("???????????? (??????/?????????????????????)")}
                    >
                        <Form.Item
                            name="city"
                            label={t("??????")}
                            required
                            rules={[
                                {
                                    validator(_, value) {
                                        if (!!!value && currentTab === "add") {
                                            return Promise.reject(
                                                t("?????????????????????????????????")
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <Input placeholder={t("????????????????????? (???????????????????????????)")} />
                        </Form.Item>
                        <Form.Item
                            name="school_state_province"
                            label={t("??????/???/???")}
                        >
                            <Input placeholder={t("????????????????????????????????? (???????????????????????????)")} />
                        </Form.Item>
                        <Form.Item
                            name="school_country"
                            label={t("??????")}
                            required
                            rules={[
                                {
                                    validator(_, value) {
                                        if (!!!value && currentTab === "add") {
                                            return Promise.reject(
                                                t("?????????????????????????????????")
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <Input placeholder={t("???????????????????????? (???????????????????????????)")} />
                        </Form.Item>
                    </Tabs.TabPane>
                </Tabs>
                <Form.Item>
                    <Button
                        type="primary"
                        onClick={() => {
                            if (currentTab === "select" && cityUid === -1) {
                                notification.error({
                                    message: t("Error"),
                                    description: t("??????????????????"),
                                    duration: 1.5,
                                });
                                return;
                            }
                            form.validateFields([
                                "school_name",
                                "city",
                                "school_country",
                            ]).then(() => {
                                setPage(1);
                            });
                        }}
                    >
                        {t("?????????")}
                    </Button>
                </Form.Item>
            </div>
            <div style={page !== 1 ? { display: "none" } : {}}>
                <Divider>??????</Divider>
                <p>
                    {t("??????????????????????????????????????????????????????????????????????????????????????????")}
                </p>
                <p>
                    {t("?????????????????????????????????????????????????????????????????????????????????????????????????????????")}
                </p>
                <Space>
                    <Form.Item
                        name="longitude"
                        label={t("??????")}
                        validateFirst
                        rules={[
                            {
                                type: "number",
                                message: t("?????????????????????"),
                                transform: (val) => Number.parseFloat(val),
                            },
                            { required: true, message: t("??????????????????") },
                            {
                                validator(_, val) {
                                    if (val > 180 || val < -180) {
                                        return Promise.reject(
                                            t("???????????????-180???180??????")
                                        );
                                    } else {
                                        return Promise.resolve();
                                    }
                                },
                            },
                        ]}
                    >
                        <InputNumber type="number" placeholder={t("LONGITUDE PLACEHOLDER", { exampleValue: 114.1216 })} />
                    </Form.Item>
                    <Form.Item
                        name="latitude"
                        label={t("??????")}
                        validateFirst
                        rules={[
                            {
                                type: "number",
                                message: t("?????????????????????"),
                                transform: (val) => Number.parseFloat(val),
                            },
                            { required: true, message: t("??????????????????") },
                            {
                                validator(_, val) {
                                    if (val > 90 || val < -90) {
                                        return Promise.reject(
                                            t("???????????????-90???90??????")
                                        );
                                    } else {
                                        return Promise.resolve();
                                    }
                                },
                            },
                        ]}
                    >
                        <InputNumber type="number" placeholder={t("LATITUDE PLACEHOLDER", { exampleValue: 22.5514 })} />
                    </Form.Item>
                </Space>
                <h3>{t("?????? & ??????")}</h3>
                <Map
                    initialZoom={8}
                    getData={mockStudentData}
                    getPopup={(props) => <InfoCard items={props} />}
                    zoom={8}
                    startingCoordinate={
                        !!location?.latitude && !!location.longitude
                            ? {
                                longitude: location.longitude,
                                latitude: location.latitude - 0.005,
                            }
                            : undefined
                    }
                    responsive
                ></Map>
                {!!location && (
                    <Card>
                        <Optional
                            content={location.name}
                            icon={<FontAwesomeIcon icon={faAddressCard} />}
                        />
                        <Optional
                            content={
                                <>
                                    ({location.longitude?.toFixed(5)},{" "}
                                    {location.latitude?.toFixed(5)})
                                </>
                            }
                            icon={<FontAwesomeIcon icon={faMapPin} />}
                            dependencies={[
                                location.longitude,
                                location.latitude,
                            ]}
                        />
                        <Optional
                            content={location.city}
                            icon={<EnvironmentOutlined />}
                        />
                        <Optional
                            content={location.address}
                            icon={<FontAwesomeIcon icon={faMap} />}
                        />
                    </Card>
                )}
                <Form.Item label={t("????????????")}>
                    <Switch
                        checkedChildren={t("??????")}
                        unCheckedChildren={t("?????????")}
                        onChange={(checked) => {
                            setProvider(
                                checked ? Provider.MAPBOX : Provider.AMAP
                            );
                        }}
                    />
                </Form.Item>
                <SearchTool
                    initialValue={form.getFieldValue("school_name")}
                    placeholder={t("??????????????????")}
                    dataHandler={getPreview}
                    searchLimit={1}
                    item={(value, index) => (
                        <Button
                            style={{
                                textAlign: "left",
                                width: "100%",
                                overflowX: "hidden",
                            }}
                            onClick={() => setLocation(value)}
                            type={
                                value.name === location?.name &&
                                    value.address === location?.address
                                    ? "primary"
                                    : "text"
                            }
                            block
                        >
                            {value.name === location?.name &&
                                value.address === location?.address && (
                                    <CheckCircleFilled />
                                )}
                            {value.name}
                            <span style={{ fontSize: "0.5rem" }}>
                                {value.city} {value.address} (
                                {value.longitude?.toFixed(5)},{" "}
                                {value.latitude?.toFixed(5)})
                            </span>
                        </Button>
                    )}
                />
                <p>{t("????????????????????????")}</p>
                <p>
                    <a href="https://lbs.amap.com/tools/picker" target="new">
                        {t("??????????????????")}
                    </a>
                </p>
                <p>
                    <a href="https://www.google.com/maps" target="new">
                        {t("?????? Google Maps (??????????????????)")}
                    </a>
                </p>
                <Form.Item>
                    <Space>
                        <Button
                            type="ghost"
                            onClick={() => {
                                setPage(0);
                            }}
                        >
                            {t("?????????")}
                        </Button>
                        `
                        <Button type="primary" htmlType="submit">
                            {t("??????")}
                        </Button>
                    </Space>
                </Form.Item>
            </div>
        </Form>
    );
};

export default AddSchoolForm;
