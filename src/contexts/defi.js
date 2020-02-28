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

    // const [pools, setPools] = useState([]);

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
        /*
        listBancorPools().then(
            pools => {
                setPools(pools)
            }
        )
        */



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

            contract.reserveTokenCount().then(
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
            contract.getReserveRatio(reserveAddress).then(
                ratio => {

                    resolve(ratio.toString());
                }
            ).catch(error => {
                reject(error)
            })
        })
    }, [web3context])

    const loadReserve = useCallback((converterAddress, index) => {
        return new Promise((resolve, reject) => {
            const signer = web3context.library.getSigner();
            const contract = getContract(converterAddress, BancorConverterAbi, signer);
            contract.reserveTokens(index).then(
                reserveAddress => {

                    contract.getReserveBalance(reserveAddress).then(
                        balance => {
                            resolve({
                                address: reserveAddress,
                                balance: ethers.utils.formatEther(balance.toString()).toString()
                            })
                            /*
                            contract.getReserveRatio(reserveAddress).then(
                                ratio => {

                                    resolve({
                                        address: reserveAddress,
                                        balance: ethers.utils.formatEther(balance.toString()).toString(),
                                        ratio : ratio.toString()
                                    })

                                }
                            )
                            */



                        }
                    )


                }
            )

        })
    }, [web3context])


    const generatePath = useCallback(async () => {
        const test = new Promise((resolve) => {
            setTimeout(() => {
                console.log("done...")
            },3000)
        })
        await test();
        return "hello"
    })

    const generatePathOld = useCallback((sourceAddress, destinationAddress) => {

        return new Promise((resolve, reject) => {
         
            resolve("hello")
            
            
    
            /*
            const signer = web3context.library.getSigner();
            const getPath = (token, anchorToken) => {
                return new Promise(resolve => {
                    if (token == anchorToken) {
                        resolve([token]);
                    }
                    const converterRegistryContract = getContract(bancorContractBancorConverterRegistry, BancorConverterRegistryAbi, signer);
                    converterRegistryContract.isSmartToken(token).then(
                        isSmartToken => {

                            const getSmartTokens = (token) => {
                                return new Promise(resolve => {
                                    if (isSmartToken) {
                                        const smartTokens = [token];
                                        resolve(smartTokens)
                                    } else {
                                        converterRegistryContract.getConvertibleTokenSmartTokens(token).then(
                                            convertibleTokenSmartTokens => {
                                                resolve(convertibleTokenSmartTokens)
                                            }
                                        )
                                    }
                                })
                            }


                            getSmartTokens(token).then(
                                smartTokens => {
                                    console.log("smartTokens : ", smartTokens)
                                    console.log("pools : ", pools)
                                    Promise.all(smartTokens.map(smartToken => new Promise((resolve, reject) => {
                                        const item = pools.find(item => item.smartTokenAddress === smartToken)
                                        if (!item ) {
                                            resolve(undefined)
                                        }

                                        const { converterAddress } = item;
                                        listReverses(converterAddress).then(
                                            reversesCount => {

                                                if (reversesCount === "2") {
                                                    Promise.all([loadReserve(converterAddress,0),loadReserve(converterAddress,1)]).then(
                                                        addresses => {
                                                            console.log("addresses : ", addresses);
                                                            const filtered = addresses.filter(item => item.address !== token);
                                                            console.log("filtered: ", filtered);
                                                            if (filtered[0]) {
                                                                getPath(filtered[0].address, BNTAddress).then(
                                                                    path => {
                                                                        console.log("final path : ", path, token, smartToken  );
                                                                       
                                                                        if (path.length > 0) {
                                                                            resolve([token, smartToken, ...path])
                                                                        }
                                                                    }
                                                                )
                                                            } else {
                                                                resolve(undefined)
                                                            }

                                                            
                                                        }
                                                    )
                                                } else {
                                                    resolve(undefined)
                                                }
                                            }
                                        )

                                        
                                    }))).then(
                                        results => {
                                            console.log("RESULTS : ", results)
                                            resolve(["test1", "test2"]);
                                        }
                                    )
                                   



                                }
                            )

                        }
                    )
                })


            }


            const BNTAddress = web3context.networkId === 3 ? TOKEN_CONTRACTS.ROPSTEN.BNT : TOKEN_CONTRACTS.MAINNET.BNT

            console.log("before getPath")
            // Use BNT as an Anchor Token
            getPath(sourceAddress, BNTAddress).then(
                path => {
                    console.log("path : ", path);
                    resolve("hello path")
                }
            ).catch(error => {
                reject(error)
            })
            */


        })
    }, [web3context, bancorContractBancorConverterRegistry])

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
        generatePath

    }
}


export default provider;