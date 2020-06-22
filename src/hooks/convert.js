import React, { createContext, useContext, useReducer, useState, useMemo, useCallback, useEffect } from "react";

import { useAddressBook } from "./addressBook";
import { ERC20TokenAbi } from "../contracts/bancor/ERC20Token";
import { SmartTokenAbi } from "../contracts/bancor/SmartToken";
import { BancorConverterAbi } from "../contracts/bancor/BancorConverter";
import { BancorConverterRegistryAbi } from "../contracts/bancor/BancorConverterRegistry";
import { BancorNetworkAbi } from "../contracts/bancor/BancorNetwork";
import { getContract, getContractRegistryAddress } from "../utils/bancor";
import { ethers } from "ethers";
import { fetchData } from "../utils/api";
import { CACHE_URL } from "../constants";

const BancorSDK = require('@bancor/sdk').SDK;


export const useConvert = (web3context) => {

    const [tokens, setTokens] = useState([]);

    const {
        initialized,
        bancorContractContractRegistry,
        bancorContractContractFeatures,
        bancorContractBancorFormula,
        bancorContractBancorNetwork,
        bancorContractBancorNetworkPathFinder,
        bancorContractBancorConverterRegistry,
        bancorContractBancorConverterRegistryData,
        bancorContractBancorGasPriceLimit,
        bancorContractBNTToken,
        bancorContractBancorConverterFactory,
        bancorContractBancorConverterUpgrader,
        bancorContractBNTConverter,
        bancorContractBancorX,
        bancorContractNonStandardTokenRegistry,
        bancorContractEtherToken
    } = useAddressBook(web3context);
    const { networkId } = web3context;


    const getETHBalance = useCallback(async () => {
        const signer = web3context.library.getSigner();
        const balance = await signer.provider.getBalance(web3context.account);
        return ethers.utils.formatEther(balance);
    }, [web3context])

    const getTokenBalance = useCallback(async (tokenAddress) => {
        const signer = web3context.library.getSigner();
        const contract = getContract(tokenAddress, ERC20TokenAbi, signer);
        const balance = await contract.balanceOf(web3context.account);
        const decimal = await contract.decimals();
        return ethers.utils.formatUnits(balance.toString(), decimal);
    }, [web3context])

    const getTokenName = useCallback(async (address) => {
        const signer = web3context.library.getSigner();
        const tokenContract = getContract(address, ERC20TokenAbi, signer);

        try {
            const symbol = await tokenContract.symbol();
            const name = await tokenContract.name();
            return {
                name: name,
                symbol: symbol,
                address: address
            };
        } catch (error) {
            let symbol;
            let name;
            switch (address.toLowerCase()) {
                case ('0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2').toLowerCase():
                    symbol = "MKR";
                    name = "Maker"
                    break;
                case ('0x1b22C32cD936cB97C28C5690a0695a82Abf688e6').toLowerCase():
                    symbol = "WISH";
                    name = "WISH";
                    break;
                case ('0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359').toLowerCase():
                    symbol = "SAI";
                    name = "Single Collateral DAI ";
                    break;
                case ('0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A').toLowerCase():
                    symbol = "DGD";
                    name = "DigixDAO";
                    break;
                case ('0xbdEB4b83251Fb146687fa19D1C660F99411eefe3').toLowerCase():
                    symbol = "SVD";
                    name = "Savedroid";
                    break;
                case ('0xF1290473E210b2108A85237fbCd7b6eb42Cc654F').toLowerCase():
                    symbol = "HEDG";
                    name = "HedgeTrade";
                    break;
                default:
                    symbol = `${address}`;
            }
            return {
                name: name || address,
                symbol: symbol,
                address: address
            };
        }

    }, [web3context])

    const getConvertibleTokens = useCallback(async () => {
        const signer = web3context.library.getSigner();
        const contract = getContract(bancorContractBancorConverterRegistry, BancorConverterRegistryAbi, signer);
        const addresses = await contract.getConvertibleTokens();

        const convertibleTokens = await Promise.all(addresses.map(address => getTokenName(address)));
        return convertibleTokens;
    }, [bancorContractBancorConverterRegistry, web3context])

    useMemo(async () => {
        if (initialized && (networkId === 1 || networkId === 3)) {
            let tokens = await getConvertibleTokens();
            if (networkId === 1) {
                tokens = tokens.filter(item => (item.name !== "Ether Token" && item.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"));
                tokens.push({
                    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                    name: "Bancor Ether",
                    symbol: "ETH"
                })  
            }
            setTokens(tokens)
        } else {
            setTokens([])
        }
    }, [initialized, networkId, bancorContractBancorConverterRegistry])

    const parseToken = useCallback((amount, decimal) => {
        return ethers.utils.formatUnits(amount, decimal) || "0.0";
    }, [])

    const getTokenDecimal = useCallback(async (tokenAddress) => {
        const signer = web3context.library.getSigner();
        const contract = getContract(tokenAddress, ERC20TokenAbi, signer);
        const decimal = await contract.decimals();
        return decimal;
    }, [web3context])

    const getConversionFee = useCallback(async (smartTokenAddress) => {
        try {
            const signer = web3context.library.getSigner();
            const smartTokenContract = getContract(smartTokenAddress, BancorConverterAbi, signer);
            const converterAddress = await smartTokenContract.owner();
            const contract = getContract(converterAddress, BancorConverterAbi, signer);
            const fee = await contract.conversionFee();
            return Number(fee.toString()) / 10000;
        } catch (error) {
            return 0;
        }

    }, [web3context]);

    const getFee = useCallback(async (path) => {
        console.log("path --> ", path)
        const results = await Promise.all(path.map(item => getConversionFee(item)))
        return results.reduce((prev, item) => prev += item, 0)
    }, [web3context])

    return {
        tokens: tokens,
        loading: !initialized,
        getETHBalance,
        getTokenBalance,
        parseToken,
        getTokenDecimal,
        getFee
    }
}

export default useConvert;

export const getUsdRate = async (tokenSymbol) => {
    try {
        const { price } = await fetchData(`${CACHE_URL}/tokens/${tokenSymbol}`);
        return price;
    } catch (error) {
        return;
    }
}

export const getPathFromSDK = async (baseTokenAddress, pairTokenAddress, inputAmount) => {

    try {
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
    } catch (error) {
        console.error(error)
        return
    }

}
