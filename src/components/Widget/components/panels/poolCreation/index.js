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
        tokenSymbol: "",
        tokenName: "",
        isNewToken: true,
        isNewConverter: true,
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
    activate: {
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
        activateConverter,
        converterOwner,
        getMaxConversionFee,
        getTotalSupplyByConverter,
        getReserves,
        registerConverter
    } = props;

    const { showProcessingModal, showErrorMessageModal } = useModal();

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
                            The Bancor Protocol is a fully on-chain liquidity protocol provides an endpoint for automated market-making against a smart contract.
                        </p>
                    </Column>
                </Row>

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
                            getMaxConversionFee={getMaxConversionFee}
                            getReserves={getReserves}
                            getTotalSupplyByConverter={getTotalSupplyByConverter}
                            showErrorMessageModal={showErrorMessageModal}
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
                            showErrorMessageModal={showErrorMessageModal}
                        />
                    )
                }

                {step === 3 &&
                    (
                        <Activate
                            color={color}
                            state={state}
                            updateState={setState}
                            updateStep={setStep}
                            activateConverter={activateConverter}
                            showProcessingModal={showProcessingModal}
                            converterOwner={converterOwner}
                        />
                    )

                }

                {step === 4 &&
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

            </Pane>
        </Fragment>
    )
}

export default PoolCreationPanel;

