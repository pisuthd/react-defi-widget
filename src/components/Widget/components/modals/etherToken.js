import React, { Component, useCallback, useState, useEffect } from 'react';
import styled from "styled-components"

import { Wrapper, Content, Footer, Body, Row, ButtonGroup, Button } from "./index";
import { toFixed } from "../../../../utils/conversion";

const EtherTokenModal = (props) => {

    const { 
        width, 
        errorMessage, 
        setErrorMessage,
        web3ReactContext,
        closeEtherTokenModal,
        getNativeETHBalance,
        getETHTokenBalance,
        depositETHToken,
        withdrawETHToken,
        showLoadingIcon,
        setShowLoadingIcon,
        color,
        closeErrorModal
    } = props;

    const [isWrapPanel, setWrapPanel] = useState(true);
    const [ nativeEthAmount, setNativeEthAmount ] = useState(0);
    const [ wethAmount, setWethAmount] = useState(0);
    const [ balance, setBalance ] = useState(0);
    
    const select = (isWrap) => {
        setWrapPanel(isWrap === "wrap" ? true : false);
    }

    const handleChange = useCallback(async (e) => {
        const regexp = /^[0-9]*(\.[0-9]{0,6})?$/;
        if (e.target.id === "availableNativeETH") {
            const value = regexp.test(e.target.value) ? (e.target.value) : nativeEthAmount;
            setNativeEthAmount(value);
        } else {
            const value = regexp.test(e.target.value) ? (e.target.value) : wethAmount;
            setWethAmount(value);
        }
    }, [nativeEthAmount, wethAmount])

    useEffect(() => {
        if (isWrapPanel) {
            getNativeETHBalance(web3ReactContext).then(
                balance => {
                    setBalance(Number(balance));
                }
            ).catch(error => {
                console.log("getNativeETHBalance error : ", error);
            })
        } else {
            getETHTokenBalance(web3ReactContext).then(
                balance => {
                    console.log("ethtoken : ", balance);
                    setBalance(Number(balance));
                }
            ).catch(error => {
                console.log("getETHTokenBalance error : ", error);
            })
        }
    }, [isWrapPanel, web3ReactContext])

    const onProceed = useCallback(async (e) => {
        setErrorMessage();
        if (showLoadingIcon) {
            return;
        }
        try {
            if (isWrapPanel) {
                console.log("nativeEthAmount / balance : ", nativeEthAmount, balance)
                if (Number(nativeEthAmount) > Number(balance)) {
                    throw new Error("Insufficient amount.");
                }
                const tx = await depositETHToken(web3ReactContext, nativeEthAmount);
                setShowLoadingIcon(true);
                await tx.wait();
                setShowLoadingIcon(false);
                const balance = await getNativeETHBalance(web3ReactContext);
                setBalance(Number(balance));

            } else {
                if (Number(wethAmount) > Number(balance)) {
                    throw new Error("Insufficient amount.");
                }
                const tx = await withdrawETHToken(web3ReactContext, wethAmount);
                setShowLoadingIcon(true);
                await tx.wait();
                setShowLoadingIcon(false);
                const balance = await getETHTokenBalance(web3ReactContext);
                setBalance(Number(balance));
            }
        } catch (error) {
            setErrorMessage(error.message);
        }
    }, [isWrapPanel, web3ReactContext, nativeEthAmount, wethAmount, balance, showLoadingIcon])

    return (
        <Wrapper>
            <Content
                width={width}
            >
                <Body>
                    <p>
                        ETH must be converted into a wrapped form prior to funding the ETH's liquidity pool.
                        </p>
                    <Row>
                        <div
                            style={{ flex: "40%", padding: "10px", paddingBottom: "0px", textAlign: "right" }}
                        >
                            <select onChange={(e) => select(e.target.value)} value={isWrapPanel ? "wrap" : "unwrap"} id="exchange">
                                <option value="wrap">Wrap</option>
                                <option value="unwrap">Unwrap</option>
                            </select>
                        </div>
                        <div
                            style={{ flex: "60%", padding: "10px", paddingBottom: "0px" }}
                        >
                            {isWrapPanel
                                ?
                                <input
                                    id="availableNativeETH"
                                    placeholder="0.0"
                                    type="number"
                                    min="0"
                                    value={nativeEthAmount}
                                    onChange={handleChange}
                                    step="0.1"
                                    pattern="^\d+(?:\.\d{1,4})?$"
                                />
                                :
                                <input
                                    id="availableWETH"
                                    placeholder="0.0"
                                    type="number"
                                    min="0"
                                    value={wethAmount}
                                    onChange={handleChange}
                                    step="0.1"
                                    pattern="^\d+(?:\.\d{1,4})?$"
                                />
                            }
                        </div>
                    </Row>
                    <Row>
                        <div style={{ flex: "40%", padding: "10px", textAlign: "right" }}>{` `}</div>
                        <div style={{ flex: "60%", padding: "10px", fontSize: "12px" }}>Available : {toFixed(balance, 6)}{` `}{`${isWrapPanel ? "ETH" : "Ether Token"}`}</div>
                    </Row>
                    {errorMessage && (
                        <MessageBar color={"red"}>
                            {errorMessage}
                        </MessageBar>
                    )}
                    {showLoadingIcon && (
                        <MessageBar  color={"blue"}>
                            Please wait while your transaction is being processed...
                        </MessageBar>
                    )}
                </Body>
                <Footer>
                    <ButtonGroup>
                        <Button disabled={showLoadingIcon} onClick={onProceed} color={color}>{`${isWrapPanel ? "Wrap" : "Unwrap"}`}</Button>
                        <Button onClick={() => closeEtherTokenModal()} color={color}>Close</Button>
                    </ButtonGroup>
                </Footer>
            </Content>
        </Wrapper>
    )
}

const MessageBar = styled.div`
    color: ${props => props.color};
    height: 24px;
    display: block;
    font-size: 12px;
    text-align: center;
    font-weight: 600;
`;

export default EtherTokenModal;