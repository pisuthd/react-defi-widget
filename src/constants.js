
export const COLORS = {
    default: "#0275d8",
    green1: "#35e65d",
    grey0: "#808080",
    grey1: "#cdd8ec",
    grey2: "#f4f7f9",
    grey3: "#b5b5b5",
    dark: "#000",
    turqois1: "#35cce6",
    turqois2: "#a3eaf7",
    primary: "#090446",
    success: "#4CAF50",
    secondary: "#E8EAF6",
    white: "#fff",
    red: "#ff0000"
} 

export const PAGES = {
    DEFAULT: "SWAP",
    SWAP: "SWAP",
    POOLS: "POOLS"
}

export const TRANSACTION_TYPE = {
    SWAP : "SWAP",
    ADD_LIQUIDITY: "ADD_LIQUIDITY"
}

export const BANCOR_CONTRACTS = {
    ROPSTEN : {
        ContractRegistry : "0xFD95E724962fCfC269010A0c6700Aa09D5de3074"
    },
    MAINNET : {
        ContractRegistry : "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4"
    }
    
}

export const TOKEN_CONTRACTS = {
    ROPSTEN : {
        BANCOR_ETHER : "0xD368b98d03855835E2923Dc000b3f9c2EBF1b27b",
        BNT: "0x62bd9D98d4E188e281D7B78e29334969bbE1053c",
        BUSD: "0xeedc02321e60fc310b3973877729193fc288297f"
    },
    MAINNET : {
        BANCOR_ETHER : "0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315",
        BNT: "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C",
        BUSD : "0x309627af60f0926daa6041b8279484312f2bf060"
    }
}

export const NETWORKS = {
    MAINNET : 1,
    ROPSTEN : 3
}

export const HEADLINES = {
    HEADER : {
        SWAP : "Simple & Easy Token Swap",
        POOLS: "Pool Creation/Stake Liquidity"
    },
    TEXT : {
        SWAP : "Allow your site's visitor convert Ethereum's ERC-20 tokens for other & earn commission on each transaction",
        POOLS: "Easily staking liquidity and earn fees on Bancor as well as make your own pool"
    },
    DISCLAIMER : {
        SWAP : "DISCLAIMER : This feature give access to third-party liquidity pools. We make no warranties of any kind of financial loss including but not limited to accuracy, security and updatedness. Please consult your financial advisor before taking any financial decision.",
        POOLS : "DISCLAIMER : This feature give access to third-party liquidity pools. We make no warranties of any kind of financial loss including but not limited to accuracy, security and updatedness. Please consult your financial advisor before taking any financial decision."
    },
    ACTIONS : {
        SWAP : "Swap",
        POOLS : "Ok"
    }
}

export const CACHE_URL = "https://db-staging.stakingdojo.com";

