import React, { useEffect, Fragment, useState } from 'react'
import { BancorLiquidityPoolsWidget } from 'react-defi-widget'
import {
    Row,
    Col,
    Jumbotron,
    Button,
    Card,
    CardImg,
    Media,
    CardText,
    CardFooter,
    Badge,
    CardHeader,
    CardBody,
    CardTitle,
    CardSubtitle
} from "reactstrap";
import styled from "styled-components"


const LiquidityPool = (props) => {

    const { web3context } = props;

    const color = "#2c3e50";

    return (
        <Fragment>
            <Row>
                <Col sm="6">
                    <GreyGradientJumbotron>
                        <BancorLiquidityPoolsWidget
                            web3ReactContext={web3context}
                            color={color}
                        />
                    </GreyGradientJumbotron>
                </Col>
            </Row>
        </Fragment>
    )
}

export default LiquidityPool;


const GreyGradientJumbotron = styled(Jumbotron)`
    background-image: linear-gradient(to bottom, #bdc3c7, #2c3e50);  
    border-radius: 10px;
    color: white;
    height: 600px;
`;

/*
const OrangeGradientJumbotron = styled(Jumbotron)`
    background-image: linear-gradient(to bottom, #f5af19, #f12711);  
    border-radius: 10px;
    color: white;
    height: 400px;
`;
*/
