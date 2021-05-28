import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import Map from './Map';
import Login from './Login';
import 'antd/dist/antd.css';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/register"><Register /></Route>
        <Route path="/map">
          <Map />
        </Route>
        <Route path="/roster">roster</Route>
        <Route path="/"><Redirect to="/login" /></Route>
      </Switch>
    </Router>
  );
}

export default App;
