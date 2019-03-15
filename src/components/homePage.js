import React, {Component} from 'react';
import {Modal, Button} from 'react-bootstrap'

class Homepage extends Component {

    constructor() {
        super();
        this.handleErrorClose = this.handleErrorClose.bind(this);
        this.handleErrorOpen = this.handleErrorOpen.bind(this);
        this.handleTideClose = this.handleTideClose.bind(this);
        this.handleTideOpen = this.handleTideOpen.bind(this);
        this.handleInputClose = this.handleInputClose.bind(this);
        this.handleInputOpen = this.handleInputOpen.bind(this);
        this.computeTides = this.computeTides.bind(this);
        this.formatTides = this.formatTides.bind(this);
        this.updateLocationInput = this.updateLocationInput.bind(this);
        this.handleInputSubmit = this.handleInputSubmit.bind(this);
        this.getTides = this.getTides.bind(this);
        this.updateCoordinates = this.updateCoordinates.bind(this);
        this.getLocation = this.getLocation.bind(this);
        this.getCounty = this.getCounty.bind(this);
        this.state = {
          showTideModal: false,
          showInputModal: false,
          showErrorModal: false,
          lowTide: null,
          highTide: null,
          location: null,
          coordinates: null
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

        return({highTide: highTide, lowTide: lowTide});
    }

    formatTides(highTide, lowTide) {
        let lowTideTimes = ''
        lowTide.forEach((entry, i) => {
            if(i === 0 && lowTide.length === 2) {
                lowTideTimes = lowTideTimes + entry.hour + ' and ';
            } else {
                lowTideTimes = lowTideTimes + entry.hour;
            }
        });
        let highTideTimes = ''
        highTide.forEach((entry, i) => {
            if(i === 0 && highTide.length === 2) {
                highTideTimes = highTideTimes + entry.hour + ' and ';
            } else {
                highTideTimes = highTideTimes + entry.hour;
            }
        });

        return({highTideTimes: highTideTimes, lowTideTimes: lowTideTimes});
    }

    updateCoordinates(position) {
        this.setState({coordinates: position.coords, location: null});
        this.getTides();
    }

    getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.updateCoordinates);
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }

    getCounty() {
        const request = new XMLHttpRequest();

        let url = 'https://geo.fcc.gov/api/census/area?lat=' + this.state.coordinates.latitude + '&lon=' + this.state.coordinates.longitude + '&format=json';

        request.open('GET', url, true);
        request.onload = () => {
            // Begin accessing JSON data here
            const data = JSON.parse(request.response);

            if (request.status >= 200 && request.status < 400) {
                let county = null;
                let results = data.results;
                if(results.length === 1) {
                    county = results[0].county_name;
                }
                this.setState({location: county, coordinates: null});
                this.getTides();
            } else {
                console.log('error in fetching tides');
            }
        };
        request.send();
    }

    getTides() {
        const request = new XMLHttpRequest();

        if(this.state.coordinates) {
            this.getCounty();
        }
        if(this.state.location) {
            let county = this.state.location.replace(/\s+/g, '-').toLowerCase();
            let url = 'https://cors-anywhere.herokuapp.com/http://api.spitcast.com/api/county/tide/' + county + '/'

            request.open('GET', url, true);
            request.onload = () => {
                // Begin accessing JSON data here
                let data = null
                try {
                    data = JSON.parse(request.response);
                } catch(error) {
                    console.log(error);
                    this.setState({showErrorModal: true});
                }

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
        let location = event.target.value;
        location = location.toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
        this.setState({location: location});
    }

    handleErrorClose() {
        this.setState({showErrorModal: false});
    }

    handleErrorOpen() {
        this.setState({showErrorModal: true});
    }

    handleTideClose() {
        this.setState({showTideModal: false});
    }

    handleTideOpen() {
        this.setState({showTideModal: true, highTideTimes: null, lowTideTimes: null});
    }

    handleInputClose() {
        this.setState({showInputModal: false});
    }

    handleInputOpen() {
        this.setState({showInputModal: true, highTideTimes: null, lowTideTimes: null, coordinates: null});
    }

    renderErrorModal() {
        return (
            <div>
                <Modal className="error-modal" show={this.state.showErrorModal} onHide={this.handleErrorClose}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>Error</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            We're sorry, this location is not supported. It is also possible that you have entered the location incorrectly. Please make sure the county is spelled correctly and separated by spaces. For example: "san diego".
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleErrorClose}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

    renderTideModal() {
        return (
            <div>
                <Modal className="tide-modal" show={this.state.showTideModal} onHide={this.handleTideClose}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>Tide Information for {this.state.location} County</Modal.Title>
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
                    <Button className='location' onClick={this.getLocation}>
                        USE MY LOCATION
                    </Button>
                </div>
            </div>);
    }

    render() {
        return (<div>
            {this.renderErrorModal()}
            {this.renderTideModal()}
            {this.renderInputModal()}
            {this.renderContent()}
        </div>);
    }
}
export default Homepage;
