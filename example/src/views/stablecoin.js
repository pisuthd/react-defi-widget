import React, { useEffect, Fragment, useState } from 'react'
import { StablecoinsWidget } from 'react-defi-widget'
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

const Stablecoin = (props) => {

    const { web3context } = props;

    return (
        <Fragment>
            <Row>
                <Col sm="6">

                </Col>
                <Col sm="6">
                    <GreyGradientJumbotron>
                        <StablecoinsWidget
                            web3ReactContext={web3context}
                        />
                    </GreyGradientJumbotron>
                </Col>
            </Row>
        </Fragment>
    )
}

export default Stablecoin;

const GreyGradientJumbotron = styled(Jumbotron)`
    background-image: linear-gradient(to bottom, #bdc3c7, #2c3e50);  
    border-radius: 10px;
    color: white;
    height: 400px;
`;