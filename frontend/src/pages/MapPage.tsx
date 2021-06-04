import { notification } from "antd";
import { OpenAPI, Service } from "wwg-api";
import Map from "../components/Map";
import { handleApiError } from "../api/utils";
import InfoPopup from "../components/InfoPopup";
import AppPage, { menuOptions } from "./AppPage";

const getRoster = async () => {
    OpenAPI.WITH_CREDENTIALS = true;
    OpenAPI.TOKEN = 'asdasd';
    return Service.getRoster()
        .then((result) => {
            return result.schools.filter((school) => !!school.latitude && !!school.longitude);
        })
        .catch((err) => handleApiError(err)
            .then(res => {
                notification.error({
                    message: "未能获取地图数据",
                    description: `错误信息：${res.message}`,
                    duration: 3,
                });
                return [];
            }));
}

const MapPage = () => {
    return (
        <AppPage activeKey={menuOptions.MAP}>
            <Map getData={getRoster} getPopup={(props) => (<InfoPopup {...props} />)} />
        </AppPage>
    )
}

export default MapPage;
