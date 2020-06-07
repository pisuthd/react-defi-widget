import React, { Component, useCallback, Fragment, useState, useEffect, useMemo } from 'react';
import ContainerDimensions from 'react-container-dimensions'
import styled from 'styled-components';
import useTheme from "../../hooks/theme"
import { useLiquidityPool } from "../../hooks/liquidityPool";
import { COLORS } from "../../constants";
import Layout from "./layout";
import { getIcon } from "../../utils/token";
import { hexIsLight } from "../../utils/conversion";

const StakeLiquidity = ({
    web3ReactContext,
    color = COLORS.primary,
    poolSymbol
}) => {

    const { loading, tokens, setCurrentPool } = useLiquidityPool(web3ReactContext)

    useMemo(() => {
        setCurrentPool(poolSymbol);
    }, [poolSymbol])

    const isBackgroundLight = hexIsLight(color);

    console.log("tokens -- >", tokens)

    return (
        <Layout>
            <ContainerDimensions>
                {({ width, height }) =>
                    <Fragment>
                        <Wrapper
                            width={width}
                            height={height}
                        >
                            <h4>{poolSymbol}</h4>
                            <TokensContainer
                                width={width}
                                height={height}
                                totalTokens={tokens.length}
                            >
                                {tokens.map((token, index) =>
                                    <TokenContainer key={index}>
                                        <InputGroup>
                                            <InputGroupIcon>
                                                <TokenLogo src={getIcon(token.symbol)} alt={token.symbol} />
                                            </InputGroupIcon>
                                            <InputGroupDropdown>
                                                {`${token.symbol}`}
                                            </InputGroupDropdown>
                                            <InputGroupArea>
                                                <input value={0} id="sourceInput" onChange={{}} placeholder="0.00" type="number" min="0" step="0.01" pattern="^\d+(?:\.\d{1,6})?$" />
                                            </InputGroupArea>
                                        </InputGroup>
                                    </TokenContainer>)}
                            </TokensContainer>
                            <SummaryContainer>
                                <div>Summary{width} Height : {height}</div>
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
                        </Wrapper>
                    </Fragment>
                }
            </ContainerDimensions>
        </Layout>

    )
}

export default StakeLiquidity;

const Wrapper = styled.div`
    h4 {
        margin-bottom: 10px;
    }

    display: flex;
    flex-direction: column;

    ${({ width }) => width >= 600 ?
        `
        
            h4 {
                font-size: 32px;
                margin-bottom: 20px;
                
            }
        `
        :
        `
            
        `
    }
`;

const TokensContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: auto;
    margin-right: auto;
    
    div {
        margin-top: 5px;
        margin-right: 10px;
    }

    ${({ width, totalTokens }) => width >= 600 &&
        `
            flex-direction: row;
            flex-wrap: ${totalTokens > 2 ? "wrap" : "nowrap"};
            div {
                width: ${totalTokens > 2 ? "45%" : "100%"};
                margin-right: 20px;
            }
    `}

    ${({ width, totalTokens }) => width >= 800 &&
        `
            flex-direction: row;
            flex-wrap: ${totalTokens > 3 ? "wrap" : "nowrap"};
            div {
                width: ${totalTokens > 3 ? "30%" : "100%"};
                margin-right: 10px;
            }
    `}

    ${({ width, totalTokens }) => (width >= 800) && (totalTokens === 3) &&
        `
            div {
                width: 250px;
                margin-right: 10px;
            }

            input {
                width: 150px;
            }
    `}

    

`;

const TokenContainer = styled.div`
    padding-right: 20px;
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
    padding-right: 15px;

`

const ButtonContainer = styled.div`
    padding-top: 20px;
    display: flex;
    padding-left: 40px;
    padding-right: 60px;
`;


const Summary = styled.div`
    border: 1px solid #ddd;
    height: 100px;

    width: 100%;
    
    
    
    ${({ width }) => width > 400
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
`;

const InputGroupArea = styled.div`
    
`;