import React, { useCallback, useState, useEffect, Fragment } from 'react';
import PieChart from 'react-minimal-pie-chart';
import { useBancor } from "../../../../contexts/bancor";
import { getIcon } from "../../../../utils/token";
import styled from "styled-components";

import loadingIcon from "../../../../../assets/loading.gif"
import SearchIcon from "../../../../../assets/search.svg";

const ACTION_PANELS = {
    ADD_LIQUIDITY: "Add Liquidity",
    REMOVE_LIQUIDITY: "Remove Liquidity",
    CREATE_POOL: "Create a New Pool"
}

const COLORS = ["#E38627", "#C13C37", "#47682C", "#6874E8", "#F7ACCF", "#12130F", "#113537"];


/*
    Liquidity Pools Panel
*/

const LiquidityPoolPanel = (props) => {

    const {
        web3ReactContext,
        updateActionText,
        width,
        clickCount
    } = props;

    const networkId = web3ReactContext.networkId;
    const [pools, setPools] = useState([]);
    const [loadingPools, setLoadingPools] = useState(false);

    const {
        loading,
        listLiquidityPools,
        getTokenName,
        getLiquidityPool,
        getReserveRatio,
        getConversionFee,
        getETHBalance,
        getTokenBalance
    } = useBancor(web3ReactContext);

    useEffect(() => {


        (async () => {
            if (!loading) {

                // List liquidity pools
                setLoadingPools(true);
                const poolList = await listLiquidityPools();

                // Load reserves balance
                console.log("Find a liquidity depth on all tokens");


                let tokenNamePromise = [];
                for (let pool of poolList) {
                    tokenNamePromise.push(getTokenName(pool.smartTokenAddress))
                }

                Promise.all(tokenNamePromise).then(
                    tokenNameResult => {
                        // console.log("tokenNameResult : ", tokenNameResult);

                        let poolPromises = [];
                        for (let pool of poolList) {
                            poolPromises.push(getLiquidityPool(pool.converterAddress));
                        }

                        Promise.all(poolPromises).then(
                            poolResult => {

                                // console.log("poolResult : ", poolResult);
                                let promisesPool = [];

                                const getPoolInfo = async (pool, count) => {
                                    const name = tokenNameResult.find((item) => item[1].toLowerCase() === pool.smartTokenAddress.toLowerCase());
                                    const reserves = poolResult[count];

                                    let formalName = "";
                                    let symbols = [];

                                    for (let reserve of reserves) {
                                        const tokenName = (await getTokenName(reserve[1]))[0];
                                        if (tokenName !== "NAME_ERROR") {
                                            symbols.push(tokenName);
                                            if (formalName === "") {
                                                formalName = tokenName;
                                            } else {
                                                formalName = formalName + "/" + tokenName;
                                            }
                                        }

                                    }

                                    return {
                                        name: name[0] || "",
                                        formalName: formalName,
                                        symbols: symbols,
                                        address: pool.smartTokenAddress,
                                        converterAddress: pool.converterAddress,
                                        reserves: reserves
                                    }
                                }

                                let count = 0;
                                for (let p of poolList) {
                                    promisesPool.push(getPoolInfo(p, count));
                                    count += 1;
                                }

                                Promise.all(promisesPool).then(
                                    finalResult => {

                                        console.log("finalResult : ", finalResult);

                                        setPools(finalResult.filter(item => item.reserves.length !== 1));
                                        setLoadingPools(false);
                                    }
                                )



                            }
                        )

                    }
                )




            }
        })();

    }, [loading, networkId])

    const isLoading = loading || loadingPools;

    const [actionPanel, setActionPanel] = useState(ACTION_PANELS.ADD_LIQUIDITY);
    const [currentPool, setCurrentPool] = useState();
    const [currentPoolRatio, setCurrentPoolRatio] = useState("");
    const [currentPoolFee, setCurrentPoolFee] = useState("");
    const [currentPoolSpread, setCurrentPoolSpread] = useState("");
    const [currentChartData, setCurrentChartData] = useState([{ color: COLORS[0], title: 'One', value: 50 }, { color: COLORS[1], title: 'Two', value: 50 }]);
    const [showActionListModal, setActionListModal] = useState(false);
    const [showPoolListModal, setPoolListModal] = useState(false);

    useEffect(() => {
        updateActionText(actionPanel);
    }, [actionPanel])

    useEffect(() => {
        // Checks a pool information
        if (currentPool) {
            console.log("Checks : ", currentPool);

            (async () => {

                const conversionFee = await getConversionFee(currentPool.converterAddress);
                console.log("conversionFee : ", conversionFee);
                setCurrentPoolFee(`${conversionFee}%`)

                let ratio = "";

                for (let reserve of currentPool.reserves) {
                    const ratioForToken = await getReserveRatio(currentPool.converterAddress, reserve[1]);
                    if (ratio !== "") {
                        ratio = `${ratio}/${Math.ceil(ratioForToken * 100)}`
                    } else {
                        ratio = `${Math.ceil(ratioForToken * 100)}`;
                    }
                }



                setCurrentPoolRatio(ratio);



            })()


        }

    }, [currentPool])

    useEffect(() => {

        if (currentPoolRatio && currentPoolRatio !== "") {
            const ratios = currentPoolRatio.split("/");
            const newData = ratios.map((item, index) => {

                return {
                    color: COLORS[index] || COLORS[0],
                    title: `${item}`,
                    value: Number(item)
                }
            })
            setCurrentChartData(newData);
            const values = ["Low", "Medium", "High"]
            setCurrentPoolSpread(values[Math.floor(Math.random() * values.length)]);


        }



    }, [currentPoolRatio]);


    const toggleActionListModal = useCallback(() => {
        setActionListModal(!showActionListModal);

        if (!showActionListModal === true) {
            setPoolListModal(false);
        }

    }, [showActionListModal]);

    const togglePoolListModal = useCallback(() => {
        setPoolListModal(!showPoolListModal);

        if (!showPoolListModal === true) {
            setActionListModal(false);
        }

    }, [showPoolListModal]);

    const onActionPanelUpdate = useCallback((panel) => {
        if (!isLoading) {
            setActionPanel(panel);
            setActionListModal(false);
        }
    }, [isLoading])

    const onUpdateCurrentPool = useCallback((poolObject) => {
        setCurrentPool(poolObject);
        setPoolListModal(false);

    }, [])

    if (!networkId) {
        return <Fragment></Fragment>
    }


    return (
        <Fragment>

            <Column>
                {isLoading
                    ? <img src={loadingIcon} width="12px" height="12px" />
                    :
                    <Fragment>
                        <Header>
                            <span onClick={() => togglePoolListModal()}>
                                {currentPool ? `${currentPool.name}` : "" || ""}{` `}&#9660;
                            </span>
                        </Header>
                        <PoolListPanel
                            active={showPoolListModal}
                            onUpdateCurrentPool={onUpdateCurrentPool}
                            pools={pools}
                        />

                        <ChartContainer>

                            {width <= 600 ?
                                <PieChart
                                    animate={false}
                                    animationDuration={500}
                                    animationEasing="ease-out"
                                    cx={50}
                                    cy={50}
                                    data={currentChartData}
                                    label={false}
                                    labelPosition={50}
                                    lengthAngle={360}
                                    lineWidth={100}
                                    paddingAngle={0}
                                    radius={50}
                                    rounded={false}
                                    startAngle={90}
                                    style={{
                                        height: '100px'
                                    }}
                                    viewBoxSize={[
                                        100,
                                        100
                                    ]}
                                />
                                :
                                <PieChart
                                    animate={false}
                                    animationDuration={500}
                                    animationEasing="ease-out"
                                    cx={50}
                                    cy={50}
                                    data={currentChartData}
                                    label
                                    labelPosition={60}
                                    labelStyle={{
                                        fontFamily: 'sans-serif',
                                        fontSize: '7px'
                                    }}
                                    lengthAngle={360}
                                    lineWidth={20}
                                    paddingAngle={0}
                                    radius={50}
                                    rounded={true}
                                    startAngle={90}
                                    style={{
                                        height: "200px"
                                    }}
                                    viewBoxSize={[
                                        100,
                                        100
                                    ]}
                                />

                            }


                            {currentPool &&
                                (
                                    <Fragment>
                                        <ChartBaseToken>

                                            {currentPool.symbols.map((item, index) => {
                                                return (
                                                    <div key={index}>
                                                        <div>
                                                            <Dot color={COLORS[index] || COLORS[0]} />{` `}{item || ""}{` `}{Number(currentPool.reserves[index][0]).toFixed(3)}
                                                        </div>

                                                    </div>
                                                )
                                            })}

                                            {/*
                                            <div>
                                                <Dot color={COLORS.PRIMARY} />
                                            </div>
                                            <div>
                                                {Number(currentPool.reserves[0][0]).toFixed(3)}{` `}{currentPool.firstTokenSymbol || ""}
                                            </div>
                                            <div>
                                                $173,544
                                            </div>
                                            <div>

                                                <Dot color={COLORS.SECONDARY} />
                                            </div>
                                            <div>
                                                {Number(currentPool.reserves[1][0]).toFixed(3)}{` `}{currentPool.secondTokenSymbol || ""}
                                            </div>
                                            <div>
                                                $45,446
                                            </div>
                                            */}


                                        </ChartBaseToken>
                                        <ChartPairToken>

                                            <InfoContainer>
                                                <table style={{ width: "100%" }}>
                                                    {/*
                                                    <tr style={{ borderBottom: "1px solid #ddd" }}>
                                                        <th width="70%">Spread</th>
                                                        <td width="30%">{currentPoolSpread}</td>
                                                    </tr>
                                                    */}
                                                    
                                                    <tr>
                                                        <th width="70%">Ratio</th>
                                                        <td width="30%">{currentPoolRatio}</td>
                                                    </tr>
                                                    <tr>
                                                        <th width="70%">Fee</th>
                                                        <td width="30%">{currentPoolFee}</td>
                                                    </tr>


                                                </table>
                                            </InfoContainer>
                                        </ChartPairToken>
                                    </Fragment>
                                )

                            }


                        </ChartContainer>



                    </Fragment>
                }

            </Column>
            <Column>

                {!isLoading &&
                    (
                        <Fragment>
                            <Header><span onClick={() => toggleActionListModal()}>{actionPanel}{` `}&#9660;</span></Header>
                            <ActionListPanel
                                active={showActionListModal}
                                onActionPanelUpdate={onActionPanelUpdate}
                            />

                            <ActionInputPanel
                                actionPanel={actionPanel}
                                currentPool={currentPool}
                                getETHBalance={getETHBalance}
                                getTokenBalance={getTokenBalance}
                                clickCount={clickCount}
                            />



                        </Fragment>
                    )

                }




            </Column>







        </Fragment >
    )
}


