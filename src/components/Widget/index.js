import React, { Component, useCallback, Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import WidgetLayout from "./layout";

import { PAGES, HEADLINES, COLORS } from "../../constants";

import SwapPanel from "./components/panels/swap";
import LiquidityPoolPanel, { ACTION_PANELS } from "./components/panels/liquidityPool";

import Modal from "./components/modals";

import styled from "styled-components"
import ContainerDimensions from 'react-container-dimensions'
import { useBancor } from "../../contexts/bancor";
import { useModal } from "../../contexts/modal";


const Widget = (props) => {

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

    const { showModal, showErrorMessageModal } = useModal();

    const widgetTitle = title || HEADLINES.HEADER[currentPage];
    const widgetSubtitle = subtitle || HEADLINES.TEXT[currentPage];
    const widgetDescription = description || HEADLINES.DISCLAIMER[currentPage];
    const widgetColor = color || COLORS.default;

    const [errorMessage, setErrorMessage] = useState();

    const { loading, loadingErrorMessage } = useBancor(web3ReactContext);

    const [clickCount, setClickCount] = useState(0);
    const [disclaimer, setDisclaimer] = useState(widgetDescription);
    const [actionText, setActionText] = useState("");

    const [networkId, setNetworkId] = useState();

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
                setErrorMessage(`${web3ReactContext.error.message}` || "Error : An unknown error occurred.");
            }
        } else {
            setErrorMessage();
            // setDisclaimer(HEADLINES.DISCLAIMER[currentPage]);
        }

    }, [web3ReactContext.error, web3ReactContext.active, loading])

    const updateActionText = (text) => {
        setActionText(text);
    }

    const handleClick = useCallback((e) => {
        e.preventDefault();
        setClickCount(clickCount + 1)

    }, [clickCount])

    const disabled = errorMessage || !web3ReactContext.active || loading;

    useEffect(() => {


        if ((networkId !== undefined) && (web3ReactContext.networkId !== undefined)) {
            if (networkId !== web3ReactContext.networkId) {
                // TODO : Only Reload the widget
                try {
                    console.log("refresh page...")
                    window.location.reload();
                } catch (error) {

                }
            }
        }

        if (web3ReactContext.networkId) {
            if ([ 1, 3].indexOf(web3ReactContext.networkId) === -1 ) {
                showErrorMessageModal("Unsupported Network","Please switch to Mainnet or Ropsten network");
                return;
            }
            setNetworkId(web3ReactContext.networkId);
        };

    }, [web3ReactContext.networkId, networkId]);

    const WRAP_WIDTH = currentPage === PAGES.SWAP ? 600 : 800;

    const isHide = ([  1, 3].indexOf(web3ReactContext.networkId) === -1 );

    return (
        <ContainerDimensions>
            {({ width, height }) =>
                <Fragment>
                    <Container
                        inactive={showModal}
                    >
                        {((width > WRAP_WIDTH) || (currentPage === PAGES.SWAP)) &&
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
                        }

                        <Body
                            width={width}
                            isMobile={width > WRAP_WIDTH}
                            height={height}
                        >
                            {!isHide && currentPage === PAGES.SWAP &&
                                (
                                    <SwapPanel
                                        clickCount={clickCount}
                                        web3ReactContext={web3ReactContext}
                                        halt={errorMessage}
                                        baseCurrency={baseCurrency}
                                        pairCurrency={pairCurrency}
                                        affiliateAccount={affiliateAccount}
                                        affiliateFee={affiliateFee}
                                        width={width}
                                        whitelisted={whitelisted}
                                    />
                                )}

                            {!isHide && currentPage === PAGES.POOLS &&
                                (
                                    <LiquidityPoolPanel
                                        web3ReactContext={web3ReactContext}
                                        width={width}
                                        wrapAt={WRAP_WIDTH}
                                        updateActionText={updateActionText}
                                        clickCount={clickCount}
                                        color={widgetColor}
                                        whitelisted={whitelisted}
                                        defaultPool={defaultPool}
                                        disablePoolCreation={disablePoolCreation}
                                    />
                                )}

                        </Body>

                        <Footer>
                            {actionText !== ACTION_PANELS.CREATE_POOL &&
                                <ActionButton color={widgetColor} onClick={handleClick} disabled={disabled}>
                                    {currentPage === PAGES.SWAP ? HEADLINES.ACTIONS[currentPage] : actionText}
                                </ActionButton>
                            }
                            <StatusPanel
                                isMobile={width > WRAP_WIDTH}
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
                    {showModal && (
                        <Modal
                            width={width}
                            height={height}
                            color={widgetColor}
                            web3ReactContext={web3ReactContext}
                        />
                    )}
                </Fragment>
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

    ${ props => (props.isMobile) && `
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
    height: 100%;
    overflow: hidden;

    ${props => props.inactive && `
        opacity: 0.6;   
    `}

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

    ${ props => (props.isMobile) && `
        grid-template-columns: repeat(2, 1fr);
    `}
    
`


Widget.propTypes = {
    web3ReactContext: PropTypes.object.isRequired,
    currentPage: PropTypes.string
};

export default Widget;