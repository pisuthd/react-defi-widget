import React, { createContext, useContext, useReducer, useState, useMemo, useCallback, useEffect } from "react";

const ModalContext = createContext();

const useModalContext = () => {
    return useContext(ModalContext)
}

const ACTIONS = {
    UPDATE_MESSAGE: "UPDATE_MESSAGE",
    SHOW_MODAL: "SHOW_MODAL"
}

export const MODAL_TYPES = {
    PROCESSING: "PROCESSING",
    WARNING: "WARNING",
    ERROR: "ERROR",
    NONE: "NONE"
}

const reducer = (state, { type, payload }) => {
    switch (type) {
        case ACTIONS.UPDATE_MESSAGE: {
            const { type, title , message } = payload;
            return {
                ...state,
                message: message,
                title: title,
                type : type
            }
        }
        
        case ACTIONS.SHOW_MODAL: {
            const { status } = payload;
            let type = MODAL_TYPES.NONE;
            if (status !== false) {
                type = state.type;
            }
            return {
                ...state,
                showModal: status,
                type: type
            }
        }
        default: {
            throw Error(`Unexpected action type in ModalContext reducer: '${type}'.`)
        }

    }
}

const provider = ({ children }) => {

    const [state, dispatch] = useReducer(reducer, {
        message: "",
        title: "",
        type : MODAL_TYPES.NONE,
        showModal: false
    })

    const updateMessage = useCallback((type, title, message) => {
        dispatch({ type: ACTIONS.UPDATE_MESSAGE, payload: { type, title, message } })
    }, [])


    const updateShowModal = useCallback((status) => {
        dispatch({ type: ACTIONS.SHOW_MODAL, payload: { status } })
    }, [])


    return (
        <ModalContext.Provider
            value={useMemo(() => [state, {
                updateMessage,
                updateShowModal
            }], [
                state,
                updateMessage,
                updateShowModal
            ])}
        >
            {children}
        </ModalContext.Provider>
    )
}


export const useModal = () => {

    const [{ message, title, showModal, type }, { updateMessage, updateShowModal }] = useModalContext();

    useEffect(() => {
        // updateShowModal(true);
        /*
        setTimeout(() => {
            updateShowModal(false);
        }, 5000)
        */
    }, [])


    const onClose = () => {
        updateShowModal(false);
        // setType(MODAL_TYPES.NONE);
    }

    const showProcessingModal = useCallback((title, message) => { 
        updateShowModal(true);
        // setType(MODAL_TYPES.PROCESSING);
        updateMessage( MODAL_TYPES.PROCESSING ,title, message);
        return onClose;
    },[])

    return {
        showModal,
        message,
        title,
        type,
        showProcessingModal
    }


}

export default provider;