const Row = styled.div`

    

    height: 250px;
    overflow-y: scroll;


    h3 {
        font-size: 20px;
        font-weight: 500;
    }

    table {
        width:100%;
        font-size: 14px;
    }

    th, td {
        padding-top: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
    }
`;

const Dot = styled.span`
    height: 10px;
    width: 10px;
    margin-bottom: 1px;
    background-color: ${props => props.color ? props.color : "#bbb"};
    border-radius: 50%;
    display: inline-block;
`;

const Header = styled.h3`
    font-size: 20px;
    font-weight: 500;
    span {
        cursor: pointer;
    }
`;

const Column = styled.div`

`;

const AccountContainer = styled.div`
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

const InputGroupButton = styled.div`
    background:#eee;
    color: #777;
    padding: 0 12px;
    position: relative;
    display: inline-block;
    cursor: pointer;
`;

const TokenLogo = styled.img`
    width : 26px;
    height : 24px;
    margin-right: 2px;
`

const ChartContainer = styled.div`
    padding: 20px;
    position: relative; 
`;

const ChartBaseToken = styled.div`
    position: absolute; 
    left: 0px; 
    top: 20px; 
    text-align: left;
    font-size: 12px;
`;

const ChartPairToken = styled.div`
    position: absolute; 
    right: 0px; 
    top: 20px;
    text-align: right;
    font-size: 12px;
