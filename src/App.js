import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Home from './components/Home';
import About from './components/About';
import Login from './components/Login';
import Logout from './components/Logout';
import Register from './components/Register';
import CreateGroup from './components/CreateGroup';
import JoinGroup from './components/JoinGroup';
import Group from './components/Groups';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { HashRouter, Route, Redirect, Switch } from "react-router-dom";

function App() {
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#ffa726',
      },
      secondary: {
        main: '#ce93d8',
        // main: '#f55',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <HashRouter basename='/'>
        <Switch>
          <PrivateRoute path='/' exact component={Home} selected='/'/>
          <PrivateRoute path='/about' exact component={About} selected='/about'/>
          <PrivateRoute path='/logout' exact component={Logout} />
          <PrivateRoute path='/createGroup' exact component={CreateGroup} selected='/createGroup'/>
          <PrivateRoute path='/joinGroup' exact component={JoinGroup} selected='/joinGroup'/>
          <PrivateRoute path='/groups' component={Group} selected='/groups'/>
          <PublicRoute path='/login' exact component={Login} />
          <PublicRoute path='/register' exact component={Register} />
          <Route render={() => <Redirect to="/" />}/>
        </Switch>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
