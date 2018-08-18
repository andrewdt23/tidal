import React, {Component} from 'react';

class Homepage extends Component {

    render() {
        return (
            <div className='background-image'>
                <div className='tidal-title'>
                    TIDAL
                </div>
                <div className='buttons'>
                    <button className='county'>
                        ENTER LOCATION
                    </button>
                    <button className='location'>
                        USE MY LOCATION
                    </button>
                </div>
            </div>);
    }
}
export default Homepage;
