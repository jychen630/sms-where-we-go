import { Typography } from "antd";
import { useTranslation } from "react-i18next";

const { Title, Paragraph } = Typography;

const lastUpdateTime = new Date("Tue, 18 Jan 2022 07:21:05 GMT");

const PrivacyPolicy = () => {
    const [t] = useTranslation();
    return (
        <>
            <Title>{t("PRIVACY AGREEMENT VERSIONED", { version: "v1.0" })}</Title>
            <Title level={3}>SMS Where We Go ({t("深圳中学学生去向网站")})</Title>
            <Paragraph>
                <ul>
                    <li>{t("我们向谁提供服务")}</li>
                    <li>{t("我们如何提供服务")}</li>
                    <li>{t("我们如何收集，管理您的信息")}</li>
                    <li>{t("您的信息对谁可见")}</li>
                    <li>{t("我们如何使用Cookies")}</li>
                    <li>{t("隐私协议的更新方式")}</li>
                    <li>{t("如何获取帮助")}</li>
                </ul>
            </Paragraph>
            <Title level={4}>{t("我们向谁提供服务")}</Title>
            <Paragraph>
                {t("深圳中学学生去向网站，下称 (\"网站\")。")}
                {t("仅向各届深圳中学 (下称 \"深中\") 毕业生，以及深中校内老师提供服务。")}
            </Paragraph>
            <Paragraph>
                {t("网站采用短期有效的注册码，及管理员手动添加用户的方式进行新用户的注册。")}
            </Paragraph>
            <Title level={4}>{t("我们如何提供服务")}</Title>
            <Paragraph>
                {t("网站收集各届深中毕业生信息 (下称 \"信息\")。")}
                {" "}{t("在保障信息安全的前提下，向毕业生提供其他学生的去向信息(大学名称，位置信息等)，及个人联系方式 (包括邮箱，手机号码等)。")}
            </Paragraph>
            <Title level={4}>{t("我们如何收集，管理您的信息")}</Title>
            <Paragraph>
                {t("您在注册过程中提供的个人信息将会在我们的服务器上存储。网站使用https协议保证数据在传输过程中不会被第三方截取。")}
            </Paragraph>
            <Paragraph>
                {t("我们不会以任何形式明文记录您的密码。所有用户的密码将在加密后存储。")}
            </Paragraph>
            <Title level={4}>{t("您的信息对谁可见")}</Title>
            <Paragraph>
                {t("注册后，用户的信息默认会对其他同年毕业的学生可见。您可随时在设置中更改信息的可见程度，或将账号从网站上移除。")}
            </Paragraph>
            <Title level={4}>{t("我们如何使用Cookies")}</Title>
            <Paragraph>
                {t("网站通过Cookies记录您的会话，来保证网站的服务能供正常运行。您可通过浏览器关闭Cookies，但是请注意这可能使得网站无法正常提供服务。")}
            </Paragraph>
            <Title level={4}>{t("隐私协议如何更新")}</Title>
            <Paragraph>
                {t("Privacy Agreement Update Time", {
                    lastUpdateTime: lastUpdateTime.toLocaleString()
                })}
            </Paragraph>
            <Paragraph>
                {t("最新的用户隐私协议将会通过网站提供。已注册的用户在重新登陆后将需要重新同意隐私协议以使用我们提供的服务。")}
            </Paragraph>
            <Title level={4}>{t("如何获取帮助")}</Title>
            <Paragraph>
                {t("如对隐私协议，或网站提供的服务有任何疑问，请联系网站当前的管理员。")}
            </Paragraph>
        </>
    );
};

export default PrivacyPolicy;
