import React, { useState , Fragment } from 'react';
import PropTypes from 'prop-types';

import Widget from "./components/Widget";

import { PAGES } from "./constants";

import NativationContextProvider from "./contexts/navigation";
import DefiContextProvider from "./contexts/defi";
import BancorContextProvider from "./contexts/bancor";

const ContextProviders = ({ children }) => {

    return (
        <BancorContextProvider>
            {children}
        </BancorContextProvider>
    )

    
}

const ConnectedWidget = (props) => {

    const { web3ReactContext, currentPage } = props;

    return (
        <ContextProviders>
            <Widget
                web3ReactContext={web3ReactContext}
                currentPage={currentPage}
            />  
        </ContextProviders>
    )
}

ConnectedWidget.propTypes = {
    web3ReactContext: PropTypes.object.isRequired,
    currentPage: PropTypes.string

};


export const TokenConversionWidget = (props) => {

    const { web3ReactContext } = props;

    return <ConnectedWidget
                web3ReactContext={web3ReactContext}
                currentPage={PAGES.SWAP}
            />
}

export const LiquidityPoolsWidget = (props) => {

    const { web3ReactContext } = props;

    return <ConnectedWidget
                web3ReactContext={web3ReactContext}
                currentPage={PAGES.POOLS}
            />
}

export const StablecoinsWidget = (props) => {
    const { web3ReactContext } = props;

    return <ConnectedWidget
                web3ReactContext={web3ReactContext}
                currentPage={PAGES.STABLECOINS}
            />
}

export default ConnectedWidget;