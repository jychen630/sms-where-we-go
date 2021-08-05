import { ModalProps } from "antd";
import Modal from "antd/lib/modal/Modal";
import { useCallback } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";


type ModalHandlerProps = {
    content: JSX.Element,
    modalProps?: Exclude<ModalProps, "visible">,
    defaultVisible?: boolean,
    onOk?: () => void,
    onCancel?: () => void,
}


export const useModal = ({ content, onOk, onCancel, modalProps, defaultVisible = false }: ModalHandlerProps): [() => JSX.Element, () => void, () => void, () => void] => {
    const [t] = useTranslation()
    const [show, setShow] = useState(defaultVisible);
    const okText = t("Confirm"), cancelText = t("Cancel");
    const wrapper = (cb?: () => void) => () => {
        cb && cb();
        setShow(false);
    };
    return [
        useCallback(() => (
            <Modal
                okText={okText}
                cancelText={cancelText}
                onOk={wrapper(onOk)}
                onCancel={wrapper(onCancel)}
                {...modalProps}
                visible={show}
            >
                {content}
            </Modal>
        ), [okText, cancelText, show]), //  eslint-disable-line
        () => {
            setShow(true);
        },
        () => {
            setShow(false);
        },
        () => {
            setShow(show => !show);
        }
    ]
}
