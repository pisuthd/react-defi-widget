import React, { Component, useEffect } from 'react'
import {
    Link
} from "react-router-dom";
import {
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavbarText,
    NavLink,
    Container
} from "reactstrap"
import styled from "styled-components"

const NavBar = (props) => {
    return (
        <StyledNavbar style={{ marginBottom: "20px" }} color="light" expand="md">
            <Container>

                <NavbarBrand>
                    <BrandHeader>
                        <Link to="/">
                            StakingDojo.com
                        </Link>
                    </BrandHeader>

                </NavbarBrand>
                <Nav className="ml-auto" navbar>

                    <NavbarText>
                        <Link to="/">
                            <NavLink>Home</NavLink>
                        </Link>
                    </NavbarText>
                    {/*
                    <NavbarText>
                        <Link to="/pools">
                            <NavLink>Liquidity Pools</NavLink>
                        </Link>
                    </NavbarText>
                    <NavbarText>
                        <Link to="/stablecoins">
                            <NavLink>Stablecoins</NavLink>
                        </Link>
                    </NavbarText>
                    <NavbarText>
                        <NavLink href="https://github.com/reactstrap/reactstrap">GitHub</NavLink>
                    </NavbarText>
                    */}

                </Nav>

            </Container>

        </StyledNavbar>
    )
}

const BrandHeader = styled.span`
    font-family: Pacifico;
    font-size: 20px;

`;

const StyledNavbar = styled(Navbar)`
-webkit-box-shadow: 0 4px 6px -6px #222;
-moz-box-shadow: 0 4px 6px -6px #222;
box-shadow: 0 4px 6px -6px #222;
`;

//background-image: linear-gradient(#0275d8 70%, white 175px);

export default NavBar;