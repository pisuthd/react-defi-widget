import React from 'react';
import { Container, Card } from "../Common";

const WidgetLayout = (props) => {

    const { children } = props;

    return (
        <Container
        >
            <Card>
                {children}
            </Card>
        </Container>
    )
}



export default WidgetLayout