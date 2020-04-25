import React, { useCallback, useState, useEffect, Fragment } from 'react';
import styled from "styled-components";
import PieChart from 'react-minimal-pie-chart';

import { ACTION_PANELS } from "../liquidityPool";
import { Header } from "../../../../Common";
import { useModal } from "../../../../../contexts/modal";
import { useBancor } from "../../../../../contexts/bancor";

const initialState = {
    setupRelayToken: {
        step: 1,
        tokenAddress: "",
        tokenSymbol : "",
        tokenName : "",
        isNewToken: true,
        completed: false
    },
    setupConverter: {
        step: 2,
        completed: false,
        converterAddress: "",
        conversionFee: 3.0,
        initialPoolTokenAmount: 0,
        reserves: []
    },
    register: {
        step: 3,
        completed: false,
        tradingFee: 0.1
    }
}


const PoolCreationPanel = (props) => {

    const { 
        title, 
        onActionPanelUpdate, 
        width, 
        color, 
        createSmartToken, 
        getSmartToken, 
        createConverter, 
        checkIfAccountHasSufficientBalance,
        addInitialReserve,
        registerConverter
    } = props;

    const { showProcessingModal } = useModal();

    const [active, setActive] = useState(false);
    const [step, setStep] = useState(1);
    const [state, setState] = useState(initialState);

    const toggleMenu = useCallback(() => {
        setActive(!active);
    }, [active])

    const onPanelUpdate = useCallback((panel) => {
        if (panel !== ACTION_PANELS.CREATE_POOL) {
            onActionPanelUpdate(panel);
        }
        setActive(false);
    }, [])

    return (
        <Fragment>
            <Pane>
                <Header>
                    <span onClick={() => toggleMenu()}>
                        {title}
                        {` `}&#9660;
                    </span>
                </Header>
                <Menu active={active}>
                    <table>
                        <tbody>
                            <tr>
                                <td onClick={() => onPanelUpdate(ACTION_PANELS.ADD_LIQUIDITY)}>Add Liquidity</td>
                            </tr>
                            <tr>
                                <td onClick={() => onPanelUpdate(ACTION_PANELS.REMOVE_LIQUIDITY)}>Remove Liquidity</td>
                            </tr>
                            <tr>
                                <td onClick={() => onPanelUpdate(ACTION_PANELS.CREATE_POOL)}>Create a New Pool</td>
                            </tr>
                        </tbody>
                    </table>
                </Menu>
                <Row style={{ marginTop: "10px" }}>
                    <Column>
                        Exchange
                    </Column>
                    <Column>
                        <select id="exchange">
                            <option value="bancor">Bancor</option>
                        </select>
                    </Column>
                </Row>
                <Row>
                    <Column>
                        {` `}
                    </Column>
                    <Column>
                        <p>
                            Prepared is me marianne pleasure likewise debating. Wonder an unable except better stairs do ye admire. His and eat secure sex called esteem praise.
                        </p>

                    </Column>
                </Row>
                {/*
                <ChartContainer>
                    <SummarySection>
                        <b>Summary</b>

                    </SummarySection>
                    
                    <PieChart
                        data={[{ value: 1, key: 1, color: color }]}
                        reveal={percentage}
                        lineWidth={20}
                        background="#bfbfbf"
                        lengthAngle={270}
                        style={{
                            height: width <= 600 ? '100px' : '200px'
                        }}
                        rounded
                    />
                    
                </ChartContainer>
                */}

            </Pane>
            <Pane>

                {step !== 5 && (
                    <Header>
                        Step {step}/4
                    </Header>
                )}

                {step === 5 && (
                    <Header>
                        Congratulation!
                    </Header>
                )}


                {step === 1 &&
                    (
                        <SetupRelayToken
                            color={color}
                            state={state}
                            updateState={setState}
                            updateStep={setStep}
                            showProcessingModal={showProcessingModal}
                            createSmartToken={createSmartToken}
                            getSmartToken={getSmartToken}
                        />
                    )
                }

                {step === 2 &&
                    (
                        <SetupConverter
                            color={color}
                            state={state}
                            updateState={setState}
                            updateStep={setStep}
                            showProcessingModal={showProcessingModal}
                            checkIfAccountHasSufficientBalance={checkIfAccountHasSufficientBalance}
                            createConverter={createConverter}
                            addInitialReserve={addInitialReserve}
                        />
                    )
                }

                {step === 3 &&
                    (
                        <Register
                            color={color}
                            state={state}
                            updateState={setState}
                            updateStep={setStep}
                            registerConverter={registerConverter}
                            showProcessingModal={showProcessingModal}
                        />
                    )

                }

                {step === 4 &&
                    (
                        <Summary
                            color={color}
                            state={state}
                            updateState={setState}
                            updateStep={setStep}
                        />
                    )

                }

            </Pane>
        </Fragment>
    )
}

