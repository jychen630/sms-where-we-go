import { BookOutlined, GithubOutlined } from "@ant-design/icons";
import { Button, Card, Layout, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useModal } from "../api/modal";
import PrivacyPolicy from "../components/PrivacyPolicy";
import AppPage, { menuOptions } from "./AppPage";
import "./ListPage.css";

type AboutData = {
    category: string;
    isBlocks?: boolean;
    items: (string | JSX.Element)[];
};

const AboutPage = () => {
    const [t] = useTranslation();
    const [PrivacyModal, showModal] = useModal({
        content: <PrivacyPolicy />,
        modalProps: {
            title: t("用户隐私协议"),
            footer: null,
        },
    });

    const data: AboutData[] = [
        {
            category: t("Coordinator"),
            items: ["User 1"],
        },
        {
            category: t("Development"),
            items: ["User 2", "User 3"],
        },
        {
            category: t("Testing"),
            items: ["User 3", "User 4", "User 5"],
        },
        {
            category: t("Links"),
            isBlocks: true,
            items: [
                <Button
                    size="large"
                    type="link"
                    icon={<GithubOutlined />}
                    target="_blank"
                    href="https://github.com/AcKindle3/sms-where-we-go"
                >
                    {t("GITHUB WELCOME TOOLTIP")}
                </Button>,
            ],
        },
        {
            category: t("Misc"),
            items: [
                <Button
                    size="large"
                    onClick={showModal}
                    icon={<BookOutlined />}
                >
                    {t("用户隐私协议")}
                </Button>,
            ],
        },
    ];

    return (
        <AppPage activeKey={menuOptions.ABOUT}>
            <Layout className="centered-layout">
                <Layout.Content>
                    <Card>
                        {data.map((categoryItem) => (
                            <div>
                                <Typography.Title level={4}>
                                    {categoryItem.category}
                                </Typography.Title>
                                {categoryItem.isBlocks ? (
                                    <Space direction="vertical">
                                        {categoryItem.items.map((item) => (
                                            <div>{item}</div>
                                        ))}
                                    </Space>
                                ) : (
                                    <Space className="list-page-flex-box">
                                        {categoryItem.items.map((item) => (
                                            <>{item}</>
                                        ))}
                                    </Space>
                                )}
                            </div>
                        ))}
                    </Card>
                </Layout.Content>
            </Layout>
            <PrivacyModal />
        </AppPage>
    );
};

export default AboutPage;
