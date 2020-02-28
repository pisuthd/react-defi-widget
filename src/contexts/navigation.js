import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from "react";
import { PAGES } from "../constants";


const NavigationContext = createContext();

const ACTIONS = {
    UPDATE_PAGE: "UPDATE_PAGE"
}

const useNavigationContext = () => {
    return useContext(NavigationContext)
}

const reducer = (state, { type, payload }) => {
    switch (type) {
        case ACTIONS.UPDATE_PAGE: {
            const { page } = payload

            if (Object.keys(PAGES).indexOf(page) === -1) {
                throw Error(`Can't navigate to page : ${page}`);
            }

            return {
                page: page
            }
        }
        default: {
            throw Error(`Unexpected action type in NavigationContext reducer: '${type}'.`)
        }
    }
}

const provider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, {
        page: PAGES.ACCOUNT
    })

    const updatePage = useCallback((page) => {
        dispatch({ type: ACTIONS.UPDATE_PAGE, payload: { page } })
    }, [])

    return (
        <NavigationContext.Provider
            value={useMemo(() => [state, { updatePage }], [
                state,
                updatePage
            ])}
        >
            {children}
        </NavigationContext.Provider>
    )

}

export const useNavigation = () => {
    const [{ page }, { updatePage }] = useNavigationContext(); 

    return {
        page,
        updatePage
    }
}

export default provider;