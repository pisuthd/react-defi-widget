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

import WidgetVersionSection from "../components/shared/widgetVersion";

const LiquidityPool = (props) => {

    const { web3context } = props;

    return (
        <Fragment>
            <Row>
                <Col sm="6">
                    <OrangeGradientJumbotron>
                        <LiquidityPoolsWidget
                            web3ReactContext={web3context}
                        />
                    </OrangeGradientJumbotron>
                </Col>
                <Col sm="6">
                    
                </Col>
            </Row>
        </Fragment>
    )
}

export default LiquidityPool;


const OrangeGradientJumbotron = styled(Jumbotron)`
    background-image: linear-gradient(to bottom, #f5af19, #f12711);  
    border-radius: 10px;
    color: white;
    height: 400px;
`;