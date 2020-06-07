import React, { Fragment, useEffect } from 'react';
import ContainerDimensions from 'react-container-dimensions'
import styled from "styled-components"
import { useTheme } from "../../hooks/theme"



const Layout = ({ children }) => {

    const { backgroundColor, showModal, fontSize } = useTheme();

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
                </Fragment>
            }
        </ContainerDimensions>
    )
}

export default Layout;

const Container = styled.div`
    background: ${({ backgroundColor }) => backgroundColor && `${backgroundColor}`};
    border-radius: 5px;
    padding: ${({ width }) => width  >= 400 ? "20px" : "10px"};
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