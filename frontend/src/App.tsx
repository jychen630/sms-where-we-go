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
import AdminPage from './pages/AdminPage';
import 'antd/dist/antd.css';
import { OpenAPI, Role } from 'wwg-api';
import { AuthProvider, useAuthProvider } from './api/auth';
import DevLoginForm from './components/DevLoginForm';
import ListPage from './pages/ListPage';
import FeedbackPage from './pages/FeedbackPage';
import FeedbackForm from './components/FeedbackForm';

OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.TOKEN = '';
function App() {
  const authProvider = useAuthProvider();
  useEffect(() => {
    document.title = 'SMS Where We Go'
    authProvider.update();
  }, []); //eslint-disable-line
  return (
    <AuthProvider value={authProvider}>
      <Router>
        <Switch>
          {process.env.NODE_ENV === 'development' &&
            <Route path="/dev-login">
              <CardPage title='Where We Go 调试登录'>
                <DevLoginForm />
              </CardPage>
            </Route>
          }
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
          <Route path="/feedback">
            <FeedbackPage />
          </Route>
          <Route path="/public-feedback">
            <CardPage title='提交反馈'>
              <FeedbackForm isPublic />
            </CardPage>
          </Route>
          <Route path="/user">
            <UserPage />
          </Route>
          <Route path="/map">
            <MapPage />
          </Route>
          <Route path="/list">
            <ListPage />
          </Route>
          {authProvider.role !== Role.STUDENT &&
            <Route path="/admin">
              <AdminPage />
            </Route>
          }
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
