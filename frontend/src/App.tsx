import React, { useEffect } from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from "react-router-dom";
import { Collapse } from "antd";
import { useModal } from "./api/modal";
import CardPage from "./pages/CardPage";
import LoginForm from "./components/LoginForm";
import RegistrationForm from "./components/RegistrationForm";
import UserPage from "./pages/UserPage";
import MapPage from "./pages/MapPage";
import AdminPage from "./pages/AdminPage";
import "antd/dist/antd.css";
import { OpenAPI, Role } from "wwg-api";
import { AuthProvider, useAuthProvider } from "./api/auth";
import DevLoginForm from "./components/DevLoginForm";
import ListPage from "./pages/ListPage";
import FeedbackPage from "./pages/FeedbackPage";
import FeedbackForm from "./components/FeedbackForm";
import AboutPage from "./pages/AboutPage";
import { notification } from "antd";
import { isDemo } from "./api/utils";

OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.TOKEN = "";
function App() {
    const authProvider = useAuthProvider();
    const [FeedbackModal, showFeedback] = useModal({
        content: (
            <>
                <p>
                    使用过程中有哪些地方不满意？你可以直接在下方反馈，让我们一起进步
                    :-)
                </p>
                <p>
                    同时，欢迎访问SMS Where We Go{" "}
                    <a href="https://github.com/AcKindle3/sms-where-we-go">
                        Github 仓库
                    </a>
                    ，给我们 Star，提 Issue 或者 PR，感谢你的支持！
                </p>
                <Collapse ghost>
                    <Collapse.Panel key="feedback" header="添加反馈">
                        <FeedbackForm isPublic={false} />
                    </Collapse.Panel>
                </Collapse>
            </>
        ),
        onOk: () => {
            window.localStorage.setItem("feedback", "hidden");
        },
        modalProps: {
            title: "你的想法对 SMS Where We Go 很重要",
            okText: "不再显示",
            cancelText: "下次再说",
        },
    });
    useEffect(() => {
        authProvider
            .update()
            .then(() => {
                if (
                    window.localStorage.getItem("feedback") !== "hidden" &&
                    Math.random() < 0.5
                ) {
                    showFeedback();
                }
            })
            .catch((e) => {
                // We expect a 401 when the user is not logged in, so we can safely ignore it.
                // However, if an error occurs and the status code is undefined or something
                // else, it's likely that something goes wrong with the server.
                if (e.status !== 401) {
                    notification.error({
                        message: "错误",
                        description: "连接到服务器时出现问题",
                    });
                }
            });
    }, []); //eslint-disable-line
    return (
        <AuthProvider value={authProvider}>
            <Router>
                <Switch>
                    {(process.env.NODE_ENV === "development" || isDemo) && (
                        <Route path="/dev-login">
                            <CardPage title="Where We Go 调试登录">
                                <DevLoginForm />
                            </CardPage>
                        </Route>
                    )}
                    <Route path="/login">
                        <CardPage title="Where We Go 登录">
                            <LoginForm />
                        </CardPage>
                    </Route>
                    <Route path="/register">
                        <CardPage title="Where We Go 注册">
                            <RegistrationForm />
                        </CardPage>
                    </Route>
                    <Route path="/feedback">
                        <FeedbackPage />
                    </Route>
                    <Route path="/public-feedback">
                        <CardPage title="提交反馈">
                            <FeedbackForm isPublic />
                        </CardPage>
                    </Route>
                    <Route path="/user">
                        <UserPage />
                    </Route>
                    <Route path="/map">
                        <MapPage />
                    </Route>
                    <Route path="/list">
                        <ListPage />
                    </Route>
                    <Route path="/about">
                        <AboutPage />
                    </Route>
                    {authProvider.role !== Role.STUDENT && (
                        <Route path="/admin">
                            <AdminPage />
                        </Route>
                    )}
                    <Route path="/roster">roster</Route>
                    <Route path="/">
                        {authProvider.studentUid ? (
                            <Redirect to="/map" />
                        ) : (
                            <Redirect to="/login" />
                        )}
                    </Route>
                </Switch>
            </Router>
        </AuthProvider>
    );
}

export default App;