const SetupRelayToken = (props) => {

    const {
        color,
        state,
        updateState,
        updateStep,
        showProcessingModal,
        createSmartToken,
        getSmartToken,
        getMaxConversionFee,
        getReserves,
        getTotalSupplyByConverter,
        showErrorMessageModal,
        showConfirmModal
    } = props;

    const [poolName, setPoolName] = useState("");
    const [poolFullName, setPoolFullName] = useState("");

    const initialExistTokenAddress = state.setupRelayToken.completed ? state.setupRelayToken.tokenAddress : "";
    const initialCustomConvertAddress = state.setupConverter.completed ? state.setupConverter.converterAddress : "";

    const [existTokenAddress, setExistTokenAddress] = useState(initialExistTokenAddress);
    const [customConverterAddress, setCustomConverterAddress] = useState(initialCustomConvertAddress);
    const initialOption = state ? state.setupRelayToken.isNewToken : true;
    const defaultConverterOption = state ? state.setupRelayToken.isNewConverter : true;

    const [isCreateNew, setCreateNew] = useState(initialOption);
    const [isNewConverter, setNewConverter] = useState(defaultConverterOption);

    const [errorMessage, setErrorMessage] = useState();

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
            case "customConverterAddress":
                setCustomConverterAddress(e.target.value);
                break;
        }
    }

    const handleOptions = (e) => {
        e.preventDefault();

        if (e.target.id === 'converter') {
            if (e.target.value === "true") {
                setNewConverter(true);
            } else {
                setNewConverter(false);
            }
        } else {
            if (e.target.value === "true") {
                setCreateNew(true);
            } else {
                setCreateNew(false);
            }
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
                const contract = await createSmartToken(poolName, poolFullName);
                console.log("contract : ", contract);
                const onClose = showProcessingModal("Deploying your relay token... ", `Tx : ${contract.deployTransaction.hash}`);
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

        if (!isNewConverter && !state['setupRelayToken']['completed']) {
            if (!customConverterAddress) {
                setErrorMessage("Converter Address is empty")
                return;
            }
        }

        const onClose = showProcessingModal("Checking... ", "");

        try {

            if (!state['setupRelayToken']['completed']) {
                const { symbol, fullName } = await getSmartToken(existTokenAddress);
                let updated = state;
                updated['setupRelayToken']['completed'] = true;
                updated['setupRelayToken']['isNewToken'] = false;
                updated['setupRelayToken']['tokenAddress'] = existTokenAddress;
                updated['setupRelayToken']['tokenName'] = fullName;
                updated['setupRelayToken']['tokenSymbol'] = symbol;

                if (!isNewConverter) {
                    updated['setupRelayToken']['isNewConverter'] = false;
                    updated['setupConverter']['converterAddress'] = customConverterAddress;
                    const maxConversionFee = await getMaxConversionFee(customConverterAddress);
                    updated['setupConverter']['conversionFee'] = maxConversionFee * 100;
                    const reserves = await getReserves(customConverterAddress);
                    updated['setupConverter']['reserves'] = reserves;
                    const totalSupply = await getTotalSupplyByConverter(customConverterAddress);
                    updated['setupConverter']['initialPoolTokenAmount'] = totalSupply;
                    updated['setupConverter']['completed'] = true;
                }

                updateState(updated);

            }

            updateStep(2);

        } catch (error) {
            setErrorMessage(error.message);
        }

        onClose();

    }, [state, existTokenAddress, isNewConverter, customConverterAddress]);

    const isCompleted = state['setupRelayToken']['completed'] ? true : false;

    return (
        <Fragment>
            <Row style={{ marginTop: "10px" }}>
                <Column>
                    Setup Relay Token
                </Column>
                <Column>
                    <select disabled={state['setupRelayToken']['completed']} onChange={handleOptions} id="relayToken" value={isCreateNew}>
                        <option value={true}>Create New Token</option>
                        {/*
                        <option value={false}>Use Existing Token</option>
                        */}

                    </select>
                    {` `}
                    <Button onClick={() => showErrorMessageModal("How to create a pool on Bancor", "To make a liquidity pool, it's essentially to have one or more token reserves, make sure you have ERC20 tokens your wallet and know its address before proceed.")} color={color}>?</Button>
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

                    {errorMessage && (
                        <ErrorMessage>
                            {errorMessage}
                        </ErrorMessage>
                    )}
                    {isCompleted && (
                        <ViewOnlyMessage />
                    )}


                </Fragment>
            ) :
                <Fragment>
                    <Row>
                        <Column>
                            Relay Token Address
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
                    <Row>
                        <Column>
                            Setup Converter
                        </Column>
                        <Column>
                            <select disabled={state['setupRelayToken']['completed']} onChange={handleOptions} id="converter" value={isNewConverter}>
                                <option value={true}>Create New Converter</option>
                                <option value={false}>Use Existing Converter</option>
                            </select>
                        </Column>
                    </Row>
                    {!isNewConverter &&
                        (
                            <Row>
                                <Column>
                                    Converter Address
                            </Column>
                                <Column>
                                    <input
                                        type="text"
                                        id="customConverterAddress"
                                        disabled={state['setupRelayToken']['completed']}
                                        value={customConverterAddress}
                                        onChange={handleChange}
                                    />
                                </Column>
                            </Row>
                        )

                    }
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
                    {errorMessage && (
                        <ErrorMessage>
                            {errorMessage}
                        </ErrorMessage>
                    )}
                    {isCompleted && (
                        <ViewOnlyMessage />
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
        addInitialReserve,
        showErrorMessageModal
    } = props;

    const defaultConversionFee = state.setupConverter.completed ? state.setupConverter.conversionFee : 3.0;
    const defaultPoolTokenAmount = state.setupConverter.completed ? state.setupConverter.initialPoolTokenAmount : 0;

    const defaultReserves = state.setupConverter.completed ? state.setupConverter.reserves : [];

    const [conversionFee, setConversionFee] = useState(defaultConversionFee);
    const [reserves, setReserves] = useState(defaultReserves);
    const [initialPoolTokenAmount, setInitialPoolTokenAmount] = useState(defaultPoolTokenAmount);
    const [errorMessage, setErrorMessage] = useState();

    const isCompleted = state['setupConverter']['completed'] ? true : false;

    useEffect(() => {

        if (!isCompleted) {
            setReserves([
                {
                    tokenAddress: "",
                    weight: "50",
                    initialAmount: "0"
                },
                {
                    tokenAddress: "",
                    weight: "50",
                    initialAmount: "0"
                }
            ])
        }

    }, [isCompleted])

    const onConfirm = useCallback(async (e) => {
        e.preventDefault();

        setErrorMessage();

        if (state['setupConverter']['completed']) {
            updateStep(3);
            return;
        }

        if (!conversionFee || conversionFee < 0 || conversionFee > 100) {
            setErrorMessage("Conversion Fee is invalid")
            return;
        }

        if (!initialPoolTokenAmount || initialPoolTokenAmount < 1) {
            setErrorMessage("Initial Pool Token Amount must be greater than 1")
            return;
        }

        const onClose = showProcessingModal("Validating... ", "");
        let totalWeight = 0;
        let addresses = [];
        try {
            for (let reserve of reserves) {
                totalWeight += Number(reserve.weight);

                if (addresses.indexOf(reserve.tokenAddress) !== -1) {
                    throw new Error("Duplicated token address");
                }

                addresses.push(reserve.tokenAddress);
                await checkIfAccountHasSufficientBalance(reserve.tokenAddress, reserve.initialAmount);

            }
        } catch (error) {
            let errorMessage = error.message;
            if ((error.message.indexOf("ENS name not configured") !== -1) || (error.message.indexOf("Invalid address") !== -1)) {
                errorMessage = "One of address is not valid ERC-20.";
            }
            setErrorMessage(errorMessage);
            onClose();
            return;
        }
        onClose();

        if (totalWeight > 100 || totalWeight < 0) {
            setErrorMessage("Sum of weighting percentage should not exceed 100%");
            return;
        }

        const smartTokenAddress = state['setupRelayToken']['tokenAddress'];
        if (!smartTokenAddress) {
            setErrorMessage("Can't identify your relay token address");
            return;
        }

        let converterAddress;
        let updated = state;

        try {

            const converterContract = await createConverter(smartTokenAddress, conversionFee, reserves);
            console.log("converterContract : ", converterContract);
            const onClose = showProcessingModal("Please wait while your converter is being deployed ", `Tx : ${converterContract.deployTransaction.hash}`);
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
            const { issuranceTx, addingReserve, funding } = txs;
            const addInitialReserveClose = showProcessingModal("Please wait while your reserves are being funded ", `Tx : ${issuranceTx.hash}`);

            const promises = (funding.map(item => item.wait())).concat([issuranceTx.wait()]).concat(addingReserve.map(item => item.wait()));
            console.log("promises : ", promises)
            try {
                await Promise.all(promises);
            } catch (error) {
                addInitialReserveClose();
                throw new Error(error.message);
            }

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

        /*
        let updated = state;
        updated['setupConverter']['converterAddress'] = "0x3536B51FeB7d6Ad6fE56b470e37069974e82A0D6";
        updated['setupConverter']['conversionFee'] = conversionFee;
        updated['setupConverter']['initialPoolTokenAmount'] = initialPoolTokenAmount;
        updated['setupConverter']['completed'] = true;
        updateState(updated);
        updateStep(3);
        */


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
            tokenAddress: "",
            weight: "50",
            initialAmount: "0"
        })
        setReserves(newReserves);

    }, [reserves, state])


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
                    {` `}
                    <Button onClick={() => showErrorMessageModal("Max Conversion Fee", "This is the maximum value that is allowed, the actual fee will setup on the next step.")} color={color}>?</Button>
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
                    {` `}
                    <Button onClick={() => showErrorMessageModal("Initial Pool Token Amount", "This is the initial amount to be issued of your pool token, it's recommended to use total value in USD of your initial reserves.")} color={color}>?</Button>
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
                                            { index === 0 &&
                                                <Button onClick={() => showErrorMessageModal("Fund Token Reserves", "You need to initially fund the pool that corresponding to the given ratio, for instance, to setup 50:50 pool with initial value of $1,000 would need to be funded with $500 of your first token and $500 of your second token.")} color={color}>?</Button>
                                            }
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
            {errorMessage && (
                <ErrorMessage>
                    {errorMessage}
                </ErrorMessage>
            )}
            {isCompleted && (
                <ViewOnlyMessage />
            )}
        </Fragment>
    )
}

