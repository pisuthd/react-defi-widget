import React, { createContext, useContext, useReducer, useState, useMemo, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { BANCOR_CONTRACTS, NETWORKS, TOKEN_CONTRACTS, CACHE_URL, TRANSACTION_TYPE } from "../constants";
import { fetchData } from "../utils/api";
import { getContract,getContractRegistryAddress  } from "../utils/bancor";
import { parseString } from "../utils/conversion";
import { ContractRegistryAbi } from "../contracts/bancor/ContractRegistry";

const AddressBookContext = createContext()

const useAddressBookContext = () => {
    return useContext(AddressBookContext)
}

const ACTIONS = {
    UPDATE_BANCOR_CONTRACTS: "UPDATE_BANCOR_CONTRACTS",
}

const reducer = (state, { type, payload }) => {
    switch (type) {

        case ACTIONS.UPDATE_BANCOR_CONTRACTS: {
            const {
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
            } = payload
            return {
                ...state,
                initialized: true,
                bancorContractContractRegistry: bancorContractContractRegistry,
                bancorContractContractFeatures: bancorContractContractFeatures,
                bancorContractBancorFormula: bancorContractBancorFormula,
                bancorContractBancorNetwork: bancorContractBancorNetwork,
                bancorContractBancorNetworkPathFinder: bancorContractBancorNetworkPathFinder,
                bancorContractBancorConverterRegistry: bancorContractBancorConverterRegistry,
                bancorContractBancorConverterRegistryData: bancorContractBancorConverterRegistryData,
                bancorContractBancorGasPriceLimit: bancorContractBancorGasPriceLimit,
                bancorContractBNTToken: bancorContractBNTToken,
                bancorContractBancorConverterFactory: bancorContractBancorConverterFactory || "",
                bancorContractBancorConverterUpgrader: bancorContractBancorConverterUpgrader || "",
                bancorContractBNTConverter: bancorContractBNTConverter || "",
                bancorContractBancorX: bancorContractBancorX || "",
                bancorContractNonStandardTokenRegistry: bancorContractNonStandardTokenRegistry || "",
                bancorContractEtherToken: bancorContractEtherToken || ""
            }
        }
        default: {
            throw Error(`Unexpected action type in AddressBookContext reducer: '${type}'.`)
        }
    }
}

const provider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, {
        initialized: false,
        bancorContractContractRegistry: "",
        bancorContractContractFeatures: "",
        bancorContractBancorFormula: "",
        bancorContractBancorNetwork: "",
        bancorContractBancorNetworkPathFinder: "",
        bancorContractBancorConverterRegistry: "",
        bancorContractBancorConverterRegistryData: "",
        bancorContractBancorGasPriceLimit: "",
        bancorContractBNTToken: "",
        bancorContractBancorConverterFactory: "",
        bancorContractBancorConverterUpgrader: "",
        bancorContractBNTConverter: "",
        bancorContractBancorX: "",
        bancorContractNonStandardTokenRegistry: "",
        bancorContractEtherToken: ""
    })

    const updateBancorContracts = useCallback(({
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

    }) => {
        dispatch({
            type: ACTIONS.UPDATE_BANCOR_CONTRACTS, payload: {
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
            }
        })
    }, [])

    return (
        <AddressBookContext.Provider
            value={useMemo(() => [state, {
                updateBancorContracts
            }], [
                state,
                updateBancorContracts
            ])}
        >
            {children}
        </AddressBookContext.Provider>
    )
}


export const useAddressBook = (web3context) => {
    const [state, { updateBancorContracts }] = useAddressBookContext();

    const { networkId } = web3context;

    useMemo(async () => {

        if (networkId) {
            const signer = web3context.library.getSigner();
            // load contract addresses from cache

            if (networkId === NETWORKS.MAINNET) {
                try {

                    const data = await fetchData(`${CACHE_URL}/address_book/bancor_systems`);
                    updateBancorContracts(data);
                    console.log("contracts loaded. (from cache)");
                    return;
                } catch (error) {
                    console.log("Load contract addresses from cache failed, failback to load from the registry contract.")
                }
            }

            const registryContract = getContract(getContractRegistryAddress(networkId), ContractRegistryAbi, signer);
            const total = await registryContract.itemCount();

            let promises = [];
            for (let i = 0; i < total; i += 1) {
                promises.push(i);
            }
            const results = await Promise.all(promises.map(index => registryContract.contractNames(index)));
            const addresses = await Promise.all(results.map(name => registryContract.getAddress(ethers.utils.toUtf8Bytes(name))));

            let contractList = {};

            for (let count = 0; count < Number(total); count += 1) {
                contractList[`bancorContract${parseString(results[count])}`] = addresses[count];
                if (Object.keys(contractList).length === Number(total)) {
                    updateBancorContracts(contractList);
                }
            }
            console.log("contracts loaded.");
        }

    }, [networkId, web3context])

    return {
        ...state
    }
}

export default provider;
