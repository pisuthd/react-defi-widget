import { ethers } from "ethers";
import { NETWORKS, BANCOR_CONTRACTS } from "../constants";

export const getContract = (address, ABI, signer) => {
    return new ethers.Contract(address, ABI, signer);
};


export const getContractRegistryAddress = (network) => {
    switch (network) {
        case NETWORKS.MAINNET:
            return BANCOR_CONTRACTS.MAINNET.ContractRegistry
        case NETWORKS.ROPSTEN:
            return BANCOR_CONTRACTS.ROPSTEN.ContractRegistry
        default:
            return;
    }
}