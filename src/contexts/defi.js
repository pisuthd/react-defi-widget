import React, { createContext, useContext, useReducer, useState, useMemo, useCallback, useEffect } from "react";
import { ethers } from "ethers";

import { BANCOR_CONTRACTS, NETWORKS, TOKEN_CONTRACTS } from "../constants";

import { ContractRegistryAbi } from "../contracts/bancor/ContractRegistry";
import { BancorConverterRegistryAbi } from "../contracts/bancor/BancorConverterRegistry";
import { BancorConverterAbi } from "../contracts/bancor/BancorConverter";
import { SmartTokenAbi } from "../contracts/bancor/SmartToken";
import { BancorConverterRegistryDataAbi } from "../contracts/bancor/BancorConverterRegistryData";
import { ERC20TokenAbi } from "../contracts/bancor/ERC20Token";
import { EtherTokenAbi } from "../contracts/bancor/EtherToken";
import { BancorNetworkAbi } from "../contracts/bancor/BancorNetwork";

const GAS_LIMIT = 100000;

const DefiContext = createContext();

const ACTIONS = {
    UPDATE_PROCESSING_TX: "UPDATE_PROCESSING_TX",
    UPDATE_BANCOR_CONTRACTS: "UPDATE_BANCOR_CONTRACTS",
    UPDATE_BALANCE: "UPDATE_BALANCE"
}

const useDefiContext = () => {
    return useContext(DefiContext)
}

const reducer = (state, { type, payload }) => {
    switch (type) {
        case ACTIONS.UPDATE_PROCESSING_TX: {
            const { processingTx } = payload

            return {
                ...state,
                processingTx: processingTx
            }
        }
        case ACTIONS.UPDATE_BALANCE: {
            const { bancorEther, bancorToken, bancorUsd } = payload;
            return {
                ...state,
                totalBancorEther: bancorEther,
                totalBancorToken: bancorToken,
                totalBancorUsd: bancorUsd

            }
        }
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
                loading: false,
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
            throw Error(`Unexpected action type in DefiContext reducer: '${type}'.`)
        }
    }
}


const provider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, {
        processingTx: undefined,
        loading: true,
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
        bancorContractEtherToken: "",
        totalBancorEther: 0, //fixme: use BigNumber
        totalBancorToken: 0, //fixme: use BigNumber
        totalBancorUsd: 0 //fixme: use BigNumber
    })

    const updateProcessingTx = useCallback((processingTx) => {
        dispatch({ type: ACTIONS.UPDATE_PROCESSING_TX, payload: { processingTx } })
    }, [])

    const updateBalance = useCallback(({ bancorEther, bancorToken, bancorUsd }) => {
        dispatch({ type: ACTIONS.UPDATE_BALANCE, payload: { bancorEther, bancorToken, bancorUsd } })
    }, [])

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
        <DefiContext.Provider
            value={useMemo(() => [state, {
                updateProcessingTx,
                updateBancorContracts,
                updateBalance
            }], [
                state,
                updateProcessingTx,
                updateBancorContracts,
                updateBalance
            ])}
        >
            {children}
        </DefiContext.Provider>
    )

}

export const getContract = (address, ABI, signer) => {
    return new ethers.Contract(address, ABI, signer);
};