`;

const DropdownContainer = styled.div`
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 220px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
    margin-left: 40px;
    height: 145px;
    
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 5px;

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


    }

    tr {
        ${props => props.skipSearch && `
            &:not(:first-child) {
                cursor: pointer;
            }
        `}
        

        &:not(:last-child) {
            border-bottom: 1px solid #ddd;
        }
    }

    ${props => props.active && (
        `
            display: block;
        `
    )}

`

const TokenBalanceContainer = styled.div`
    padding-top: 10px;
`;

const DropdownListContainer = styled(DropdownContainer)`
    overflow-y: scroll;
    height: 250px;
    margin-left: 0px;
    min-width: 300px;
    
`

const TableSearchRow = styled.tr`


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

const TableInnerRow = styled.div`
    display: flex;
`;

const TableBox = styled.div`
    border: 1px solid #eee;
    vertical-align: middle;
    font-size: 12px;
    padding: 5px;
    margin-right: 5px;
`

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

const InfoContainer = styled.div`
    
    font-size: 12px;

    th {
        text-align: right;
        padding-right: 5px;
    }

    td {
        padding-left: 5px;
    }

`;



export default LiquidityPoolPanel;

const ActionListPanel = (props) => {

    const { active, onActionPanelUpdate } = props;


    return (
        <DropdownContainer active={active}>
            <table>
                <tbody>
                    <tr>
                        <td onClick={() => onActionPanelUpdate(ACTION_PANELS.ADD_LIQUIDITY)}>Add Liquidity</td>
                    </tr>
                    <tr>
                        <td onClick={() => onActionPanelUpdate(ACTION_PANELS.REMOVE_LIQUIDITY)}>Remove Liquidity</td>
                    </tr>
                    <tr>
                        <td onClick={() => onActionPanelUpdate(ACTION_PANELS.CREATE_POOL)}>Create a New Pool</td>
                    </tr>
                </tbody>
            </table>
        </DropdownContainer>
    )
};

