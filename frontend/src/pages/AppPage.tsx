import {
    BarsOutlined,
    CompassOutlined,
    ControlOutlined,
    InfoCircleOutlined,
    LogoutOutlined,
    RadarChartOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Space } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Role } from "wwg-api";
import { useAuth } from "../api/auth";
import "../app.css";

const { Header, Content } = Layout;
export enum menuOptions {
    MAP = "map",
    LIST = "list",
    SETTINGS = "settings",
    ADMIN = "admin",
    FEEDBACK = "feedback",
    ABOUT = "info",
}

const AppPage = ({
    activeKey,
    children,
}: {
    activeKey: menuOptions;
    children: React.ReactNode;
}) => {
    const [t] = useTranslation();
    const { role, logout } = useAuth();
    const history = useHistory();

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header className="app-header">
                <Menu
                    mode="horizontal"
                    activeKey={activeKey}
                    style={{ overflow: "scroll hidden" }}
                >
                    <Menu.Item key="map" onClick={() => history.push("/map")}>
                        <Space>
                            <CompassOutlined /> {t("地图")}
                        </Space>
                    </Menu.Item>
                    <Menu.Item key="list" onClick={() => history.push("/list")}>
                        <Space>
                            <BarsOutlined /> {t("列表")}
                        </Space>
                    </Menu.Item>
                    <Menu.Item
                        key="settings"
                        onClick={() => history.push("/user")}
                    >
                        <Space>
                            <SettingOutlined /> {t("设置")}
                        </Space>
                    </Menu.Item>
                    <Menu.Item
                        key="feedback"
                        onClick={() => history.push("/feedback")}
                    >
                        <Space>
                            <RadarChartOutlined /> {t("反馈")}
                        </Space>
                    </Menu.Item>
                    {!!role && role !== Role.STUDENT && (
                        <Menu.Item
                            key="admin"
                            onClick={() => history.push("/admin")}
                        >
                            <Space>
                                <ControlOutlined /> {t("管理")}
                            </Space>
                        </Menu.Item>
                    )}
                    <Menu.Item
                        key="logout"
                        onClick={() => {
                            history.push("/login");
                            logout();
                        }}
                    >
                        <Space>
                            <LogoutOutlined /> {t("登出")}
                        </Space>
                    </Menu.Item>
                </Menu>
            </Header>
            <Content className="app-content">
                <div className="app-content-container">{children}</div>
            </Content>
        </Layout>
    );
};

export default AppPage;
