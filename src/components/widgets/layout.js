import React, { Fragment, useEffect } from 'react';
import ContainerDimensions from 'react-container-dimensions'
import styled from "styled-components"
import { useTheme } from "../../hooks/theme"
import { useModal } from "../../contexts/modal"
import Modal from "./components/modals"


const Layout = ({ children }) => {

    const { backgroundColor, fontSize } = useTheme();
    const { showModal } = useModal();

    return (
        <ContainerDimensions>
            {({ width, height }) =>
                <Fragment>
                    <Container
                        inactive={showModal}
                        backgroundColor={backgroundColor}
                        width={width}
                        height={height}
                        fontSize={fontSize}
                    >
                        {children}
                    </Container>
                    {showModal && (
                        <Modal
                            width={width}
                            height={height}
                        />
                    )}
                </Fragment>
            }
        </ContainerDimensions>
    )
}

export default Layout;

const Container = styled.div`
    background: ${({ backgroundColor }) => backgroundColor && `${backgroundColor}`};
    border-radius: 5px;
    padding: ${({ width }) => width >= 400 ? "20px" : "10px"};
    color: rgba(0, 0, 0, 0.7);
    ${({ height, width }) => (height && width) &&
        `
        height: ${height}px;
        width: ${width}px;
    `};
    overflow: hidden;
    ${({ fontSize }) => fontSize && `
        font-size: ${fontSize};
        
    `}

    ${({ inactive }) => inactive && `
        opacity: 0.6;   
    `}

`;