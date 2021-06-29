import PrivateRoute from './components/PrivateRoute';
import Home from './components/Home';
import About from './components/About';
import Login from './components/Login';
import Register from './components/Register';

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
          <Route path='/login' exact component={Login} />
          <Route path='/register' exact component={Register} />
          <Route render={() => <Redirect to="/" />}/>
        </Switch>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
