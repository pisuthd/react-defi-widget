import React, { useCallback, useState, useEffect, Fragment } from 'react';

import styled from "styled-components";

import { useBancor, INITIAL_TOKENS, EXCLUDE_TOKENS } from "../../../../contexts/bancor";
import { getIcon, getDefaultTokenAddress } from "../../../../utils/token";

import loadingIcon from "../../../../../assets/loading.gif"


const SwapPanel = (props) => {

    const { web3ReactContext, handleProcessing, clickCount } = props;

    const [tokens, setTokens] = useState(INITIAL_TOKENS.map(token => [token, getDefaultTokenAddress(token)]));

    const [liquidityPools, setLiquidityPools] = useState([]);

    const { loading, parseToken, listConversionTokens, getRate, getTokenDecimal, listLiquidityPools, getTokenBalance, generatePath } = useBancor(web3ReactContext);

    const [source, setSource] = useState(tokens[0]);
    const [destination, setDestination] = useState(tokens[1]);

    const [sourceBalance, setSourceBalance] = useState("0.0");
    const [isLoadingBalance, setLoadingBalance] = useState(true);
    const [rate, setRate] = useState("1");
    const [isLoadingRate, setLoadingRate] = useState(true);

    const [sourceAmount, setSourceAmount] = useState(0);
    const [destinationAmount, setDestinationAmount] = useState(0);

    

    useEffect(() => {
        // Handle click event on Parent Component
        console.log("do something...")
    }, [clickCount])

    useEffect(() => {

        (async () => {
            if (!loading) {
                // List all available tokens to trade
                try {
                    const available = await listConversionTokens();
                    const finalList = INITIAL_TOKENS.map(name => available.find(item => item[0] === name));

                    for (let token of available) {
                        if ((finalList.find(item => item[0] === token[0]) === undefined) && (token[0] !== "NAME_ERROR") && (EXCLUDE_TOKENS.indexOf(token[0]) === -1)) {
                            finalList.push(token);
                        }
                    }
                    console.log("final token list : ", finalList);
                    setTokens(finalList);
                } catch (error) {
                    console.log("list tokens error : ", error);
                }
                // List all liquidity pools
                const poolList = await listLiquidityPools();
                setLiquidityPools(poolList);

            }
        })()



    }, [loading])

    useEffect(() => {

        const result = (Number(sourceAmount)*Number(rate)).toFixed(6);

        setDestinationAmount(result);

    }, [sourceAmount, rate])

    const onSourceChange = useCallback((newSource) => {

        if (newSource[0] === destination[0]) {
            return;
        }

        setSource(newSource);

    }, [destination])


    const onDestinationChange = useCallback((newDestination) => {

        if (newDestination[0] === source[0]) {
            return;
        }

        setDestination(newDestination);

    }, [source])

    useEffect(() => {

        if (!isLoadingBalance && !isLoadingRate) {
            handleProcessing(false)
        } else if (isLoadingBalance || isLoadingRate) {
            handleProcessing(true)
        }  

    },[isLoadingBalance, isLoadingRate])

    useEffect(() => {

        if (source[1] !== '' && !loading) {
            console.log("checking balance of : ", source[1]);
            (async () => {
                setLoadingBalance(true);

                try {
                    const result = await getTokenBalance(source[1]);
                    setSourceBalance(result);
                } catch (error) {
                    console.log("loading rate error  ;", error);
                }


                setLoadingBalance(false);
            })();

        }
    }, [source, loading])

    useEffect(() => {

        if (source[1] !== '' && destination[1] !== '' && !loading && liquidityPools.length > 0) {
            console.log(`looking for an exchange rate on the pair ${source[0]}/${destination[0]} `);
            (async () => {
                setLoadingRate(true);
                try {
                    const path = await generatePath(source[1], destination[1], liquidityPools);
                    // console.log("path : ", path);
                    const sourceDecimal = await getTokenDecimal(source[1]);
                    const rate = await getRate(path, "1", sourceDecimal);
                    const destinationDecimal = await getTokenDecimal(destination[1]);
                    const finalRate = parseToken(rate, destinationDecimal);
                    setRate(`${Number(finalRate).toFixed(6)}`);

                } catch (error) {
                    console.log("Find a shortest path error : ", error);
                }
                setLoadingRate(false);

            })();
        }

    }, [source, destination, loading, liquidityPools])

    const handleChange = useCallback((e) => {
        e.preventDefault();
        setSourceAmount(e.target.value);
    }, [])

    return (
        <Fragment>
            <Column>
                <h3>Pay</h3>

                <InputGroup>
                    <InputGroupIcon>
                        <TokenLogo src={getIcon(source[0])} alt={source[0]} />
                    </InputGroupIcon>
                    <InputGroupDropdown>

                        <span>
                            {source[0]}&#9660;
                        </span>
                        <div className="dropdown-content">
                            <table>
                                <tbody>
                                    {tokens.map((item, index) => {
                                        return (
                                            <tr onClick={() => onSourceChange(item)} key={index}>
                                                <td width="35%">
                                                    <TokenLogo src={getIcon(item[0])} alt={item[0]} />
                                                </td>
                                                <td>
                                                    {item[0]}
                                                </td>
                                            </tr>
                                        )
                                    })}


                                </tbody>
                            </table>
                        </div>
                    </InputGroupDropdown>
                    <InputGroupArea>
                        <input value={sourceAmount} onChange={handleChange} placeholder="0.00" type="number" min="0" step="0.01" pattern="^\d+(?:\.\d{1,2})?$" />
                    </InputGroupArea>
                </InputGroup>
                <AccountSection>
                    <AccountLeft>
                        BALANCE {sourceBalance}{` `}{isLoadingBalance && (<img src={loadingIcon} width="12px" height="12px" />)}
                    </AccountLeft>
                    <AccountRight>

                    </AccountRight>
                </AccountSection>
            </Column>
            <Column>
                <h3>Receive</h3>


                <InputGroup>
                    <InputGroupIcon>
                        <TokenLogo src={getIcon(destination[0])} alt={destination[0]} />
                    </InputGroupIcon>
                    <InputGroupDropdown>
                        <span>{destination[0]}&#9660;</span>
                        <div className="dropdown-content">
                            <table>
                                <tbody>
                                    {tokens.map((item, index) => {
                                        return (
                                            <tr onClick={() => onDestinationChange(item)} key={index}>
                                                <td width="35%">
                                                    <TokenLogo src={getIcon(item[0])} alt={item[0]} />
                                                </td>
                                                <td>
                                                    {item[0]}
                                                </td>
                                            </tr>
                                        )
                                    })}


                                </tbody>
                            </table>
                        </div>
                    </InputGroupDropdown>
                    <InputGroupArea>
                        <input value={destinationAmount} type="text" placeholder="0" />
                    </InputGroupArea>
                </InputGroup>
                <AccountSection>
                    <AccountLeft>

                    </AccountLeft>
                    <AccountRight>
                        {isLoadingRate && (<img src={loadingIcon} width="12px" height="12px" />)}{` `}{`1 ${source[0].toUpperCase()} = ${rate} ${destination[0].toUpperCase()}`}
                    </AccountRight>
                </AccountSection>
            </Column>
        </Fragment>
    )
}

export default SwapPanel;

const Column = styled.div`
    h3 {
        font-size: 20px;
        font-weight: 500;
    }
`;

const AccountSection = styled.div`
    display: flex;
`;

const AccountLeft = styled.div`
    margin-top: 8px;
    flex: 50%;
    font-size: 10px;
    font-weight: 500;
`;

const AccountRight = styled(AccountLeft)`
    text-align: right;
    
    
    
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
        min-width: 200px;
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

    :hover .dropdown-content {
        display: block;
        
    }

`
const InputGroupIcon = styled.div`
    background:#eee;
    color: #777;
    padding: 8px;
`;

const InputGroupArea = styled.div`
    width:100%;
`;

const InputArea = styled.div`

`;


const TokenLogo = styled.img`
    width : 34px;
    height : 32px; 
`