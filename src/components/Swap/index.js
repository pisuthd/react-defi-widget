import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useDefi } from "../../contexts/defi";

const SwapPage = (props) => {

    const { width, height, web3context } = props;
    const { loading, getTokenName, bancorConvert, listConversionTokens, getERC20Balance, generatePath, calculateRateFromPaths } = useDefi(web3context);
    const [availableTokens, setAvailableTokens] = useState([])
    const [path, setPath] = useState([]);
    const [internalLoading, setInternalLoading] = useState(false);
    const [source, setSource] = useState("");
    const [sourceAmount, setSourceAmount] = useState(0);
    const [sourceTotal, setSourceTotal] = useState(0);
    const [destination, setDestination] = useState("");
    const [destinationTotal, setDestinationTotal] = useState(0);
    const [destinationAmount, setDestinationAmount] = useState(0);
    const [ converting, setConverting ] = useState(false);
    const [convertPairs, setConvertPairs] = useState([]);


    useEffect(() => {



        if (!loading) {
            setInternalLoading(true);
            listConversionTokens().then(
                tokenAddresses => {


                    const checkBalance = (address, updateTotal) => {


                        getERC20Balance(address).then(
                            balance => {
                                console.log("balance : ", balance)
                                updateTotal(Number(balance))
                            }
                        ).catch(
                            error => {
                                console.log("error :", error)
                                updateTotal(0)
                            }
                        )

                    }

                    Promise.all(tokenAddresses.map(token => getTokenName(token))).then(
                        names => {
                            const tokens = names.map((tokenName, index) => { return { symbol: tokenName || undefined, address: tokenAddresses[index] || undefined } }).filter(item => item.symbol !== undefined)
                            console.log("TOKENS : ", tokens)
                            setAvailableTokens(tokens);
                            if (tokens[0]) {
                                setSource(tokens[0].symbol)
                                checkBalance(tokens[0].address, setSourceTotal)
                            }
                            if (tokens[1]) {
                                setDestination(tokens[1].symbol)
                                checkBalance(tokens[1].address, setDestinationTotal)
                            }
                            setInternalLoading(false);
                        }
                    )


                }
            )
        }

    }, [loading])

    const [timer, setTimer ] = useState();

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(new Date().getTime());
        }, 5000);

        return () => clearInterval(interval);
    }, [])

    useEffect(() => {
        if (timer) {
            updateRate();
        }
    }, [timer])

    const updateRate = useCallback(() => {
        console.log("Update rate...", source, destination, sourceAmount);

        if (source && destination && Number(sourceAmount) > 0) {
            updateSummary(source, destination, sourceAmount)
        }


    },[source, destination, sourceAmount])

    const handleTokenChange = useCallback((e) => {

        const checkBalance = (symbol, updateTotal) => {

            const t = availableTokens.find(item => item.symbol === symbol)

            getERC20Balance(t.address).then(
                balance => {
                    console.log("balance : ", balance)
                    updateTotal(Number(balance))
                }
            ).catch(
                error => {
                    console.log("error :", error)
                    updateTotal(0)
                }
            )

        }

        if (e.target.id === "sourceToken") {
            setSource(e.target.value);
            checkBalance(e.target.value, setSourceTotal)
            // updateSummary(e.target.value, destination , sourceAmount)

        } else if (e.target.id === "destinationToken") {
            setDestination(e.target.value);
            checkBalance(e.target.value, setDestinationTotal)
            // updateSummary(source, e.target.value, sourceAmount )

        }
    }, [availableTokens, destination, source, sourceAmount])


    const handleAmount = useCallback((e) => {
        if (e.target.id === "sourceAmount") {
            setSourceAmount(Number(e.target.value));
            // updateSummary(source, destination, Number(e.target.value) );
        } else if (e.target.id === "destinationAmount") {
            setDestinationAmount(Number(e.target.value))
        }
    }, [source, destination])

    const updateSummary = useCallback((source, destination, amount) => {


        if (Number(amount) === 0) return;
        const sourceAddress = availableTokens.find(item => item.symbol === source).address
        const destinationAddress = availableTokens.find(item => item.symbol === destination).address

        console.log("sourceAddress /  destinationAddress : ", sourceAddress, destinationAddress)
        // setInternalLoading(true)
        generatePath(sourceAddress, destinationAddress).then(
            path => {
                console.log("PATH : ", path)
                setPath(path);
                calculateRateFromPaths(path, amount).then(
                    ({amount, convertPairs }) => {
                        console.log("RATE : ", amount,convertPairs )
                        setDestinationAmount(Number(amount))
                        setConvertPairs(convertPairs);
                    }
                )
            }
        ).catch(error => {
            console.log("error : ", error)
        })

    }, [availableTokens])

    const onConvert = useCallback((e) => {
        e.preventDefault();
        console.log('convert...', path, sourceAmount, destinationAmount)
        if (path.length > 0 && convertPairs.length > 0 && Number(sourceAmount) > 0) {
            setConverting(true);
            const converterAddress = convertPairs[0].converterBlockchainId;
            const fromToken = convertPairs[0].fromToken;

            bancorConvert( converterAddress, path,  sourceAmount, destinationAmount , fromToken ).then(
                result => {
                    console.log("result : ", result)
                }
            ).catch(error => {
                console.log("error : ", error)
            }).finally(
                () => {
                    setConverting(false)
                }
                
            )
        }   


    },[path, sourceAmount , path, destinationAmount,  convertPairs, availableTokens])

    return (
        <div>
            {loading
                ?
                <p>
                    Verifying DeFi smart contracts...
                </p>
                :
                <Wrapper width={width}>
                    <Header>
                        <div className="text-center">
                            <h6> Token Conversion</h6>
                        </div>


                    </Header>
                    <Body width={width}>

                        <Column>
                            <div>
                                <h3>Pay{` `}


                                </h3>
                                <TokenInput>
                                    <TokenAmount>
                                        <input id="sourceAmount" placeholder="0.00" type="number" min="0" value={sourceAmount} onChange={handleAmount} step="0.01" pattern="^\d+(?:\.\d{1,2})?$" />
                                    </TokenAmount>
                                    <TokenList>
                                        <select onChange={handleTokenChange} value={source} id="sourceToken" name="sourceToken">
                                            {availableTokens.map((item, index) => {

                                                const symbol = item.symbol || "";
                                                return (
                                                    <option
                                                        key={index}
                                                        value={symbol}
                                                        disabled={symbol === destination}
                                                    >{symbol}</option>
                                                )
                                            })}
                                        </select>
                                    </TokenList>

                                </TokenInput>
                                <TokenAvailable>
                                    <p>Available{` `}:{` `}{sourceTotal.toFixed(8)}{` `}{source}</p>
                                </TokenAvailable>


                            </div>
                            <div>
                                <h3>Receive{` `}

                                </h3>
                                <TokenInput>
                                    <TokenAmount>
                                        <input disabled={true} id="destinationAmount" placeholder="0.00" type="number" min="0" onChange={handleAmount} value={destinationAmount} step="0.01" pattern="^\d+(?:\.\d{1,2})?$" />
                                    </TokenAmount>
                                    <TokenList>
                                        <select onChange={handleTokenChange} value={destination} id="destinationToken" name="destinationToken">
                                            {availableTokens.map((item, index) => {


                                                const symbol = item.symbol || "";
                                                return (
                                                    <option
                                                        key={index}
                                                        value={symbol || ""}
                                                        disabled={symbol === source}
                                                    >{symbol}</option>
                                                )
                                            })}
                                        </select>
                                    </TokenList>

                                </TokenInput>
                                <TokenAvailable>
                                    <p>Available{` `}:{` `}{destinationTotal.toFixed(8)}{` `}{destination}</p>
                                </TokenAvailable>

                            </div>
                        </Column>
                        <Column>
                            <SummaryCard>
                                <table >
                                    <thead>
                                        <tr>
                                            <th width="40%">Summary</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Amount</td>
                                            <td style={{ textAlign: "right" }}>$0.00</td>

                                        </tr>
                                        <tr>
                                            <td>Fee</td>
                                            <td style={{ textAlign: "right" }}>$0.00</td>

                                        </tr>
                                        <tr>
                                            <td>Total Cost</td>
                                            <td style={{ textAlign: "right" }}>$0.00</td>

                                        </tr>

                                    </tbody>
                                </table>
                                <div style={{ paddingTop: "10px" }} className="text-center">
                                    <Button loading={internalLoading || converting || Number(destinationAmount) <= 0} onClick={onConvert}>
                                        Convert
                                    </Button>
                                </div>
                            </SummaryCard>
                        </Column>
                    </Body>
                </Wrapper>
            }
        </div>
    )
}

