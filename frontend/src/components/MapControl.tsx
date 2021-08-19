import { Button, ButtonProps } from "antd";
import { ButtonType } from "antd/lib/button";
import { useState } from "react";

const MapControl = ({
    onToggle,
    btnProps,
    type,
    altType,
    defaultToggled,
    Content,
    AltContent,
}: {
    onToggle: (toggle: boolean) => void;
    defaultToggled?: boolean;
    type?: ButtonType;
    altType?: ButtonType;
    Content: () => JSX.Element;
    AltContent?: () => JSX.Element;
    btnProps?: ButtonProps;
}) => {
    const [toggle, setToggle] = useState(defaultToggled ?? false);

    return (
        <Button
            className="floating-control-btn"
            shape="round"
            size="large"
            type={toggle ? type ?? "primary" : altType ?? "primary"}
            onClick={() => {
                setToggle((toggle) => !toggle);
                onToggle(!toggle);
            }}
            {...btnProps}
        >
            {toggle ? <Content /> : AltContent ? <AltContent /> : <Content />}
        </Button>
    );
};

export default MapControl;
