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
        affiliateFee
    } = props;

    const { showProcessingModal } = useModal();

    const initialList = INITIAL_TOKENS.map(token => [token, getDefaultTokenAddress(token), 0])

    const defaultAffiliateAccount = affiliateAccount ? getAddress(affiliateAccount) : "0x0000000000000000000000000000000000000000";
    const defaultAffiliateFee = affiliateFee ? parseFee(affiliateFee) : "0";

    const networkId = web3ReactContext.networkId;

    const getDefaultCurrency = (currency, list, fallback) => {
        for (let item of list) {
            if (item[0] === currency) {
                return item
            }
        }
        return fallback;
    }

    const defaultBaseCurrency = getDefaultCurrency(baseCurrency, initialList, initialList[1]);
    const defaultPairCurrency = getDefaultCurrency(pairCurrency, initialList, initialList[0]);

    const [tokens, setTokens] = useState(initialList);

    const [liquidityPools, setLiquidityPools] = useState([]);

    const [isSourceModalOpen, setSourceModal] = useState(false);
    const [isDestinationModalOpen, setDestinationModal] = useState(false);

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
        generatePath
    } = useBancor(web3ReactContext);

    const [source, setSource] = useState(defaultBaseCurrency);
    const [destination, setDestination] = useState(defaultPairCurrency);

    const [sourceBalance, setSourceBalance] = useState("0.0");
    const [isLoadingBalance, setLoadingBalance] = useState(true);
    const [rate, setRate] = useState("1");
    const [fee, setFee] = useState(0);
    const [path, setPath] = useState([]);
    const [isLoadingRate, setLoadingRate] = useState(true);
    const [loadingModal, setLoadingModal ] = useState();

    const [sourceAmount, setSourceAmount] = useState(0);
    const [destinationAmount, setDestinationAmount] = useState(0);

    useEffect(() => {
        // Handle click event from Parent Component
        onConvert();
    }, [clickCount])

    

    useEffect(() => {

            if (loading) {
                // showProcessingModal("Looking up system contracts in registry...", "");
            } 
        
    }, [loading])

    useEffect(() => {

        (async () => {
            if (!loading) {
                // List all available tokens to trade
                let tokenList = [];
                try {
                    const available = await listConversionTokens();

                    let finalList;

                    if (networkId === 1) {
                        finalList = INITIAL_TOKENS.map(name => available.find(item => item[0] === name));
                        for (let token of available) {
                            if ((finalList.find(item => item[0] === token[0]) === undefined) && (token[0] !== "NAME_ERROR") && (EXCLUDE_TOKENS.indexOf(token[0]) === -1)) {
                                finalList.push(token);
                            }
                        }
                    } else {
                        finalList = available;
                    }

                    console.log("final token list : ", finalList);
                    setTokens(finalList.map(item => [item[0], item[1], 0]));
                    tokenList = finalList;
                } catch (error) {
                    console.log("list tokens error : ", error);
                }
                // List all liquidity pools
                const poolList = await listLiquidityPools();
                setLiquidityPools(poolList);

                // Load reserves balance
                console.log("Find a liquidity depth on all tokens");
                let poolPromises = [];
                for (let pool of poolList) {
                    poolPromises.push(getLiquidityPool(pool.converterAddress));
                }

                Promise.all(poolPromises).then(
                    poolResult => {

                        let listWithReserveBalance = [];

                        for (let token of tokenList) {
                            const tokenAddress = token[1];
                            const filtered = poolResult.reduce((array, items) => {
                                for (let item of items) {
                                    if (item[1] === tokenAddress) {
                                        array.push(item)
                                    }
                                }
                                return array;
                            }, []);

                            const totalReserves = filtered.reduce((result, items) => {
                                result = result + Number(items[0]);

                                return result;
                            }, 0)
                            listWithReserveBalance.push([token[0], token[1], Math.round(totalReserves)]);

                        }
                        setTokens(listWithReserveBalance);

                    }
                )
            }
        })()



    }, [loading, networkId])

    useEffect(() => {
        if (networkId) {
            // Update default token list for non-mainnet
            if (networkId === 3) {
                const ropstenList = ROPSTEN_TOKENS.map(token => [token, getRopstenTokenAddress(token), 0])
                setTokens(ropstenList);
                const defaultBaseCurrency = getDefaultCurrency(baseCurrency, ropstenList, ropstenList[1]);
                const defaultPairCurrency = getDefaultCurrency(pairCurrency, ropstenList, ropstenList[0]);
                setSource(defaultBaseCurrency);
                setDestination(defaultPairCurrency);
            }
        }
    }, [networkId, baseCurrency, pairCurrency])


    const onConvert = useCallback(async () => {

        if ((source[1] !== "") && (path.length > 0) && (sourceAmount !== 0)) {



            // handleProcessing(true);

            console.log("Convert...", source, path, sourceAmount);
            /*
            const round = (num) => {
                return +(Math.floor(num + "e+3") + "e-3");
            }

            const normalizedAmount = `${round(Number(sourceAmount))}`;
            */
           const normalizedAmount = sourceAmount;

            console.log("normalizedAmount : ", normalizedAmount);

            try {
                const sourceDecimal = await getTokenDecimal(source[1]);
                const rateResult = await getRate(path, normalizedAmount, sourceDecimal);
                const detinationAmount = rateResult[0];

                const slipRate = SLIPPAGE_RATE; // 3%
                console.log("detinationAmount : ", detinationAmount.toString());

                console.log("defaultAffiliateAccount : ", defaultAffiliateAccount, " rate : ", defaultAffiliateFee);

                const tx = await convert(
                    path,
                    source[1],
                    normalizedAmount,
                    sourceDecimal,
                    detinationAmount,
                    slipRate,
                    source[0] === "ETH",
                    destination[0] === "ETH",
                    defaultAffiliateAccount,
                    defaultAffiliateFee
                );

                if (tx.hash) {
                    const { hash } = tx;
                    const onClose = showProcessingModal("Please wait while your transaction is being processed", `Tx : ${hash}`);
                    try {
                        await tx.wait(); // shows an error if it's failed
                    } catch (error) {
                        alert(error.message);
                    }
                    onClose();

                    console.log("done...");

                }

            } catch (error) {
                console.log("onConvert error : ", error)
            }

            
            setTimeout(async () => {
                await updateBalance(source);
            }, 3000)


        }

    }, [sourceAmount, source, destination, path, web3ReactContext])




    const onSourceChange = useCallback((newSource) => {

        if (newSource[0] === source[0]) {
            updateBalance(source);
        }

        if (newSource[0] === destination[0]) {
            // alert("Can't choose the same token")
            setSource(destination);
            setDestination(source);
            setSourceModal(false);
            return;
        }

        setSource(newSource);
        setSourceModal(false);

    }, [destination, source])


    const onDestinationChange = useCallback((newDestination) => {

        if (newDestination[0] === source[0]) {
            // alert("Can't choose the same token")
            setDestination(source);
            setSource(destination);
            setDestinationModal(false);
            return;
        }

        setDestination(newDestination);
        setDestinationModal(false);

    }, [source, destination])

    useEffect(() => {

        if (source[1] !== '' && !loading) {
            (async () => {
                await updateBalance(source);
            })();

        }
    }, [source, loading])

    const toggleSourceModal = useCallback(() => {
        setSourceModal(!isSourceModalOpen);

    }, [isSourceModalOpen]);

    const toggleDestinationModal = useCallback(() => {
        setDestinationModal(!isDestinationModalOpen);

    }, [isDestinationModalOpen])

    const updateBalance = useCallback(async (source) => {
        setLoadingBalance(true);
        const onClose = showProcessingModal("Loading balances...", "");
        try {

            if (source[0] === "ETH") {
                console.log("Check native ETH...");
                const result = await getETHBalance();
                console.log(result.toString());
                setSourceBalance(`${Number(result).toFixed(5).slice(0,-1)}`);
            } else {
                const result = await getTokenBalance(source[1]);
                console.log(result.toString());

                setSourceBalance(`${Number(result).toFixed(5).slice(0,-1)}`);
            }

        } catch (error) {
            console.log("loading balance error  ;", error);
        }
        onClose();
        setLoadingBalance(false);

    }, [web3ReactContext])

    useEffect(() => {

        if (source[1] !== '' && destination[1] !== '' && !loading && networkId !== undefined && liquidityPools.length > 0) {
            console.log(`looking for an exchange rate on the pair ${source[0]}/${destination[0]} `);
            (async () => {
                setLoadingRate(true);
                const onClose = showProcessingModal("Fetching rates...", "");
                try {
                    const path = await generatePath(source[1], destination[1], liquidityPools);
                    console.log("path : ", path);
                    const sourceDecimal = await getTokenDecimal(source[1]);
                    const rateResult = await getRate(path, "1", sourceDecimal);
                    const rate = rateResult[0];
                    const fee = rateResult[1];
                    const destinationDecimal = await getTokenDecimal(destination[1]);
                    const finalRate = parseToken(rate, destinationDecimal);
                    const finalFee = parseToken(fee, destinationDecimal);
                    setRate(`${Number(finalRate).toFixed(6)}`);
                    setFee(Number((100 * Number(finalFee)) / Number(finalRate)));
                    setPath(path);

                    updateDestinationAmount(finalRate);

                } catch (error) {
                    console.log("Find a shortest path error : ", error);
                }
                setLoadingRate(false);
                onClose();

            })();
        }

    }, [source, destination, loading, liquidityPools, networkId])

    const handleChange = useCallback((e) => {
        e.preventDefault();

        if (isLoadingRate) {
            return;
        }
        const regexp = /^[0-9]*(\.[0-9]{0,4})?$/;

        if (e.target.id === 'sourceInput') {
            const value = regexp.test(e.target.value) ? (e.target.value) : sourceAmount;
            setSourceAmount(value);
            const result = (Number(value) * Number(rate)).toFixed(5).slice(0,-1);
            setDestinationAmount(result);
        } else {
            const value = regexp.test(e.target.value) ? (e.target.value) : destinationAmount;
            setDestinationAmount(value);
            const result = (Number(value) * Number(rate)).toFixed(5).slice(0,-1);
            setSourceAmount(result);

        }

    }, [rate, isLoadingRate, sourceAmount, destinationAmount])

    const updateDestinationAmount = useCallback((rate) => {

        if (Number(destinationAmount) !== 0) {
            const result = (Number(sourceAmount) * Number(rate)).toFixed(5).slice(0,-1);
            setDestinationAmount(result);
        }

    }, [sourceAmount, destinationAmount]);

    const setSourceAmountByPercentage = useCallback((percent, amount) => {

        if (isLoadingRate) {
            alert("Not ready!")
            return;
        }

        const newAmount = (Number(amount) * percent).toFixed(5).slice(0,-1);
        setSourceAmount(newAmount);
        setDestinationAmount((newAmount * Number(rate)).toFixed(5).slice(0,-1));

    }, [rate, isLoadingRate])


    if (!networkId) {
        return <Fragment></Fragment>
    }

    if (loading) {
        return (
            <Fragment>
                <Column>
                    <img src={loadingIcon} width="12px" height="12px" />
                </Column>
                <Column></Column>
            </Fragment>
        )
    }

    return (
        <Fragment>
            <Column>
                <h3>Pay</h3>

                <InputGroup>
                    <InputGroupIcon>
                        <TokenLogo src={getIcon(source[0])} alt={source[0]} />
                    </InputGroupIcon>
                    <InputGroupDropdown active={isSourceModalOpen}>

                        <span onClick={() => toggleSourceModal()}>
                            {source[0]}&#9660;
                        </span>


                        <DropdownPanel
                            tokens={tokens}
                            onChange={onSourceChange}
                            getIcon={getIcon}
                        />




                    </InputGroupDropdown>
                    <InputGroupArea>
                        <input value={sourceAmount} id="sourceInput" onChange={handleChange} placeholder="0.00" type="number" min="0" step="0.01" pattern="^\d+(?:\.\d{1,2})?$" />
                    </InputGroupArea>
                </InputGroup>
                <AccountSection>
                    <AccountLeft>
                        BALANCE {sourceBalance}
                    </AccountLeft>
                    <AccountRight>
                        {sourceBalance !== "0.0" && (
                            <span>
                                <Percentage onClick={() => setSourceAmountByPercentage(0.25, sourceBalance)} >25%</Percentage>{` `}
                                <Percentage onClick={() => setSourceAmountByPercentage(0.5, sourceBalance)}>50%</Percentage>{` `}
                                <Percentage onClick={() => setSourceAmountByPercentage(1, sourceBalance)}>100%</Percentage>
                            </span>
                        )}
                    </AccountRight>
                </AccountSection>
            </Column>
            <Column>
                <h3>Receive</h3>


                <InputGroup>
                    <InputGroupIcon>
                        <TokenLogo src={getIcon(destination[0])} alt={destination[0]} />
                    </InputGroupIcon>
                    <InputGroupDropdown active={isDestinationModalOpen}>
                        <span onClick={() => toggleDestinationModal()}>{destination[0]}&#9660;</span>

                        <DropdownPanel
                            tokens={tokens}
                            onChange={onDestinationChange}
                            getIcon={getIcon}
                        />



                    </InputGroupDropdown>
                    <InputGroupArea>
                        <input value={destinationAmount} id="destinationInput" onChange={handleChange} placeholder="0.00" type="number" min="0" step="0.01" pattern="^\d+(?:\.\d{1,2})?$" />
                    </InputGroupArea>
                </InputGroup>
                <AccountSection>
                    <AccountLeft>
                        FEE {fee.toFixed(1)} %
                    </AccountLeft>
                    <AccountRight>
                        {`1 ${source[0].toUpperCase()} = ${rate} ${destination[0].toUpperCase()}`}
                    </AccountRight>
                </AccountSection>
            </Column>
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
                setFiltered(tokens.filter((item) => item[0].toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1))
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
                                    <TokenLogo src={getIcon(item[0])} alt={item[0]} />
                                </td>
                                <td>
                                    {item[0]}
                                    <ReservePoolAmount inactive={item[2] === 0}>
                                        SUPPLY{` `}:{` `}{item[2]}{` `}{item[0]}
                                    </ReservePoolAmount>
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