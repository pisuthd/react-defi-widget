import React, { useEffect, Fragment, useState } from 'react'
import { LiquidityPoolsWidget } from 'react-defi-widget'
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

    const color = "orange";

    // Provides whitelisted pools
    // const defaultPool = "ENJBNT";
    // const whitelisted = ["ETHBNT", "ENJBNT", "DAIBNT"];

    return (
        <Fragment>
            <Row>
                <Col sm="12">
                    <OrangeGradientJumbotron>
                        <LiquidityPoolsWidget
                            web3ReactContext={web3context}
                            color={color}
                            // whitelisted={whitelisted}
                            // defaultPool={defaultPool}
                            // disablePoolCreation={true}
                        />
                    </OrangeGradientJumbotron>
                </Col>
            </Row>
        </Fragment>
    )
}

export default LiquidityPool;

/*
const GreyGradientJumbotron = styled(Jumbotron)`
    background-image: linear-gradient(to bottom, #bdc3c7, #2c3e50);  
    border-radius: 10px;
    color: white;
    height: 600px;
`;
*/

const OrangeGradientJumbotron = styled(Jumbotron)`
    background-image: linear-gradient(to bottom, #f5af19, #f12711);  
    border-radius: 10px;
    color: white;
    height: 600px;
    
    padding: 40px 20px 40px 20px;
`;

