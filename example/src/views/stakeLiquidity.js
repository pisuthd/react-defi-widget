import React, { Component, useEffect, useState, Fragment } from 'react'
import {
    Row, Col, Form, FormGroup, Label, Input,
    Button, ButtonGroup
} from "reactstrap";
import styled from 'styled-components';
import { StakingLiquidityWidget } from "react-defi-widget";

const Wrapper = styled.div`
    margin-top: 20px;
`

const MAINNET = [
    "ETHBNT",
    "ENJBNT",
    "KNCBNT"
]

const ROPSTEN = [
    "XXXBNT",
    "APPTKNBNT"
]

const WidgetContainer = styled.div`
height: 500px;
`;

const StakingLiquidity = ({ web3context }) => {

    const [network, setNetwork] = useState(1);
    const [pool, setPool] = useState(MAINNET[0]);
    const [gasLimit, setGasLimit] = useState();


    useEffect(() => {
        if (network === 1) {
            setPool(MAINNET[0])
        } else {
            setPool(ROPSTEN[0])
        }
    }, [network]);


    return (
        <Wrapper>
            <Form>

                <FormGroup row>
                    <Label for="network" sm={4}>Network</Label>
                    <Col sm={8}>
                        <ButtonGroup>
                            <Button color={network === 1 ? "primary" : "secondary"} onClick={() => setNetwork(1)} size="sm">Mainnet</Button>
                            <Button color={network === 3 ? "primary" : "secondary"} onClick={() => setNetwork(3)} size="sm">Ropsten</Button>

                        </ButtonGroup>
                    </Col>
                </FormGroup>

                <FormGroup row>
                    <Label for="pool" sm={4}>Pool</Label>
                    <Col sm={8}>
                        <ButtonGroup>
                            {/*
                             { MAINNET.map((symbol, index) => <Button key={index} color={symbol === pool ? "primary" : "secondary"} onClick={() => setPool(MAINNET[index])} size="sm">{symbol}</Button>)}
                            */}


                            {network === 1 && MAINNET.map((symbol, index) => <Button key={index} color={symbol === pool ? "primary" : "secondary"} onClick={() => setPool(MAINNET[index])} size="sm">{symbol}</Button>)}
                            {network === 3 && ROPSTEN.map((symbol, index) => <Button key={index} color={symbol === pool ? "primary" : "secondary"} onClick={() => setPool(ROPSTEN[index])} size="sm">{symbol}</Button>)}


                        </ButtonGroup>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for="gasLimit" sm={4}>Gas Limit</Label>
                    <Col sm={8}>
                        <ButtonGroup>
                            <Button color={!gasLimit ? "primary" : "secondary"} onClick={() => setGasLimit()} size="sm">AUTO</Button>
                            <Button color={gasLimit === 500000 ? "primary" : "secondary"} onClick={() => setGasLimit(500000)} size="sm">500000</Button>
                            <Button color={gasLimit === 1000000 ? "primary" : "secondary"} onClick={() => setGasLimit(1000000)} size="sm">1000000</Button>
                        </ButtonGroup>
                    </Col>
                </FormGroup>
            </Form>
            <WidgetContainer>
                <StakingLiquidityWidget
                    web3ReactContext={web3context}
                    color={"#0275d8"}
                    poolSymbol={pool}
                    gasLimit={gasLimit}
                />
            </WidgetContainer>
        </Wrapper>
    )
}

export default StakingLiquidity;