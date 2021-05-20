import React, { useEffect, useRef } from 'react';
import logo from './logo.svg';
import mapboxgl from 'mapbox-gl';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import Map from './Map';

mapboxgl.accessToken = "pk.eyJ1IjoiYWNraW5kbGUzIiwiYSI6ImNrYzYzcWFnOTA5bjQycnRlY2t4OWxlMWUifQ.a3wwi4cHq1sHakuoT9Bo0w";

function App() {

  return (
    <Router>

      <Switch>
        <Route path="/login">
          login
        </Route>
        <Route path="/register">register</Route>
        <Route path="/map">
          <Map />
        </Route>
        <Route path="/roster">roster</Route>
        <Route path="/"><Redirect to="/login"/></Route>
      </Switch>
    </Router>
  );
}

export default App;
