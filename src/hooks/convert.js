import React, { createContext, useContext, useReducer, useState, useMemo, useCallback, useEffect } from "react";

import { useAddressBook } from "./addressBook";
import { ERC20TokenAbi } from "../contracts/bancor/ERC20Token";
import { BancorConverterRegistryAbi } from "../contracts/bancor/BancorConverterRegistry";
import { getContract, getContractRegistryAddress } from "../utils/bancor";



export const useConvert = (web3context) => {

    const [ tokens, setTokens ] = useState([]);

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

    useMemo( async () => {
        if (initialized && (networkId === 1 || networkId === 3)) {
            const tokens = await getConvertibleTokens();
            setTokens(tokens)
        } else {
            setTokens([])
        }
    }, [initialized, networkId, bancorContractBancorConverterRegistry])

    return {
        tokens: tokens,
        loading: !initialized
    }
}

export default useConvert;

