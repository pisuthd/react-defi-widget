import React, { Component, useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import WidgetLayout from "./layout";

import { PAGES, HEADLINES, COLORS } from "../../constants";

import SwapPanel from "./components/panels/swap";

import styled from "styled-components"
import ContainerDimensions from 'react-container-dimensions'
import { useBancor } from "../../contexts/bancor";


const Widget = (props) => {

    const { 
        web3ReactContext,
        currentPage,
        title,
        subtitle,
        description,
        color,
        baseCurrency,
        pairCurrency
    } = props;

    const widgetTitle = title || HEADLINES.HEADER[currentPage];
    const widgetSubtitle = subtitle || HEADLINES.TEXT[currentPage];
    const widgetDescription = description || HEADLINES.DISCLAIMER[currentPage];
    const widgetColor = color || COLORS.default;

    const [errorMessage, setErrorMessage] = useState();

    const { loading, listConversionTokens, getTokenName, loadingErrorMessage } = useBancor(web3ReactContext);


    const [ processing, setProcessing ] = useState(false);

    const [ clickCount, setClickCount ] = useState(0);

    const [ disclaimer, setDisclaimer ] = useState(widgetDescription);

    useEffect(() => {
        if (loadingErrorMessage) {
            setErrorMessage(loadingErrorMessage);
        }
    }, [loadingErrorMessage])

    useEffect(() => {

        if (loading) {
            setErrorMessage();
            // setDisclaimer(HEADLINES.DISCLAIMER[currentPage]);
            return;
        }

        if (!web3ReactContext.active) {

            if (!web3ReactContext.error) {
                setErrorMessage();
                // setDisclaimer("Connecting to MetaMask...");
            } else {
                setErrorMessage(`Error : ${web3ReactContext.error.message}` || "Error : An unknown error occurred.");
            }
        } else {
            setErrorMessage();
            // setDisclaimer(HEADLINES.DISCLAIMER[currentPage]);
        }

    }, [web3ReactContext.error, web3ReactContext.active, loading])


    const handleProcessing = (status) => {
        setProcessing(status);
    }

    const handleClick = useCallback((e) => {
        e.preventDefault();
        setClickCount(clickCount+1)

    },[clickCount])

    const disabled = errorMessage || !web3ReactContext.active || loading || processing ;

    return (
        <ContainerDimensions>
            {({ width, height }) =>
                <Container>
                    <Header
                        width={width}
                        height={height}
                    >
                        <h3>
                            {widgetTitle}
                        </h3>
                        <p>
                            {widgetSubtitle}
                        </p>

                    </Header>

                    <Body
                        width={width}
                        height={height}
                    >
                        {currentPage === PAGES.SWAP && 
                        (
                        <SwapPanel 
                            clickCount={clickCount} 
                            handleTextStatus={setDisclaimer} 
                            handleProcessing={handleProcessing} 
                            web3ReactContext={web3ReactContext} 
                            halt={errorMessage} 
                            textDescription={widgetDescription}
                            baseCurrency={baseCurrency}
                            pairCurrency={pairCurrency} 
                        />
                        )}
                    </Body>

                    <Footer>

                        <ActionButton color={widgetColor}  onClick={handleClick} disabled={disabled}>
                            Swap
                        </ActionButton>
                        <StatusPanel
                            width={width}
                        >
                            {errorMessage
                                ?
                                (<ErrorMessage>{`Error : ${errorMessage}` || "Error : An unknown error occurred."}</ErrorMessage>)
                                :
                                <span>{disclaimer}</span>
                            }
                        </StatusPanel>

                    </Footer>
                </Container>

            }
        </ContainerDimensions>


    )
}


const ActionButton = styled.button`
    background-color: ${props => props.color && `${props.color}`}; 
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    ${props => props.disabled && 'opacity: 0.6;'}
`;

const StatusPanel = styled.div`
    font-size: 10px;
    text-align: center;
    padding-top: 10px;

    ${ props => props.width > 600 && `
        font-size: 12px;
    `}
`;

const ErrorMessage = styled.span`
    color: red;
    font-weight: 600;
    
`;

const Container = styled.div`
    background: #fff;
    border-radius: 5px;
    padding: 20px;
    color: rgba(0, 0, 0, 0.7);
`;

const Header = styled.div`
    text-align: center;

    h3 {
        font-size: 16px;
        font-weight: 600;
    }

    p {
        font-size: 12px;
    }

    ${ props => props.width > 600 && `
        h3 {
            font-size: 24px;
        }

        p {
            font-size: 14px;
        }
    `}

`;

const Footer = styled.div`
    text-align: center;
    padding: 20px;
`;

const Body = styled.div`
    
    display: grid;
    grid-gap: 1rem;
    
    ${ props => props.width > 600 && `
        grid-template-columns: repeat(2, 1fr);
    `}

    
`


Widget.propTypes = {
    web3ReactContext: PropTypes.object.isRequired,
    currentPage: PropTypes.string
};

export default Widget;