export const useDefi = (web3context) => {
    const [state, { updateProcessingTx, updateBancorContracts, updateBalance }] = useDefiContext();

    const { networkId } = web3context;

    const [pools, setPools] = useState([]);

    const {
        processingTx,
        loading,
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
        bancorContractEtherToken,
        totalBancorEther,
        totalBancorToken,
        totalBancorUsd
    } = state;

    useEffect(() => {

        try {
            console.log("web3context.networkId : ", web3context.networkId)
            const network = ([NETWORKS.MAINNET, NETWORKS.ROPSTEN].indexOf(web3context.networkId) !== -1) ? web3context.networkId : undefined;
            if (web3context && web3context.active && network !== undefined) {
                console.log(`load bancor's contract for  ${network}`);
                const signer = web3context.library.getSigner();
                const getContractRegistryAddress = (network) => {
                    switch (network) {
                        case NETWORKS.MAINNET:
                            return BANCOR_CONTRACTS.MAINNET.ContractRegistry
                        case NETWORKS.ROPSTEN:
                            return BANCOR_CONTRACTS.ROPSTEN.ContractRegistry
                        default:
                            return;
                    }
                }
                const contract = getContract(getContractRegistryAddress(network), ContractRegistryAbi, signer);



                contract.itemCount().then(
                    totalItem => {
                        const totalContracts = totalItem.toNumber()

                        let contractList = {};

                        const onUpdate = (contractName, contractAddress) => {

                            const parseString = (str) => {
                                return str.replace(/[^a-z0-9+]+/gi, '');
                            }

                            contractList[`bancorContract${parseString(contractName)}`] = contractAddress

                            if (Object.keys(contractList).length === totalContracts) {
                                updateBancorContracts(contractList);
                            }

                        }


                        for (let i = 0, p = Promise.resolve(); i < totalContracts; i++) {
                            p = p.then(_ => new Promise(resolve => {

                                contract.contractNames(i + "").then(
                                    contractName => {

                                        contract.getAddress(ethers.utils.toUtf8Bytes(contractName)).then(
                                            contractAddress => {
                                                onUpdate(contractName, contractAddress)
                                                resolve();
                                            }
                                        )



                                    }
                                )


                            }
                            ));
                        }

                    }
                ).catch(error => {
                    throw new Error(error);
                })

            } else {
                console.log("Unable to load Bancor's contracts")
            }
        } catch (error) {
            console.log("Load Bancor contracts error : ", error)
        }


    }, [web3context])

    const getERC20Balance = useCallback((tokenAddress) => {
        return new Promise((resolve, reject) => {
            const signer = web3context.library.getSigner();
            const contract = getContract(tokenAddress, ERC20TokenAbi, signer);
            contract.balanceOf(web3context.account).then(
                balance => {
                    resolve(ethers.utils.formatEther(balance.toString()).toString() || "0")
                }
            ).catch(error => {
                reject(error)
            })
        })
    }, [web3context])

    useEffect(() => {


        const signer = web3context.library.getSigner();


        const queryERC20Balance = (tokenAddress, abi) => {

            return new Promise((resolve, reject) => {
                const contract = getContract(tokenAddress, abi, signer);
                contract.balanceOf(web3context.account).then(
                    balance => {
                        resolve(ethers.utils.formatEther(balance.toString()).toString() || "0")
                    }
                )
            })
        }


        if (networkId === 3) {
            console.log("Updating token balance for Ropsten")
            const bancorEtherAddress = TOKEN_CONTRACTS.ROPSTEN.BANCOR_ETHER;
            const bancorTokenAddress = TOKEN_CONTRACTS.ROPSTEN.BNT;
            const bancorUsdAddress = TOKEN_CONTRACTS.ROPSTEN.BUSD;
            Promise.all([queryERC20Balance(bancorEtherAddress, EtherTokenAbi), queryERC20Balance(bancorTokenAddress, ERC20TokenAbi), queryERC20Balance(bancorUsdAddress, ERC20TokenAbi)]).then(values => {
                const balances = { bancorEther: Number(values[0]), bancorToken: Number(values[1]), bancorUsd: Number(values[2]) }
                console.log("Balance : ", balances)
                updateBalance(balances)
            })
        }

        if (bancorContractEtherToken && bancorContractBNTToken) {
            console.log("Updating token balance");
            const bancorUsdAddress = TOKEN_CONTRACTS.MAINNET.BUSD;
            Promise.all([queryERC20Balance(bancorContractEtherToken, EtherTokenAbi), queryERC20Balance(bancorContractBNTToken, ERC20TokenAbi), queryERC20Balance(bancorUsdAddress, ERC20TokenAbi)]).then(values => {

                const balances = { bancorEther: Number(values[0]), bancorToken: Number(values[1]), bancorUsd: Number(values[2]) }
                console.log("Balance : ", balances)
                updateBalance(balances)
            })


        }

        listBancorPools().then(
            pools => {
                setPools(pools)
            }
        )




    }, [bancorContractEtherToken, bancorContractBNTToken, networkId, web3context])


    const listConversionTokens = useCallback(() => {
        return new Promise((resolve, reject) => {
            const signer = web3context.library.getSigner();
            const contract = getContract(bancorContractBancorConverterRegistry, BancorConverterRegistryAbi, signer);

            contract.getConvertibleTokens().then(
                tokens => {
                    console.log("tokens : ", tokens)
                    resolve(tokens)


                }
            )

        })
    }, [bancorContractBancorConverterRegistry, web3context])

    const listBancorPools = useCallback(() => {

        return new Promise((resolve, reject) => {
            const signer = web3context.library.getSigner();
            const contract = getContract(bancorContractBancorConverterRegistry, BancorConverterRegistryAbi, signer);
            console.log("Load liquidity pools...");
            contract.getLiquidityPools().then(
                pools => {
                    contract.getConvertersBySmartTokens(pools).then(
                        converters => {
                            resolve(pools.map((item, index) => { return { smartTokenAddress: item, converterAddress: converters[index] } }))
                        }
                    )

                }
            )

        })

    }, [bancorContractBancorConverterRegistry, web3context])

    const getTokenName = useCallback((address) => {


        return new Promise((resolve, reject) => {
            const signer = web3context.library.getSigner();
            const contract = getContract(address, SmartTokenAbi, signer);
            contract.symbol().then(
                name => {
                    resolve(name)
                }
            ).catch(error => {
                resolve()
            })
        })
    }, [web3context])


    const listReverses = useCallback((converterAddress) => {
        return new Promise((resolve, reject) => {
            const signer = web3context.library.getSigner();
            const contract = getContract(converterAddress, BancorConverterAbi, signer);

            contract.connectorTokenCount().then(
                total => {
                    resolve(total.toString());
                }
            ).catch(error => {
                reject(error)
            })
        })
    }, [web3context])


    const loadRatio = useCallback((converterAddress, reserveAddress) => {
        return new Promise((resolve, reject) => {
            const signer = web3context.library.getSigner();
            const contract = getContract(converterAddress, BancorConverterAbi, signer);
            try {
                contract.getConnectorRatio(reserveAddress).then(
                    ratio => {

                        resolve(ratio.toString());
                    }
                ).catch(error => {
                    reject(error)
                })
            } catch (err) {
                contract.getReserveRatio(reserveAddress).then(
                    ratio => {

                        resolve(ratio.toString());
                    }
                ).catch(error => {
                    reject(error)
                })
            }

        })
    }, [web3context])

    const loadReserve = useCallback((converterAddress, index) => {
        return new Promise((resolve, reject) => {
            const signer = web3context.library.getSigner();
            const contract = getContract(converterAddress, BancorConverterAbi, signer);
            contract.connectorTokens(index).then(
                reserveAddress => {

                    contract.getConnectorBalance(reserveAddress).then(
                        balance => {
                            resolve({
                                address: reserveAddress,
                                balance: ethers.utils.formatEther(balance.toString()).toString()
                            })

                        }
                    )


                }
            )

        })
    }, [web3context])


    const generatePath = useCallback(async (sourceAddress, destinationAddress) => {
        const signer = web3context.library.getSigner();

        const converterRegistry = getContract(bancorContractBancorConverterRegistry, BancorConverterRegistryAbi, signer);

        const getPath = async (token, anchorToken) => {

            if (token == anchorToken)
                return [token];

            const isSmartToken = await converterRegistry.isSmartToken(token);
            const smartTokens = isSmartToken ? [token] : await converterRegistry.getConvertibleTokenSmartTokens(token);
            for (const smartToken of smartTokens) {
                const pool = pools.find(item => item.smartTokenAddress === smartToken)

                if (pool.converterAddress) {
                    const connectorTokenCount = await listReverses(pool.converterAddress);
                    for (let i = 0; i < Number(connectorTokenCount); i++) {
                        const connectorToken = await loadReserve(pool.converterAddress, i);
                        if (connectorToken && (connectorToken.address != token)) {
                            const path = await getPath(connectorToken.address, anchorToken);
                            if (path.length > 0)
                                return [token, smartToken, ...path];
                        }
                    }
                    return [];
                }

            }

            return [];
        }


        const getShortestPath = (sourcePath, targetPath) => {
            if (sourcePath.length > 0 && targetPath.length > 0) {
                let i = sourcePath.length - 1;
                let j = targetPath.length - 1;
                while (i >= 0 && j >= 0 && sourcePath[i] == targetPath[j]) {
                    i--;
                    j--;
                }

                const path = [];
                for (let m = 0; m <= i + 1; m++)
                    path.push(sourcePath[m]);
                for (let n = j; n >= 0; n--)
                    path.push(targetPath[n]);

                let length = 0;
                for (let p = 0; p < path.length; p += 1) {
                    for (let q = p + 2; q < path.length - p % 2; q += 2) {
                        if (path[p] == path[q])
                            p = q;
                    }
                    path[length++] = path[p];
                }

                return path.slice(0, length);
            }

            return [];
        }

        // Use BNT as an anchor token
        const BNTAddress = web3context.networkId === 3 ? TOKEN_CONTRACTS.ROPSTEN.BNT : TOKEN_CONTRACTS.MAINNET.BNT
        const sourcePath = await getPath(sourceAddress, BNTAddress);
        const targetPath = await getPath(destinationAddress, BNTAddress);
        console.log("sourcePath / targetPath : ", sourcePath, targetPath)
        return getShortestPath(sourcePath, targetPath);

    }, [web3context, bancorContractBancorConverterRegistry, pools])




    const calculateRateFromPaths = useCallback(async (paths, amount) => {

        const signer = web3context.library.getSigner();

        const getConversionReturn = async (converterPair, amount) => {
            const converterContract = getContract(converterPair.converterBlockchainId, BancorConverterAbi, signer);
            const returnAmount = await converterContract.getReturn(converterPair.fromToken, converterPair.toToken, amount);

            return returnAmount
        }

        const getConverterBlockchainId = async (blockchainId) => {
            const tokenContract = getContract(blockchainId, SmartTokenAbi, signer);
            return await tokenContract.owner()
        };

        const getConverterPairs = async (path) => {
            let pairs = [];
            for (let i = 0; i < path.length - 1; i += 2) {
                let converterBlockchainId = await getConverterBlockchainId(path[i + 1]);
                pairs.push({ converterBlockchainId: converterBlockchainId, fromToken: (path[i]), toToken: (path[i + 2]) });
            }

            return pairs;
        }

        const getAmountInTokenWei = async (tokenAddress, amount) => {
            const tokenContract = getContract(tokenAddress, ERC20TokenAbi, signer);
            const decimals = await tokenContract.decimals();
            return ethers.utils.parseUnits(`${amount}`, Number(decimals));
        }

        const getPathStepRate = async (converterPair, amount) => {
            console.log("converterPair : ", converterPair)
            let amountInTokenWei = await getAmountInTokenWei(converterPair.fromToken, amount);
            const returnAmount = await getConversionReturn(converterPair, amountInTokenWei);
            amountInTokenWei = returnAmount['0'];
            return ethers.utils.formatEther(amountInTokenWei.toString()).toString() || "0";
        }

        const convertPairs = await getConverterPairs(paths);

        let i = 0;
        while (i < convertPairs.length) {
            amount = await getPathStepRate(convertPairs[i], amount);
            i += 1;
        }


        return {
            amount: amount,
            convertPairs: convertPairs

        }

    }, [web3context, bancorContractBancorConverterRegistry, pools])

    const fund = useCallback(async (converterAddress, tokenAddress) => {
        const amountWei = ethers.utils.parseEther("0.1");
        
        const signer = web3context.library.getSigner();

        const options = {
            gasLimit: GAS_LIMIT,
            gasPrice: ethers.utils.parseEther("0.0000004")
        };

        const tokenContract = getContract(tokenAddress, ERC20TokenAbi, signer);

        const transfer = await tokenContract.transfer(converterAddress, amountWei, options);

        console.log("waiting for confirmation : ", transfer)

        try {
            await transfer.wait();
        } catch (error) {
            console.log("error:", error)
        }

        const tx = await tokenContract.approve(converterAddress , amountWei , options);
        console.log("waiting for confirmation : ", tx)
        try {
            await tx.wait();
        } catch (error) {
            console.log("error:", error)
        }

        
        return "ok"
        // const converterContract = getContract(converterAddress, BancorConverterAbi, signer);


    })

    const bancorConvert = useCallback(async (converterAddress, path, sourceAmount, destinationAmount, fromAddress) => {




        console.log("bancorContractBancorNetwork : ", bancorContractBancorNetwork)
        const sourceAmountWei = ethers.utils.parseEther(`${sourceAmount}`);
        
        const destinationAmountWei = ethers.utils.parseEther(`${destinationAmount}`);
       
        const signer = web3context.library.getSigner();
   
        const tokenContract = getContract(fromAddress, SmartTokenAbi, signer)
        const options = {
            gasLimit: GAS_LIMIT,
            gasPrice: ethers.utils.parseEther("0.0000004")
        };

        const tx = await tokenContract.approve(bancorContractBancorNetwork , sourceAmountWei , options);
        console.log("waiting for confirmation : ", tx)
        try {
            await tx.wait();
        } catch (error) {
            console.log("error:", error)
        }
   
    
        const networkContract = getContract(bancorContractBancorNetwork, BancorNetworkAbi, signer);

        // console.log("path : ", path, sourceAmountWei.toNumber(), destinationAmountWei.toNumber())
        let response = await networkContract.convert(path, sourceAmountWei , destinationAmountWei , options);
        // let response = await networkContract.quickConvert(path, sourceAmountWei, destinationAmountWei, options);
        console.log("response : ", response);
        try {
            await response.wait();
        } catch (error) {
            console.log("error:", error)
        }

        return "ok"
    }, [web3context, bancorContractBancorNetwork])

    return {
        processingTx,
        listBancorPools,
        loading,
        getTokenName,
        totalBancorEther,
        totalBancorToken,
        totalBancorUsd,
        listReverses,
        loadReserve,
        listConversionTokens,
        getERC20Balance,
        loadRatio,
        generatePath,
        calculateRateFromPaths,
        bancorConvert,
        fund
    }
}


export default provider;