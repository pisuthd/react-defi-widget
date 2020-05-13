import React, { useCallback, useState, useEffect, Fragment } from 'react';
import styled from "styled-components";
import PropTypes from 'prop-types';

import { useBancor, INITIAL_TOKENS, ROPSTEN_TOKENS, EXCLUDE_TOKENS } from "../../../../contexts/bancor";
import { getIcon, getDefaultTokenAddress, getRopstenTokenAddress } from "../../../../utils/token";
import { getAddress, parseFee } from "../../../../utils/account";
import { HEADLINES, PAGES, SLIPPAGE_RATE } from "../../../../constants";
import { useModal } from "../../../../contexts/modal";
import loadingIcon from "../../../../../assets/loading.gif"
import SearchIcon from "../../../../../assets/search.svg";
import { toFixed } from "../../../../utils/conversion";


/*
    Token Swap Panel
*/

const SwapPanel = (props) => {

    const {
        web3ReactContext,
        clickCount,
        baseCurrency,
        pairCurrency,
        affiliateAccount,
        affiliateFee,
        width
    } = props;
    const { showProcessingModal , showErorMessageModal } = useModal();
    const defaultAffiliateAccount = affiliateAccount ? getAddress(affiliateAccount) : "0x0000000000000000000000000000000000000000";
    const defaultAffiliateFee = affiliateFee ? parseFee(affiliateFee) : "0";
    const networkId = web3ReactContext.networkId;

    const [tokens, setTokens] = useState();
    const [resetRate, setResetRate ] = useState(0);
    const [liquidityPools, setLiquidityPools] = useState([]);
    const [isBaseTokenModalOpen, setBaseTokenModal] = useState(false);
    const [isPairTokenModalOpen, setPairTokenModal] = useState(false);

    const {
        loading,
        parseToken,
        convert,
        listConversionTokens,
        getRate,
        getTokenDecimal,
        getETHBalance,
        listLiquidityPools,
        getLiquidityPool,
        getTokenName,
        getTokenBalance,
        generatePath,
        getConvertibleTokens
    } = useBancor(web3ReactContext);

    const [baseToken, setBaseToken] = useState();
    const [pairToken, setPairToken] = useState();
    const [sourceBalance, setSourceBalance] = useState("0.0");
    const [isLoadingBalance, setLoadingBalance] = useState(true);
    const [rate, setRate] = useState("1");
    const [fee, setFee] = useState(0);
    const [path, setPath] = useState([]);
    const [isLoadingRate, setLoadingRate] = useState(true);
    const [baseTokenAmount, setBaseTokenAmount] = useState(0);
    const [pairTokenAmount, setPairTokenAmount] = useState(0);

    useEffect(() => {
        // Handle click event from Parent Component
        onConvert();
    }, [clickCount])

    useEffect(() => {
        if (!loading) {
            (async () => {
                // List all available tokens to trade
                const onClose = showProcessingModal("Loading Tokens...", "");
                try {
                    const available = await getConvertibleTokens();
                    console.log("available : ", available);
                    setTokens(available);
                    const defaultBaseSymbol = baseCurrency ? baseCurrency : "ETH";
                    const defaultPairSymbol = pairCurrency ? pairCurrency : "BNT";
                    const defaultBaseToken = available.find(item => item.symbol === defaultBaseSymbol);
                    const defaultPairToken = available.find(item => item.symbol === defaultPairSymbol);
                    setBaseToken(defaultBaseToken);
                    setPairToken(defaultPairToken);
                } catch (error) {
                    console.log("Load tokens error : ", error.message);
                };

                // List all liquidity pools
                const poolList = await listLiquidityPools();
                setLiquidityPools(poolList);
                onClose();
            })();
        }

    }, [loading, networkId])

    useEffect(() => {

        if (baseToken && !loading) {
            (async () => {
                await updateBalance(baseToken);
            })();

        }
    }, [baseToken, loading])

    const updateBalance = useCallback(async (base) => {
        setLoadingBalance(true);
        try {
            if (base.symbol === "ETH") {
                console.log("Check native ETH...");
                const result = await getETHBalance();
                console.log(result.toString());
                setSourceBalance(`${toFixed(result, 8)}`);
            } else {
                const result = await getTokenBalance(base.address);
                console.log(result.toString());
                setSourceBalance(`${toFixed(result, 8)}`);
            }
        } catch (error) {
            console.log("loading balance error  ;", error);
        }
        setLoadingBalance(false);

    }, [web3ReactContext])

    const onConvert = useCallback(async () => {

        if ((baseToken) && (path.length > 0) && (baseTokenAmount !== 0)) {
            console.log("Converting...", baseToken, path, baseTokenAmount);
            const normalizedAmount = baseTokenAmount;
            try {
                const sourceDecimal = await getTokenDecimal(baseToken.address);
                const rateResult = await getRate(path, normalizedAmount, sourceDecimal);
                const detinationAmount = rateResult[0];
                console.log("defaultAffiliateAccount : ", defaultAffiliateAccount, " rate : ", defaultAffiliateFee);

                const txs = await convert(
                    path,
                    baseToken.address,
                    normalizedAmount,
                    sourceDecimal,
                    detinationAmount,
                    baseToken.symbol === "ETH",
                    pairToken.symbol === "ETH",
                    defaultAffiliateAccount,
                    defaultAffiliateFee
                );
                
                const onClose = showProcessingModal("Pleae wait while all transactions are being confirmed", `Number of transactions : ${txs.length}`);
                try {
                    await Promise.all(txs.map(item => item.wait()));
                    setBaseAmountByPercent(0,0);
                } catch (error) {
                    showErorMessageModal(error.message, "Possibly because of congestion on the network. You can try it again with the same amount.")
                    setResetRate(resetRate+1);
                }
                onClose();
            } catch (error) {
                showErorMessageModal("Error", error.message)
                console.log("onConvert error : ", error)
            }
            setTimeout(async () => {
                await updateBalance(baseToken);
            }, 3000)
        }
    }, [baseTokenAmount, baseToken, pairToken, path, web3ReactContext, resetRate])

    useEffect(() => {

        if (baseToken && pairToken && !loading && networkId !== undefined && liquidityPools.length > 0) {
            if (baseToken.symbol !== '' && pairToken.symbol !== '') {

                (async () => {
                    console.log(`looking for an exchange rate on the pair ${baseToken.symbol}/${pairToken.symbol} `);
                    setLoadingRate(true);
                    const onClose = showProcessingModal("Fetching rates...", "");
                    try {
                        const path = await generatePath(baseToken.address, pairToken.address, liquidityPools);
                        console.log("path : ", path);
                        const baseDecimal = await getTokenDecimal(baseToken.address);
                        const rateResult = await getRate(path, "1", baseDecimal);
                        const rate = rateResult[0];
                        const fee = rateResult[1];
                        const pairDecimal = await getTokenDecimal(pairToken.address);
                        const finalRate = parseToken(rate, pairDecimal);
                        const finalFee = parseToken(fee, pairDecimal);
                        console.log("finalRate / finalFee : ", finalRate, finalFee);
                        setRate(`${finalRate}`);
                        setFee(Number((100 * Number(finalFee)) / Number(finalRate)));
                        setPath(path);

                        updatePairTokenAmount(finalRate);

                    } catch (error) {
                        console.log("Find a shortest path error : ", error);
                    }
                    setLoadingRate(false);
                    onClose();
                })();
            }
        }
    }, [baseToken, pairToken, loading, liquidityPools, networkId, resetRate]);

    const toggleBaseModal = useCallback(() => {
        setBaseTokenModal(!isBaseTokenModalOpen);
    }, [isBaseTokenModalOpen]);

    const togglePairModal = useCallback(() => {
        setPairTokenModal(!isPairTokenModalOpen);
    }, [isPairTokenModalOpen]);

    const onBaseChange = useCallback((newSource) => {

        if (newSource.symbol === baseToken.symbol) {
            // updateBalance(newSource);
        }

        if (newSource.symbol === pairToken.symbol) {
            // alert("Can't choose the same token")
            setBaseToken(pairToken);
            setPairToken(baseToken);
            setBaseTokenModal(false);
            return;
        }

        setBaseToken(newSource);
        setBaseTokenModal(false);

    }, [pairToken, baseToken]);

    const onPairChange = useCallback((newDestination) => {

        if (newDestination.symbol === baseToken.symbol) {
            // alert("Can't choose the same token")
            setPairToken(baseToken);
            setBaseToken(pairToken);
            setPairTokenModal(false);
            return;
        }

        setPairToken(newDestination);
        setPairTokenModal(false);

    }, [baseToken, pairToken])

    const handleChange = useCallback((e) => {
        e.preventDefault();
        if (isLoadingRate) {
            return;
        }
        const regexp = /^[0-9]*(\.[0-9]{0,8})?$/;

        if (e.target.id === 'sourceInput') {
            const value = regexp.test(e.target.value) ? (e.target.value) : baseTokenAmount;
            setBaseTokenAmount(value);
            const result = (Number(value) * Number(rate));
            setPairTokenAmount(result);
        } else {
            const value = regexp.test(e.target.value) ? (e.target.value) : pairTokenAmount;
            setPairTokenAmount(value);
            const result = (Number(value) * Number(rate));
            setBaseTokenAmount(result);
        }
    }, [rate, isLoadingRate, baseTokenAmount, pairTokenAmount])

    const updatePairTokenAmount = useCallback((rate) => {
        const result = (Number(baseTokenAmount) * Number(rate));
        setPairTokenAmount(result);
    },[baseTokenAmount])

    const setBaseAmountByPercent = useCallback((percent, amount) => {

        if (isLoadingRate) {
            // alert("Not ready!")
            return;
        }

        const newAmount = toFixed((Number(amount) * percent), 8);
        setBaseTokenAmount(newAmount);
        setPairTokenAmount(toFixed(newAmount * Number(rate), 8));

    }, [rate, isLoadingRate])

    if (!networkId) {
        return <Fragment></Fragment>
    }

    return (
        <Fragment>
            {loading
                ?
                <Fragment>
                    <Column>
                        <img src={loadingIcon} width="12px" height="12px" />
                    </Column>
                    <Column>
                    </Column>
                </Fragment>
                :
                <Fragment>
                    <Column>
                        <h3>Pay</h3>
                        <InputGroup>
                            <InputGroupIcon>
                                {baseToken &&
                                    (
                                        <TokenLogo src={getIcon(baseToken.symbol)} alt={baseToken.symbol} />
                                    )}
                            </InputGroupIcon>
                            <InputGroupDropdown active={isBaseTokenModalOpen}>
                                <span onClick={() => toggleBaseModal()}>
                                    {baseToken && `${baseToken.symbol}`}&#9660;
                                </span>
                                <DropdownPanel
                                    tokens={tokens || []}
                                    onChange={onBaseChange}
                                    getIcon={getIcon}
                                />
                            </InputGroupDropdown>
                            <InputGroupArea>
                                <input value={baseTokenAmount} id="sourceInput" onChange={handleChange} placeholder="0.00" type="number" min="0" step="0.01" pattern="^\d+(?:\.\d{1,6})?$" />
                            </InputGroupArea>
                        </InputGroup>
                        <AccountSection>
                            <AccountLeft>
                                BALANCE {sourceBalance}
                            </AccountLeft>
                            <AccountRight>
                                {sourceBalance !== "0.0" && (
                                    <span>
                                        <Percentage onClick={() => setBaseAmountByPercent(0.25, sourceBalance)} >25%</Percentage>{` `}
                                        <Percentage onClick={() => setBaseAmountByPercent(0.5, sourceBalance)}>50%</Percentage>{` `}
                                        <Percentage onClick={() => setBaseAmountByPercent(1, sourceBalance)}>100%</Percentage>
                                    </span>
                                )}
                            </AccountRight>
                        </AccountSection>
                    </Column>
                    <Column>
                        <h3>Receive</h3>
                        <InputGroup>
                            <InputGroupIcon>
                                {pairToken &&
                                    (
                                        <TokenLogo src={getIcon(pairToken.symbol)} alt={pairToken.symbol} />
                                    )}
                            </InputGroupIcon>
                            <InputGroupDropdown active={isPairTokenModalOpen}>
                                <span onClick={() => togglePairModal()}>
                                    {pairToken && `${pairToken.symbol}`}&#9660;
                                </span>
                                <DropdownPanel
                                    tokens={tokens || []}
                                    onChange={onPairChange}
                                    getIcon={getIcon}
                                />
                            </InputGroupDropdown>
                            <InputGroupArea>
                                <input value={pairTokenAmount} id="destinationInput" onChange={handleChange} placeholder="0.00" type="number" min="0" step="0.01" pattern="^\d+(?:\.\d{1,6})?$" />
                            </InputGroupArea>
                        </InputGroup>
                        <AccountSection>
                            <AccountLeft>
                                FEE {toFixed(fee, 1)} %
                            </AccountLeft>
                            {baseToken && pairToken && (
                                <AccountRight>
                                    {`1 ${baseToken.symbol.toUpperCase()} = ${Number(rate).toFixed(6)} ${pairToken.symbol.toUpperCase()}`}
                                </AccountRight>
                            )}

                        </AccountSection>
                    </Column>
                </Fragment>
            }

        </Fragment>
    )
}

SwapPanel.propTypes = {
    web3ReactContext: PropTypes.object.isRequired,
    clickCount: PropTypes.number.isRequired,
    baseCurrency: PropTypes.string,
    pairCurrency: PropTypes.string,
    affiliateAccount: PropTypes.string,
    affiliateFee: PropTypes.number,
};

export default SwapPanel;


const DropdownPanel = (props) => {
    const { tokens, onChange, getIcon } = props;
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

    return (
        <div className="dropdown-content">
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
                                    {/*
                                    <ReservePoolAmount inactive={item[2] === 0}>
                                        SUPPLY{` `}:{` `}{item[2]}{` `}{item[0]}
                                    </ReservePoolAmount>
                                    */}

                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
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

const Column = styled.div`
    h3 {
        font-size: 20px;
        font-weight: 500;
    }
`;

const AccountSection = styled.div`
    display: flex;
`;

const ReservePoolAmount = styled.div`
    font-size: 10px;
    font-weight: 500;
    word-wrap: break-word;
    padding: 4px;
    ${ props => props.inactive &&
        (`
            background-color: pink;
        `)

    }
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

const Percentage = styled.a`
    cursor: pointer;

    :hover {
        font-weight: 600;
    }

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