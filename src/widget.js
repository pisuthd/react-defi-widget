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
        description,
        color,
        baseCurrency,
        pairCurrency,
        affiliateAccount,
        affiliateFee
    } = props;

    return (
        <ContextProviders>
            <Widget
                web3ReactContext={web3ReactContext}
                currentPage={currentPage}
                title={title}
                subtitle={subtitle}
                description={description}
                color={color}
                baseCurrency={baseCurrency}
                pairCurrency={pairCurrency}
                affiliateAccount={affiliateAccount}
                affiliateFee={affiliateFee}
            />  
        </ContextProviders>
    )
}

ConnectedWidget.propTypes = {
    web3ReactContext: PropTypes.object.isRequired,
    currentPage: PropTypes.string,
    title: PropTypes.string,
    subtitle : PropTypes.string,
    description : PropTypes.string,
    color : PropTypes.string,
    baseCurrency :  PropTypes.string,
    pairCurrency :  PropTypes.string,
    affiliateAccount : PropTypes.string,
    affiliateFee : PropTypes.number,
};


export const TokenConversionWidget = (props) => {

    const { 
        web3ReactContext, 
        title, 
        subtitle, 
        description,
        color,
        baseCurrency,
        pairCurrency,
        affiliateAccount,
        affiliateFee
    } = props;

    return <ConnectedWidget
                web3ReactContext={web3ReactContext}
                currentPage={PAGES.SWAP}
                title={title}
                subtitle={subtitle}
                description={description}
                color={color}
                baseCurrency={baseCurrency}
                pairCurrency={pairCurrency}
                affiliateAccount={affiliateAccount}
                affiliateFee={affiliateFee}
            />
}

TokenConversionWidget.propTypes = {
    web3ReactContext: PropTypes.object.isRequired,
    currentPage: PropTypes.string,
    title: PropTypes.string,
    subtitle : PropTypes.string,
    description : PropTypes.string,
    color : PropTypes.string,
    baseCurrency :  PropTypes.string,
    pairCurrency :  PropTypes.string,
    affiliateAccount : PropTypes.string,
    affiliateFee : PropTypes.number,

};


export const BancorLiquidityPoolsWidget = (props) => {

    const { web3ReactContext, color } = props;

    return <ConnectedWidget
                web3ReactContext={web3ReactContext}
                currentPage={PAGES.POOLS}
                color={color}
            />
}


BancorLiquidityPoolsWidget.propTypes = {
    web3ReactContext: PropTypes.object.isRequired,
    color : PropTypes.string

};

export const StablecoinsWidget = (props) => {
    const { web3ReactContext } = props;

    return <ConnectedWidget
                web3ReactContext={web3ReactContext}
                currentPage={PAGES.STABLECOINS}
            />
}

export default ConnectedWidget;