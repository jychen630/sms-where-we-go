import { Layout, Card, Tabs } from "antd";
import AppPage, { menuOptions } from "./AppPage";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router";
import RegistrationKey from "../components/Registrationkey";
import Feedbacks from "../components/Feedbacks";
import Classes from "../components/Classes";
import Schools from "../components/Schools";
import Users from "../components/Users";

enum AdminTab {
    Users = "users",
    Classes = "classes",
    Keys = "keys",
    Feedbacks = "feedbacks",
    Schools = "schools",
}

const AdminPage = () => {
    const [t] = useTranslation();
    const history = useHistory();
    const match = useRouteMatch<{ tab: string }>("/admin/:tab");

    useEffect(() => {
        if (
            match === null ||
            !Object.values(AdminTab).includes(match.params.tab as AdminTab)
        ) {
            history.replace(`/admin/${AdminTab.Users}`);
        }
    }, [history, match]);

    return (
        <AppPage activeKey={menuOptions.ADMIN}>
            <Layout className="centered-layout">
                <Layout.Content>
                    <Card>
                        <Tabs
                            activeKey={
                                match !== null &&
                                    Object.values(AdminTab).includes(
                                        match.params.tab as AdminTab
                                    )
                                    ? match.params.tab
                                    : AdminTab.Users
                            }
                            onChange={(key) => history.replace(`/admin/${key}`)}
                        >
                            <Tabs.TabPane
                                tab={t("User List")}
                                key={AdminTab.Users}
                            >
                                <Users />
                            </Tabs.TabPane>
                            <Tabs.TabPane
                                tab={t("Class List")}
                                key={AdminTab.Classes}
                            >
                                <Classes />
                            </Tabs.TabPane>
                            <Tabs.TabPane
                                tab={t("Registration Keys")}
                                key={AdminTab.Keys}
                            >
                                <RegistrationKey />
                            </Tabs.TabPane>
                            <Tabs.TabPane
                                tab={t("Feedbacks")}
                                key={AdminTab.Feedbacks}
                            >
                                <Feedbacks adminView />
                            </Tabs.TabPane>
                            <Tabs.TabPane
                                tab={t("Schools")}
                                key={AdminTab.Schools}
                            >
                                <Schools />
                            </Tabs.TabPane>
                        </Tabs>
                    </Card>
                </Layout.Content>
            </Layout>
        </AppPage>
    );
};

export default AdminPage;
