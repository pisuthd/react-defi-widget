
import React, { useCallback } from "react";

// const BancorSDK = require('bancor-sdk').SDK;

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
    /*
    const getPathFromSDK = useCallback(async (baseTokenAddress, pairTokenAddress, inputAmount) => {
        const settings = {
            ethereumNodeEndpoint: "https://mainnet.infura.io/v3/3aa2960d9ce549d6a539421c0a94fe52",
        };

        const sourceToken = {
            blockchainType: 'ethereum',
            blockchainId: baseTokenAddress
        };
        const targetToken = {
            blockchainType: 'ethereum',
            blockchainId: pairTokenAddress
        };

        let bancorSDK = await BancorSDK.create(settings);
        const result = await bancorSDK.pricing.getPathAndRate(sourceToken, targetToken, inputAmount);
        await BancorSDK.destroy(bancorSDK);
        return result;
    }, [])
    */

    return {
        getUsdRate,
        // getPathFromSDK
    }
}

