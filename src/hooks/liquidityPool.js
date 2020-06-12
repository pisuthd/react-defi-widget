import React, { createContext, useContext, useReducer, useState, useMemo, useCallback, useEffect } from "react";
import { fetchData } from "../utils/api";
import { useAddressBook } from "./addressBook";
import { BancorConverterAbi } from "../contracts/bancor/BancorConverter";
import { SmartTokenAbi, SmartTokenControllerAbi } from "../contracts/bancor/SmartToken";
import { BancorConverterRegistryAbi } from "../contracts/bancor/BancorConverterRegistry";
import { ERC20TokenAbi } from "../contracts/bancor/ERC20Token";
import { BANCOR_CONTRACTS, NETWORKS, TOKEN_CONTRACTS, CACHE_URL, TRANSACTION_TYPE } from "../constants";
import { getContract, getContractRegistryAddress } from "../utils/bancor";
import { ethers } from "ethers";


export const useLiquidityPool = (web3context) => {

    const [tokens, setTokens] = useState([]);
    const [currentPool, setCurrentPool] = useState();
    const [poolData, setPoolData] = useState({
        smartTokenAddress: "",
        converterAddress: "",
        fee: 0
    });
    const [loading, setLoading] = useState(false);
    const {
        initialized,
        bancorContractBancorConverterRegistry
    } = useAddressBook(web3context);
    const { networkId } = web3context;

    const listLiquidityPools = useCallback(async () => {
        const signer = web3context.library.getSigner();
        const contract = getContract(bancorContractBancorConverterRegistry, BancorConverterRegistryAbi, signer);
        const pools = await contract.getLiquidityPools();
        const converters = await contract.getConvertersBySmartTokens(pools);
        return pools.map((item, index) => { return { smartTokenAddress: item, converterAddress: converters[index] } });

    }, [bancorContractBancorConverterRegistry, web3context])

    const getPoolName = useCallback(async (address) => {
        const signer = web3context.library.getSigner();
        const tokenContract = getContract(address, SmartTokenAbi, signer);
        try {
            const symbol = await tokenContract.symbol();
            return symbol;
        } catch (error) {
            console.log("getPoolname error : ", error);
            return;
        }

    }, [web3context])

    const getPoolTotalSupply = useCallback(async (address) => {
        const signer = web3context.library.getSigner();
        const tokenContract = getContract(address, SmartTokenAbi, signer);
        try {
            const total = await tokenContract.totalSupply();
            return ethers.utils.formatEther(total);
        } catch (error) {
            console.log("getPoolTotalSupply error : ", error);
            return 0;
        }

    }, [web3context])

    const getReserves = useCallback(async (converterAddress) => {
        const signer = web3context.library.getSigner();
        const contract = getContract(converterAddress, BancorConverterAbi, signer);

        const total = await contract.connectorTokenCount();
        const connectorTokenCount = Number(total.toString())
        let indexs = [];
        for (let i = 0; i < connectorTokenCount; i++) {
            indexs.push(i);
        }
        const reserves = await Promise.all(indexs.map(item => contract.connectorTokens(item)))
        const result = await Promise.all(reserves.map(address => {
            const tokenContract = getContract(address, ERC20TokenAbi, signer);
            return new Promise((resolve, reject) => {
                contract.getConnectorBalance(address).then(
                    balance => {
                        tokenContract.symbol().then(
                            symbol => {
                                contract.connectors(address).then(
                                    reserveData => {
                                        resolve({
                                            address : address,
                                            symbol: symbol,
                                            balance: ethers.utils.formatEther(balance.toString()).toString(),
                                            ratio : (reserveData[1] / 1000000)
                                        })
                                    }
                                )

                            }
                        )
                    }
                )
            })

        }))
        return result;

    }, [web3context])

    const getConversionFee = useCallback(async (converterAddress) => {
        const signer = web3context.library.getSigner();
        const contract = getContract(converterAddress, BancorConverterAbi, signer);
        const fee = await contract.conversionFee();
        return Number(fee.toString()) / 10000;;
    }, [web3context]);

    useMemo(async () => {

        if (initialized && currentPool && (networkId === 1 || networkId === 3)) {
            
            if (networkId === 1) {
                // load pool's data from the cache
                try {
                    const data = await fetchData(`${CACHE_URL}/pools/${currentPool}`);
                    const converterAddress = data.contracts.find(item => item.name === "converter")['address'];
                    const smartTokenAddress = data.contracts.find(item => item.name === "smartToken")['address'];
                    setTokens(data.reserves);
                    const totalSupply = await getPoolTotalSupply(smartTokenAddress)

                    setPoolData({
                        smartTokenAddress: smartTokenAddress,
                        converterAddress: converterAddress,
                        fee : data.fee,
                        totalSupply: totalSupply
                    })      
                    return;
                } catch (error) {
                    console.log("Load pool's data from cache failed, failback to load from the smart contract.", error)
                }
            }
            
            setLoading(true);
            const pools = await listLiquidityPools();
            const symbols = await Promise.all(pools.map(item => getPoolName(item.smartTokenAddress)));
            const index = symbols.indexOf(currentPool);
            const pool = pools[index];

            if (!pool) {
                setPoolData({
                    smartTokenAddress: "",
                    converterAddress: "",
                    fee: 0
                })
                setTokens([]);
                return;
            }

            const fee = await getConversionFee(pool.converterAddress);
            const totalSupply = await getPoolTotalSupply(pool.smartTokenAddress);
            /*
            symbol: "BNT"
            address: "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C"
            balance: "5866442.697927883087667825"
            balanceInUsd: 3545163.6574676805
            ratio: 0.5
            isSaleEnabled: true
            isSet: true
            volume: 757312.8566619952
            volumeInUsd: 457653.49718994915
            */
            setPoolData({
                ...pool,
                fee: fee,
                totalSupply: totalSupply
            })
            const tokens = await getReserves(pool.converterAddress);
            setTokens(tokens);
            setLoading(false);

        } else {
            setTokens([])
        }
    }, [networkId, currentPool, initialized])



    return {
        tokens,
        loading: (!initialized || loading),
        setCurrentPool,
        poolData
    }
}

export default useLiquidityPool;

