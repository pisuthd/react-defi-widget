import React, { Component, useCallback, Fragment, useState, useEffect } from 'react';
import ContainerDimensions from 'react-container-dimensions'
import useConvert from "../../hooks/convert"
import Layout from "./layout";
import { hexIsLight } from "../../utils/conversion";
import { COLORS } from "../../constants";
import styled from 'styled-components';
import { getIcon } from "../../utils/token";


const TokenSwap = ({
    web3ReactContext,
    color = COLORS.primary,
    baseToken = "ETH",
    pairToken = "BNT"
}) => {

    const { tokens, loading } = useConvert(web3ReactContext);

    const [isBaseTokenModalOpen, setBaseTokenModal] = useState(false);
    const [isPairTokenModalOpen, setPairTokenModal] = useState(false);

    const toggleBaseModal = useCallback(() => {
        setBaseTokenModal(!isBaseTokenModalOpen);
    }, [isBaseTokenModalOpen]);

    const togglePairModal = useCallback(() => {
        setPairTokenModal(!isPairTokenModalOpen);
    }, [isPairTokenModalOpen]);
    /*
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('This will run every second!');
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    */
    const isBackgroundLight = hexIsLight(color);


    return (
        <Layout>
            <ContainerDimensions>
                {({ width, height }) =>
                    <Fragment>
                        <TokensContainer
                            width={width}
                            height={height}
                        >
                            <TokenContainer
                                width={width}
                            >
                                <h4>Pay</h4>
                                <InputGroup>
                                    <InputGroupIcon>
                                        {baseToken &&
                                            (
                                                <TokenLogo src={getIcon(baseToken)} alt={baseToken} />
                                            )}
                                    </InputGroupIcon>
                                    <InputGroupDropdown active={isBaseTokenModalOpen}>
                                        <span onClick={() => toggleBaseModal()}>
                                            {baseToken && `${baseToken}`}&#9660;
                                        </span>
                                        {/*
                                        <DropdownPanel
                                            tokens={tokens || []}
                                            onChange={onBaseChange}
                                            getIcon={getIcon}
                                        />
                                        */}

                                    </InputGroupDropdown>
                                    <InputGroupArea>
                                        <input value={0} id="sourceInput" onChange={{}} placeholder="0.00" type="number" min="0" step="0.01" pattern="^\d+(?:\.\d{1,6})?$" />
                                    </InputGroupArea>
                                </InputGroup>
                            </TokenContainer>
                            <TokenContainer>
                                <h4>Receive</h4>
                                <InputGroup>
                                    <InputGroupIcon>
                                        {pairToken &&
                                            (
                                                <TokenLogo src={getIcon(pairToken)} alt={pairToken} />
                                            )}
                                    </InputGroupIcon>
                                    <InputGroupDropdown active={isPairTokenModalOpen}>
                                        <span onClick={() => togglePairModal()}>
                                            {pairToken && `${pairToken}`}&#9660;
                                        </span>
                                        {/*
                                        <DropdownPanel
                                            tokens={tokens || []}
                                            onChange={onBaseChange}
                                            getIcon={getIcon}
                                        />
                                        */}

                                    </InputGroupDropdown>
                                    <InputGroupArea>
                                        <input value={0} id="sourceInput" onChange={{}} placeholder="0.00" type="number" min="0" step="0.01" pattern="^\d+(?:\.\d{1,6})?$" />
                                    </InputGroupArea>
                                </InputGroup>
                            </TokenContainer>
                        </TokensContainer>
                        <SummaryContainer>
                            <div>Summary {width} Height : {height}</div>
                            <Summary
                                width={width}
                            >
                                hello
                            </Summary>
                        </SummaryContainer>
                        <ButtonContainer>
                            <Button
                                color={color}
                                isBackgroundLight={isBackgroundLight}
                                disabled={loading}
                            >
                                Convert
                            </Button>
                        </ButtonContainer>

                    </Fragment>
                }
            </ContainerDimensions>
        </Layout>
    )
}

export default TokenSwap;

const TokensContainer = styled.div`
    h4 {
        margin-bottom: 10px;
    }
    
    ${({ width }) => width >= 600 ?
        `
        display: flex;
        div {
            flex: 50%;
        }
        h4 {
            font-size: 32px;
            margin-bottom: 20px;
            
        }
    `
        : `
        div {
            :not(:first-child){
                margin-top: 10px;
            }
        }
    `
    }

`

const ButtonContainer = styled.div`
    padding-top: 20px;
    display: flex;
    padding-left: 40px;
    padding-right: 60px;
`;

const SummaryContainer = styled.div`
    padding-top: 20px;
    display: flex;
    padding-left: 40px;
    padding-right: 60px;
    flex-direction: column;

    div {
        margin-left: auto;
        margin-right: auto;
        max-width: 300px;
    }

`;

const TokenContainer = styled.div`
    padding-right: 20px;
    ${({ width }) => width < 600 &&
        `
        
    `
    }
`;

const Summary = styled.div`
    border: 1px solid #ddd;
    height: 100px;

    width: 100%;
    
    ${({width}) => width > 400 
    ?
    `
        padding: 10px;
        font-size: 16px;
        height: 150px;
    `
    :
    `
        
        padding: 10px;
        padding-top: 5px;
        font-size: 14px;
    `
    }

    
`;

const Button = styled.button`
    background-color: ${({ color }) => color};
    border: 0;
    margin-left: auto;
    margin-right: auto;
    height: 50px;
    max-width: 300px;
    font-size: 18px;
    width: 100%;
    opacity: ${({ disabled }) => disabled ? "0.6" : "1"};
    color: ${({ isBackgroundLight }) => isBackgroundLight ? "black" : "white"};
    :hover {
        opacity: 0.95;
    }
`;

const InputGroupIcon = styled.div`
    background:#eee;
    color: #777;
    padding: 8px;
`;

const InputGroup = styled.div`
    display: table;
    border-collapse: collapse;
    width:100%;
    
    div {
        display: table-cell;
        border: 1px solid #eee;
        vertical-align: middle;
        :last-child {
            border: 1px solid #ddd;
        }
    }

    input {
        border: 0;
        display: block;
        width: 100%;
        padding: 8px;
        text-align:right;
        outline: none;
    }

`;

const TokenLogo = styled.img`
    width : 34px;
    height : 32px; 
`


const InputGroupDropdown = styled.div`
    background:#eee;
    color: #777;
    padding: 0 12px;
    position: relative;
    display: inline-block;
    cursor: pointer;
    

    .dropdown-content {
        display: none;
        position: absolute;
        background-color: #f9f9f9;
        min-width: 220px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
        height: 250px;
        overflow-y: scroll;
        padding-left: 10px;
        padding-right: 10px;
        

        a {
            color: black;
            padding: 12px 16px;
            text-decoration: none;
            display: block;
            :hover {
                background-color: #f1f1f1
            }

        }

        table {
            width: 100%;
        }
    
        th, td {
            padding-top: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ddd;
        }

    }

    ${props => props.active && (
        `
        .dropdown-content {
            display: block;
        }
        `
    )}

`

const InputGroupArea = styled.div`
    width:100%;
`;