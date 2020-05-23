import React, { useCallback, useState, useEffect, Fragment } from 'react';
import PieChart from 'react-minimal-pie-chart';
import { useBancor } from "../../../../contexts/bancor";
import { useModal } from "../../../../contexts/modal";
import { useRate } from "../../../../contexts/rate";
import { getIcon } from "../../../../utils/token";
import { Header } from "../../../Common";
import PoolCreationPanel from "./poolCreation";
import styled from "styled-components";

import loadingIcon from "../../../../../assets/loading.gif"
import SearchIcon from "../../../../../assets/search.svg";

import { toFixed } from "../../../../utils/conversion";
import { TRANSACTION_TYPE } from "../../../../constants";

export const ACTION_PANELS = {
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
        clickCount,
        color,
        wrapAt,
        whitelisted,
        defaultPool,
        disablePoolCreation
    } = props;

    const networkId = web3ReactContext.networkId;
    const [pools, setPools] = useState([]);
    const [loadingPools, setLoadingPools] = useState(false);
    const { getUsdRate } = useRate();

    const {
        loading,
        listLiquidityPools,
        getTokenName,
        getLiquidityPool,
        getReserveRatio,
        getConversionFee,
        getMaxConversionFee,
        getTotalSupplyByConverter,
        getETHBalance,
        getTokenBalance,
        fundLiquidityPool,
        withdrawLiquidityPool,
        getLiquidityPoolDeposit,
        getAfforableAmount,
        createSmartToken,
        getSmartToken,
        createConverter,
        estimateTotalTransactions,
        checkIfAccountHasSufficientBalance,
        addInitialReserve,
        activateConverter,
        converterOwner,
        getReserves,
        registerConverter
    } = useBancor(web3ReactContext);

    const {
        showProcessingModal,
        showEtherTokenModal,
        showModal,
        tick,
        showConfirmModal,
        showErrorMessageModal
    } = useModal();

    useEffect(() => {
        (async () => {
            if (!loading) {

                // List liquidity pools
                setLoadingPools(true);
                const onClose = showProcessingModal("Loading Liquidity Pools...", "");
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
                                    const totalSupply = await getTotalSupplyByConverter(pool.converterAddress);

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
                                        totalSupply: totalSupply,
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
                                        let result = finalResult;
                                        console.log("finalResult : ", finalResult);
                                        if (whitelisted && whitelisted.length > 0) {
                                            result = result.filter(item => whitelisted.indexOf(item.name) !== -1);
                                        }
                                        // overrides SAI pool
                                        result = result.map(item => {
                                            if (item.address === "0xee01b3AB5F6728adc137Be101d99c678938E6E72") {
                                                item.name = "SAIBNT";
                                            }
                                            return item;
                                        })

                                        setPools(result.filter(item => item.reserves.length !== 1).sort((a, b) => (Number(a.totalSupply) > Number(b.totalSupply)) ? -1 : 1));
                                        setLoadingPools(false);
                                        onClose();
                                    }
                                )
                            }
                        )

                    }
                )




            }
        })();

    }, [loading, networkId, whitelisted])

    const isLoading = loading;

    const [actionPanel, setActionPanel] = useState(ACTION_PANELS.ADD_LIQUIDITY);
    const [currentPool, setCurrentPool] = useState();
    const [currentPoolRatio, setCurrentPoolRatio] = useState("");
    const [currentPoolFee, setCurrentPoolFee] = useState("");
    const [currentPoolSpread, setCurrentPoolSpread] = useState("");
    const [currentChartData, setCurrentChartData] = useState([{ color: COLORS[0], title: 'One', value: 50 }, { color: COLORS[1], title: 'Two', value: 50 }]);
    const [showActionListModal, setActionListModal] = useState(false);
    const [showPoolListModal, setPoolListModal] = useState(false);
    const [deposit, setDeposit] = useState([]);
    const [usdRates, setUsdRates] = useState([]);

    const [isLoadingDeposited, setLoadingDeposited] = useState(false);

    useEffect(() => {
        updateActionText(actionPanel);
    }, [actionPanel])

    useEffect(() => {
        // Checks a pool information
        if (currentPool) {
            console.log("Checks : ", currentPool);

            (async () => {

                const ratio = currentPool.reserves.reduce((prev, item) => {
                    let reserveRatio;
                    if (prev === "") {
                        reserveRatio = `${Math.ceil(item[2] * 100)}`;
                    } else {
                        reserveRatio = prev + `/${Math.ceil(item[2] * 100)}`
                    }
                    return reserveRatio;
                }, "")

                setCurrentPoolRatio(ratio);
                setLoadingDeposited(true);
                const conversionFee = await getConversionFee(currentPool.converterAddress);
                console.log("conversionFee : ", conversionFee);
                setCurrentPoolFee(`${conversionFee}%`)

                // Checks a deposit amount on this pool
                await updateDepositAmount();
                // checking rates of each reserve in USD
                let rates = [];
                if (currentPool.symbols.length > 0) {
                    for (let symbol of currentPool.symbols) {
                        const price = await getUsdRate(symbol);
                        if (price) {
                            rates.push({
                                symbol: symbol,
                                usdPrice: price
                            })
                        }

                    }
                    setUsdRates(rates);
                }

            })()

        }

    }, [currentPool])


    const updateDepositAmount = useCallback(async () => {

        const onClose = showProcessingModal("Checking your deposits...", "");

        const depositAmount = await getLiquidityPoolDeposit(currentPool);
        setDeposit(depositAmount);
        setLoadingDeposited(false);
        onClose();

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
        setActionPanel(panel);
        setActionListModal(false);
    }, [isLoading])

    const onUpdateCurrentPool = useCallback((poolObject) => {
        setCurrentPool(poolObject);
        setPoolListModal(false);

    }, [])

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


    if (actionPanel === ACTION_PANELS.CREATE_POOL) {
        return (
            <PoolCreationPanel
                title={actionPanel}
                color={color}
                width={width}
                onActionPanelUpdate={onActionPanelUpdate}
                createSmartToken={createSmartToken}
                getSmartToken={getSmartToken}
                checkIfAccountHasSufficientBalance={checkIfAccountHasSufficientBalance}
                createConverter={createConverter}
                getTotalSupplyByConverter={getTotalSupplyByConverter}
                getMaxConversionFee={getMaxConversionFee}
                addInitialReserve={addInitialReserve}
                activateConverter={activateConverter}
                converterOwner={converterOwner}
                getReserves={getReserves}
                registerConverter={registerConverter}
            />
        )
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
                            defaultPool={defaultPool}
                        />

                        <ChartContainer>

                            {width <= wrapAt ?
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
                            <div style={{ fontSize: "12px", paddingTop: "10px", textAlign: "center" }}>
                                <b>Pool Fee</b>{` `}{currentPoolFee} /  <b>Ratio</b>{` `}{currentPoolRatio}
                            </div>

                            {currentPool &&
                                (
                                    <Fragment>
                                        <ChartLeftPanel>
                                            {currentPool.symbols.map((item, index) => {
                                                const usdRate = usdRates.find(rate => rate.symbol === item);
                                                return (
                                                    <div key={index}>
                                                        {usdRate
                                                            ?
                                                            <div>
                                                                <Dot color={COLORS[index] || COLORS[0]} />{` `}{item || ""}{` $`}{(Number(currentPool.reserves[index][0]) * Number(usdRate.usdPrice)).toFixed(2).toLocaleString()}
                                                            </div>
                                                            :
                                                            <div>
                                                                <Dot color={COLORS[index] || COLORS[0]} />{` `}{item || ""}{` `}{Number(currentPool.reserves[index][0]).toFixed(6)}
                                                            </div>
                                                        }

                                                    </div>
                                                )
                                            })}
                                        </ChartLeftPanel>
                                        <ChartRightPanel>
                                            <div>
                                                <b>Deposited</b>
                                                {deposit.map((item, index) => {
                                                    return (
                                                        <div key={index}> {Number(item.amount).toFixed(4)}{` `}{item.symbol}</div>
                                                    )
                                                })}
                                            </div>
                                        </ChartRightPanel>
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
                                disablePoolCreation={disablePoolCreation}
                            />

                            <ActionInputPanel
                                actionPanel={actionPanel}
                                currentPool={currentPool}
                                getETHBalance={getETHBalance}
                                getTokenBalance={getTokenBalance}
                                clickCount={clickCount}
                                updateDepositAmount={updateDepositAmount}
                                fundLiquidityPool={fundLiquidityPool}
                                withdrawLiquidityPool={withdrawLiquidityPool}
                                getAfforableAmount={getAfforableAmount}
                                color={color}
                                width={width}
                                tick={tick}
                                showProcessingModal={showProcessingModal}
                                showEtherTokenModal={showEtherTokenModal}
                                isModalActive={showModal}
                                wrapAt={wrapAt}
                                estimateTotalTransactions={estimateTotalTransactions}
                                showConfirmModal={showConfirmModal}
                                showErrorMessageModal={showErrorMessageModal}
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

const ChartLeftPanel = styled.div`
    position: absolute; 
    left: 0px;
    top: 20px; 
    text-align: left;
    font-size: 12px;
`;

const ChartRightPanel = styled.div`
    position: absolute; 
    right: 0px; 
    top: 20px;
    text-align: right;
    font-size: 12px;
    width: 150px;
`;

const LiquidityInputPanel = styled.div`
    position: absolute; 
    left: 50%;
    top: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    width: 200px
`;

const ChartDepositPanel = styled.div`
    position: absolute; 
    right: 0px; 
    bottom: 0px;
    text-align: right;
    font-size: 12px;
    width: 150px;
`

const DropdownContainer = styled.div`
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 220px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
    margin-left: 40px;
    height: ${props => props.minimized ? "100px" : "145px"};
    
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
        cursor: pointer;
        ${props => props.skipSearch && `
            :first-child) {
                cursor: default;
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
    padding: 20px;
    position: relative; 
    font-size: 10px;
    height: 100px;
`;

const LiquiditySummaryContainer = styled.div`
    position: relative; 
    ${props => props.isMobile
        ?
        `
        height: 140px;
    `
        :
        `
        height: 100%;
    `
    }
    
`;



const LiquidityInputContainer = styled.div`
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
            
        }

        input {
            border: 0;
            display: block;
            width: 100%;
            padding: 8px;
            text-align:left;
            outline: 1px solid #eee;
        }
    }
`;

const TableInnerRow = styled.div`
    display: flex;
`;

const TableBox = styled.div`
    border: 1px solid #eee;
    vertical-align: middle;
    font-size: 10px;
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

const Button = styled.button`
    background-color: ${props => props.color && `${props.color}`};
    border: none;
    color: white;
    text-align: center;
    text-decoration: none;
    padding: 4px 8px 4px 8px;
    font-size: 14px;
    margin-right: 4px;
    border-radius: 4px;
    ${props => props.disabled && 'opacity: 0.6;'}
`;

const InputGroupArea = styled.div`
    width:100%;

    z-index: -1;
    .slider {
        -webkit-appearance: none;
        width: 100%;
        height: 15px;
        border-radius: 5px;  
        background: #d3d3d3;
        outline: none;
        opacity: 0.7;
        -webkit-transition: .2s;
        transition: opacity .2s;
      }
      
      .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 25px;
        height: 25px;
        border-radius: 50%; 
        background: ${props => props.color ? props.color : "#4CAF50"};
        cursor: pointer;
      }
      
      .slider::-moz-range-thumb {
        width: 25px;
        height: 25px;
        border-radius: 50%;
        background: ${props => props.color ? props.color : "#4CAF50"};
        cursor: pointer;
      }

`;

const InputArea = styled.div`

`;



export default LiquidityPoolPanel;

const ActionListPanel = (props) => {

    const { active, onActionPanelUpdate, disablePoolCreation } = props;


    return (
        <DropdownContainer active={active} minimized={disablePoolCreation}>
            <table>
                <tbody>
                    <tr>
                        <td onClick={() => onActionPanelUpdate(ACTION_PANELS.ADD_LIQUIDITY)}>Add Liquidity</td>
                    </tr>
                    <tr>
                        <td onClick={() => onActionPanelUpdate(ACTION_PANELS.REMOVE_LIQUIDITY)}>Remove Liquidity</td>
                    </tr>
                    {!disablePoolCreation &&
                        (<tr>
                            <td onClick={() => onActionPanelUpdate(ACTION_PANELS.CREATE_POOL)}>Create a New Pool</td>
                        </tr>

                        )

                    }
                </tbody>
            </table>
        </DropdownContainer>
    )
};


const ActionInputPanel = (props) => {

    const {
        actionPanel,
        currentPool,
        getETHBalance,
        getTokenBalance,
        clickCount,
        fundLiquidityPool,
        withdrawLiquidityPool,
        getAfforableAmount,
        color,
        width,
        tick,
        updateDepositAmount,
        showProcessingModal,
        showEtherTokenModal,
        isModalActive,
        wrapAt,
        estimateTotalTransactions,
        showConfirmModal,
        showErrorMessageModal
    } = props;

    const [isLoadingBalance, setLoadingBalance] = useState(false);
    const [isWrapping, setWrapping] = useState(false);
    const [balances, setBalances] = useState([]);

    const [inputMax, setInputMax] = useState(1000000);
    const [inputMin, setInputMin] = useState(0);
    const [inputAmount, setInputAmount] = useState(0);

    const [maxAffordablePercentage, setMaxAffordablePercentage] = useState(0);
    const [poolTokenAmount, setPoolTokenAmount] = useState(0);
    const [poolTokenSupply, setPoolTokenSupply] = useState(0);

    useEffect(() => {

        if (currentPool) {
            (async () => {
                await updateBalance();
            })()
        }

    }, [currentPool]);

    useEffect(() => {
        if (tick > 0) {
            (async () => {
                await updateBalance();
            })()
        }
    }, [tick])

    useEffect(() => {
        if ((tick > 0)) {
            setWrapping(false);
        }
    }, [tick])

    useEffect(() => {
        // Handle click event from Parent Component
        // onProceed();
        console.log("clickCount : ", clickCount);
        onProceedDryrun();
    }, [clickCount])

    useEffect(() => {
        if (tick > 0) {
            (async () => {
                onProceed();
            })()
        }
    }, [tick])

    const onProceed = useCallback(async () => {

        if (isWrapping) {
            return
        }

        if (!currentPool) {
            return;
        }

        switch (actionPanel) {
            case ACTION_PANELS.ADD_LIQUIDITY:
                console.log("ADD_LIQUIDITY ....");
                if (inputAmount === 0) {
                    return;
                }
                const input = (Number(maxAffordablePercentage) * Number(inputAmount)) / 1000000;
                try {
                    const txs = await fundLiquidityPool(currentPool, input);
                    const onClose = showProcessingModal("Funding...", `Number of transactions : ${txs.length}`);
                    try {
                        await Promise.all(txs.map(item => item.wait()));
                        console.log("funded.");
                        await updateBalance();
                        await updateDepositAmount();
                    } catch (error) {
                        onClose();
                        throw new Error(error.message);
                    }
                    onClose();
                } catch (error) {
                    console.log("error : ", error);
                    showErrorMessageModal("Unknow error occurs, may caused by the token's allowance changing in a short time period", "We are advise you to try again with the same percentage");
                }
                break;
            case ACTION_PANELS.REMOVE_LIQUIDITY:
                console.log("REMOVE_LIQUIDITY ...");

                if (inputAmount === 0) {
                    return;
                }

                const liquidateInput = ((Number(poolTokenAmount * 100) / Number(poolTokenSupply)) * Number(inputAmount)) / 1000000;
                try {
                    const liquidateTx = await withdrawLiquidityPool(currentPool, liquidateInput);
                    const onClose = showProcessingModal("Liquidating...", `Tx : ${liquidateTx.hash}`);
                    try {
                        await liquidateTx.wait();
                        console.log("liquidated.");
                        await updateBalance();
                        await updateDepositAmount();
                    } catch (error) {
                        onClose();
                        throw new Error(error.message);
                    }
                    onClose();

                } catch (error) {
                    console.log("error : ", error);
                    showErrorMessageModal("Unknow error occurs", "You can try to reduce the percentage and proceed again.");
                }
                break;
        }


    }, [actionPanel, isWrapping, currentPool, maxAffordablePercentage, inputAmount, poolTokenAmount, poolTokenSupply])


    const onProceedDryrun = useCallback(async () => {
        if (inputAmount === 0) {
            return;
        }
        switch (actionPanel) {
            case ACTION_PANELS.ADD_LIQUIDITY:
                const input = (Number(maxAffordablePercentage) * Number(inputAmount)) / 1000000;
                const totalAddingTransactions = await estimateTotalTransactions(TRANSACTION_TYPE.ADD_LIQUIDITY, {
                    pool: currentPool,
                    percentage: input
                });
                showConfirmModal("Please be informed that you will need to approve a number of transactions on Metamask", `Total transactions to be signed : ${totalAddingTransactions}`)
                break;
            case ACTION_PANELS.REMOVE_LIQUIDITY:
                showConfirmModal("Please be informed that you will need to approve a number of transactions on Metamask", `Total transactions to be signed : ${1}`)
                break;
        }

    }, [actionPanel, currentPool, maxAffordablePercentage, inputAmount]);

    const updateBalance = useCallback(async () => {


        if (currentPool) {
            setLoadingBalance(true);
            const onClose = showProcessingModal("Loading balances...");
            let result = [];
            try {

                for (let i = 0; i < currentPool.reserves.length; i += 1) {
                    const symbolName = currentPool.symbols[i] || "";

                    const amount = await getTokenBalance(currentPool.reserves[i][1]);
                    result.push({
                        symbol: symbolName,
                        balance: `${toFixed(Number(amount), 6)}`
                    })
                }
            } catch (error) {
                console.log("fetch rate error : ", error);
            }
            setBalances(result);

            await updateAffordableToken(result);
            setLoadingBalance(false);
            onClose();
        }

    }, [currentPool, isWrapping])

    const updateAffordableToken = useCallback(async (tokenList) => {

        if (actionPanel === ACTION_PANELS.ADD_LIQUIDITY) {
            setInputAmount(0);
        } else if (actionPanel === ACTION_PANELS.REMOVE_LIQUIDITY) {
            setInputAmount(1000000);
        }

        if (currentPool && tokenList.length > 0) {

            console.log("get affordable amount...")
            const { maxAfforable, totalPoolToken, totalPoolTokenSupply } = await getAfforableAmount(currentPool, tokenList);
            console.log("result --> ", maxAfforable, totalPoolToken, totalPoolTokenSupply);

            setPoolTokenAmount(Number(totalPoolToken));
            setPoolTokenSupply(Number(totalPoolTokenSupply));
            setMaxAffordablePercentage(maxAfforable);

        }

    }, [currentPool, actionPanel])

    useEffect(() => {
        if (actionPanel === ACTION_PANELS.ADD_LIQUIDITY) {
            setInputAmount(0);
        } else if (actionPanel === ACTION_PANELS.REMOVE_LIQUIDITY) {
            setInputAmount(1000000);
        }
    }, [actionPanel])


    const handleChange = useCallback((e) => {
        // e.preventDefault();

        if (actionPanel === ACTION_PANELS.ADD_LIQUIDITY) {
            if (maxAffordablePercentage !== 0 && isLoadingBalance === false) {
                setInputAmount(e.target.value);
            }
        }

        if (actionPanel === ACTION_PANELS.REMOVE_LIQUIDITY) {
            if (poolTokenAmount !== 0 && isLoadingBalance === false) {
                setInputAmount(e.target.value);
            }
        }


    }, [maxAffordablePercentage, isLoadingBalance, actionPanel, poolTokenAmount])

    if (!currentPool) {
        return <Fragment></Fragment>
    }

    return (
        <LiquiditySummaryContainer isMobile={width <= 800} >

            {actionPanel === ACTION_PANELS.ADD_LIQUIDITY &&
                (
                    <Fragment>
                        <ChartLeftPanel>
                            <div>
                                <b>Your Staking</b>
                                <div>
                                    {poolTokenAmount.toFixed(4)} {(Number(inputAmount) !== 0 && (Number(maxAffordablePercentage) !== 0)) && `(+${(poolTokenSupply * ((Number(maxAffordablePercentage) * Number(inputAmount)) / 1000000) / 100).toFixed(4)})`}
                                </div>
                            </div>
                            <div>
                                <b>Total Supply</b>
                                <div>
                                    {poolTokenSupply.toFixed(4)}
                                </div>
                            </div>
                        </ChartLeftPanel>

                        <LiquidityInputPanel>
                            <InputGroupArea color={color} style={{ fontSize: "14px", marginTop: "10px", padding: "10px 0px 0px 0px" }}>
                                <input type="range" onChange={handleChange} min={inputMin} max={inputMax} value={inputAmount} className="slider" id="myRange" />
                            </InputGroupArea>
                            <AccountContainer>
                                <AccountLeft style={{ flex: "40%" }}>
                                    Amount {(((Number(maxAffordablePercentage) * Number(inputAmount)) / 1000000).toFixed(6))}%
                            </AccountLeft>
                                <AccountRight style={{ flex: "60%" }}>
                                    Max Affordable {Number(maxAffordablePercentage).toFixed(6)}%
                            </AccountRight>
                            </AccountContainer>
                            <div style={{ textAlign: "center", marginTop: "8px" }}>

                                {currentPool.symbols.map((name, index) => {
                                    return (
                                        <span key={index}>
                                            <TokenLogo src={getIcon(name)} alt={name} />
                                        </span>
                                    )
                                })}
                                <div style={{ fontSize: "12px", marginTop: "8px" }}>
                                    <Button onClick={() => showErrorMessageModal("Adding Liquidity to the Pool", "You can buy pool tokens with all reserve tokens using the same percentage, you will see how much pool tokens on the left while your current balances on the right.")} color={color}>?</Button>
                                </div>
                            </div>
                        </LiquidityInputPanel>
                        <ChartRightPanel style={{ fontSize: "12px" }}>
                            <b>Balances</b>
                            {currentPool.reserves.map((item, index) => {
                                const symbol = currentPool.symbols[index];
                                const balance = (balances.find(item => item.symbol === symbol));
                                const balanceAmount = balance ? balance.balance : "0.00";
                                return (
                                    <div key={index}>
                                        <div>
                                            {balanceAmount}{` `}{symbol}
                                        </div>
                                        {(Number(inputAmount) !== 0) &&
                                            (
                                                <div style={{ color: "red", fontWeight: "600" }}>
                                                    (-{((Number(item[0]) * ((Number(maxAffordablePercentage) * Number(inputAmount)) / 1000000)) / 100).toFixed(6)}{` `}{symbol})
                                                </div>
                                            )

                                        }
                                        {symbol === "ETH" && (
                                            <WrappedEtherBar
                                                showEtherTokenModal={showEtherTokenModal}
                                                isModalActive={isModalActive || isLoadingBalance}
                                                setWrapping={setWrapping}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </ChartRightPanel>
                    </Fragment>
                )

            }

            {actionPanel === ACTION_PANELS.REMOVE_LIQUIDITY &&
                (
                    <Fragment>
                        <ChartLeftPanel>
                            <div>
                                <b>Your Staking</b>
                                <div>
                                    {poolTokenAmount.toFixed(4)} {(Number(inputAmount) !== 0) && `(-${((poolTokenAmount * Number(inputAmount)) / 1000000).toFixed(4)})`}
                                </div>
                            </div>
                            <div>
                                <b>Total Supply</b>
                                <div>
                                    {poolTokenSupply.toFixed(4)}
                                </div>
                            </div>
                        </ChartLeftPanel>

                        <LiquidityInputPanel>
                            <InputGroupArea color={color} style={{ fontSize: "14px", marginTop: "10px", padding: "10px 0px 0px 0px" }}>
                                <input type="range" onChange={handleChange} min={inputMin} max={inputMax} value={inputAmount} className="slider" id="myRange" />
                            </InputGroupArea>
                            <AccountContainer>
                                <AccountLeft style={{ flex: "40%" }}>
                                    Amount {((((Number(poolTokenAmount * 100) / Number(poolTokenSupply)) * Number(inputAmount)) / 1000000).toFixed(6))}%
                            </AccountLeft>
                                <AccountRight style={{ flex: "60%" }}>
                                    Max Affordable {(Number(poolTokenAmount * 100) / Number(poolTokenSupply)).toFixed(6)}%
                            </AccountRight>
                            </AccountContainer>
                            <div style={{ textAlign: "center", marginTop: "8px" }}>
                                {currentPool.symbols.map((name, index) => {
                                    return (
                                        <span key={index}>
                                            <TokenLogo src={getIcon(name)} alt={name} />
                                        </span>
                                    )
                                })}
                                <div style={{ fontSize: "12px", marginTop: "8px" }}>
                                    <Button onClick={() => showErrorMessageModal("Removing Liquidity from the Pool", "You can sell pool tokens for all reserve tokens using the same percentage as opposed to funding the pool.")} color={color}>?</Button>
                                </div>
                            </div>

                        </LiquidityInputPanel>
                        <ChartRightPanel style={{ fontSize: "12px" }}>
                            <b>Balance</b>
                            {currentPool.reserves.map((item, index) => {
                                const symbol = currentPool.symbols[index];
                                const balance = (balances.find(item => item.symbol === symbol));
                                const balanceAmount = balance ? balance.balance : "0.00";
                                return (
                                    <div key={index}>
                                        <div>
                                            {balanceAmount}{` `}{symbol}
                                        </div>
                                        {(Number(inputAmount) !== 0) &&
                                            (
                                                <div style={{ color: "green", fontWeight: "600" }}>
                                                    (+{((Number(item[0]) * 0.01 * ((((Number(poolTokenAmount * 100) / Number(poolTokenSupply))) * Number(inputAmount)) / 1000000))).toFixed(6)}{` `}{symbol})
                                                </div>
                                            )
                                        }
                                        {symbol === "ETH" && (
                                            <WrappedEtherBar
                                                showEtherTokenModal={showEtherTokenModal}
                                                isModalActive={isModalActive || isLoadingBalance}
                                                setWrapping={setWrapping}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </ChartRightPanel>
                    </Fragment>
                )

            }






        </LiquiditySummaryContainer>
    )
}

const WrappedEtherBar = ({ showEtherTokenModal, isModalActive, setWrapping }) => {

    const showModal = useCallback((e) => {
        if (!isModalActive) {
            setWrapping(true)
            showEtherTokenModal("", "")
        }
    }, [isModalActive])

    return (
        <div
            style={{
                fontSize: "10px",
                fontWeight: "600",
                fontStyle: "italic",
                cursor: "pointer",
                opacity: isModalActive ? "0.6" : "1.0"
            }}
            onClick={showModal}
        >
            Wrap/Unwrap ETH
        </div>
    )
}

const SummaryInput = styled.input`
    :hover {
        cursor: default;
    }
`;

const TokenAmount = styled.div`
    ${props => props.danger && `
        color: red;
    `}
`;


const PoolListPanel = (props) => {
    const { active, onUpdateCurrentPool, pools, defaultPool } = props;

    const [searchTerm, setSearchTerm] = useState("");
    const [filtered, setFiltered] = useState(pools);

    useEffect(() => {
        if (pools[0]) {

            if (defaultPool) {
                const pool = pools.find(item => item.name === defaultPool);
                onUpdateCurrentPool(pool);
            } else {
                onUpdateCurrentPool(pools[0]);
            }
        }
    }, [pools, defaultPool]);

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
                        <td style={{ textAlign: "center", fontSize: "10px" }} width="40%">
                            {/*
                            <img src={SearchIcon} width="26px" />
                            */}
                        </td>
                        <td>
                            <input value={searchTerm} onChange={handleSearchTerm} placeholder="Search By Symbol" type="text" />
                        </td>
                        <td width="10%">

                        </td>
                    </TableSearchRow>

                    {filtered.map((item, index) => {
                        const ratio = item.reserves.reduce((prev, item) => {
                            let reserveRatio;
                            if (prev === "") {
                                reserveRatio = `${Math.ceil(item[2] * 100)}`;
                            } else {
                                reserveRatio = prev + `/${Math.ceil(item[2] * 100)}`
                            }
                            return reserveRatio;
                        }, "")
                        return (
                            <tr onClick={() => onChange(item)} key={index}>
                                <td width="40%">
                                    <TableInnerRow>
                                        {item.symbols.map((symbol, index) => {
                                            if (index > 3) {
                                                return;
                                            }
                                            return (
                                                <TokenLogo key={index} src={getIcon(symbol)} alt={symbol} />
                                            )
                                        })}

                                    </TableInnerRow>
                                </td>
                                <td>
                                    {`${item.name} `}
                                    <TableInnerRow>
                                        <TableBox>
                                            Bancor
                                        </TableBox>
                                        <TableBox>
                                            Supply {Number(Math.floor(item.totalSupply)).toLocaleString()}
                                        </TableBox>
                                    </TableInnerRow>
                                </td>
                                <td width="10%">

                                </td>
                            </tr>
                        )


                    })}
                </tbody>
            </table>
        </DropdownListContainer>
    )
};



