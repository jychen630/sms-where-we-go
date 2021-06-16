import { Service } from "wwg-api";
import Map from "../components/Map";
import { createNotifyError, handleApiError } from "../api/utils";
import InfoCard from "../components/InfoCard";
import AppPage, { menuOptions } from "./AppPage";
import { useCallback } from "react";
import { useHistory } from "react-router";

const MapPage = () => {
    const history = useHistory();

    const getRoster = useCallback(async () => {
        return Service.getRoster()
            .then((result) => {
                return result.schools.filter((school) => !!school.latitude && !!school.longitude);
            })
            .catch((err) => {
                handleApiError(err, createNotifyError('错误', '未能获取地图数据', err => err.requireLogin && setTimeout(() => history.push('/login', history.location), 1500)));
                return [];
            });
    }, [history]);

    return (
        <AppPage activeKey={menuOptions.MAP}>
            <Map getData={getRoster} getPopup={(props) => (<InfoCard {...props} />)} />
        </AppPage>
    )
}

export default MapPage;
