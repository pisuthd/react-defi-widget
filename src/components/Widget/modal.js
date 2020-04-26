import React, { Component, useCallback, useState, useEffect } from 'react';

import styled from "styled-components"

import { MODAL_TYPES, useModal } from "../../contexts/modal";
import loadingIcon from "../../../assets/loading-large.gif";
import { toFixed } from "../../utils/conversion";

const Modal = (props) => {

    const { width, height, color, web3ReactContext } = props;

    const { title, message, type, closeEtherTokenModal, getNativeETHBalance, getETHTokenBalance, depositETHToken, withdrawETHToken } = useModal();

    const [ showLoadingIcon , setShowLoadingIcon ] = useState(false);
    const [ isWrapPanel, setWrapPanel ] = useState(true);

    const [ nativeEthAmount, setNativeEthAmount ] = useState(0);
    const [ wethAmount, setWethAmount] = useState(0);
    const [ balance, setBalance ] = useState(0);
    const [errorMessage, setErrorMessage ] = useState();


    const handleChange = useCallback(async (e) => {

        const regexp = /^[0-9]*(\.[0-9]{0,6})?$/;


        if (e.target.id === "availableNativeETH") {
            const value = regexp.test(e.target.value) ? (e.target.value) : nativeEthAmount;
            setNativeEthAmount(value);
        } else {
            const value = regexp.test(e.target.value) ? (e.target.value) : wethAmount;
            setWethAmount(value);
        }

    },[nativeEthAmount, wethAmount])

    const select = (isWrap) => {
        setWrapPanel(isWrap === "wrap" ? true : false);
    }


    useEffect(() => {
        
        if (type === MODAL_TYPES.PROCESSING ) {
            setShowLoadingIcon(true);
        } else {
            setShowLoadingIcon(false);
        }

    },[type])

    useEffect(() => {

        if (type === MODAL_TYPES.ETHERTOKEN) {
            if (isWrapPanel) {
                getNativeETHBalance(web3ReactContext).then(
                    balance => {
                        setBalance(Number(balance));
                    }
                ).catch(error=>{
                    console.log("getNativeETHBalance error : ", error);
                })
                
            } else {
                getETHTokenBalance(web3ReactContext).then(
                    balance => {
                        console.log("ethtoken : ", balance);
                        setBalance(Number(balance));
                    }
                ).catch(error=>{
                    console.log("getETHTokenBalance error : ", error);
                })
            }

        }

    },[isWrapPanel, type, web3ReactContext])

    const onProceed = useCallback(async (e) => {
        setErrorMessage();

        if (showLoadingIcon) {
            return;
        }
        
        try  {
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

    if (type === MODAL_TYPES.ETHERTOKEN) {
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
                                style={{flex: "40%", padding: "10px", paddingBottom : "0px" , textAlign : "right"}}
                            >
                                <select onChange={(e) => select(e.target.value)} value={isWrapPanel ? "wrap" :"unwrap" } id="exchange">
                                     <option value="wrap">Wrap</option>
                                     <option value="unwrap">Unwrap</option>
                                </select>
                            </div>
                            <div
                                style={{flex: "60%", padding: "10px", paddingBottom : "0px" }}
                            >
                                  { isWrapPanel 
                                    ?   
                                    <input
                                        id="availableNativeETH"
                                        placeholder="0.0"
                                        type="number"
                                        min="0"
                                        // style={{marginLeft: "10px", border: "1px solid #eee", padding: "5px"}}
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
                            <div style={{flex: "40%", padding: "10px", textAlign : "right"}}>{` `}</div>
                            <div style={{flex: "60%", padding: "10px", fontSize : "12px"}}>Available : {toFixed(balance, 6)}{` `}{`${isWrapPanel ? "ETH" : "Ether Token"}`}</div>

                        </Row>
                        { errorMessage && (
                            <Row style={{height: "24px", display: "block",  fontSize: "12px", textAlign:"center", color: "red", fontWeight : "600"}}>
                                {errorMessage}
                            </Row>
                        )}
                        { showLoadingIcon && (
                            <Row style={{height: "24px", display: "block",  fontSize: "12px", textAlign:"center", color: "blue", fontWeight : "600"}}>
                                Please wait while your transaction is being processed...
                            </Row>
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
                        { title }
                        { message !== "" &&
                        (
                            <Description>
                                { message }
                            </Description>
                        )}
                    </Body>
            </Content>
        </Wrapper>
    )

}


const Row  = styled.div`
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
    font-weight: ${props => props.active ? "600" : "400" };
    cursor: pointer;
    ${props => props.active && `
        text-decoration: underline;
    `}
`;

const Wrapper = styled.div`
    margin: 0;
    color: black;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

const Content = styled.div`
    background: #fff;
    border-radius: 5px;
    padding: 20px;
    text-align: center;
    font-size: 14px;
    word-wrap: break-word;
    width: ${props => (props.width && props.width > 600) ? `${(props.width) / 2}px` : `${props.width*0.8}px` };
`;

const Header = styled.div`
    .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
    }
`;

const Footer = styled.div`
    
    height: 40px;
    position: relative; 
`;

const Body = styled.div`
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

const ButtonGroup = styled.div`
    position: absolute; 
    left: 50%;
    top: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
`;

const Button = styled.button`
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