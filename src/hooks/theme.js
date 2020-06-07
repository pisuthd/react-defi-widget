import React, { createContext, useContext, useReducer, useState, useMemo, useCallback, useEffect } from "react";

const ThemeContext = createContext();

const useThemeContext = () => {
    return useContext(ThemeContext)
}

const ACTIONS = {
    UPDATE_FONT_SIZE: "UPDATE_FONT_SIZE",
    UPDATE_FOREGROUND: "UPDATE_FOREGROUND",
    UPDATE_BACKGROUND: "UPDATE_BACKGROUND",
    SHOW_MODAL: "SHOW_MODAL",
    UPDATE_EDGES: "UPDATE_EDGES"
}

export const MODAL_TYPES = {
    PROCESSING: "PROCESSING",
    CONFIRM: "CONFIRM",
    WARNING: "WARNING",
    ERROR: "ERROR",
    NONE: "NONE",
    ETHERTOKEN: "ETHERTOKEN"
}

const reducer = (state, { type, payload }) => {

    switch (type) {
        case ACTIONS.UPDATE_FOREGROUND:
            const { color } = payload;
            return {
                ...state,
                color: color
            }
        case ACTIONS.UPDATE_EDGES:
            const { width, height } = payload;
            return {
                ...state,
                width: width,
                height: height
            }
        case ACTIONS.UPDATE_BACKGROUND:
            const { backgroundColor } = payload;
            return {
                ...state,
                backgroundColor: backgroundColor
            }
        case ACTIONS.UPDATE_FONT_SIZE:
            const { size } = payload;
            return {
                ...state,
                fontSize: size
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
            throw Error(`Unexpected action type in AddressBookContext reducer: '${type}'.`)
        }
    }
}

const provider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, {
        color: "#0275d8",
        backgroundColor: "#FFFFFF",
        fontSize: "16px",
        type: MODAL_TYPES.NONE,
        showModal: false
    })

    const updateColor = useCallback((color) => {
        dispatch({ type: ACTIONS.UPDATE_FOREGROUND, payload: { color } })
    }, [])

    const updateBackgroundColor = useCallback((backgroundColor) => {
        dispatch({ type: ACTIONS.UPDATE_BACKGROUND, payload: { backgroundColor } })
    }, [])

    const updateFontSize = useCallback((size) => {
        dispatch({ type: ACTIONS.UPDATE_FONT_SIZE, payload: { size } })
    }, []);

    const updateShowModal = useCallback((status) => {
        dispatch({ type: ACTIONS.SHOW_MODAL, payload: { status } })
    }, []);

    const updateEdges = useCallback((width, height) => {
        dispatch({ type: ACTIONS.UPDATE_EDGES, payload: { width, height } })
    }, []);

    return (
        <ThemeContext.Provider
            value={useMemo(() => [state, {
                updateColor,
                updateBackgroundColor,
                updateFontSize,
                updateShowModal,
                updateEdges
            }], [
                state,
                updateColor,
                updateBackgroundColor,
                updateFontSize,
                updateShowModal,
                updateEdges
            ])}
        >
            {children}
        </ThemeContext.Provider>
    )
}


export const useTheme = () => {

    const [{ color, backgroundColor, fontSize, showModal, type }, { updateColor, updateBackgroundColor, updateFontSize, updateShowModal, updateEdges }] = useThemeContext();

    return {
        color,
        backgroundColor,
        fontSize,
        updateColor,
        updateFontSize,
        updateBackgroundColor,
        updateEdges
    }
}

export default provider;