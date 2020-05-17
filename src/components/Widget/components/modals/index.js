import React, { Component, useCallback, useState, useEffect } from 'react';

import styled from "styled-components"

import { MODAL_TYPES, useModal } from "../../../../contexts/modal";
import loadingIcon from "../../../../../assets/loading-large.gif";
import { toFixed } from "../../../../utils/conversion";

import EtherTokenModal from "./etherToken";
import ErrorMessageModal from "./errorMessage";
import ConfirmModal from "./confirm";

const Modal = (props) => {

    const { width, height, color, web3ReactContext } = props;

    const {
        title,
        message,
        type,
        closeEtherTokenModal,
        getNativeETHBalance,
        getETHTokenBalance,
        depositETHToken,
        withdrawETHToken,
        closeErrorModal,
        closeConfirmModal,
        showConfirmModal
    } = useModal();
    const [showLoadingIcon, setShowLoadingIcon] = useState(false);
    const [errorMessage, setErrorMessage] = useState();

    useEffect(() => {
        if (type === MODAL_TYPES.PROCESSING) {
            setShowLoadingIcon(true);
        } else {
            setShowLoadingIcon(false);
        }
    }, [type])

    switch (type) {
        case MODAL_TYPES.ETHERTOKEN:
            return (
                <EtherTokenModal
                    width={width}
                    errorMessage={errorMessage}
                    setErrorMessage={setErrorMessage}
                    web3ReactContext={web3ReactContext}
                    closeEtherTokenModal={closeEtherTokenModal}
                    getNativeETHBalance={getNativeETHBalance}
                    getETHTokenBalance={getETHTokenBalance}
                    depositETHToken={depositETHToken}
                    withdrawETHToken={withdrawETHToken}
                    showLoadingIcon={showLoadingIcon}
                    setShowLoadingIcon={setShowLoadingIcon}
                    color={color}
                    
                />
            )
        case MODAL_TYPES.ERROR:
            return <ErrorMessageModal
                        width={width}
                        color={color}
                        title={title}
                        message={message}
                        closeErrorModal={closeErrorModal}
                    />
        case MODAL_TYPES.CONFIRM:
            return <ConfirmModal
                        width={width}
                        color={color}
                        title={title}
                        message={message}
                        closeConfirmModal={closeConfirmModal}
                    />
        default:
            return (
                <Wrapper>
                    <Content
                        width={width}
                    >
                        {showLoadingIcon && (
                            <LoadingContainer>
                                <img src={loadingIcon} width="18px" height="18px" />
                            </LoadingContainer>
                        )}
                        <Body>
                            {title}
                            {message !== "" &&
                                (
                                    <Description>
                                        {message}
                                    </Description>
                                )}
                        </Body>
                    </Content>
                </Wrapper>
            )
    }
}


export const Row = styled.div`
    display: flex;
    text-align: left;
    font-size: 14px;

    input, select {
        padding: 4px 8px 4px 8px;
        border: 1px solid #A9A9A9;
        border-radius: 4px;
        width: 100%;
        height: 100%;
        background-color: transparent;
    }

    select {
        cursor: pointer;
    }

`;

const Select = styled.a`
    font-weight: ${props => props.active ? "600" : "400"};
    cursor: pointer;
    ${props => props.active && `
        text-decoration: underline;
    `}
`;

export const Wrapper = styled.div`
    margin: 0;
    color: black;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

export const Content = styled.div`
    background: #fff;
    border-radius: 5px;
    padding: 20px;
    text-align: center;
    font-size: 14px;
    word-wrap: break-word;
    border: 0.3px solid rgba(0, 0, 0, 0.6);
    width: ${props => (props.width && props.width > 600) ? `${(props.width) / 2}px` : `${props.width * 0.8}px`};
`;

const Header = styled.div`
    .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
    }
`;

export const Footer = styled.div`
    height: 40px;
    position: relative; 
`;

export const Body = styled.div`
    font-size: 12px;
`;

const Description = styled.div`
    font-size: 10px;
    margin-top: 10px;
    font-weight: 600;
`;

const LoadingContainer = styled.div`
    padding-bottom: 20px;
`;

export const ButtonGroup = styled.div`
    position: absolute; 
    left: 50%;
    top: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
`;

export const Button = styled.button`
    background-color: ${props => props.color && `${props.color}`};
    border: none;
    color: white;
    text-align: center;
    text-decoration: none;
    padding: 4px 8px 4px 8px;
    font-size: 14px;
    margin-right: 4px;
    border-radius: 4px;
    ${props => props.disabled && 'opacity: 0.6;'}
`;


export default Modal;