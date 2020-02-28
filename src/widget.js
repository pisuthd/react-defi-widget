import React , {useState} from 'react';
import PropTypes from 'prop-types';

import Widget from "./components/Widget";

import NativationContextProvider from "./contexts/navigation";
import DefiContextProvider from "./contexts/defi";

const ContextProviders = ({children}) => {
    return (
        <NativationContextProvider>
            <DefiContextProvider>
                {children}
            </DefiContextProvider>
        </NativationContextProvider>
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

export default ConnectedWidget;