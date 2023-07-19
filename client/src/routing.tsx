import React from 'react';

import createHistory from 'history/createBrowserHistory';
import { Route, Router } from 'react-router-dom';

import App from './App';
import Auth from './auth/Auth';
import Callback from './components/Callback';

const history = createHistory();

const auth = new Auth(history);

const handleAuthentication = (props: any) => {
  const location = props.location;
  if (/access_token|id_token|error/.test(location.hash)) {
    auth.handleAuthentication();
  }
};

export const makeAuthRouting = () => {
  return (
    <Router history={history}>
      <div>
        <Route
          path="/callback"
          render={(props) => {
            handleAuthentication(props);
            return <Callback />;
          }}
        />
        <Route
          render={(props) => {
            return <App auth={auth} {...props} />;
          }}
        />
      </div>
    </Router>
  );
};
