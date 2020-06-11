import React, { Component, useCallback, useState, useEffect } from 'react';
import styled from "styled-components"

import { Wrapper, Content, Footer, Body, Row, ButtonGroup, Button } from "./index";

const ErrorMessageModal = (props) => {

    const { width, color, title, message, closeErrorModal } = props;

    return (
        <Wrapper>
            <Content
                width={width}
            >
                <Body>
                    <h6>{title}</h6>
                    <p>{message}</p>
                </Body>
                <Footer>
                    <ButtonGroup>
                        <Button onClick={() => closeErrorModal()} color={color}>Close</Button>
                    </ButtonGroup>
                </Footer>
            </Content>
        </Wrapper>
    )
}

export default ErrorMessageModal;