const Activate = (props) => {

    const { color, state, updateState, updateStep, activateConverter, showProcessingModal, converterOwner } = props;

    const defaultTradingFee = state.activate.completed ? state.activate.tradingFee : 0.1;

    const [tradingFee, setTradingFee] = useState(defaultTradingFee);
    const [errorMessage, setErrorMessage] = useState();
    const [isActivate, setActivate] = useState(false);
    const [loading, setLoading] = useState(false);


    const converterAddress = state['setupConverter']['converterAddress'];

    useEffect(() => {

        if (converterAddress) {
            (async () => {
                setLoading(true);
                try {
                    const owner = await converterOwner(converterAddress);

                    if (owner === converterAddress) {
                        setActivate(true);
                        setErrorMessage("Converter is already activated")
                    }
                } catch (error) {
                    console.log("eror : ", error);
                }
                setLoading(false);

            })()
        }


    }, [converterAddress])

    const onConfirm = useCallback(async (e) => {
        e.preventDefault();
        setErrorMessage();

        if (loading) {
            return;
        }

        if (!tradingFee || tradingFee < 0 || tradingFee > 100) {
            setErrorMessage("Trading Fee is invalid")
            return;
        }

        const smartTokenAddress = state['setupRelayToken']['tokenAddress'];
        // const converterAddress = state['setupConverter']['converterAddress'];
        if ((!smartTokenAddress) || (!converterAddress)) {
            setErrorMessage("State error.")
            return;
        }

        try {
            const txs = await activateConverter(smartTokenAddress, converterAddress, tradingFee);

            console.log("txs object : ", txs);
            const { setConversionFeeTx, transferOwnershipTx, activateTx } = txs;
            const promises = [setConversionFeeTx.wait(), transferOwnershipTx.wait(), activateTx.wait()]
            const activateModalClose = showProcessingModal("Activating...", `Tx : ${setConversionFeeTx.hash}`);
            try {
                await Promise.all(promises);
            } catch (error) {
                activateModalClose();
                throw new Error(error.message);
            }

            activateModalClose();

        } catch (error) {
            setErrorMessage(error.message);
            return;
        }

        let updated = state;
        updated['activate']['completed'] = true;
        updated['activate']['tradingFee'] = tradingFee;
        updateState(updated);
        updateStep(4);
    }, [state, tradingFee, loading])

    const back = useCallback((e) => {
        e.preventDefault();

        updateStep(2);

    }, [state])

    const onSkip = useCallback((e) => {
        e.preventDefault();

        let updated = state;
        updated['activate']['completed'] = true;
        updated['activate']['tradingFee'] = tradingFee;
        updateState(updated);
        updateStep(4);

    }, [state, tradingFee]);

    const handleChange = useCallback((e) => {
        e.preventDefault();

        const regexp = /^[0-9]*(\.[0-9]{0,1})?$/;
        const value = regexp.test(e.target.value) ? (e.target.value) : tradingFee;
        setTradingFee(value);

    }, [tradingFee]);

    const isCompleted = state['activate']['completed'] ? true : false;

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
                        disabled={state['activate']['completed']}
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
                    {!isActivate
                        ?
                        <Button onClick={onConfirm} color={color}>Activate</Button>
                        :
                        <Button onClick={onSkip} color={color} >Skip</Button>
                    }

                </ButtonGroup>
            </Row>
            {(errorMessage && (!isCompleted)) && (
                <ErrorMessage>
                    {errorMessage}
                </ErrorMessage>
            )}
            {isCompleted && (
                <ViewOnlyMessage />
            )}
        </Fragment>
    )
}