export default PoolCreationPanel;

const SetupRelayToken = (props) => {

    const { color, state, updateState, updateStep, showProcessingModal , createSmartToken, getSmartToken} = props;

    const [poolName, setPoolName] = useState("");
    const [poolFullName, setPoolFullName] = useState("");

    const initialExistTokenAddress = state.setupRelayToken.completed ? state.setupRelayToken.tokenAddress : "0x40d4557925f1c92289BcAC23fEfBe3933E05A5B1";

    const [existTokenAddress, setExistTokenAddress] = useState(initialExistTokenAddress);
    const initialOption = state ? state.setupRelayToken.isNewToken : true;
    const [isCreateNew, setCreateNew] = useState(initialOption);
    const [ errorMessage , setErrorMessage ] = useState();

    const handleChange = (e) => {
        e.preventDefault();

        switch (e.target.id) {
            case "poolName":
                setPoolName((e.target.value).toUpperCase());
                const fullName = e.target.value === "" ? "" : `${(e.target.value).toUpperCase()} Smart Relay Token`
                setPoolFullName(fullName);
                break;
            case "poolFullName":
                setPoolFullName(e.target.value);
                break;
            case "tokenAddress":
                setExistTokenAddress(e.target.value);
                break;
        }
    }

    const handleOptions = (e) => {
        e.preventDefault();
        if (e.target.value === "true") {
            setCreateNew(true);
        } else {
            setCreateNew(false);
        }
    }

    const onCreateNewToken = useCallback(async (e) => {
        e.preventDefault();

        setErrorMessage();

        if ((!poolName) && !state['setupRelayToken']['completed']) {
            setErrorMessage("Pool Name is empty")
            return;
        }

        if ((!poolFullName) && !state['setupRelayToken']['completed']) {
            setErrorMessage("Full Name is empty")
            return;
        }

        try {

            if (!state['setupRelayToken']['completed']) {
                const contract = await createSmartToken( poolName, poolFullName);
                console.log("contract : ", contract);
                const onClose = showProcessingModal("Please wait while your relay token is being deployed ", contract.deployTransaction.hash );
                await contract.deployed()

                onClose();

                let updated = state;
                updated['setupRelayToken']['completed'] = true;
                updated['setupRelayToken']['isNewToken'] = true;
                console.log("tokenAddress : ", contract.address);
                updated['setupRelayToken']['tokenAddress'] = contract.address;
                updated['setupRelayToken']['tokenName'] = poolFullName;
                updated['setupRelayToken']['tokenSymbol'] = poolName;
                updateState(updated);
            }

            updateStep(2);

        } catch (error) {
            setErrorMessage(error.message);
        }

        
        
    }, [state, poolName, poolFullName])

    const onLoadToken = useCallback(async (e) => {
        e.preventDefault();

        setErrorMessage();

        if ((!existTokenAddress) && !state['setupRelayToken']['completed']) {
            setErrorMessage("Token Address is empty")
            return;
        }

        const onClose = showProcessingModal("Checking... ", "" );

        try {

            if (!state['setupRelayToken']['completed']) {
                const { symbol, fullName } = await getSmartToken(existTokenAddress);
                let updated = state;
                updated['setupRelayToken']['completed'] = true;
                updated['setupRelayToken']['isNewToken'] = false;
                updated['setupRelayToken']['tokenAddress'] = existTokenAddress;
                updated['setupRelayToken']['tokenName'] = fullName;
                updated['setupRelayToken']['tokenSymbol'] = symbol;
            }
            
            updateStep(2);

        } catch (error) {
            setErrorMessage(error.message);
        }

        onClose();

    }, [state, existTokenAddress]);

    const isCompleted = state['setupRelayToken']['completed'] ? true : false;

    return (
        <Fragment>
            <Row style={{ marginTop: "10px" }}>
                <Column>
                    Setup Relay Token
                </Column>
                <Column>
                    <select disabled={state['setupRelayToken']['completed']} onChange={handleOptions} id="setupRelayTokenOptions" value={isCreateNew}>
                        <option value={true}>Create New Token</option>
                        <option value={false}>Use Existing Token</option>
                    
                    </select>
                </Column>
            </Row>
            {isCreateNew ? (
                <Fragment>
                    <Row>
                        <Column>
                            Pool Name
                         </Column>
                        <Column>
                            <input
                                type="text"
                                disabled={state['setupRelayToken']['completed']}
                                id="poolName"
                                placeholder="ETHBNT"
                                value={isCompleted ? state['setupRelayToken']['tokenSymbol'] : poolName}
                                onChange={handleChange}
                            />
                        </Column>
                    </Row>
                    <Row>
                        <Column>
                            Full Name
                         </Column>
                        <Column>
                            <input
                                type="text"
                                disabled={state['setupRelayToken']['completed']}
                                id="poolFullName"
                                placeholder="ETHBNT Smart Relay Token"
                                value={isCompleted ? state['setupRelayToken']['tokenName'] : poolFullName}
                                onChange={handleChange}
                            />
                        </Column>
                    </Row>
                    <Row
                        style={{
                            position: "relative",
                            height: "60px"
                        }}
                    >
                        <ButtonGroup>
                            <Button onClick={onCreateNewToken} color={color}>Next</Button>
                            
                        </ButtonGroup>
                       
                    </Row>

                    { errorMessage && (
                        <ErrorMessage>
                            {errorMessage }
                        </ErrorMessage>
                    )}
                    { isCompleted && (
                        <ViewOnlyMessage/>
                    )}
                    
                    
                </Fragment>
            ) :
                <Fragment>
                    <Row>
                        <Column>
                            Token Address
                        </Column>
                        <Column>
                            <input
                                type="text"
                                id="tokenAddress"
                                disabled={state['setupRelayToken']['completed']}
                                value={existTokenAddress}
                                onChange={handleChange}
                            />
                        </Column>
                    </Row>
                    <Row
                        style={{
                            position: "relative",
                            height: "60px"
                        }}
                    >
                        <ButtonGroup>
                            <Button onClick={onLoadToken} color={color}>Next</Button>
                        </ButtonGroup>
                        
                    </Row>
                    { errorMessage && (
                        <ErrorMessage>
                            {errorMessage }
                        </ErrorMessage>
                    )}
                    { isCompleted && (
                        <ViewOnlyMessage/>
                    )}
                </Fragment>
            }
        </Fragment>
    )
}


