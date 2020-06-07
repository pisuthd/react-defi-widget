import React, { Component, useEffect, useState, Fragment } from 'react'
import {
    Row, Col, Form, FormGroup, Label, Input,
    Button, ButtonGroup
} from "reactstrap";
import styled from 'styled-components';
import { TokenSwapWidget } from 'react-defi-widget'

const Wrapper = styled.div`
    margin-top: 20px;
`

const TOKENS = [
    "ETH",
    "BNT",
    "KNC",
    "ENJ"
]

const WidgetContainer = styled.div`
     height: 500px;
`;

const TokenSwap = ({ web3context }) => {

    const [baseToken, setBaseToken] = useState(TOKENS[0]);
    const [pairToken, setPairToken] = useState(TOKENS[1]);
    const [gasLimit, setGasLimit] = useState();

    return (
        <Wrapper>
            <Form>
                <FormGroup row >
                    <Label for="baseToken" sm={4}>Base Token</Label>
                    <Col sm={8}>
                        <ButtonGroup>
                            {TOKENS.map((token, index) => <Button color={baseToken === token ? "primary" : "secondary"} key={index} size="sm" onClick={() => pairToken !== token && setBaseToken(token)}>{token}</Button>)}

                        </ButtonGroup>
                    </Col>
                </FormGroup>

                <FormGroup row>
                    <Label for="pairToken" sm={4}>Pair Token</Label>
                    <Col sm={8}>
                        <ButtonGroup>
                            {TOKENS.map((token, index) => <Button color={pairToken === token ? "primary" : "secondary"} key={index} size="sm" onClick={() => baseToken !== token && setPairToken(token)}>{token}</Button>)}
                        </ButtonGroup>
                    </Col>
                </FormGroup>
                {/*
                <FormGroup row>
                    <Label for="pairToken" sm={4}>Show List</Label>
                    <Col sm={8}>
                        <ButtonGroup>
                            <Button color={showList ? "primary" : "secondary"} size="sm" onClick={() => setShowList(true)}>ENABLE</Button>
                            <Button color={!showList ? "primary" : "secondary"} size="sm" onClick={() => setShowList(false)}>DISABLE</Button>
                        </ButtonGroup>
                    </Col>
                </FormGroup>
                */}
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
                <TokenSwapWidget
                    web3ReactContext={web3context}
                    color={"#0275d8"}
                    baseToken={baseToken}
                    pairToken={pairToken}
                    gasLimit={gasLimit}
                />
            </WidgetContainer>
        </Wrapper>
    )
}

export default TokenSwap;

