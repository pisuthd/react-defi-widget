import React, { createContext, useContext, useReducer, useState, useMemo, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { BANCOR_CONTRACTS, TOKEN_CONTRACTS } from "../constants";
import { EtherTokenAbi } from "../contracts/bancor/EtherToken";
import { getContract }  from "./bancor";

const ModalContext = createContext();

const useModalContext = () => {
    return useContext(ModalContext)
}

const ACTIONS = {
    UPDATE_MESSAGE: "UPDATE_MESSAGE",
    SHOW_MODAL: "SHOW_MODAL",
    TICK: "TICK"
}

export const MODAL_TYPES = {
    PROCESSING: "PROCESSING",
    CONFIRM : "CONFIRM",
    WARNING: "WARNING",
    ERROR: "ERROR",
    NONE: "NONE",
    ETHERTOKEN : "ETHERTOKEN"
}

const reducer = (state, { type, payload }) => {
    switch (type) {
        case ACTIONS.UPDATE_MESSAGE: {
            const { type, title , message } = payload;
            return {
                ...state,
                message: message,
                title: title,
                type : type
            }
        }
        
        case ACTIONS.SHOW_MODAL: {
            const { status } = payload;
            let type = MODAL_TYPES.NONE;
            if (status !== false) {
                type = state.type;
            }
            return {
                ...state,
                showModal: status,
                type: type
            }
        }
        case ACTIONS.TICK : {
            const { newTick } = payload;
            return {
                ...state,
                tick : newTick
            }
        }

        default: {
            throw Error(`Unexpected action type in ModalContext reducer: '${type}'.`)
        }

    }
}

const provider = ({ children }) => {

    const [state, dispatch] = useReducer(reducer, {
        message: "",
        title: "",
        type : MODAL_TYPES.NONE,
        showModal: false,
        tick: 0
    })

    const updateMessage = useCallback((type, title, message) => {
        dispatch({ type: ACTIONS.UPDATE_MESSAGE, payload: { type, title, message } })
    }, [])


    const updateShowModal = useCallback((status) => {
        dispatch({ type: ACTIONS.SHOW_MODAL, payload: { status } })
    }, [])

    const updateTick = useCallback((newTick) => {
        dispatch({ type: ACTIONS.TICK, payload: { newTick } })
    }, []);

    return (
        <ModalContext.Provider
            value={useMemo(() => [state, {
                updateMessage,
                updateShowModal,
                updateTick
            }], [
                state,
                updateMessage,
                updateShowModal,
                updateTick
            ])}
        >
            {children}
        </ModalContext.Provider>
    )
}

export const useModal = () => {

    const [{ message, title, showModal, type, tick }, { updateMessage, updateShowModal, updateTick }] = useModalContext();

    const [ confirmation, setConfirmation ] = useState();

    const onClose = () => {
        updateShowModal(false);
        // setType(MODAL_TYPES.NONE);
    }
    
    const showProcessingModal = useCallback((title, message) => { 
        updateShowModal(true);
        // setType(MODAL_TYPES.PROCESSING);
        updateMessage( MODAL_TYPES.PROCESSING ,title, message);
        return onClose;
    },[])

    const showErrorMessageModal = useCallback((title, message) => { 
        updateShowModal(true);
        updateMessage( MODAL_TYPES.ERROR ,title, message);
    },[])

    const showConfirmModal = useCallback((title, message) => { 
        updateShowModal(true);
        updateMessage( MODAL_TYPES.CONFIRM ,title, message);
    },[showModal])

    const showEtherTokenModal = useCallback((title, message) => {
        updateShowModal(true);
        updateMessage(MODAL_TYPES.ETHERTOKEN, title, message);
    }, []);

    const closeEtherTokenModal = useCallback(() => {
        onClose();
        updateTick(tick+1);
    }, [tick]);

    const closeErrorModal = useCallback(() => {
        onClose();
    },[]);

    const closeConfirmModal = useCallback((next) => {
        onClose();
        if (next) {
            updateTick(tick+1);
        }
    }, [confirmation])

    const getNativeETHBalance = useCallback(async (web3context) => {
        const signer = web3context.library.getSigner();
        const balance = await signer.provider.getBalance(web3context.account);
        return ethers.utils.formatEther(balance);
    },[])

    const getETHTokenBalance=  useCallback(async (web3context) => {
        const signer = web3context.library.getSigner();
        const { networkId, account } = web3context;

        let contractAddress;

        if (networkId === 1 ) {
            contractAddress= TOKEN_CONTRACTS.MAINNET.BANCOR_ETHER;
        } else if (networkId === 3) {
            contractAddress= TOKEN_CONTRACTS.ROPSTEN.BANCOR_ETHER;
        } else {
            return 0;
        };

        if (!contractAddress) {
            return;
        }

        const tokenContract = getContract(contractAddress,EtherTokenAbi, signer );
        const balance = await tokenContract.balanceOf(account);
        return ethers.utils.formatEther(balance);
    },[]);

    const getTxOptions = useCallback(async (web3context) => {
        const signer = web3context.library.getSigner();
        const estimatedGasPrice =  await signer.provider.getGasPrice()
        const minimumGasPrice = ethers.utils.parseEther("0.000000003"); // 3 Gwei
        const finalGasPrice = estimatedGasPrice.lt(minimumGasPrice) ? minimumGasPrice : estimatedGasPrice
        const estimatedGasLimit = (Number(ethers.utils.formatUnits(`${finalGasPrice}`, "gwei" ))*100000);
        let options = {
            gasLimit: Math.floor(estimatedGasLimit * 0.2),
            gasPrice: finalGasPrice, // Minimum 3 Gwei
        };
        return options;
    }, []) 

    const depositETHToken = useCallback(async (web3context, depositAmount ) => {
        const signer = web3context.library.getSigner();
        let options = await getTxOptions(web3context);
        const { networkId, account } = web3context;
        let contractAddress;

        if (networkId === 1 ) {
            contractAddress= TOKEN_CONTRACTS.MAINNET.BANCOR_ETHER;
        } else if (networkId === 3) {
            contractAddress= TOKEN_CONTRACTS.ROPSTEN.BANCOR_ETHER;
        } else {
            throw new Error("Network is not supported.")
        };
        const tokenContract = getContract(contractAddress,EtherTokenAbi, signer );

        options = {
            ...options,
            value : ethers.utils.parseEther(`${depositAmount}`)
        }
        const tx = await tokenContract.deposit( options);

        return tx;

    }, []);

    const withdrawETHToken = useCallback(async (web3context, withdrawAmount ) => {
        const signer = web3context.library.getSigner();
        const options = await getTxOptions(web3context);
        const { networkId, account } = web3context;
        let contractAddress;

        if (networkId === 1 ) {
            contractAddress= TOKEN_CONTRACTS.MAINNET.BANCOR_ETHER;
        } else if (networkId === 3) {
            contractAddress= TOKEN_CONTRACTS.ROPSTEN.BANCOR_ETHER;
        } else {
            throw new Error("Network is not supported.")
        };
        const tokenContract = getContract(contractAddress,EtherTokenAbi, signer );
        const tx = await tokenContract.withdraw(ethers.utils.parseEther(`${withdrawAmount}`), options);
        return tx;
    }, []);

    return {
        showModal,
        message,
        title,
        type,
        tick,
        showProcessingModal,
        showEtherTokenModal,
        showErrorMessageModal,
        closeEtherTokenModal,
        getNativeETHBalance,
        getETHTokenBalance,
        depositETHToken,
        closeErrorModal,
        withdrawETHToken,
        showConfirmModal,
        closeConfirmModal
    }


}

export default provider;