const SetupConverter = (props) => {

    const { 
        color, 
        state, 
        updateState, 
        updateStep, 
        checkIfAccountHasSufficientBalance, 
        showProcessingModal, 
        createConverter,
        addInitialReserve
    } = props;

    const defaultConversionFee = state.setupConverter.completed ? state.setupConverter.conversionFee : 3.0;
    const defaultPoolTokenAmount = state.setupConverter.completed ? state.setupConverter.initialPoolTokenAmount : 0;

    const [conversionFee, setConversionFee] = useState(defaultConversionFee);
    const [reserves, setReserves] = useState([]);
    const [initialPoolTokenAmount, setInitialPoolTokenAmount] = useState(defaultPoolTokenAmount);
    const [ errorMessage , setErrorMessage ] = useState();

    useEffect(() => {
        setReserves([
            {
                tokenAddress: "0x0000000000000000000000000000000000000000",
                weight: "50",
                initialAmount: "0"
            },
            {
                tokenAddress: "0x0000000000000000000000000000000000000000",
                weight: "50",
                initialAmount: "0"
            }
        ])
    }, [])

    const onConfirm = useCallback(async (e) => {
        e.preventDefault();

        setErrorMessage();
        /*

        if (!conversionFee || conversionFee < 0 || conversionFee > 100) {
            setErrorMessage("Conversion Fee is invalid")
            return;
        }

        if (!initialPoolTokenAmount || initialPoolTokenAmount < 1) {
            setErrorMessage("Initial Pool Token Amount must be greater than 1")
            return;
        }

        const onClose = showProcessingModal("Validating... ", "" );
        let totalWeight = 0;
        let addresses = [];
        try {
            for (let reserve of reserves) {
                totalWeight += Number(reserve.weight);

                if (addresses.indexOf(reserve.tokenAddress) !== -1) {
                    throw new Error("Duplicated token address");
                }

                addresses.push(reserve.tokenAddress);
                await checkIfAccountHasSufficientBalance( reserve.tokenAddress , reserve.initialAmount);

            }
        } catch (error) {
            setErrorMessage(error.message);
            onClose();
            return;
        }
        onClose();

        if (totalWeight > 100 || totalWeight < 0) {
            setErrorMessage("Sum of weighting percentage should not exceed 100%");
            return;
        }

        const smartTokenAddress  = state['setupRelayToken']['tokenAddress'];
        if (!smartTokenAddress) {
            setErrorMessage("Can't identify your relay token address");
            return;
        }

        let converterAddress;
        let updated = state;

        try {

            const converterContract = await createConverter(smartTokenAddress, conversionFee, reserves);
            console.log("converterContract : ", converterContract);
            const onClose = showProcessingModal("Please wait while your converter is being deployed ", converterContract.deployTransaction.hash );
            await converterContract.deployed();
            updated['setupConverter']['converterAddress'] = converterContract.address;
            converterAddress = converterContract.address; 
            onClose();

        } catch (error) {
            setErrorMessage(error.message);
            return;
        }
        
        if (!converterAddress) {
            setErrorMessage("Can't identify your converter address")
            return;
        }

        try {

            const txs = await addInitialReserve(smartTokenAddress, converterAddress, reserves, initialPoolTokenAmount);
            console.log("txs object : ", txs);
            const { issuranceTx } = txs;
            const addInitialReserveClose = showProcessingModal("Please wait while your reserve pool is being funded ", issuranceTx.hash );
            await issuranceTx.wait()

            addInitialReserveClose();

        } catch (error) {
            setErrorMessage(error.message);
            return;
        }

        updated['setupConverter']['completed'] = true;
        updated['setupConverter']['reserves'] = reserves;
        updated['setupConverter']['conversionFee'] = conversionFee;
        updated['setupConverter']['initialPoolTokenAmount'] = initialPoolTokenAmount;
        updateState(updated);
        updateStep(3);
        
        */
       
       
       let updated = state;
       updated['setupConverter']['converterAddress'] = "0x3536B51FeB7d6Ad6fE56b470e37069974e82A0D6";
       updated['setupConverter']['conversionFee'] = conversionFee;
       updated['setupConverter']['initialPoolTokenAmount'] = initialPoolTokenAmount;
       updated['setupConverter']['completed'] = true;
       updateState(updated);
       updateStep(3);
       

    }, [state, conversionFee, reserves, initialPoolTokenAmount])

    const back = useCallback((e) => {
        e.preventDefault();
        updateStep(1);

    }, [state])

    const handleChange = useCallback((e) => {
        e.preventDefault();

        switch (e.target.id) {
            case "maxConversionFee":
                const regexp = /^[0-9]*(\.[0-9]{0,1})?$/;
                const value = regexp.test(e.target.value) ? (e.target.value) : conversionFee;
                setConversionFee(value);
                break;
            case "initialPoolTokenAmount":
                const regexpinitialPoolTokenAmount = /^[0-9]*(\.[0-9]{0,4})?$/;
                const poolTokenValue = regexpinitialPoolTokenAmount.test(e.target.value) ? (e.target.value) : initialPoolTokenAmount;
                setInitialPoolTokenAmount(poolTokenValue);
                break;
        }

    }, [conversionFee, initialPoolTokenAmount])

    const updateReserves = useCallback((index, type, value) => {

        setReserves(reserves.map((item, i) => {
            if (i === index) {
                return {
                    ...item,
                    [type]: value
                }

            } else {
                return item;
            }
        }));


    }, [reserves])

    const deleteReserve = useCallback((index) => {

        if (!state.setupConverter.completed) {
            setReserves(reserves.filter((item, i) => i !== index));
        }

    }, [reserves, state])

    const addReserve = useCallback((e) => {
        if (state.setupConverter.completed) {
            return;
        }

        let newReserves = [];
        for (let r of reserves) {
            newReserves.push(r)
        }

        if (newReserves.length >= 10) {
            return;
        }

        newReserves.push({
            tokenAddress: "0x0000000000000000000000000000000000000000",
            weight: "50",
            initialAmount: "0"
        })
        setReserves(newReserves);

    }, [reserves, state])

    const isCompleted = state['setupConverter']['completed'] ? true : false;

    return (
        <Fragment>
            
            <Row style={{ marginTop: "10px" }}>
                <Column>
                    Max Conversion Fee (%)
                </Column>
                <Column>
                    <input
                        id="maxConversionFee"
                        placeholder="0.0"
                        type="number"
                        min="0"
                        disabled={state['setupConverter']['completed']}
                        value={conversionFee}
                        onChange={handleChange}
                        step="0.1"
                        pattern="^\d+(?:\.\d{1,2})?$"
                    />
                </Column>
                {/*
                <Column>
                    <div style={{ display: "flex"}}>
                        <div style={{flex: "50%", textAlign: "right"}}>
                            Max Conversion Fee (%)
                        </div>
                        <div style={{flex: "50%" }}>
                            <input
                                id="maxConversionFee"
                                placeholder="0.0"
                                type="number"
                                min="0"
                                style={{width : "100%"}}
                                disabled={state['setupConverter']['completed']}
                                value={conversionFee}
                                onChange={handleChange}
                                step="0.1"
                                pattern="^\d+(?:\.\d{1,2})?$"
                            />
                        </div>
                    </div>
                </Column>
                <Column>
                    <div style={{ display: "flex"}}>
                        <div style={{flex: "50%", textAlign: "right"}}>
                            Initial Pool Tokens
                        </div>
                        <div style={{flex: "40%" }}>
                            <input
                                id="initialPoolTokenAmount"
                                placeholder="0.0"
                                type="number"
                                style={{width : "100%"}}
                                min="0"
                                disabled={state['setupConverter']['completed']}
                                value={initialPoolTokenAmount}
                                onChange={handleChange}
                                step="0.1"
                                pattern="^\d+(?:\.\d{1,2})?$"
                            />
                        </div>
                    </div>
                </Column>
                */}
            </Row>
            {/*
            <Row
                style={{
                    fontWeight: "600",
                    fontSize: "10px"
                }}
            >
                <div style={{ margin: "auto", paddingTop: "4px" }}>
                    RESERVES
                </div>
            </Row>
            */}
            <Row>
                <Column>
                    Initial Pool Token Amount
                </Column>
                <Column>
                    <input
                        id="initialPoolTokenAmount"
                        placeholder="0.0"
                        type="number"
                        min="0"
                        disabled={state['setupConverter']['completed']}
                        value={initialPoolTokenAmount}
                        onChange={handleChange}
                        step="0.1"
                        pattern="^\d+(?:\.\d{1,2})?$"
                    />
                </Column>
            </Row>
            
            <Row>
                <WeightSetupWrapper>
                    <table>
                        <thead>
                            <tr>
                                <th width="10%">#</th>
                                <th width="30%">Token Address</th>
                                <th width="20%">Weight (%)</th>
                                <th width="30%">Initial Amount</th>
                                <th>

                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            {reserves.map((item, index) => {

                                return (
                                    <tr key={index}>
                                        <th>
                                            {index + 1}
                                        </th>
                                        <td>
                                            <input
                                                disabled={state['setupConverter']['completed']}
                                                type="text"
                                                value={item.tokenAddress}
                                                onChange={(e) => updateReserves(index, "tokenAddress", e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                disabled={state['setupConverter']['completed']}
                                                type="number"
                                                value={item.weight}
                                                onChange={(e) => updateReserves(index, "weight", e.target.value)}

                                            />
                                        </td>
                                        <td>
                                            <input
                                                disabled={state['setupConverter']['completed']}
                                                type="number"
                                                value={item.initialAmount}
                                                onChange={(e) => updateReserves(index, "initialAmount", e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            {index !== 0 &&
                                                <Button
                                                    color={"red"}
                                                    disabled={state['setupConverter']['completed']}
                                                    onClick={() => deleteReserve(index)}
                                                    style={{
                                                        fontSize: "10px",
                                                        fontWeight: "600"
                                                    }}
                                                >
                                                    X
                                                </Button>
                                            }
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </WeightSetupWrapper>

            </Row>

            <Row
                style={{
                    position: "relative",
                    height: "60px"
                }}
            >
                <ButtonGroup>
                    <Button onClick={back} color={color}>Back</Button>
                    <Button onClick={addReserve} color={color}>Add Reserve</Button>
                    <Button onClick={onConfirm} color={color}>Next</Button>
                </ButtonGroup>
            </Row>
            { errorMessage && (
                <ErrorMessage>
                    {errorMessage }
                </ErrorMessage>
            )}
            { isCompleted && (
                <ViewOnlyMessage/>
            )}
        </Fragment>
    )
}

const Register = (props) => {

    const { color, state, updateState, updateStep, registerConverter, showProcessingModal } = props;

    const [tradingFee, setTradingFee] = useState(0.1);
    const [ errorMessage , setErrorMessage ] = useState();

    const onConfirm = useCallback(async (e) => {
        e.preventDefault();
        setErrorMessage();

        if (!tradingFee || tradingFee < 0 || tradingFee > 100) {
            setErrorMessage("Trading Fee is invalid")
            return;
        }

        const smartTokenAddress  = state['setupRelayToken']['tokenAddress'];
        const converterAddress = state['setupConverter']['converterAddress'];


        if ((!smartTokenAddress) || (!converterAddress)) {
            setErrorMessage("State error.")
            return;
        }

        try {
            const txs = await registerConverter(smartTokenAddress, converterAddress, tradingFee);
            
            console.log("txs object : ", txs);
            const { activateTx, registerTx } = txs;
            const registerModalClose = showProcessingModal("Activating and Registering", registerTx.hash );
            await registerTx.wait()

            registerModalClose();
        
        } catch (error) {
            setErrorMessage(error.message);
            return;
        }


        let updated = state;
        updated['register']['completed'] = true;
        updated['register']['tradingFee'] = tradingFee;
        updateState(updated);
        updateStep(4);
    }, [state, tradingFee])

    const back = useCallback((e) => {
        e.preventDefault();

        updateStep(2);

    }, [state])

    const handleChange = useCallback((e) => {
        e.preventDefault();

        const regexp = /^[0-9]*(\.[0-9]{0,1})?$/;
        const value = regexp.test(e.target.value) ? (e.target.value) : tradingFee;
        setTradingFee(value);

    }, [tradingFee])

    return (
        <Fragment>

            <Row style={{ marginTop: "10px" }}>
                <Column>
                    Actual Conversion Fee (%)
                </Column>
                <Column>
                    <input
                        id="tradingFee"
                        placeholder="0.0"
                        type="number"
                        min="0"
                        disabled={state['register']['completed']}
                        value={tradingFee}
                        onChange={handleChange}
                        step="0.1"
                        pattern="^\d+(?:\.\d{1,2})?$"
                    />
                </Column>
            </Row>

            <Row
                style={{
                    position: "relative",
                    height: "60px"
                }}
            >
                <ButtonGroup>
                    <Button onClick={back} color={color}>Back</Button>
                    <Button onClick={onConfirm} color={color}>Next</Button>
                </ButtonGroup>
            </Row>
            { errorMessage && (
                <ErrorMessage>
                    {errorMessage }
                </ErrorMessage>
            )}
        </Fragment>
    )
}


const Summary = (props) => {

    const { color, state, updateState, updateStep } = props;

    const onReset = useCallback((e) => {
        e.preventDefault();

        const defaultValue = {
            setupRelayToken: {
                step: 1,
                tokenAddress: "",
                tokenSymbol : "",
                tokenName : "",
                isNewToken: true,
                completed: false
            },
            setupConverter: {
                step: 2,
                completed: false,
                converterAddress: "",
                conversionFee: 3.0,
                initialPoolTokenAmount: 0,
                reserves: []
            },
            register: {
                step: 3,
                completed: false
            }
        }

        updateState(defaultValue);
        updateStep(1);

    }, [state])

    return (
        <Fragment>

            <Row style={{ marginTop: "10px" }}>
                <Column2>
                    Pool Name
                </Column2>
                <Column2>
                    BNTETH Smart Relay Token (BNTETH)
                </Column2>
            </Row>
            <Row>
                <Column2>
                    Relay Token Address
                </Column2>
                <Column2>
                    0x7ca2692b7D700336A6c9bb0EB78e34a5B631B7Be
                </Column2>
            </Row>
            <Row>
                <Column2>
                    Converter Address
                </Column2>
                <Column2>
                    0x7ca2692b7D700336A6c9bb0EB78e34a5B631B7Be
                </Column2>
            </Row>


            <Row
                style={{
                    position: "relative",
                    height: "60px"
                }}
            >
                <ButtonGroup>
                    <Button onClick={onReset} color={color}>Create Another Pool</Button>
                </ButtonGroup>
            </Row>
        </Fragment>
    )
}


const Pane = styled.div`

`;

const Row = styled.div`
    display: flex;
    font-size: 12px;

    input, select {
        padding: 2px 4px 2px 4px;
        border: 1px solid #A9A9A9;
        border-radius: 4px;
        background-color: transparent;
    }

    select {
        cursor: pointer;
    }

    p {
        font-size: 10px;
    }

    table {
        width:100%;
        font-size: 12px;

        input {
            width: 90%;
        }

    }

    th, td {
        padding-top: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
    }


`;

const ErrorMessage = styled(Row)`
    padding-top: 0px;
    margin-top: 0px;
    padding-bottom: 0px;
    margin-bottom: 0px;
    display: block;
    font-weight: 600;
    color: ${props => props.color ? props.color : "red" };
    font-size: 12px;
    text-align: center;
`;

const ViewOnlyMessage = () => <ErrorMessage style={{ fontSize: "10px" }} color={"blue"}>You can only view the details shown.</ErrorMessage>

const WeightSetupWrapper = styled.div`
    max-height: 180px;
    overflow-y: scroll;
`;

const Column = styled.div`
    flex: 40%;
    text-align: right;
    padding: 5px;

    :first-child {
        padding-top: 6.5px;
    }

    :last-child {
        flex: 60%;
        text-align: left;
    }
`;

const Column2 = styled.div`
    flex: 40%;
    padding: 5px;
    text-align: right;

    text-overflow: ellipsis;
    overflow: hidden; 
    white-space: nowrap;

    :last-child {
        text-align: left;
        flex: 60%;
    }
`;

const ButtonGroup = styled.div`
    position: absolute; 
    left: 50%;
    top: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
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

const Menu = styled.div`
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
        cursor: pointer;
        &:not(:last-child) {
            border-bottom: 1px solid #ddd;
        }
    }

    ${props => props.active && (
        `
            display: block;
        `
    )}

`;

const ChartContainer = styled.div`
    padding: 20px;
    position: relative; 
`;

const SummarySection = styled.div`
    position: absolute; 
    left: 0px;
    top: 20px; 
    text-align: left;
    font-size: 12px;
`;
