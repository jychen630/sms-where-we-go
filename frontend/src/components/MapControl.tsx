import { Button, ButtonProps } from 'antd';
import { ButtonType } from 'antd/lib/button';
import { useState } from 'react';

const MapControl = (props: { onToggle: (toggle: boolean) => void, defaultToggled?: boolean, type?: ButtonType, altType?: ButtonType, Content: () => JSX.Element, AltContent?: () => JSX.Element } & ButtonProps) => {
    const { onToggle, type, altType, defaultToggled, Content, AltContent } = props;
    const [toggle, setToggle] = useState(defaultToggled ?? false);

    return (
        <Button
            className="floating-control-btn"
            shape='round'
            size='large'
            type={toggle ? (type ?? 'primary') : (altType ?? 'primary')}
            onClick={() => {
                setToggle(toggle => !toggle);
                onToggle(!toggle)
            }}
            {...props}
        >
            {
                toggle ?
                    <Content />
                    :
                    AltContent ? <AltContent /> : <Content />
            }
        </Button>
    );
}

export default MapControl;
