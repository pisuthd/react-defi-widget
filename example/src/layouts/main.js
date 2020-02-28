import React, { Component ,Fragment } from 'react'
import { Container } from 'reactstrap';
import NavBar from "../views/navbar";

const MainLayout = ({children}) => {
    return (
        <Fragment>
            <NavBar/>
            <Container>
                {children}
            </Container>
        </Fragment>
    )
}

export default MainLayout;