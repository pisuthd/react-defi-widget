import React, { Component, useCallback, useState, useEffect } from 'react';

import styled from "styled-components"

import { MODAL_TYPES, useModal } from "../../contexts/modal";
import loadingIcon from "../../../assets/loading-large.gif";

const Modal = (props) => {

    const { width, height } = props;

    const { title, message, type } = useModal();

    const [ showLoadingIcon , setShowLoadingIcon ] = useState(false);

    useEffect(() => {

        console.log("type chainingn... : ", type );

        if (type === MODAL_TYPES.PROCESSING ) {
            setShowLoadingIcon(true);
        } else {
            setShowLoadingIcon(false);
        }

    },[type])

    return (
        <Wrapper>
            <Content
                width={width}
            >
                {showLoadingIcon && (
                    <LoadingContainer>
                        <img src={loadingIcon} width="18px" height="18px" />
                    </LoadingContainer>
                )}


                    <Body>
                        { title }
                        { message !== "" &&
                        (
                            <Description>
                                { message }
                            </Description>
                        )}
                    </Body>
            </Content>
        </Wrapper>
    )

}


const Wrapper = styled.div`
    margin: 0;
    color: black;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

const Content = styled.div`
    background: #fff;
    border-radius: 5px;
    padding: 20px;
    text-align: center;
    font-size: 14px;
    word-wrap: break-word;
    width: ${props => props.width && `${(props.width) / 2}px`};
`;

const Header = styled.div`
    .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
    }
`;

const Body = styled.div`
    font-size: 12px;
`;

const Description = styled.div`
    font-size: 10px;
    margin-top: 10px;
    font-weight: 600;
`;  

const LoadingContainer = styled.div`
    padding-bottom: 20px;
`;




export default Modal;