const ActionInputPanel = (props) => {

    const { actionPanel, currentPool, getETHBalance, getTokenBalance, clickCount } = props;

    const [selectedToken, setSelectedToken] = useState();

    const [showTokenList, setShowTokenList] = useState(false);

    const [balance, setBalance] = useState("0.0");
    const [isLoadingBalance, setLoadingBalance] = useState(false);
    const [amount, setAmount] = useState(0);

    useEffect(() => {

        console.log("currentPool : ", currentPool)

        if (currentPool && currentPool.symbols[0]) {
            setSelectedToken(currentPool.symbols[0]);
            setShowTokenList(false);
        }



    }, [currentPool])

    useEffect(() => {
        // Handle click event from Parent Component
        onProceed();
    }, [clickCount])

    const onProceed = useCallback(async () => {
        console.log("onProcess...");

        if (amount <= 0) {
            return;
        }

        console.log("amoutn is valid...");
        switch(actionPanel) {
            case ACTION_PANELS.ADD_LIQUIDITY:
                console.log("ADD_LIQUIDITY ....")
                break;
            case ACTION_PANELS.REMOVE_LIQUIDITY:
                console.log("REMOVE_LIQUIDITY ...")
                break;
        }

    },[amount, selectedToken, currentPool])

    const toggle = useCallback(() => {
        setShowTokenList(!showTokenList)
    }, [showTokenList])

    const onSelectedTokenChange = (token) => {
        setSelectedToken(token);
        setShowTokenList(false);
    }

    useEffect(() => {
        if (selectedToken) {

            (async () => {
                setLoadingBalance(true);

                try {
                    if (selectedToken === "ETH") {
                        console.log("Check native ETH...");
                        const result = await getETHBalance();
                        setBalance(Number(result.toString()).toFixed(6) + "");
                    } else {

                        for (let i = 0; i < currentPool.symbols.length; i++) {
                            if (currentPool.symbols[i] === selectedToken) {
                                const result = await getTokenBalance(currentPool.reserves[i][1]);
                                setBalance(Number(result.toString()).toFixed(6) + "");
                                break;
                            }
                        }

                    }
                } catch (error) {
                    console.log("fetch rate error : ", error);
                }

                setLoadingBalance(false);




            })()





        }
    }, [selectedToken, currentPool])

    const handleChange = useCallback((e) => {

        e.preventDefault();
        const regexp = /^[0-9]*(\.[0-9]{0,4})?$/;
        const value = regexp.test(e.target.value) ? (e.target.value) : amount;
        setAmount(value);

    }, [isLoadingBalance, amount]);

    return (
        <Fragment>
            <TokenBalanceContainer>
                {/*
                <InputGroup>
                    <InputGroupIcon>
                        <div style={{ display: "flex", border: "0px" }}>
                            <TokenLogo src={getIcon("BNT")} alt={"BNT"} />
                            <TokenLogo src={getIcon("ETH")} alt={"ETH"} />

                        </div>
                    </InputGroupIcon>
                    <InputGroupButton style={{ fontSize: "14px" }}>

                        BNT/ETH{` `}
                        &#9660;
                    </InputGroupButton>
                    <InputGroupArea style={{ width: "55%", fontSize: "14px" }}>
                        <input id="deposited" placeholder="120 BNT / 350.345 ETH" type="text" />
                    </InputGroupArea>
                </InputGroup>
                */}



                {actionPanel !== ACTION_PANELS.CREATE_POOL &&
                    (
                        <InputGroup>
                            <InputGroupIcon>
                                <img src={getIcon(selectedToken)} alt={selectedToken} style={{
                                    width: "34px",
                                    height: "32px"
                                }} />
                            </InputGroupIcon>
                            <InputGroupButton>
                                <span onClick={() => toggle()}>{selectedToken}&#9660;</span>
                                {showTokenList &&
                                    (
                                        <DropdownContainer
                                            style={{ height: `${(currentPool.symbols.length * 60)}px` }}
                                        >
                                            <table>
                                                <tbody>

                                                    {currentPool.symbols.map((symbol, index) => {
                                                        return (
                                                            <tr key={index} onClick={() => onSelectedTokenChange(symbol)}>
                                                                <td width="25%">
                                                                    <img src={getIcon(symbol)} alt={symbol} style={{
                                                                        width: "34px",
                                                                        height: "32px"
                                                                    }} />
                                                                </td>
                                                                <td >{symbol}</td>
                                                            </tr>
                                                        )
                                                    })}


                                                </tbody>
                                            </table>
                                        </DropdownContainer>
                                    )
                                }



                            </InputGroupButton>
                            <InputGroupArea>
                                <input value={amount} id="amountInput" onChange={handleChange} placeholder="0.00" type="number" min="0" step="0.01" pattern="^\d+(?:\.\d{1,2})?$" />
                            </InputGroupArea>
                        </InputGroup>
                    )

                }


            </TokenBalanceContainer>

            <AccountContainer>
                <AccountLeft>
                    {actionPanel === ACTION_PANELS.ADD_LIQUIDITY && (
                        <span>
                            BALANCE {balance}{` `}{isLoadingBalance && (<img src={loadingIcon} width="12px" height="12px" />)}
                        </span>
                    )

                    }

                    {actionPanel === ACTION_PANELS.REMOVE_LIQUIDITY && (
                        <span>
                            AVAILABLE 0.66780 ETH
                        </span>
                    )

                    }

                </AccountLeft>

            </AccountContainer>
        </Fragment>
    )
}

