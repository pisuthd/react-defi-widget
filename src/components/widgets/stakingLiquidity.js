import React, { Component, useCallback, Fragment, useState, useEffect, useMemo } from 'react';
import ContainerDimensions from 'react-container-dimensions'
import styled from 'styled-components';
import useTheme from "../../hooks/theme"
import useInterval from "../../hooks/interval";
import { toFixed } from "../../utils/conversion";
import { useLiquidityPool } from "../../hooks/liquidityPool";
import { COLORS } from "../../constants";
import Layout from "./layout";
import { getIcon } from "../../utils/token";
import { hexIsLight } from "../../utils/conversion";
import { InsufficientAmount } from "./components/ui/alert"
import { SummaryHeadline, Summary, SummaryContainer, Row, Column } from "./components/ui/common";

const ACTION = {
    ADD_LIQUIDITY: "Add Liquidity",
    REMOVE_LIQUIDITY: "Remove Liquidity"
}

const StakeLiquidity = ({
    web3ReactContext,
    networkId = 1,
    color = COLORS.primary,
    poolSymbol
}) => {

    const {
        loading,
        tokens,
        setCurrentPool,
        poolData,
        getTokenBalance,
        getETHBalance
    } = useLiquidityPool(web3ReactContext);

    const [dropdownActive, setDropdownActive] = useState(false);
    const [actionType, setActionType] = useState(ACTION.ADD_LIQUIDITY);
    const [balances, setBalances] = useState({});
    const [amounts, setAmounts] = useState({});

    useMemo(() => {
        setCurrentPool(poolSymbol);
        setAmounts({});
    }, [poolSymbol])

    const networkName = (id) => {
        if (id === 1) {
            return "Mainnet"
        }
        else if (id === 3) {
            return "Ropsten"
        } else {
            return "Unknown"
        }
    }

    const totalLiquidity = useMemo(() => {
        const total = tokens.reduce((prev, item) => {
            if (item.balanceInUsd) {
                prev += item.balanceInUsd;
            }
            return prev;
        }, 0)
        return total;
    }, [tokens])

    const ratio = useMemo(() => {
        const ratio = tokens.reduce((prev, item) => {
            let reserveRatio;
            if (prev === "") {
                reserveRatio = `${Math.ceil(item.ratio * 100)}`;
            } else {
                reserveRatio = prev + `/${Math.ceil(item.ratio * 100)}`
            }
            return reserveRatio;
        }, "")
        return ratio;
    }, [tokens])

    const poolTokenAmount = useMemo(() => {
        let amount = 0;
        const symbols = Object.keys(amounts);
        for (let symbol of symbols) {
            const { ratio, balance } = tokens.find(item => item.symbol === symbol);
            const basePercentage = (100 * Number(amounts[symbol]) / (Number(balance) * ratio));
            const total = (basePercentage * (ratio * poolData.totalSupply)) / 100
            amount += Number(total * ratio);
        }

        return amount;

    }, [amounts, poolData, tokens])

    const updateBalance = useCallback(async () => {
        if (tokens.length > 0) {
            let balance = {};
            for (let token of tokens) {
                if (token.symbol === "ETH") {
                    const result = await getETHBalance();
                    balance[token.symbol] = result;
                } else {
                    const result = await getTokenBalance(token.address);
                    balance[token.symbol] = result;
                }
            }
            setBalances(balance);
        }
    }, [tokens])

    const handleChange = useCallback((symbol, amount) => {
        if (!tokens.find((item) => item.symbol === symbol)) {
            return;
        }
        if (Number(poolData.totalSupply) <= 0) {
            return;
        }

        const regexp = /^[0-9]*(\.[0-9]{0,8})?$/;
        const previousValue = amounts[symbol] ? amounts[symbol] : 0;
        const value = regexp.test(amount) ? (amount) : previousValue;
        const { ratio, balance } = tokens.find(item => item.symbol === symbol);
        const basePercentage = (100 * Number(value) / (Number(balance) * ratio))
        let others = {};
        const filtered = tokens.filter(item => item.symbol !== symbol)
        for (let token of filtered) {
            const tokenAmount = (basePercentage * (token.ratio * token.balance)) / 100
            others[token.symbol] = toFixed(tokenAmount, 9)
        }

        setAmounts({
            ...others,
            [symbol]: value
        })
    }, [amounts, tokens, poolData])

    // console.log("tokens : ", tokens, loading)
    // console.log("pool data --> ", poolData, amounts)
    useInterval(updateBalance, 3000)
    const isBackgroundLight = hexIsLight(color);

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
                                {tokens.map((token, index) => {
                                    const tokenAmount = amounts[token.symbol] || 0;
                                    const balance = balances[token.symbol] ? toFixed(Number(balances[token.symbol]), 4) : 0;

                                    return (
                                        <Fragment>
                                            <TokenContainer key={index}>
                                                <InputGroup>
                                                    <InputGroupIcon>
                                                        <TokenLogo src={getIcon(token.symbol)} alt={token.symbol} />
                                                    </InputGroupIcon>
                                                    <InputGroupDropdown>
                                                        {`${token.symbol}`}
                                                    </InputGroupDropdown>
                                                    <InputGroupArea>
                                                        <input value={tokenAmount} id={`sourceInput-${token.symbol}`} onChange={(e) => handleChange(token.symbol, e.target.value)} placeholder="0.00" type="number" min="0" step="0.01" pattern="^\d+(?:\.\d{1,6})?$" />
                                                    </InputGroupArea>
                                                </InputGroup>
                                                <InputBottom
                                                    width={width}
                                                >
                                                    <div>
                                                        BALANCE : {balance}{` `}{token.symbol}
                                                    </div>
                                                    <div>
                                                        {0}{` `}/{` `}{Number(token.balance).toFixed(2)}{` `}{token.symbol}
                                                    </div>
                                                </InputBottom>
                                                {Number(tokenAmount) > Number(balance) &&
                                                    <InsufficientAmount />
                                                }

                                            </TokenContainer>
                                        </Fragment>
                                    )
                                }
                                )}
                                {web3ReactContext.networkId && (networkId !== web3ReactContext.networkId) &&
                                    <div className="text-center">
                                        <p style={{ color: "red" }}>You're not connected to {networkName(networkId)}</p>
                                    </div>
                                }
                            </TokensContainer>
                            <div
                                style={{
                                    display: "flex",
                                    fontSize: "12px",
                                    paddingTop: 10,
                                }}
                            >
                                <div
                                    style={{ flex: "50%" }}
                                >
                                    <b>Ratio: </b>{ratio}
                                </div>
                                {/*
                                <div
                                    style={{ flex: "40%", textAlign: "center" }}
                                >

                                    <b>Size: </b>${Math.floor(totalLiquidity)}
                                </div>
                                */}
                                <div
                                    style={{ flex: "50%", textAlign: "right" }}
                                >
                                    <b>Pool Fee: </b>{poolData.fee}%
                                </div>
                            </div>
                            <SummaryContainer>
                                <SummaryHeadline
                                    width={width}
                                    style={{ display: "none" }}
                                >
                                    POOL INFORMATION
                                </SummaryHeadline>

                                <Summary
                                    width={width}
                                    style={{ display: "none" }}
                                >
                                    {/*
                                    <Row>
                                        
                                        <Column
                                            style={{ flex: "70%" }}
                                        >
                                            <b>My stake / Total supply</b>
                                            <div>
                                                {0}{` `}/{` `}{poolData.totalSupply ? Number(poolData.totalSupply).toLocaleString() : "0"}{` `}{poolSymbol}
                                            </div>
                                        </Column>
                                        
                                        <Column
                                            style={{ flex: "60%" }}
                                        >
                                            <b>Pool's Version</b>

                                        </Column>

                                        <Column
                                            style={{ flex: "40%" }}
                                        >
                                            <b>Fees</b>
                                            <div>
                                                {poolData.fee}%
                                            </div>
                                        </Column>
                                    </Row>*/}
                                    {/*
                                    <Row>
                                        <Column>
                                            <b>Total liquidity</b>
                                            <div>
                                                ${totalLiquidity.toLocaleString()}
                                            </div>
                                        </Column>
                                        <Column>
                                            <b>Conversion fees</b>
                                            <div>
                                                {poolData.fee}%
                                            </div>

                                        </Column>
                                    </Row>
                                    */}
                                    {tokens.map((item, index) => {
                                        return (
                                            <Row key={index}>
                                                <Column
                                                    style={{ flex: "80%" }}
                                                >
                                                    <div>
                                                        <TokenLogo src={getIcon(item.symbol)} style={{ width: "18px", height: "18px", marginBottom: "2px" }} alt={item.symbol} />
                                                        {` `}
                                                        {Number(item.balance).toFixed(2)}{` `}{item.symbol}
                                                        {` `}

                                                    </div>
                                                </Column>
                                                <Column
                                                    style={{ flex: "20%" }}
                                                >
                                                    <div>
                                                        {Math.floor(Number(item.ratio * 100))}%
                                                    </div>
                                                </Column>
                                            </Row>
                                        )
                                    })

                                    }
                                </Summary>

                            </SummaryContainer>
                            <SummaryContainer>
                                <SummaryHeadline
                                    width={width}
                                >
                                    SUMMARY
                                </SummaryHeadline>
                                <Summary
                                    width={width}
                                >

                                    <Row>
                                        <Column
                                            style={{ flex: "50%" }}
                                        >
                                            <b>My stake</b>
                                            <div>
                                                {0}{` `}{poolSymbol}
                                            </div>
                                            <div>
                                                +{poolTokenAmount.toLocaleString()}{` `}{poolSymbol}
                                            </div>
                                            {poolData.totalSupply && totalLiquidity &&
                                                <div>
                                                    (+${ Number((  totalLiquidity/ poolData.totalSupply)*(poolTokenAmount)).toLocaleString() })
                                                </div>
                                            }

                                        </Column>
                                        <Column
                                            style={{ flex: "50%" }}
                                        >
                                            <b>Total supply</b>
                                            <div>
                                                {poolData.totalSupply ? Number(poolData.totalSupply).toLocaleString() : "0"}{` `}{poolSymbol}
                                            </div>
                                            <div>
                                                (${totalLiquidity.toLocaleString()})
                                            </div>
                                        </Column>
                                    </Row>
                                </Summary>
                            </SummaryContainer>

                            <ButtonContainer>
                                {/*
                                <Button
                                    color={color}
                                    isBackgroundLight={isBackgroundLight}
                                    disabled={loading}
                                >
                                    Add Liquidity
                                </Button>
                                */}
                                <ButtonGroup
                                    width={width}
                                    color={color}
                                    isBackgroundLight={isBackgroundLight}
                                >
                                    <button
                                        onClick={() => setDropdownActive(!dropdownActive)}
                                    >&#9660;</button>
                                    <button>{actionType}</button>

                                    <Dropdown active={dropdownActive}>
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td><a onClick={() => {
                                                        setActionType(ACTION.ADD_LIQUIDITY)
                                                        setDropdownActive(false)

                                                    }}>Add Liquidity</a></td>
                                                </tr>
                                                <tr>
                                                    <td><a onClick={() => {
                                                        setActionType(ACTION.REMOVE_LIQUIDITY)
                                                        setDropdownActive(false)
                                                    }}>Remove Liquidity</a></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </Dropdown>
                                </ButtonGroup>


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

const Dropdown = styled.div`
    display: ${({ active }) => active ? "block" : "none"};
    position: absolute;
    background-color: #f9f9f9;
    margin-left: 0px;
    margin-top: 0px;
    font-size: 15px;
    width: 150px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
    height: 80px;

    table {
        margin-left: 5px;
        margin-right: 5px;
        width: 100%;
    }

    tr {
        height: 40px;
        :not(:last-child) {
            border-bottom: 1px solid #ddd;
        }

         
    }

    th, td {
        padding: 10px;
        padding-top: 7px;
        padding-bottom: 7px;
    }

    a {
        cursor: pointer;

    }

`;

const InputBottom = styled.div`
    display: flex;
    ${({ width }) => width >= 400 && `
        margin-top: 5px;
    `}

    font-size: ${({ width }) => width >= 400 ? "12px" : "10px"};
    font-weight: 500;

    div {
        flex: 50%;
        :last-child {
            text-align: right;
        }
    }

`;

/*
const ButtonGroupOLD = styled.div`
 
    width: 100%;
     
    button {
        background-color: ${({ color }) => color};
        border: 0;
        height: 50px;
        font-size: ${({ width }) => width > 400 ? "18px" : "14px"};
        color: ${({ isBackgroundLight }) => isBackgroundLight ? "black" : "white"};
        opacity: ${({ disabled }) => disabled ? "0.6" : "1"};

        padding: 10px 24px;
        cursor: pointer;
        float: left;

        width: 50%;

        :not(:last-child) {
            border-right: none;
        }

        
        :hover {
            opacity: 0.95;
        }

        :after {
            content: "";
            clear: both;
            display: table;
        }

    }


`;
*/

const ButtonGroup = styled.div`
    width: 100%;
    max-width: 380px;
    margin-left: auto;
    margin-right: auto;

    button {
        background-color: ${({ color }) => color};
        border: 0;
        height: 50px;
        font-size: ${({ width }) => width > 400 ? "18px" : "16px"};
        color: ${({ isBackgroundLight }) => isBackgroundLight ? "black" : "white"};
        opacity: ${({ disabled }) => disabled ? "0.6" : "1"};
        padding: 10px 24px;
        cursor: pointer;
        :hover {
            opacity: 0.95;
        }
        width: 80%;
        :first-child {
            width: 20%;
        }
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
                margin-right: ${totalTokens > 2 ? "20px" : "10px"};
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
    align-items: center;
    padding-left: 0px;
    padding-right: 10px;
`;



const InputGroupArea = styled.div`
    
`;