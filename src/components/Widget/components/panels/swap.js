import React, { useCallback, useState, useEffect, Fragment } from 'react';

import styled from "styled-components";

import { useBancor, INITIAL_TOKENS, EXCLUDE_TOKENS } from "../../../../contexts/bancor";
import { getIcon, getDefaultTokenAddress } from "../../../../utils/token";



const SwapPanel = (props) => {

    const { web3ReactContext } = props;

    const [tokens, setTokens] = useState(INITIAL_TOKENS.map(token => [token, getDefaultTokenAddress(token)]));

    const { loading, listConversionTokens, getTokenBalance } = useBancor(web3ReactContext);

    const [source, setSource] = useState(tokens[0]);
    const [destination, setDestination] = useState(tokens[1]);

    const [sourceBalance , setSourceBalance ] = useState("0.0"); 

    useEffect(() => {

        (async () => {
            if (!loading) {

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
                    console.log("error : ", error);
                }

            }
        })()



    }, [loading])

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
        
        if (source[1]!=='' && !loading) {
            console.log("checking balance of : ", source[1]);
            (async () => {
                const result = await getTokenBalance(source[1]);
                setSourceBalance(result);
            })();
            
        }
    },[source, loading])

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
                        <input type="text" placeholder="0" />
                    </InputGroupArea>
                </InputGroup>
                <AccountSection>
                    <AccountLeft>
                        BALANCE {sourceBalance}
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
                        <input type="text" placeholder="0" />
                    </InputGroupArea>
                </InputGroup>
                <AccountSection>
                    <AccountLeft>

                    </AccountLeft>
                    <AccountRight>
                        RATE {tokens.length}
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