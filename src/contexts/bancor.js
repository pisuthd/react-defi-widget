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

export const INITIAL_TOKENS = ["BNT", "ETH", "DAI", "ENJ", "BAT", "KNC", "MANA", "POWR", "MKR", "ANT", "GNO", "OMG", "SNT", "RDN", "SAN", "USDB","USDC"]

// Not sure whether BNB stills ERC-20, removal of low-volume tokens
export const EXCLUDE_TOKENS = ["BNB", "AIX", "ATS", "BCS", "MNTP", "TBX", "TRST", "WAND", "HOT", "WLK", "ABX", "ESZ", "ZINC", "J8T", "LDC", "ONG", "RVT", "STAC", "BETR", "UP", "AUC", "DAN", "DTRC", "FKX" ,"FTX", "GES", "MAD", "MORPH", "MRG", "POA20", "REPUX", "SCL", "SIG", "TNS", "X8X", "XBP", "XNK", "PAT", "BBO", "SHP", "FLIXX", "CMCT", "AGRI" , "EVO", "LOCI", "PEG:USD", "REAL", "SPD", "TIX", "COT", "EFOOD", "EMCO", "SXL", "RST100", "PRTL", "ELET", "SYB7", "PKG", "MGT", "sUSD", "GRIG", "ACD", "CBIX7", "DZAR", "JRT", "XIO", "UPT", "STX", "USD", "OMNIS", "TBC", "sXAU", "IGA", "eXAU", "COMM", "cUSD", "AUTO", "FTH", "pBTC", "EST", "BFZ", "ANK" ];

const BancorContext = createContext();

const useBancorContext = () => {
    return useContext(BancorContext)
}

const ACTIONS = {
    UPDATE_PROCESSING_TX: "UPDATE_PROCESSING_TX",
    UPDATE_BANCOR_CONTRACTS: "UPDATE_BANCOR_CONTRACTS",
    UPDATE_BALANCE: "UPDATE_BALANCE"
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
            throw Error(`Unexpected action type in BancorContext reducer: '${type}'.`)
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
        <BancorContext.Provider
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
        </BancorContext.Provider>
    )

}

export const getContract = (address, ABI, signer) => {
    return new ethers.Contract(address, ABI, signer);
};


export const useBancor = (web3context) => {
    const [state, { updateProcessingTx, updateBancorContracts, updateBalance }] = useBancorContext();

    const [loadingErrorMessage, setErrorMessage] = useState();

    const { networkId } = web3context;

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
                    // throw new Error(error);
                    console.log("error : ", error);
                    setErrorMessage(error);
                })

            } else {
                console.log("Unable to load Bancor's contracts");
            }
        } catch (error) {
            const msg = `Load Bancor contracts error : ${error}`;
            console.log(msg);
            setErrorMessage(msg);

        }


    }, [web3context])



    useEffect(() => {
        /*

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
        */






    }, [bancorContractEtherToken, bancorContractBNTToken, networkId, web3context])

    /*
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
    */

    const getTokenName = useCallback(async (address) => {
        try {
            const signer = web3context.library.getSigner();
            const contract = getContract(address, SmartTokenAbi, signer);
            const name = await contract.symbol();
            return [ name, address ];
        } catch (error) {

            switch(address.toLowerCase()) {
                case ('0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2').toLowerCase():
                    return ["MKR", address ];
                default:
                    return ["NAME_ERROR", address ];
            }

        }

    }, [web3context])


    const listConversionTokens = useCallback(async () => {

        const signer = web3context.library.getSigner();
        const contract = getContract(bancorContractBancorConverterRegistry, BancorConverterRegistryAbi, signer);
        const addresses = await contract.getConvertibleTokens();

        const results = await Promise.all(addresses.map(address => getTokenName(address)));

        return results;


    }, [bancorContractBancorConverterRegistry, web3context])


    const getTokenBalance = useCallback(async (tokenAddress) => {

        const signer = web3context.library.getSigner();
        const contract = getContract(tokenAddress, ERC20TokenAbi, signer);
        const balance = await contract.balanceOf(web3context.account);

        const decimal = await contract.decimals();

        return ethers.utils.formatUnits(balance.toString(), decimal).toString() || "0.0";



    }, [web3context])

    return {
        loading,
        getTokenName,
        listConversionTokens,
        loadingErrorMessage,
        getTokenBalance
    }
}


export default provider;