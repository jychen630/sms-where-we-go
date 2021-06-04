import { Card, Space } from "antd";
import { MapItem } from "./Map";
import "./InfoPopup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap } from "@fortawesome/free-solid-svg-icons";
import { EnvironmentFilled, FlagFilled, HomeFilled } from "@ant-design/icons";

const InfoPopup = (props: MapItem) => {
    return (
        <Card className="popup-card">
            <p><Space><HomeFilled /> {props.school_name}</Space></p>
            <p><Space><FlagFilled /> {props.school_country}</Space></p>
            <p><Space><EnvironmentFilled /> {props.school_state_province}</Space></p>
            <p><Space><FontAwesomeIcon icon={faMap} /> {props.city}</Space></p>
        </Card>
    )
}

export default InfoPopup;
