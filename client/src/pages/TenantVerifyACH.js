import React from 'react';
// eslint-disable-next-line
import { Navbar, NavbarBrand, NavbarNav, NavLinkItem, Container, Row, Form, Input } from '../components/Bootstrap';
import Template from './Template';
import './page.css'
import GoogleSvg from '../components/svg/GoogleSvg';
import Button from '../components/Bootstrap/Button';
import Spinner from './modals/Spinner';
import Pane from '../components/Pane'
import * as api from '../api';
import { Link } from 'react-router-dom';

const intRegex = /^\d+$/;

class TenantVerifyACH extends Template {
    constructor(props, match) {
        super(props, match);
        this.activationCode = props.match.params.code;

        this.state = {
            amnt1: '',
            amnt2: '',
            errors: {},
            verified: false,
        };

    }

    componentDidMount() {
        // this.showModal(
        //     <Spinner />, 'Finding your account'
        // );

        // api
        //     .
    }

    inputChanged = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    verifyAccount = (e) => {
        e.preventDefault();

        var errors = {};
        if (!intRegex.test(this.state.amnt1)) {
            errors.amnt1 = "Not a valid number";
        }
        if (!intRegex.test(this.state.amnt2)) {
            errors.amnt2 = "Not a valid number";
        }

        this.setState({ errors: errors });
        var noErrors = (Object.getOwnPropertyNames(errors).length == 0);

        if (noErrors) {
            api
                .verifyACH([parseInt(this.state.amnt1), parseInt(this.state.amnt2)])
                .then(response => {
                    if (response.result == 'success') {
                        this.setState({ verified: true });
                    }
                 });
        }
    }

    getNavItems() {
        return [...(this.tenantNavLinks), { path: this.props.match.path, text: 'Verify Bank Account' }];
    }

    getContent() {
        if (this.state.verified) return (
            <Container>
            <Pane>
                <h3>Verify Bank Account</h3>
                <p>
                    Your bank account has been verified and can be used to pay rent.
                </p>
                <p><Link to='/'>Return to overview</Link></p>    
            </Pane>
        </Container>
        );

        return (
            <Container>
                <Pane>
                    <h3>Verify Bank Account</h3>
                    <p>
                        Enter the value, <em>in cents</em>, of the two deposits made to verify the account. 
                        They will appear on your statement as <tt>AMNTS</tt>.
                    </p>
                    <Form>
                        <Container>
                            <Row center>
                                <Input innerPrepend='AMNTS' className='col-5' name="amnt1" onChange={this.inputChanged} value={this.state.amnt1} />
                            </Row>
                            <Row center>
                                <Input innerPrepend='AMNTS' className='col-5' name="amnt2" onChange={this.inputChanged} value={this.state.amnt2} />
                            </Row>
                        </Container>    
                        <Button onClick={this.verifyAccount}>Verify Account</Button>
                    </Form>
                </Pane>
            </Container>
        );    
    }    
}

export default TenantVerifyACH;