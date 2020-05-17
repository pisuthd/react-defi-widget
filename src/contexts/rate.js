
import React, { useCallback } from "react";

import { BANCOR_CONTRACTS, NETWORKS, TOKEN_CONTRACTS, CACHE_URL, TRANSACTION_TYPE } from "../constants";

import { fetchData } from "./bancor";

export const useRate = () => {

    const getUsdRate = useCallback(async (tokenSymbol) => {
        try {
            const { price } = await fetchData(`${CACHE_URL}/tokens/${tokenSymbol}`);
            return price;
        } catch (error) {
            return;
        }
    }, [])

    return {
        getUsdRate
    }
}