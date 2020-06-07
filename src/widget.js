import React from 'react';
import PropTypes from 'prop-types';


import AddressBookProvider, { useAddressBook } from "./hooks/addressBook"
import ThemeProvider from "./hooks/theme";
import StakingLiquidity from "./components/widgets/stakingLiquidity"
import TokenSwap from "./components/widgets/tokenSwap"

const ContextProviders = ({ children }) => {
    
    return (
        <ThemeProvider>
            <AddressBookProvider>
                {children}
            </AddressBookProvider>
        </ThemeProvider>
    )
}

const ConnectedWidget = (props) => {

    const { children } = props;

    return (
        <ContextProviders>
            {children}
        </ContextProviders>
    )
}
/*
ConnectedWidget.PropTypes = {
    
}
*/

export const StakingLiquidityWidget = (props) => {

    const { web3ReactContext, poolSymbol, gasLimit, color } = props;

    return (
        <ConnectedWidget>
            <StakingLiquidity
                web3ReactContext={web3ReactContext}
                color={color}
                poolSymbol={poolSymbol}
                gasLimit={gasLimit}
            />
        </ConnectedWidget>
    )
}

StakingLiquidityWidget.propTypes = {
    web3ReactContext: PropTypes.object.isRequired,
    color: PropTypes.string,
    poolSymbol: PropTypes.string.isRequired, 
    gasLimit: PropTypes.string
}

export const TokenSwapWidget = (props) => {

    const { web3ReactContext, baseToken, pairToken, gasLimit, color } = props;

    return (
        <ConnectedWidget>
            <TokenSwap
                web3ReactContext={web3ReactContext}
                color={color}
                baseToken={baseToken}
                pairToken={pairToken}
                gasLimit={gasLimit}
            />
        </ConnectedWidget>
    )
}

TokenSwapWidget.propTypes = {
    web3ReactContext: PropTypes.object.isRequired,
    color: PropTypes.string,
    baseToken: PropTypes.string,
    pairToken: PropTypes.string,
    gasLimit: PropTypes.string
}