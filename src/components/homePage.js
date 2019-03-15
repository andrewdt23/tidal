import React, {Component} from 'react';
import {Modal, Button} from 'react-bootstrap'

class Homepage extends Component {

    constructor() {
        super();
        this.handleTideClose = this.handleTideClose.bind(this);
        this.handleTideOpen = this.handleTideOpen.bind(this);
        this.handleInputClose = this.handleInputClose.bind(this);
        this.handleInputOpen = this.handleInputOpen.bind(this);
        this.computeTides = this.computeTides.bind(this);
        this.formatTides = this.formatTides.bind(this);
        this.updateLocationInput = this.updateLocationInput.bind(this);
        this.handleInputSubmit = this.handleInputSubmit.bind(this);
        this.getTides = this.getTides.bind(this);
        this.state = {
          showTideModal: false,
          showInputModal: false,
          lowTide: null,
          highTide: null,
          location: null,
        };
    }

    computeTides(tideList) {
        let highTide = [];
        let lowTide = [];
        tideList.forEach((entry, i) => {
            if(i === 23 || i === 0) {
                return;
            }
            if(tideList[i+1].tide < entry.tide && tideList[i-1].tide < entry.tide) {
                highTide.push(entry);
            }
            if(tideList[i-1].tide > entry.tide && tideList[i+1].tide > entry.tide) {
                lowTide.push(entry);
            }
        });

        if(highTide.length < 2) {
            highTide.push({hour: '12AM', tide: 0});
        }
        if(lowTide.length < 2) {
            lowTide.push({hour: '12AM', tide: 0});
        }

        return({highTide: highTide, lowTide: lowTide});
    }

    formatTides(highTide, lowTide) {
        let lowTideTimes = ''
        lowTide.forEach((entry, i) => {
            if(i === 0) {
                lowTideTimes = lowTideTimes + entry.hour + ' and ';
            } else {
                lowTideTimes = lowTideTimes + entry.hour;
            }
        });
        let highTideTimes = ''
        highTide.forEach((entry, i) => {
            if(i === 0) {
                highTideTimes = highTideTimes + entry.hour + ' and ';
            } else {
                highTideTimes = highTideTimes + entry.hour;
            }
        });

        return({highTideTimes: highTideTimes, lowTideTimes: lowTideTimes});
    }

    getTides() {
        const request = new XMLHttpRequest();

        if(this.state.location) {
            let county = this.state.location.replace(/\s+/g, '-').toLowerCase();
            let url = 'https://cors-anywhere.herokuapp.com/http://api.spitcast.com/api/county/tide/' + county + '/'

            request.open('GET', url, true);
            request.onload = () => {
                // Begin accessing JSON data here
                const data = JSON.parse(request.response);

                if (request.status >= 200 && request.status < 400) {
                    let tideList = [];
                    // console.log(data);
                    data.forEach((entry, i) => {
                        if (entry.hour && entry.tide) {
                            // console.log(hour.tide);
                            if (tideList && i !== 24) {
                                tideList.push({hour: entry.hour, tide: entry.tide});
                            }
                        }
                    });

                    let tides = this.computeTides(tideList);
                    let highTide = tides.highTide;
                    let lowTide = tides.lowTide;

                    let tideTimes = this.formatTides(highTide, lowTide);
                    let highTideTimes = tideTimes.highTideTimes;
                    let lowTideTimes = tideTimes.lowTideTimes;

                    this.setState({
                        lowTideTimes: lowTideTimes,
                        highTideTimes: highTideTimes,
                        showTideModal: true
                    });

                } else {
                    console.log('error in fetching tides');
                }
            };
            request.send();
        }
    }

    handleInputSubmit() {
        this.getTides();
        this.setState({showInputModal: false});
    }

    updateLocationInput(event) {
        event.preventDefault();
        this.setState({location: event.target.value});
    }

    handleTideClose() {
        this.setState({showTideModal: false});
    }

    handleTideOpen() {
        this.setState({showTideModal: true});
    }

    handleInputClose() {
        this.setState({showInputModal: false});
    }

    handleInputOpen() {
        this.setState({showInputModal: true});
    }

    renderTideModal() {
        return (
            <div>
                <Modal className="tide-modal" show={this.state.showTideModal} onHide={this.handleTideClose}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>Tide Information</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            Low Tide: {this.state.lowTideTimes}
                        </p>
                        <p>
                            High Tide: {this.state.highTideTimes}
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleTideClose}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

    renderInputModal() {
        return (
            <div>
                <Modal className="input-modal" show={this.state.showInputModal} onHide={this.handleInputClose}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>County Tide Information</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <form>
                        <div className="enter-county">Enter county:</div>
                        <div className="county-input-wrapper">
                            <input className="county-input" type="text" onChange={this.updateLocationInput}/>
                        </div>
                        <div className="county-submit-wrapper">
                            <Button className="county-submit" onClick={this.handleInputSubmit}>Submit</Button>
                        </div>
                    </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleInputClose}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

    renderContent() {
        return (
            <div className='background-image'>
                <div className='tidal-title'>
                    TIDAL
                </div>
                <div className='buttons'>
                    <Button className='county' onClick={this.handleInputOpen}>
                        ENTER LOCATION
                    </Button>
                    <Button className='location' onClick={this.handleTideOpen}>
                        USE MY LOCATION
                    </Button>
                </div>
            </div>);
    }

    render() {
        return (<div>
            {this.renderTideModal()}
            {this.renderInputModal()}
            {this.renderContent()}
        </div>);
    }
}
export default Homepage;
