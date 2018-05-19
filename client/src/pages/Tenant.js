import React from 'react';
import axios from 'axios';
// eslint-disable-next-line
import { Navbar, NavbarBrand, NavbarNav, NavLinkItem, Container } from '../components/Bootstrap';
import Template from './Template';
import './page.css'
import Button from '../components/Bootstrap/Button';
import * as api from '../api';
import { Table } from '../components/Table';

declare var StripeCheckout;

class Tenant extends Template {
    constructor(props) {
        super(props)
      
        this.payRentWithCreditCard = this.payRentWithCreditCard.bind(this);
        this.submitMaintenanceRequest =this.submitMaintenanceRequest.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.paymentTransform = this.paymentTransform.bind(this);
        this.paymentCheckChanged = this.paymentCheckChanged.bind(this);

        this.rentColumns = [
            { name: 'unitName', label: 'Unit' },
            { name: 'amount', label: 'Amount' },
            { name: 'due', label: 'Due' },
            { name: 'payButton', label: 'Pay' },
        ]

        this.state = {
            paymentTable: {
                columns: this.rentColumns,
                items: [],
            },
            checkedPaymentIds: [], // : number[]
            totalDue: 0,
            message: '',
            processingPayment: false,
        };

    }

    componentDidMount() {
        this.requestRentData();
    }

    requestRentData() {
        this.setState({
            paymentTable: {
                columns: this.rentColumns,
                items: [],
            },
            totalDue: 0,
            checkedPaymentIds: [],
            processingPayment: false,
        });

        api
            .getRentDue()
            .then(invoices => {
                var totalDue = invoices.reduce((acc, item) => acc + item.amount, 0);
                var checkedPayments = invoices.map(invoice => invoice.id);
                
                this.setState({
                    paymentTable: {
                        columns: this.rentColumns,
                        items: invoices,
                    },
                    totalDue: totalDue,
                    checkedPaymentIds: checkedPayments,
                    processingPayment: false,
                });
            });
    }

    payRentWithCreditCard = (ev) => {
        var checkoutHandler = StripeCheckout.configure({
            key: "pk_test_edJT25Bz1YVCJKIMvmBGCS5Y",
            locale: "auto"
        });

        checkoutHandler.open({
            name: "132 Chapel St. LLC",
            description: "Rent Payment",
            token: this.handleTokenCard
        });
    }

    handleTokenCard = (token) => {
        token.invoiceList = this.state.checkedPaymentIds;
        
        this.setState({ processingPayment: true });
        fetch("/api/submitPayment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(token)
        }).then(output => {
            this.setState({ processingPayment: false });
            if (output.status === "succeeded") {
                this.setState({ processingPayment: false });
                console.log("successful payment");
            }
        }).catch(function (error) {
            console.log(error);
        });
    }
    
    paymentCheckChanged(event) {
        var checked = event.target.checked || false;
        var id = parseInt(event.target.name);

        var checkedIds = this.state.checkedPaymentIds.slice();

        if (checked) { // Ensure it's in the list
            if (!this.state.checkedPaymentIds.includes(id)) {
                checkedIds.push(id);
            }
        } else { // Ensure it's NOT in the list
            var indexOf = checkedIds.indexOf(id);
            if (indexOf >= 0) checkedIds.splice(indexOf, 1);
        }

        var selectedPayments =
            this.state.paymentTable.items.filter(item => checkedIds.includes(item.id));
        
        this.setState({
            checkedPaymentIds: checkedIds,
            totalDue: selectedPayments.reduce((total, item) => total + item.amount, 0)
        });
    }

    getSelectedPayments() {
        var allShownPayments = this.state.paymentTable.items.slice();
        var allCheckedPayments = allShownPayments.filter(payment => this.state.checkedPaymentIds.includes(payment.id));

        return allCheckedPayments;
    }

    /**
     * Converts values from this.state.paymentTable to JSX
     * @param {*} col - column name
     * @param {*} value - column value
     * @param {*} item - item being displayed
     */
    paymentTransform(col, value, item) {
        if (col == 'payButton') {
            return <input
                type='checkbox'
                checked={this.state.checkedPaymentIds.includes(item.id)}
                onChange={this.paymentCheckChanged}
                disabled={this.state.processingPayment}
                name={item.id}
            />;
        } else if (col == 'amount') {
            return this.formatDollars(value);
        } else if (col == 'due') {
            return new Date(value).toLocaleDateString();
        } else {
            return value;
        }
    }

    /** Formats a number as a dollar amount */
    formatDollars(value) {
        return '$' + parseFloat(value).toFixed(2);
    }

    getNavItems() {
        return [
            { path: '/tenant', text: 'Home' },
            { path: '/tenant', text: 'Pay Rent' },
            { path: '/tenant', text: 'Request Maintenance' },
        ];
    }


    handleChange(event) {
        this.setState({message: event.target.value});
    }
    
    submitMaintenanceRequest(event) {
        // alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
        
        axios.post('/api/postMaintRequest', {
            message: this.state.message
        }).then(function(resMaint) { 
            console.log("Post Maintenance Request works!");
        });
    }


    getContent() {
        return (
            <div>
                <h3>Rent Due</h3>

                <Table
                    data={this.state.paymentTable}
                    transform={this.paymentTransform}
                />
                <p>
                    Total:  <span className='rent-amount'>{this.formatDollars(this.state.totalDue || 0)}</span>
                    <br />
                    <Button
                        disabled={this.state.processingPayment || (this.state.totalDue === 0)}    
                        onClick={this.payRentWithCreditCard}
                    >
                        Pay Now
                    </Button>

                </p>

                <h3>Maintenance Requests</h3>
                <form>
                  <label>
                      What is Wrong ?
                      <input type="text" value={this.state.message} onChange={this.handleChange} />
                  </label>                            
                 <Button onClick={this.submitMaintenanceRequest}>Request Maintenance</Button>
              </form>

            </div>
        );
    }
}

export default Tenant;