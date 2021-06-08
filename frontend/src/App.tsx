import React, { useEffect } from 'react';
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
import { AuthProvider, useAuthProvider } from './api/auth';

OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.TOKEN = '';
function App() {
  const authProvider = useAuthProvider();
  useEffect(() => {
    authProvider.update();
  });
  return (
    <AuthProvider value={authProvider}>
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
          <Route path="/">
            {authProvider.studentUid ?
              <Redirect to="/map" />
              :
              <Redirect to="/login" />
            }
          </Route>
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