export default SwapPage;


const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: ${props => props.width - 100}px;


`;


const Body = styled.div`
    
    display: grid;
    grid-gap: 10px;
    grid-template-columns: ${props => `${props.width - 450}px`} 350px;
    

`;

const Header = styled.div`
  

    padding: 10px 20px 10px 20px;

    h6 {
        font-weight: 600;
        font-size: 14px;
    }

`;

const TokenInput = styled.div`
    display: flex;

`

const TokenAmount = styled.div`
    width : 70%;
`;

const TokenList = styled.div`
    width : 30%;
`

const TokenAvailable = styled.div`
    font-size: 12px;
    margin-top: 10px;
`;

const SummaryCard = styled.div`
    border: 1px solid rgba(0, 0, 0, 0.7);
    padding: 20px 10px 10px 10px;
    display: flex;
    flex-direction: column;
    height: 300px;
    border-radius: 5px;
    font-size: 16px;
    line-height: 30px;
`;

const Dropdown = styled.span`
    position: relative;
    display: inline-block;
    font-size: 12px;
    cursor: pointer;

    

    .dropdown-content {
        display: none;
        position: absolute;
        background-color: #f9f9f9;
        min-width: 160px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;

        a {
            color: black;
            padding: 12px 16px;
            text-decoration: none;
            display: block;
            :hover {
                background-color: #f1f1f1
            }

          }

     }

     :hover .dropdown-content {
        display: block;
    }

`;

const Row = styled.div`
    padding: 0;
    margin: 0;
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
`;

const Column = styled.div`
    padding: 20px;
    

    h5 {
        font-weight: 600;
    }

    input {
        width: 100%;
        height: 60px;
        padding: 16px 20px;
        border-radius: 4px;
        border: 1px solid rgba(0, 0, 0, 0.7);
        :disabled {
            background: white;
        }
    }

    select {
        width: 100%;
        padding: 16px 20px;
        height: 60px;
        margin-left: 2px;
        margin-right: 2px;
        border-radius: 4px;
        cursor: pointer;
        background-color: white;
        border: 1px solid rgba(0, 0, 0, 0.7);
    }

`;

const Button = styled.button`
    width: 100px;
    border: 1px solid transparent;
    border-radius: 5px;
    background-color:  blue;
    color: white;
    padding: 10px;
    ${props => props.loading && "opacity: 0.6;"}
    font-size: 16px;
    cursor: pointer;
    margin: 10px;
`;