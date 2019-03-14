import React, {Component} from 'react';
import { Modal, Button} from 'react-bootstrap'

class Homepage extends Component {

    constructor() {
        super();
        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.state = {
          showModal: false,
          lowTide: null,
          highTide: null
        };
    }

    componentDidMount() {
        const request = new XMLHttpRequest();

        request.open('GET', 'https://crossorigin.me/http://api.spitcast.com/api/county/tide/orange-county/', true);
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
                // console.log(tideList);
                let highTide = [];
                let lowTide = [];
                tideList.forEach((entry, i) => {
                    if(i === 23 || i === 0) {
                        return;
                    }
                    if(tideList[i+1].tide < entry.tide && tideList[i-1].tide < entry.tide) {
                        highTide.push(entry)
                    }
                    if(tideList[i-1].tide > entry.tide && tideList[i+1].tide > entry.tide) {
                        lowTide.push(entry)
                    }
                });
                // console.log(highTide);
                // console.log(lowTide);
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
                this.setState({
                    lowTideTimes: lowTideTimes,
                    highTideTimes: highTideTimes
                });
            } else {
                console.log('error in fetching tides');
            }
        };
        request.send();
    }

    handleClose() {
        this.setState({showModal: false});
    }

    handleOpen() {
        this.setState({showModal: true});
    }

    renderModal() {
        return (
            <div>
                <Modal className="info-modal" show={this.state.showModal} onHide={this.handleClose}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>Tide Information</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            Low Tide: {this.state.lowTideTimes}, High Tide: {this.state.highTideTimes}
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleClose}>Close</Button>
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
                    <Button className='county' onClick={this.handleOpen}>
                        ENTER LOCATION
                    </Button>
                    <Button className='location' onClick={this.handleOpen}>
                        USE MY LOCATION
                    </Button>
                </div>
            </div>);
    }

    render() {
        return (<div>
            {this.renderModal()}
            {this.renderContent()}
        </div>);
    }
}
export default Homepage;
