import { ethers } from "ethers";

export const getAddress = (address) => {
    try {
        const result = ethers.utils.getAddress(address);
        
        return result;
    } catch (error) {
        return "0x0000000000000000000000000000000000000000";
    }

}

export const parseFee = (fee) => {

    if (typeof (fee) === "number") {
        let result = Number(fee) * 10000;

        if (0 > result) {
            return "0";
        }

        if (result > 30000) {
            return "30000";
        } else {
            return `${result}`;
        }


    } else {
        return "0";
    }
}