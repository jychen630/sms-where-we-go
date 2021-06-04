import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import CardPage from './pages/CardPage';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import UserPage from './pages/UserPage';
import MapPage from './pages/MapPage';
import 'antd/dist/antd.css';
import { OpenAPI } from 'wwg-api';

OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.TOKEN = 'asdasd';
function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <CardPage title='Where We Go 登录'>
            <LoginForm />
          </CardPage>
        </Route>
        <Route path="/register">
          <CardPage title='Where We Go 注册'>
            <RegistrationForm />
          </CardPage>
        </Route>
        <Route path="/user">
          <UserPage />
        </Route>
        <Route path="/map">
          <MapPage />
        </Route>
        <Route path="/roster">roster</Route>
        <Route path="/"><Redirect to="/login" /></Route>
      </Switch>
    </Router>
  );
}

export default App;
