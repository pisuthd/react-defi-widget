import React, { Component, useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import WidgetLayout from "./layout";
import { useNavigation } from "../../contexts/navigation";
import { useDefi } from "../../contexts/defi";
import { PAGES } from "../../constants";
import AccountPage from "../Account";
import StakePage from "../Stake";
import SwapPage from "../Swap";
import styled from "styled-components"
import ContainerDimensions from 'react-container-dimensions'

const Widget = ({ web3ReactContext, currentPage }) => {

    const { page, updatePage } = useNavigation();



    useEffect(() => {
        if (currentPage) {
            if (Object.keys(PAGES).indexOf(currentPage) !== -1) {
                updatePage(currentPage);
            }

        }
    }, [currentPage])


    return (
        <ContainerDimensions>
            {({ width, height }) =>
                <WidgetLayout>
                    {!web3ReactContext.active
                        ?
                        (<LoadingPanel> {!web3ReactContext.error ? "Connecting to MetaMask..." : (<ErrorMessage>{`Error : ${web3ReactContext.error.message}` || "MetaMask Error : An unknown error occurred."}</ErrorMessage>)}  </LoadingPanel>)
                        :
                        (
                            <div>
                                {page === PAGES.ACCOUNT && <AccountPage web3context={web3ReactContext} width={width} height={height} />}
                                {page === PAGES.STAKE && <StakePage web3context={web3ReactContext} width={width} height={height} />}
                                {page === PAGES.SWAP && <SwapPage web3context={web3ReactContext} width={width} height={height} />}
                            </div>
                        )
                    }
                </WidgetLayout>
            }
        </ContainerDimensions>


    )
}


const LoadingPanel = styled.div`
    font-size: 14px;
`;

const ErrorMessage = styled.span`
    color: red;
    font-weight: 600;
`;

Widget.propTypes = {
    web3ReactContext: PropTypes.object.isRequired,
    currentPage: PropTypes.string
};

export default Widget;