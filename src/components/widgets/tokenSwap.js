import React, { Component, useCallback, Fragment, useState, useEffect, useMemo } from 'react';
import ContainerDimensions from 'react-container-dimensions'
import useConvert, { getUsdRate, getPathFromSDK } from "../../hooks/convert"
import useInterval from "../../hooks/interval";
import { useModal } from "../../contexts/modal";
import Layout from "./layout";
import { hexIsLight } from "../../utils/conversion";
import { COLORS } from "../../constants";
import styled from 'styled-components';
import { getIcon } from "../../utils/token";
import { toFixed } from "../../utils/conversion";
import SearchIcon from "../../../assets/search.svg";
import { InsufficientAmount } from "./components/ui/alert"
import { SummaryHeadline, Summary, SummaryContainer, Row, Column } from "./components/ui/common";
// import loadingIcon from "../../../assets/loading.gif"

const TokenSwap = ({
    web3ReactContext,
    color = COLORS.primary,
    defaultBaseToken = "ETH",
    defaultPairToken = "BNT"
}) => {

    const { 
        tokens, 
        loading, 
        getETHBalance, 
        getTokenBalance,
        parseToken,
        getTokenDecimal,
        getFee
    } = useConvert(web3ReactContext);

    const { showProcessingModal } = useModal();

    const [isBaseTokenModalOpen, setBaseTokenModal] = useState(false);
    const [isPairTokenModalOpen, setPairTokenModal] = useState(false);
    // const [loadingSummary, setLoadingSummary] = useState(false);

    const [baseBalance, setBaseBalance] = useState(0);

    const [baseToken, setBaseToken] = useState(baseToken);
    const [pairToken, setPairToken] = useState(pairToken);
    const [initialRate, setInitialRate] = useState(1);
    const [rate, setRate] = useState(1);
    const [path, setPath] = useState();
    const [baseTokenAmount, setBaseTokenAmount] = useState(0);
    const [pairTokenAmount, setPairTokenAmount] = useState(0);
    const [baseRates, setBaseRates] = useState(1);
    const [pairRates, setPairRates] = useState(1);
    const [fee, setFee] = useState(0);

    useEffect(() => {
        (async () => {
            if (baseToken) {
                const result = await getUsdRate(baseToken);
                setBaseRates(result);
            }

        })()
    }, [baseToken])

    useEffect(() => {
        (async () => {
            if (pairToken) {
                const result = await getUsdRate(pairToken);
                setPairRates(result);
            }

        })()
    }, [pairToken])

    useEffect(() => {
        setBaseToken(defaultBaseToken)
    }, [defaultBaseToken])

    useEffect(() => {
        setPairToken(defaultPairToken)
    }, [defaultPairToken])

    const toggleBaseModal = useCallback(() => {
        setBaseTokenModal(!isBaseTokenModalOpen);
    }, [isBaseTokenModalOpen]);

    const togglePairModal = useCallback(() => {
        setPairTokenModal(!isPairTokenModalOpen);
    }, [isPairTokenModalOpen]);

    const onBaseTokenChange = useCallback(({ symbol }) => {
        if (symbol === pairToken) {
            setBaseToken(pairToken)
            setPairToken(baseToken)
            setBaseTokenModal(false)
            return;
        }

        setBaseToken(symbol)
        setBaseTokenModal(false)

    }, [pairToken, baseToken])

    const onPairTokenChange = useCallback(({ symbol }) => {

        if (symbol === baseToken) {
            setBaseToken(pairToken)
            setPairToken(baseToken)
            setPairTokenModal(false)
            return;
        }

        setPairToken(symbol)
        setPairTokenModal(false)


    }, [baseToken, pairToken])

    const updateBalance = useCallback(async () => {
        if (baseToken && tokens.length > 0) {
            /*
            name: "Ether Token"
            symbol: "ETH"
            address: "0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315"
            */

            if (baseToken === "ETH") {
                const result = await getETHBalance();
                setBaseBalance(result)
                return;
            }

            const token = tokens.find(item => item.symbol === baseToken)
            const result = await getTokenBalance(token.address);
            setBaseBalance(result)
        }

    }, [tokens, baseToken])

    const updateRate = useCallback(async () => {

        if (baseToken && pairToken && tokens.length > 0) {
            const source = tokens.find(item => item.symbol === baseToken)
            const destination = tokens.find(item => item.symbol === pairToken)

            if (baseTokenAmount > 0 && baseTokenAmount > 1) {
                // const result = await getPathFromSDK(source.address, destination.address, `${baseTokenAmount}`);
                const results = await Promise.all([getPathFromSDK(source.address, destination.address, `${baseTokenAmount}`), getPathFromSDK(source.address, destination.address, "1")]);
                const result = results[0];
                const rate = result.rate;
                const path = result.path.map(item => item.blockchainId);
                const amount = (baseTokenAmount > 1) ? baseTokenAmount : 1;
                setPath(path);
                setRate(rate / amount)
                const initialRateResult = results[1];
                const initialRate = initialRateResult.rate;
                setInitialRate(initialRate)
                // console.log("rate / path / initialRate : ", rate / amount, path, initialRate)

            } else {
                const result = await getPathFromSDK(source.address, destination.address, `1`);
                const rate = result.rate;
                const path = result.path.map(item => item.blockchainId);
                const amount = (baseTokenAmount > 1) ? baseTokenAmount : 1;
                setPath(path);
                setRate(rate / amount)
                // console.log("rate / path : ", rate / amount, path)
            }


            /*
            setTimeout(() => {
                setLoadingSummary(false);
            }, 5000)
            */
        }

    }, [tokens, baseToken, pairToken, baseTokenAmount])

    useEffect(() => {
        if (baseToken && pairToken && tokens.length > 0) {
            // console.log("look for initial rate...");
            const onClose = showProcessingModal("Fetching rates...", "");
            const source = tokens.find(item => item.symbol === baseToken)
            const destination = tokens.find(item => item.symbol === pairToken)
            getPathFromSDK(source.address, destination.address, "1").then(
                result => {
                    const rate = result.rate;
                    
                    const path = result.path.map(item => item.blockchainId);
                    console.log("path --> ", path)
                    // ["0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315", "0xb1CD6e4153B2a390Cf00A6556b0fC1458C4A5533", "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C"]
                    setInitialRate(rate);
                    onClose();
                    updatePairTokenAmount(rate);
                    updateFee(  path);

                }
            )
        }

    }, [baseToken, pairToken, tokens])

    useInterval(updateBalance, 3000)
    useInterval(updateRate, 3000);

    const isBackgroundLight = hexIsLight(color);

    const handleChange = useCallback((e) => {
        e.preventDefault();

        const regexp = /^[0-9]*(\.[0-9]{0,8})?$/;

        if (e.target.id === 'sourceInput') {
            const value = regexp.test(e.target.value) ? (e.target.value) : baseTokenAmount;
            setBaseTokenAmount(value);
            const result = toFixed((Number(value) * Number(initialRate)), 6);
            setPairTokenAmount(Number(result));
        } else {
            const value = regexp.test(e.target.value) ? (e.target.value) : pairTokenAmount;
            setPairTokenAmount(value);
            const result = toFixed((Number(value) * Number(initialRate)), 6);
            setBaseTokenAmount(Number(result));
        }

        // setLoadingSummary(true);
    }, [baseTokenAmount, pairTokenAmount, initialRate])

    const updateFee = useCallback(async ( path) => {
        const result = await getFee(path );
        setFee(result);
    }, [web3ReactContext])

    const updatePairTokenAmount = useCallback((rate) => {
        const result = toFixed((Number(baseTokenAmount) * Number(rate)), 6);
        setPairTokenAmount(result);
    }, [baseTokenAmount])

    const slippageRate = useMemo(() => {
        try {
            return (Number((rate - initialRate) * 100 / initialRate)).toFixed(2);
        } catch (error) {
            return 0
        }
    }, [rate, initialRate])

    const finalAmount = useMemo(() => {
        return toFixed(Number(rate) * Number(baseTokenAmount), 6)
    }, [rate, baseTokenAmount])

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
                                        <DropdownPanel
                                            tokens={tokens || []}
                                            onChange={onBaseTokenChange}
                                        />
                                    </InputGroupDropdown>
                                    <InputGroupArea>
                                        <input value={baseTokenAmount} id="sourceInput" onChange={handleChange} placeholder="0.00" type="number" min="0" step="0.01" pattern="^\d+(?:\.\d{1,6})?$" />
                                    </InputGroupArea>
                                </InputGroup>
                                <Account
                                    width={width}
                                >
                                    <div>BALANCE : {toFixed(baseBalance, 9)}{` `}{baseToken}</div>
                                </Account>
                                { Number(baseTokenAmount) > Number(baseBalance) && 
                                <InsufficientAmount/>}
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
                                        <DropdownPanel
                                            tokens={tokens || []}
                                            onChange={onPairTokenChange}
                                        />
                                    </InputGroupDropdown>
                                    <InputGroupArea>
                                        <input value={pairTokenAmount} id="destinationInput" onChange={handleChange} placeholder="0.00" type="number" min="0" step="0.01" pattern="^\d+(?:\.\d{1,6})?$" />
                                    </InputGroupArea>
                                </InputGroup>
                                <Account
                                    width={width}
                                >
                                    <div>{`1 ${baseToken} = ${Number(initialRate).toFixed(6)} ${pairToken}`}</div>
                                </Account>
                            </TokenContainer>
                        </TokensContainer>
                        <SummaryContainer>
                            <SummaryHeadline
                                width={width}
                            >
                                SUMMARY
                                {/*
                                { loadingSummary && <img src={loadingIcon} width="14px" height="14px" style={{marginBottom: 3}} />}
                                */}
                            </SummaryHeadline>
                            <Summary
                                width={width}
                            >
                                {/*
                                <Row>
                                    <Column>
                                        <b>Amount</b>
                                    </Column>
                                    <Column>
                                        {baseTokenAmount}{` `}{baseToken}
                                    </Column>
                                </Row>
                                */}
                                <Row>
                                    <Column>
                                        <b>Slippage rates:</b>
                                        <div>
                                            {(baseTokenAmount === 0) || (rate === 1) ?
                                                <span>{"0.00"}</span>
                                                :
                                                <span>{slippageRate > 0 && "+"}{slippageRate}</span>
                                            }
                                        %
                                        </div>
                                    </Column>
                                    <Column>
                                        <b>Conversion fees:</b>
                                        <div>
                                            {toFixed(fee, 1)}%
                                        </div>
                                    </Column>
                                </Row>
                                <Row>
                                    <Column>
                                        <b>Final amount:</b>
                                        <div>
                                            {}{`${finalAmount}`}{pairToken}
                                        </div>
                                    </Column>
                                    <Column>
                                        <b>In USD:</b>
                                        <div>
                                            ${toFixed(Number(pairRates) * Number(finalAmount), 2)}
                                        </div>
                                    </Column>
                                </Row>
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

const DropdownPanel = ({ tokens, onChange }) => {
    const [filtered, setFiltered] = useState(tokens);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (tokens.length > 0) {
            if (searchTerm === "") {
                setFiltered(tokens);
            } else {
                setFiltered(tokens.filter((item) => item.symbol.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1))
            }
        }
    }, [tokens, searchTerm])

    const handleSearchTerm = useCallback(async (e) => {
        e.preventDefault();
        setSearchTerm(e.target.value);
    }, [tokens])

    if (tokens.length === 0) {
        return (
            <Dropdown>Loading...</Dropdown>
        )
    }

    return (
        <Dropdown>
            <table>
                <tbody>
                    <SearchPanel>
                        <td width="25%">
                            <img src={SearchIcon} width="28px" />
                        </td>
                        <td>
                            <input value={searchTerm} onChange={handleSearchTerm} placeholder="Enter Symbol" type="text" />
                        </td>
                    </SearchPanel>
                    {filtered.map((item, index) => {
                        return (
                            <tr onClick={() => onChange(item)} key={index}>
                                <td width="25%">
                                    <TokenLogo src={getIcon(item.symbol)} alt={item.symbol} />
                                </td>
                                <td>
                                    {item.symbol}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </Dropdown>
    )
}


const SearchPanel = styled.tr`
    td {
        font-size: 14px;

        :first-child {
            text-align: center;
        }

        :last-child {
            padding-top: 4px;
            padding-bottom: 4px;
            input {
                border: 0;
                display: block;
                width: 100%;
                padding: 8px;
                text-align:left;
                outline: 1px solid #eee;
            }
        }
    }
`;



const Account = styled.div`
    display: flex;
    ${({ width }) => width >= 400 && `
        margin-top: 5px;
    `}
     
    font-size: ${({ width }) => width >= 400 ? "12px" : "10px"};
    font-weight: 500;

    div {
        flex: 50%;
    }

`;

const Dropdown = styled.div`
    display: block;
    position: absolute;
    display: none;
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


`;


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
    padding-left: 0px;
    padding-right: 10px;
`;


const TokenContainer = styled.div`
    padding-right: 20px;
    ${({ width }) => width < 600 &&
        `
        
    `
    }
`;


const Button = styled.button`
    background-color: ${({ color }) => color};
    border: 0;
    margin-left: auto;
    margin-right: auto;
    height: 50px;
    max-width: 380px;
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
    

    div {
        display: none;
        
    }

    ${props => props.active && (
        `
        div {
            display: block;
        }
        `
    )}

`

const InputGroupArea = styled.div`
    width:100%;
`;