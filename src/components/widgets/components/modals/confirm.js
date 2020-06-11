import React, { Component, useCallback, useState, useEffect } from 'react';
import styled from "styled-components"

import { Wrapper, Content, Footer, Body, Row, ButtonGroup, Button } from "./index";


const ConfirmModal = (props) => {
    const { width, color, title, message, closeConfirmModal } = props;

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
                        <Button onClick={() => closeConfirmModal(true)} color={color}>Confirm</Button>
                        <Button onClick={() => closeConfirmModal(false)} color={color}>Cancel</Button>
                    </ButtonGroup>
                </Footer>
            </Content>
        </Wrapper>
    )
}

export default ConfirmModal;