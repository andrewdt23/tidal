import React, {Component} from 'react';
import Homepage from './components/homePage.js';
import './Assets/css/default.min.css';
import {
    BrowserRouter as Router, Route,
} from 'react-router-dom';

class App extends Component {
    render() {
        return (<Router>
            <div className="App">
                <Homepage />
            </div>
        </Router>);
    }
}

export default App;
