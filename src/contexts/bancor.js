import React, { createContext, useContext, useReducer, useState, useMemo, useCallback, useEffect } from "react";
import { ethers } from "ethers";

import { BANCOR_CONTRACTS, NETWORKS, TOKEN_CONTRACTS } from "../constants";

import { ContractRegistryAbi } from "../contracts/bancor/ContractRegistry";
import { BancorConverterRegistryAbi } from "../contracts/bancor/BancorConverterRegistry";
import { BancorConverterAbi, BancorConverterByteCode } from "../contracts/bancor/BancorConverter";
import { SmartTokenAbi, SmartTokenByteCode, SmartTokenControllerAbi } from "../contracts/bancor/SmartToken";
import { BancorConverterRegistryDataAbi } from "../contracts/bancor/BancorConverterRegistryData";
import { ERC20TokenAbi } from "../contracts/bancor/ERC20Token";
import { EtherTokenAbi } from "../contracts/bancor/EtherToken";
import { BancorNetworkAbi } from "../contracts/bancor/BancorNetwork";
import { useModal } from "./modal";


export const INITIAL_TOKENS = ["BNT", "ETH", "DAI", "ENJ", "BAT", "KNC", "MANA", "POWR", "MKR", "ANT", "GNO", "OMG", "SNT", "RDN", "SAN", "USDB", "USDC"]
export const ROPSTEN_TOKENS = ["BNT", "ETH", "XXX", "YYY"]


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
    const { showProcessingModal } = useModal();


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
            // console.log("web3context.networkId : ", web3context.networkId)
            const network = ([NETWORKS.MAINNET, NETWORKS.ROPSTEN].indexOf(web3context.networkId) !== -1) ? web3context.networkId : undefined;
            if (web3context && web3context.active && network !== undefined) {
                // console.log(`load bancor's contract for  ${network}`);
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


    const getLiquidityPool = useCallback(async (address) => {
        try {
            const signer = web3context.library.getSigner();
            const contract = getContract(address, BancorConverterAbi, signer);

            const connectorTokenCount = await getConnectorTokenCount(address);

            let result = []

            for (let i = 0; i < Number(connectorTokenCount); i++) {
                let row = [];
                const reserveAddress = await contract.connectorTokens(i);

                const balance = await contract.getConnectorBalance(reserveAddress);

                const reserveData = await contract.connectors(reserveAddress);


                row.push(ethers.utils.formatEther(balance.toString()).toString());
                row.push(reserveAddress);
                row.push(reserveData[1] / 1000000);
                row.push(reserveData[3]);
                result.push(row);
            }

            return result;
        } catch (error) {
            console.log("error : ", error)
            switch (address.toLowerCase()) {
                default:
                    return [];
            }

        }


    }, [web3context])

    const getTokenName = useCallback(async (address, needFullName = false) => {
        try {
            const signer = web3context.library.getSigner();
            const contract = getContract(address, SmartTokenAbi, signer);
            
            if (!needFullName) {
                const name = await contract.symbol();
                return [name, address];
            } else {

                try {
                    const name = await contract.symbol();
                    const fullName = await contract.name();

                    return [name, fullName, address];
                } catch (error) {
                    return;
                }
                
            }
            
        } catch (error) {

            switch (address.toLowerCase()) {
                case ('0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2').toLowerCase():
                    return ["MKR", address];
                case ('0x1b22C32cD936cB97C28C5690a0695a82Abf688e6').toLowerCase():
                    return ["WISH", address];
                case ('0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359').toLowerCase():
                    return ["SAI", address];
                case ('0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A').toLowerCase():
                    return ["DGD", address];
                case ('0xbdEB4b83251Fb146687fa19D1C660F99411eefe3').toLowerCase():
                    return ["SVD", address];
                case ('0xF1290473E210b2108A85237fbCd7b6eb42Cc654F').toLowerCase():
                    return ["HEDG", address];
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


    const getETHBalance = useCallback(async () => {

        const signer = web3context.library.getSigner();
        const balance = await signer.provider.getBalance(web3context.account);
        return ethers.utils.formatEther(balance);

    }, [web3context])

    const getGasPrice = useCallback(async () => {
        const signer = web3context.library.getSigner();
        const price = await signer.provider.getGasPrice();
        return price;
    }, [web3context])

    const constructTxOptions = useCallback(async () => {
        const estimatedGasPrice = await getGasPrice();
        const minimumGasPrice = ethers.utils.parseEther("0.000000003"); // 3 Gwei

        const finalGasPrice = estimatedGasPrice.lt(minimumGasPrice) ? minimumGasPrice : estimatedGasPrice

        let options = {
            gasLimit: GAS_LIMIT,
            gasPrice: finalGasPrice, // Minimum 3 Gwei
        };

        return options;
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

        for (let r of ret) {
            console.log("getRate : ", ethers.utils.formatUnits(r, decimal).toString());
        }

        return [ret[0], ret[1]];

    }, [web3context, bancorContractBancorNetwork])


    const convert = useCallback( async (path, baseTokenAddress, baseAmountRaw, baseDecimal, pairAmount, slipRate, fromETH, toETH, affiliateAccount = "0x0000000000000000000000000000000000000000", affiliateFee = "0") => {
        
        const baseAmount = ethers.utils.parseUnits(`${baseAmountRaw}`, baseDecimal);

        const signer = web3context.library.getSigner();
        let options = await constructTxOptions();
        const tokenContract = getContract(baseTokenAddress, SmartTokenAbi, signer);
        const networkContract = getContract(bancorContractBancorNetwork, BancorNetworkAbi, signer);

        // Check allowance 
        const allowance = await tokenContract.allowance(web3context.account, bancorContractBancorNetwork);
        console.log("allowance : ", ethers.utils.formatEther(allowance));

        const diff = Number(ethers.utils.formatUnits(baseAmount, baseDecimal))-Number(ethers.utils.formatUnits(allowance, baseDecimal));
        if ((diff > 0 ) && (!fromETH)) {
            console.log("diff : ", diff);
            if ((Number(ethers.utils.formatEther(allowance)) > 0) && (!fromETH)) {
                console.log("allowance is not zero need to clear it first...");
                const resetTx = await tokenContract.approve(bancorContractBancorNetwork, 0, options);
                const onClose  = showProcessingModal("Your transaction might take a while since the token allowance will need to be adjusted", `tx : ${resetTx.hash}`);
                await resetTx.wait();
                onClose();
            }

            await tokenContract.approve(bancorContractBancorNetwork, baseAmount, options);

        }

        if (fromETH) {
            options = {
                ...options,
                value: baseAmount
            }
        }

        let tx;
        if (!fromETH) {
            tx = await networkContract.claimAndConvert2(path, baseAmount, pairAmount, affiliateAccount, affiliateFee, options);
        } else {
            tx = await networkContract.convert2(path, baseAmount, pairAmount, affiliateAccount, affiliateFee, options);
        }

        return tx;



    },[web3context, bancorContractBancorNetwork])

    const getReserveRatio = useCallback(async (converterAddress, tokenAddress) => {

        try {
            const signer = web3context.library.getSigner();
            const contract = getContract(converterAddress, BancorConverterAbi, signer);
            const ratioPPM = await contract.getReserveRatio(tokenAddress);
            const ratio = ratioPPM.toNumber() / 1000000;
            return ratio;
        } catch (error) {
            console.log("Can't fetch ratio for : ", tokenAddress, error);
            console.log("Assumming 50%");
            return 0.5;
        }



    }, [web3context])

    const getConversionFee = useCallback(async (converterAddress) => {

        const signer = web3context.library.getSigner();
        const contract = getContract(converterAddress, BancorConverterAbi, signer);

        const fee = await contract.conversionFee();

        return Number(fee.toString()) / 10000;;

    }, [web3context]);


    const getMaxConversionFee = useCallback(async (converterAddress) => {
        const signer = web3context.library.getSigner();
        const contract = getContract(converterAddress, BancorConverterAbi, signer);
        const fee = await contract.maxConversionFee();
        return Number(fee.toString()) / 1000000;;
    }, [web3context]);


    const getReserves = useCallback(async (converterAddress) => {
        const signer = web3context.library.getSigner();
        const contract = getContract(converterAddress, BancorConverterAbi, signer);
        const connectorTokenCount = await contract.connectorTokenCount();
        let reserves = []
        
        for (let i = 0; i < Number(connectorTokenCount); i++) {
            const reserveAddress = await contract.connectorTokens(i);
            const balance = await contract.getConnectorBalance(reserveAddress);
            const weight = await contract.getReserveRatio(reserveAddress);
            reserves.push({
                tokenAddress : reserveAddress,
                initialAmount : `${ethers.utils.formatEther(balance)}` ,
                weight : `${(Number(weight) / 10000)}` 
            })
        }

        return reserves;
    }, [web3context]);

    const getTotalSupplyByConverter = useCallback(async (converterAddress) => {
        const signer = web3context.library.getSigner();
        const controllerContract = getContract(converterAddress ,SmartTokenControllerAbi, signer);
        const token = await controllerContract.token();
        const tokenContract = getContract(token, SmartTokenAbi, signer);
        const totalSupply = await tokenContract.totalSupply();
        return ethers.utils.formatEther(totalSupply);
    }, [web3context])

    const getLiquidityPoolDeposit = useCallback(async (poolObject) => {
        

        try {

            const signer = web3context.library.getSigner();

            const relayTokenContract = getContract(poolObject.address, SmartTokenAbi, signer);
            const converterContract = getContract(poolObject.converterAddress, BancorConverterAbi, signer);
            const relayTokenBalanceWei = await relayTokenContract.balanceOf(web3context.account);

            const relayTokenBalance = ethers.utils.formatEther(relayTokenBalanceWei.toString());

            let result = [];

            const supplyWei = await relayTokenContract.totalSupply();
            const supply = ethers.utils.formatEther(supplyWei.toString());

            const percentage = (100 * relayTokenBalance) / supply;

            for (let i = 0; i < poolObject.reserves.length; i += 1) {
                const symbolName = poolObject.symbols[i];
                const reverse = poolObject.reserves[i];
                
                const thisReserveBalance = await converterContract.getConnectorBalance(reverse[1]);
                const token = getContract(reverse[1], ERC20TokenAbi, signer);

                const decimals = await token.decimals();

                const amount = ethers.utils.formatUnits(thisReserveBalance, decimals);

                result.push({
                    symbol : symbolName,
                    amount: ((amount * percentage)/100)
                })
            }

            return result;

            

        } catch (error) {
            console.log("Checks deposit failed ", error)
            return [];
        }

    }, [web3context])

    const getAfforableAmount = useCallback( async (poolObject , tokenList) => {

        console.log("from getAfforableAmount (symbol/balance) : ", tokenList)

        try {

            const signer = web3context.library.getSigner();
            const relayTokenContract = getContract(poolObject.address, SmartTokenAbi, signer);
            const converterContract = getContract(poolObject.converterAddress, BancorConverterAbi, signer);
            const relayTokenBalanceWei = await relayTokenContract.balanceOf(web3context.account);

            const decimal = await relayTokenContract.decimals();

            const supplyWei = await relayTokenContract.totalSupply();
            const relayTokenBalance = ethers.utils.formatUnits(relayTokenBalanceWei.toString(), decimal);
            console.log("getAfforableAmount decimal : ", decimal);
            const supply = ethers.utils.formatUnits(supplyWei.toString(), decimal);


            // let percentage = 100 / (supply / 0.01);

            let maxAfforable = 1000;
            

            for (let i = 0; i < poolObject.reserves.length; i += 1) {
                const reverse = poolObject.reserves[i];
                const symbolName = poolObject.symbols[i];
                const thisReserveBalance = await converterContract.getConnectorBalance(reverse[1]);
                const token = getContract(reverse[1], ERC20TokenAbi, signer);
                const decimal = await token.decimals();

                const thisToken = tokenList.filter((item) => item.symbol === symbolName);
                let max = (Number(thisToken[0].balance) >= Number(ethers.utils.formatUnits(thisReserveBalance, decimal))) ? Number(thisToken[0].balance) : ethers.utils.formatUnits(thisReserveBalance, decimal);
                // console.log("max : ", max, thisToken[0].balance ,ethers.utils.formatUnits(thisReserveBalance, decimal));
                console.log("afford to buy : ", thisToken[0].balance , " from : " ,  max, " reserve : ", ethers.utils.formatUnits(thisReserveBalance, decimal));

                const tokenMaxAfforable = ( (thisToken[0].balance)*100)/ max ;
                console.log("tokenMaxAfforable : ", tokenMaxAfforable);
                if (tokenMaxAfforable < maxAfforable) {
                    maxAfforable = tokenMaxAfforable
                }
                // const buyingAmount = thisReserveBalance.mul(ethers.utils.bigNumberify(Math.floor(percentage * 1000000))).div(ethers.utils.bigNumberify(1000000));


            }


            return {
                totalPoolToken : relayTokenBalance,
                totalPoolTokenSupply : supply,
                maxAfforable : maxAfforable===1000 ? 0 : maxAfforable
            }

        } catch (error) {
            console.log("get affordable amount : ", error);
        }

    }, [web3context])


    const fundLiquidityPool = useCallback(async (poolObject, amountInPercentage) => {

        console.log("fund... : ", poolObject, " % : ", amountInPercentage);
        try {
            
            const signer = web3context.library.getSigner();
            let options = await constructTxOptions();

            const relayTokenContract = getContract(poolObject.address, SmartTokenAbi, signer);
            const converterContract = getContract(poolObject.converterAddress, BancorConverterAbi, signer);

            const decimal = await relayTokenContract.decimals();

            const supplyWei = await relayTokenContract.totalSupply();
            const supply = ethers.utils.formatUnits(`${supplyWei}`, decimal);
            
            const percentage = amountInPercentage;
            const tokenAmount = supplyWei.mul(ethers.utils.bigNumberify(Math.floor((amountInPercentage/100) * 1000000))).div(ethers.utils.bigNumberify(1000000));
            // const tokenAmount =  (supply*percentage)/100;
            console.log("buying amount : ", percentage, " token amount : ", ethers.utils.formatEther(tokenAmount) , " from supply : ", supply); 

            for (let i = 0; i < poolObject.reserves.length; i += 1) {
                const reverse = poolObject.reserves[i];
                const thisReserveBalance = await converterContract.getConnectorBalance(reverse[1]);
                const token = getContract(reverse[1], ERC20TokenAbi, signer);
                const thisReserveDecimal = await token.decimals();
                const symbolName = poolObject.symbols[i];

                // let buyingAmount = Number(ethers.utils.formatEther(thisReserveBalance)) *  (percentage/100);

                const buyingAmount = thisReserveBalance.mul(ethers.utils.bigNumberify(Math.floor((percentage * 1000000 )))).div(ethers.utils.bigNumberify(1000000 * 100));
                console.log("buyingAmount : ", ethers.utils.formatUnits(buyingAmount, thisReserveDecimal), " for --> ", symbolName);
                

                const fromETH = symbolName === "ETH" ? true : false;

                if (fromETH) {
                    
                    const etherTokenContract = getContract(reverse[1], EtherTokenAbi, signer);
                    const currentDeposit = await etherTokenContract.balanceOf(web3context.account);
                    const ethDecimal = await etherTokenContract.decimals();
                    const depositDiff = buyingAmount.sub(currentDeposit);
                    console.log("depositDiff : ", ethers.utils.formatUnits(depositDiff, ethDecimal) );
                    if (depositDiff > 0) {
                            const depositOptions = {
                                ...options,
                                // value: (depositDiff.mul(ethers.utils.parseEther("1.03"))).div(ethers.utils.parseEther("1"))
                                value: depositDiff
                            }
                            const depositTx = await etherTokenContract.deposit(depositOptions);
                            await depositTx.wait();
                            console.log("depositTx : ", depositTx);
                    }
                                    
                }

                const allowance = await token.allowance(web3context.account, converterContract.address);
                console.log("current allowance : ", ethers.utils.formatUnits(allowance, thisReserveDecimal) , " symbol : ", symbolName);

                const diff = buyingAmount.sub(allowance);

                console.log("diff -> ", ethers.utils.formatUnits(diff, thisReserveDecimal));

                if ((diff > 0)  ) {

                    if ((allowance > 0) ) {
                        console.log("allowance is not zero need to clear it first...");
                        const clearTx = await token.approve(converterContract.address, 0, options);
                    }

                    const approvalTx = await token.approve(converterContract.address, buyingAmount, options);
                    console.log("waiting for confirmation : ", approvalTx)
                }

                
            }
          

            console.log("deciaml : ", decimal, " tokenAmount : ", ethers.utils.formatEther(tokenAmount), "options : ", options);

            const fundtx =  await converterContract.fund( tokenAmount , options);
            console.log("funding...");
            return fundtx;

        } catch (error) {
            console.log("Funding failed : ", error);
        }

    }, [web3context]);

    const withdrawLiquidityPool = useCallback(async (poolObject, amountInPercentage) => {

        try {
            
            const signer = web3context.library.getSigner();
            const options = await constructTxOptions();

            const relayTokenContract = getContract(poolObject.address, SmartTokenAbi, signer);
            const converterContract = getContract(poolObject.converterAddress, BancorConverterAbi, signer);

            const decimal = await relayTokenContract.decimals();

            const supplyWei = await relayTokenContract.totalSupply();
            const supply = ethers.utils.formatEther(supplyWei.toString());
            

            const percentage = amountInPercentage;
            const tokenAmount = supplyWei.mul(ethers.utils.bigNumberify(Math.floor((amountInPercentage/100) * 1000000))).div(ethers.utils.bigNumberify(1000000));
            // const tokenAmount =  (supply*percentage)/100;
            console.log("selling amount : ", percentage, " token amount : ", ethers.utils.formatEther(tokenAmount) , " from supply : ", supply); 

            let withdrawEthAmount = 0;
            let etherTokenAddress;

            for (let i = 0; i < poolObject.reserves.length; i += 1) {
                
                const reverse = poolObject.reserves[i];
                const thisReserveBalance = await converterContract.getConnectorBalance(reverse[1]);
                const token = getContract(reverse[1], ERC20TokenAbi, signer);

                const symbolName = poolObject.symbols[i];

                const sellingAmount = thisReserveBalance.mul(ethers.utils.bigNumberify(Math.floor((percentage /100) * 1000000))).div(ethers.utils.bigNumberify(1000000));
                console.log("sellingAmount : ", ethers.utils.formatEther(sellingAmount), " for --> ", symbolName);

                const fromETH = symbolName === "ETH" ? true : false;

                if (fromETH) {
                    withdrawEthAmount = sellingAmount;
                    etherTokenAddress = reverse[1];
                    
                   /*
                   const etherTokenContract = getContract(reverse[1], EtherTokenAbi, signer);
                   const test = await etherTokenContract.balanceOf(web3context.account);
                   const depositTx = await etherTokenContract.withdraw(test);
                   */
                }
            }
            
            const tx =  await converterContract.liquidate( tokenAmount , options);

            console.log("liquidating...");
            
            if ((withdrawEthAmount !== 0) && (etherTokenAddress)) {

                try {
                    await tx.wait();
                } catch(error) {

                }
                
                // await tx.wait();
                const etherTokenContract = getContract(etherTokenAddress, EtherTokenAbi, signer);
                const max = await etherTokenContract.balanceOf(web3context.account);
                console.log("max : ", ethers.utils.formatEther(max));
                const withdrawTx = await etherTokenContract.withdraw(max, options);
                console.log("withdrawTx : ", withdrawTx);
                return withdrawTx;
            } else {
                return tx;
            }
            

            
            

        } catch (error) {
            console.log("Withdraw failed : ", error);
        }


    },[web3context])

    const createSmartToken = useCallback(async (symbol, fullName) => {

        try {

            const signer = web3context.library.getSigner();
            const options = await constructTxOptions();
            const factory = new ethers.ContractFactory(SmartTokenAbi , SmartTokenByteCode , signer);
            const contract = await factory.deploy(fullName, symbol ,18, options);

            return contract;
        } catch (error) {
            throw new Error(error.message)
        }

    }, [web3context])

    const getSmartToken = useCallback(async (address) => {
        try {
            const result = await getTokenName(address, true);
            if (!result) {
                throw new Error("Token Address is invalid");
            }
            return {
                symbol : result[0],
                fullName : result[1]
            }
        } catch (error) {
            throw new Error(error.message)
        }

    }, [web3context])

    const checkIfAccountHasSufficientBalance = useCallback( async (address, amount) => {
        try {

            const balance = await getTokenBalance(address);
            
            if (Number(amount) > Number(balance)) {
                throw new Error(`Insufficient balance on ${address}`);
            }

        } catch (error) {
            throw new Error(error.message)
        }
    },[ web3context ])


    const createConverter = useCallback(async (smartTokenAddress, conversionFee, reserves ) => {


        console.log("createConverter : ", bancorContractContractRegistry, smartTokenAddress, conversionFee, reserves)

        try {
            const normalizedMaxConversionFee = Number(conversionFee) * (1000000/100);

            const signer = web3context.library.getSigner();
            let options = await constructTxOptions();

            options.gasLimit = options.gasLimit*5;

            const factory = new ethers.ContractFactory(BancorConverterAbi , BancorConverterByteCode , signer);
            const contract = await factory.deploy(
                smartTokenAddress,
                bancorContractContractRegistry ,
                normalizedMaxConversionFee, 
                reserves[0].tokenAddress,
                Number(reserves[0].weight) *  (1000000/100),
                options // Increare GAS
            );

            console.log("contract : ", contract);

            return contract;


        } catch (error) {
            throw new Error(error.message)
        }

    }, [web3context, bancorContractContractRegistry])


    const addInitialReserve = useCallback(async (smartTokenAddress, converterAddress, reserves, initialPoolTokenAmount) => {

        console.log("addInitialReserve : ", smartTokenAddress, converterAddress, reserves, initialPoolTokenAmount);

        const signer = web3context.library.getSigner();
        const options = await constructTxOptions();

        const relayTokenContract = getContract(smartTokenAddress , SmartTokenAbi, signer);
        const converterContract = getContract(converterAddress, BancorConverterAbi, signer);

        let count = 0;

        let addingReserveTxs = [];
        let fundingTxs = [];

        for (let reserve of reserves) {
            if (count!==0) {
                const addingReserveTx = await converterContract.addReserve(reserve.tokenAddress, Number(reserve.weight) * (1000000/100), options);
                addingReserveTxs.push(addingReserveTx);
            }

            const tokenContract = getContract(reserve.tokenAddress, ERC20TokenAbi, signer);
            const fundingTx =  await tokenContract.transfer(converterAddress, ethers.utils.parseEther(`${reserve.initialAmount}`) , options);

            fundingTxs.push(fundingTx);

            count +=1;
        }

        const issuranceTx = await relayTokenContract.issue(web3context.account, ethers.utils.parseEther(`${initialPoolTokenAmount}`) , options);

        // const transferOwnershipTx = await relayTokenContract.transferOwnership();
        return {
            addingReserve : addingReserveTxs,
            funding : fundingTxs,
            issuranceTx : issuranceTx
        }

    }, [web3context])


    const checkIfConnectorValid = useCallback(async (converterAddress) => {
        const signer = web3context.library.getSigner();
        const options = await constructTxOptions();

        // Check token name & supply
        console.log("check if connector valid...");
        console.log("converterAddress : ", converterAddress);
        const controllerContract = getContract(converterAddress ,SmartTokenControllerAbi, signer);
        const token = await controllerContract.token();
        console.log("token name : ", token);
        const tokenContract = getContract(token, SmartTokenAbi, signer);
        const totalSupply = await tokenContract.totalSupply();
        console.log("total supply : ", ethers.utils.formatEther(totalSupply) );
        const owner = await tokenContract.owner();
        console.log("owner : ", owner);

        // Check that the converter holds balance in each of its reserves
        const converterContract = getContract(converterAddress, BancorConverterAbi, signer);
        const reserveTokenCount = await converterContract.connectorTokenCount();
        console.log("reserveTokenCount : ", reserveTokenCount);
        for (let i = 0;i < reserveTokenCount; i += 1) {
            const tokenAddress = await converterContract.connectorTokens(i);
            console.log("tokenAddress : ", tokenAddress);
            const ERC20contract = getContract(tokenAddress, ERC20TokenAbi, signer)
            const balance = await ERC20contract.balanceOf(converterAddress);
            console.log("balance : ", ethers.utils.formatEther(balance));
        }

    }, [web3context])

    const converterOwner = useCallback( async (converterAddress) => {
        const signer = web3context.library.getSigner();
        const controllerContract = getContract(converterAddress ,SmartTokenControllerAbi, signer);
        const token = await controllerContract.token();
        const tokenContract = getContract(token, SmartTokenAbi, signer);
        const owner = await tokenContract.owner();
        return owner;
    } ,[web3context])


    const activateConverter = useCallback(async (smartTokenAddress, converterAddress, tradingFee) => {

        console.log("activateConverter : ", smartTokenAddress, converterAddress, tradingFee );
        const signer = web3context.library.getSigner();
        const options = await constructTxOptions();

        const relayTokenContract = getContract(smartTokenAddress , SmartTokenAbi, signer);
        const converterContract = getContract(converterAddress, BancorConverterAbi, signer);
        const converterRegistry = getContract(bancorContractBancorConverterRegistry, BancorConverterRegistryAbi, signer );

        const setConversionFeeTx = await converterContract.setConversionFee( Number(tradingFee) * (1000000/100) ,options);
        const transferOwnershipTx = await relayTokenContract.transferOwnership(converterAddress,options);
        const activateTx = await converterContract.acceptTokenOwnership(options);
        
        return {
            setConversionFeeTx : setConversionFeeTx,
            transferOwnershipTx : transferOwnershipTx ,
            activateTx : activateTx
        }


    }, [web3context, bancorContractBancorConverterRegistry]);

    const registerConverter = useCallback(async (converterAddress) => {

        console.log("register : ", converterAddress);
        const signer = web3context.library.getSigner();
        const options = await constructTxOptions();

        const converterRegistry = getContract(bancorContractBancorConverterRegistry, BancorConverterRegistryAbi, signer );
        const isValid = await converterRegistry.isConverterValid(converterAddress);

        if (!isValid) {
            throw new Error(`Can't add your converter to the registry. Make sure that is not duplicated with other pools.`);
        }

        const registerTx = await converterRegistry.addConverter(converterAddress, options);

        return registerTx;

    }, [web3context, bancorContractBancorConverterRegistry])

    return {
        loading,
        getTokenName,
        listConversionTokens,
        listLiquidityPools,
        generatePath,
        getLiquidityPool,
        getRate,
        loadingErrorMessage,
        getTokenBalance,
        getTokenDecimal,
        parseToken,
        convert,
        getETHBalance,
        getConversionFee,
        getMaxConversionFee,
        getReserveRatio,
        fundLiquidityPool,
        withdrawLiquidityPool,
        getLiquidityPoolDeposit,
        getAfforableAmount,
        createSmartToken,
        getSmartToken,
        checkIfAccountHasSufficientBalance,
        createConverter,
        addInitialReserve,
        activateConverter,
        converterOwner,
        getReserves,
        getTotalSupplyByConverter,
        registerConverter
    }
}



export default provider;