const PoolListPanel = (props) => {

    const { active, onUpdateCurrentPool, pools } = props;

    const [searchTerm, setSearchTerm] = useState("");
    const [filtered, setFiltered] = useState(pools);

    useEffect(() => {
        if (pools[0]) {
            onUpdateCurrentPool(pools[0]);
        }
    }, [pools]);

    const onChange = (poolObject) => {
        onUpdateCurrentPool(poolObject);
    }



    useEffect(() => {

        if (pools.length > 0) {
            if (searchTerm === "") {
                setFiltered(pools);
            } else {
                setFiltered(pools.filter((item) => item.formalName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1))
            }
        }

    }, [searchTerm, pools])

    const handleSearchTerm = useCallback(async (e) => {
        e.preventDefault();
        setSearchTerm(e.target.value);
    }, [pools])

    return (
        <DropdownListContainer active={active} skipSearch={true}>
            <table>
                <tbody>

                    <TableSearchRow>
                        <td style={{ textAlign: "center", fontSize: "10px" }} width="70px">
                            {/*
                            <img src={SearchIcon} width="26px" />
                            */}
                        </td>
                        <td width="100px">
                            <input value={searchTerm} onChange={handleSearchTerm} placeholder="Search By Symbol" type="text" />
                        </td>
                        <td>
                        </td>
                    </TableSearchRow>

                    {filtered.map((item, index) => {

                        return (
                            <tr onClick={() => onChange(item)} key={index}>
                                <td width="80px">
                                    <TableInnerRow>
                                        {item.symbols.map((symbol, index) => {
                                            return (
                                                <TokenLogo key={index} src={getIcon(symbol)} alt={symbol} />
                                            )
                                        })}

                                    </TableInnerRow>
                                </td>
                                <td width="80px">
                                    {`${item.name} `}
                                </td>
                                <td>
                                    <TableInnerRow>
                                        <TableBox>
                                            $870044
                                        </TableBox>
                                    </TableInnerRow>

                                </td>
                            </tr>
                        )


                    })}
                </tbody>
            </table>
        </DropdownListContainer>
    )
};