const Register = (props) => {

    const { color, state, updateState, updateStep, registerConverter, showProcessingModal } = props;

    const [isCompleted, setCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState();

    const tokenName = state['setupRelayToken']['tokenName'];
    const tokenSymbol = state['setupRelayToken']['tokenSymbol'];
    const tokenAddress = state['setupRelayToken']['tokenAddress'];
    const converterAddress = state['setupConverter']['converterAddress'];
    const totalReserves = state['setupConverter']['reserves'].length;

    const onReset = useCallback((e) => {
        e.preventDefault();

        const defaultValue = {
            setupRelayToken: {
                step: 1,
                tokenAddress: "",
                tokenSymbol: "",
                tokenName: "",
                isNewToken: true,
                isNewConverter: true,
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
            activate: {
                step: 3,
                completed: false,
                tradingFee: 0.1
            }
        }

        updateState(defaultValue);
        updateStep(1);

    }, [state])

    const onRegister = useCallback(async (e) => {
        e.preventDefault();
        setErrorMessage();
        try {
            const tx = await registerConverter(converterAddress);
            const onClose = showProcessingModal("Registering...", `Tx : ${tx.hash}`);
            try {
                await tx.wait();
            } catch (error) {
                onClose();
                throw new Error(error.message);
            }

            onClose();

            setCompleted(true);
        } catch (error) {
            console.log("error : ", error);
            setErrorMessage(error.message);
            return;
        }


    }, [state, converterAddress])

    const back = useCallback((e) => {
        e.preventDefault();

        updateStep(3);

    }, [state])

    return (
        <Fragment>

            <Row style={{ marginTop: "10px" }}>
                <Column2>
                    Pool Name
                </Column2>
                <Column2>
                    {tokenName} ({tokenSymbol})
                </Column2>
            </Row>
            <Row>
                <Column2>
                    Relay Token Address
                </Column2>
                <Column2 style={{ fontSize: "10px", marginTop: "2px", overflow: "visible" }}>
                    {tokenAddress}
                </Column2>
            </Row>
            <Row>
                <Column2>
                    Converter Address
                </Column2>
                <Column2 style={{ fontSize: "10px", marginTop: "2px", overflow: "visible" }}>
                    {converterAddress}
                </Column2>
            </Row>
            <Row>
                <Column2>
                    Total Reserves
                </Column2>
                <Column2>
                    {totalReserves}
                </Column2>
            </Row>


            <Row
                style={{
                    position: "relative",
                    height: "60px"
                }}
            >
                <ButtonGroup>
                    <Button onClick={back} color={color}>Back</Button>
                    {isCompleted ?
                        <Button onClick={onReset} color={color}>Create Another Pool</Button>
                        :
                        <Button onClick={onRegister} color={color}>Register</Button>
                    }
                    {!isCompleted && (errorMessage) && (
                        <Button onClick={onReset} color={color}>Reset</Button>
                    )
                    }
                </ButtonGroup>
            </Row>
            {errorMessage && (
                <ErrorMessage>
                    {errorMessage}
                </ErrorMessage>
            )}
            {isCompleted && (
                <CompletedMessage />
            )}

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
    color: ${props => props.color ? props.color : "red"};
    font-size: 12px;
    text-align: center;
`;

const ViewOnlyMessage = () => <ErrorMessage style={{ fontSize: "10px" }} color={"blue"}>You can only view the details shown.</ErrorMessage>
const CompletedMessage = () => <ErrorMessage style={{ fontSize: "10px" }} color={"blue"}>Congratulation! Your pool is successfully created.</ErrorMessage>


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
