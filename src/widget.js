import React, { useState , Fragment } from 'react';
import PropTypes from 'prop-types';

import Widget from "./components/Widget";

import { PAGES } from "./constants";

import BancorContextProvider from "./contexts/bancor";

const ContextProviders = ({ children }) => {

    return (
        <BancorContextProvider>
            {children}
        </BancorContextProvider>
    )

    
}

const ConnectedWidget = (props) => {

    const { 
        web3ReactContext, 
        currentPage ,
        title, 
        subtitle, 
        description
    } = props;

    return (
        <ContextProviders>
            <Widget
                web3ReactContext={web3ReactContext}
                currentPage={currentPage}
                title={title}
                subtitle={subtitle}
                description={description}
            />  
        </ContextProviders>
    )
}

ConnectedWidget.propTypes = {
    web3ReactContext: PropTypes.object.isRequired,
    currentPage: PropTypes.string,
    title: PropTypes.string,
    subtitle : PropTypes.string,
    description : PropTypes.string
};


export const TokenConversionWidget = (props) => {

    const { 
        web3ReactContext, 
        title, 
        subtitle, 
        description,
    } = props;

    return <ConnectedWidget
                web3ReactContext={web3ReactContext}
                currentPage={PAGES.SWAP}
                title={title}
                subtitle={subtitle}
                description={description}
            />
}

TokenConversionWidget.propTypes = {
    web3ReactContext: PropTypes.object.isRequired,
    currentPage: PropTypes.string,
    title: PropTypes.string,
    subtitle : PropTypes.string,
    description : PropTypes.string
};


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