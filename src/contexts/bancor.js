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


export const INITIAL_TOKENS = ["BNT", "ETH", "DAI", "ENJ", "BAT", "KNC", "MANA", "POWR", "MKR", "ANT", "GNO", "OMG", "SNT", "RDN", "SAN", "USDB", "USDC"]

// Not sure whether BNB stills ERC-20, removal of low-volume tokens
export const EXCLUDE_TOKENS = ["BNB", "AIX", "ATS", "BCS", "MNTP", "TBX", "TRST", "WAND", "HOT", "WLK", "ABX", "ESZ", "ZINC", "J8T", "LDC", "ONG", "RVT", "STAC", "BETR", "UP", "AUC", "DAN", "DTRC", "FKX", "FTX", "GES", "MAD", "MORPH", "MRG", "POA20", "REPUX", "SCL", "SIG", "TNS", "X8X", "XBP", "XNK", "PAT", "BBO", "SHP", "FLIXX", "CMCT", "AGRI", "EVO", "LOCI", "PEG:USD", "REAL", "SPD", "TIX", "COT", "EFOOD", "EMCO", "SXL", "RST100", "PRTL", "ELET", "SYB7", "PKG", "MGT", "sUSD", "GRIG", "ACD", "CBIX7", "DZAR", "JRT", "XIO", "UPT", "STX", "USD", "OMNIS", "TBC", "sXAU", "IGA", "eXAU", "COMM", "cUSD", "AUTO", "FTH", "pBTC", "EST", "BFZ", "ANK"];

const BancorContext = createContext();

const useBancorContext = () => {
    return useContext(BancorContext)
}

const ACTIONS = {
    UPDATE_PROCESSING_TX: "UPDATE_PROCESSING_TX",
    UPDATE_BANCOR_CONTRACTS: "UPDATE_BANCOR_CONTRACTS"
}

const GAS_LIMIT = 1000000;


