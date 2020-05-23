import React from 'react';
import PropTypes from 'prop-types';

import Widget from "./components/Widget";

import { PAGES } from "./constants";

import BancorContextProvider from "./contexts/bancor";
import ModalContextProvider from "./contexts/modal";

const ContextProviders = ({ children }) => {
    return (
        <ModalContextProvider>
            <BancorContextProvider>
                {children}
            </BancorContextProvider>
        </ModalContextProvider>
    )
}

const ConnectedWidget = (props) => {

    const {
        web3ReactContext,
        currentPage,
        title,
        subtitle,
        description,
        color,
        baseCurrency,
        pairCurrency,
        affiliateAccount,
        affiliateFee,
        whitelisted,
        defaultPool,
        disablePoolCreation
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
                whitelisted={whitelisted}
                defaultPool={defaultPool}
                disablePoolCreation={disablePoolCreation}
            />
        </ContextProviders>
    )
}

ConnectedWidget.propTypes = {
    web3ReactContext: PropTypes.object.isRequired,
    currentPage: PropTypes.string,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    description: PropTypes.string,
    color: PropTypes.string,
    baseCurrency: PropTypes.string,
    pairCurrency: PropTypes.string,
    affiliateAccount: PropTypes.string,
    affiliateFee: PropTypes.number,
    whitelisted: PropTypes.array,
    defaultPool: PropTypes.string,
    disablePoolCreation: PropTypes.bool
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
        affiliateFee,
        whitelisted
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
        whitelisted={whitelisted}
    />
}

TokenConversionWidget.propTypes = {
    web3ReactContext: PropTypes.object.isRequired,
    currentPage: PropTypes.string,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    description: PropTypes.string,
    color: PropTypes.string,
    baseCurrency: PropTypes.string,
    pairCurrency: PropTypes.string,
    affiliateAccount: PropTypes.string,
    affiliateFee: PropTypes.number,
    whitelisted: PropTypes.array

};


export const LiquidityPoolsWidget = (props) => {

    const {
        web3ReactContext,
        color,
        whitelisted,
        defaultPool,
        disablePoolCreation
    } = props;

    return <ConnectedWidget
        web3ReactContext={web3ReactContext}
        currentPage={PAGES.POOLS}
        color={color}
        whitelisted={whitelisted}
        defaultPool={defaultPool}
        disablePoolCreation={disablePoolCreation}
    />
}


LiquidityPoolsWidget.propTypes = {
    web3ReactContext: PropTypes.object.isRequired,
    color: PropTypes.string,
    whitelisted: PropTypes.array,
    defaultPool: PropTypes.string,
    disablePoolCreation: PropTypes.bool
};


export default ConnectedWidget;