const reducer = (state, { type, payload }) => {
    switch (type) {
        case ACTIONS.UPDATE_PROCESSING_TX: {
            const { processingTx } = payload

            return {
                ...state,
                processingTx: processingTx
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
        bancorContractEtherToken: ""
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
        bancorContractEtherToken
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




    const getTokenName = useCallback(async (address) => {
        try {
            const signer = web3context.library.getSigner();
            const contract = getContract(address, SmartTokenAbi, signer);
            const name = await contract.symbol();
            return [name, address];
        } catch (error) {

            switch (address.toLowerCase()) {
                case ('0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2').toLowerCase():
                    return ["MKR", address];
                default:
                    return ["NAME_ERROR", address];
            }

        }

    }, [web3context])

    const listLiquidityPools = useCallback(async () => {

        const signer = web3context.library.getSigner();
        const contract = getContract(bancorContractBancorConverterRegistry, BancorConverterRegistryAbi, signer);
        const pools = await contract.getLiquidityPools();
        const converters = await contract.getConvertersBySmartTokens(pools);
        return pools.map((item, index) => { return { smartTokenAddress: item, converterAddress: converters[index] } });

    }, [bancorContractBancorConverterRegistry, web3context])


    const listConversionTokens = useCallback(async () => {

        const signer = web3context.library.getSigner();
        const contract = getContract(bancorContractBancorConverterRegistry, BancorConverterRegistryAbi, signer);
        const addresses = await contract.getConvertibleTokens();

        const results = await Promise.all(addresses.map(address => getTokenName(address)));

        return results;


    }, [bancorContractBancorConverterRegistry, web3context])


    const loadReserve = useCallback(async (converterAddress, index) => {

        const signer = web3context.library.getSigner();
        const contract = getContract(converterAddress, BancorConverterAbi, signer);
        const reserveAddress = await contract.connectorTokens(index);

        const balance = await contract.getConnectorBalance(reserveAddress);

        return {
            address: reserveAddress,
            balance: ethers.utils.formatEther(balance.toString()).toString()
        }



    }, [web3context])

    const getConnectorTokenCount = useCallback(async (converterAddress) => {

        const signer = web3context.library.getSigner();
        const contract = getContract(converterAddress, BancorConverterAbi, signer);
        const total = await contract.connectorTokenCount();

        return Number(total.toString());

    }, [web3context])

    const getTokenBalance = useCallback(async (tokenAddress) => {

        const signer = web3context.library.getSigner();
        const contract = getContract(tokenAddress, ERC20TokenAbi, signer);
        const balance = await contract.balanceOf(web3context.account);

        const decimal = await contract.decimals();

        return ethers.utils.formatUnits(balance.toString(), decimal).toString() || "0.0";



    }, [web3context])

    const getTokenDecimal = useCallback(async (tokenAddress) => {

        const signer = web3context.library.getSigner();
        const contract = getContract(tokenAddress, ERC20TokenAbi, signer);
        const decimal = await contract.decimals();

        return decimal;
    }, [web3context])

    const parseToken = useCallback((amount, decimal) => {
        return ethers.utils.formatUnits(amount, decimal) || "0.0";
    }, [])

    const generatePath = useCallback(async (sourceAddress, destinationAddress, pools, anchor = "BNT") => {

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
                    const connectorTokenCount = await getConnectorTokenCount(pool.converterAddress);

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

        let anchorTokenAddress = "";
        switch (anchor) {
            case 'BNT':
                anchorTokenAddress = web3context.networkId === 3 ? TOKEN_CONTRACTS.ROPSTEN.BNT : TOKEN_CONTRACTS.MAINNET.BNT;
                break;
        }

        if (anchorTokenAddress === "") {
            throw new Error('Invalid Anchor Token Address');
        }

        const sourcePath = await getPath(sourceAddress, anchorTokenAddress);
        const targetPath = await getPath(destinationAddress, anchorTokenAddress);
        console.log("sourcePath / targetPath : ", sourcePath, targetPath)
        return getShortestPath(sourcePath, targetPath);


    }, [web3context, bancorContractBancorConverterRegistry])


    const getRate = useCallback(async (path, amount, decimal = 18) => {

        const signer = web3context.library.getSigner();
        const networkContract = getContract(bancorContractBancorNetwork, BancorNetworkAbi, signer);

        const ret = await networkContract.getReturnByPath(path, ethers.utils.parseUnits(amount, decimal));
        return ret[0];

    }, [web3context, bancorContractBancorNetwork])


    const convert = useCallback(async (path, sourceTokenAddress,  sourceAmount, destinationAmount, ) => {

        
        try {
            const sourceAmountWei = ethers.utils.parseEther(`${sourceAmount}`);
            
            const destinationAmountWei = destinationAmount;
            const signer = web3context.library.getSigner();

            const options = {
                gasLimit: GAS_LIMIT,
                gasPrice: ethers.utils.parseEther("0.000000005") // 5 Gwei
            };
        
            const tokenContract = getContract(sourceTokenAddress, SmartTokenAbi, signer);
            const allowance = await tokenContract.allowance(web3context.account, bancorContractBancorNetwork);

            const diff = sourceAmountWei.sub(allowance);

            if (diff > 0) {
                console.log("diff : ", diff.toString());
                const approvalTx = await tokenContract.approve(bancorContractBancorNetwork , diff , options);
                console.log("waiting for confirmation : ", approvalTx)
            }

            
            // await approvalTx.wait();
            
            
            const networkContract = getContract(bancorContractBancorNetwork, BancorNetworkAbi, signer);
            const convertTx = await networkContract.claimAndConvert2(path, sourceAmountWei , destinationAmountWei ,"0x0000000000000000000000000000000000000000", "0", options);
            
            console.log("convertTx : ", convertTx);
            
            // await convertTx.wait();
            
            return convertTx;

        } catch (error) {
            // throw new Error(error);
            console.log("error : ", error);
            return undefined;
        }


    }, [web3context, bancorContractBancorNetwork])

    return {
        loading,
        getTokenName,
        listConversionTokens,
        listLiquidityPools,
        generatePath,
        getRate,
        loadingErrorMessage,
        getTokenBalance,
        getTokenDecimal,
        parseToken,
        convert
    }
}


export default provider;