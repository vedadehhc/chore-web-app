import React, { useState, useEffect } from 'react';
import {Link as RouterLink, useHistory} from "react-router-dom";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';

import HomeIcon from '@material-ui/icons/Home';
import InfoIcon from '@material-ui/icons/Info';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import {makeStyles} from "@material-ui/core/styles";
import useCheckMobile from '../utils/useCheckMobile';
import { logout } from '../utils/auth';
const useStyles = makeStyles((theme) => ({
  title: {
    margin: theme.spacing(1, 0, 1),
    textTransform: "none",
    textAlign: "left",
    color: '#333',
  },
  logoButton: {
    padding: theme.spacing(0),
    textAlign: "left",
  },
  navButton: {
    color: '#333',
    '&:hover':{
      backgroundColor: '#fff',
    }
  },
  navButtonSelected: {
    color: '#333',
    backgroundColor: '#fff',
    '&:hover':{
      backgroundColor: '#fff',
    }
  },
  navButtonMobile: {
    color: '#fff',
    width: '100%',
  },
  navButtonMobileSelected: {
    backgroundColor: '#fff',
    color: '#000',
    width: '100%',
  },
  drawerDiv: {
    height: '100vh',
    backgroundColor: theme.palette.primary.main,
  },
}));

const navLinks = [
  ['Home', '/', <HomeIcon/>], 
  ['About', '/about', <InfoIcon/>],
  // ['Courses', '/courses', <LinearScaleIcon/>],
];

export default function Header(props) {
  const history = useHistory();
  const classes = useStyles();
  
  // mobile
  const isMobile = useCheckMobile();


  // Scroll effects
  useEffect(() => {
    window.onscroll = () => {
      scrollFunction()
    }
  });

  const [navElevation, setNavElevation] = useState(0);

  function scrollFunction() {
    const scroll = document.body.scrollTop || document.documentElement.scrollTop;
    if(scroll === 0) {
      setNavElevation(0);
    } else {
      setNavElevation(4);
    }
  }


  // Menu 
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  function handleHovering() {
    setHovered(true);
  }

  function handleUnhovering() {
    setHovered(false);
  }

  // render
  return (
    <AppBar position='fixed' elevation={navElevation}>
      <Toolbar>
        <div>
          <Button component={RouterLink} to="/" className={classes.logoButton}>
            {/* <img src="http://usaco.org/current/images/usaco_logo.png" alt="logo" className={classes.logo} style={{
              maxHeight: logoRatio*navHeight,
              transition: navTransitionSpeed,
            }}/> */}
            <Typography variant="h6" className={classes.title}>
              Chore web app
            </Typography>
          </Button>
        </div>
        <div style={{flexGrow: 1}}></div>
        <div>
          {isMobile ? (
            <React.Fragment>
              <IconButton className={classes.navButton} onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer anchor='top' open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <div className={classes.drawerDiv}>
                  <Button
                    onClick={() => setDrawerOpen(false)}
                    className={classes.navButtonMobile}
                    style={{ height: `${Math.floor(100 / (navLinks.length + 2))}%`, maxHeight: 100 }}
                  >
                    <CloseIcon />
                  </Button>
                  {navLinks.map((text, index) => (
                    <Button key={`navbar-mobile-navlink${index}`} component={RouterLink} to={text[1]}
                      onClick={() => setDrawerOpen(false)}
                      className={props.selected === text[1] ? classes.navButtonMobileSelected : classes.navButtonMobile}
                      style={{ height: `${Math.floor(100 / (navLinks.length + 2))}%`, maxHeight: 100 }}
                    >
                      {text[2]}
                      <div style={{ width: 20 }} />
                      {text[0]}
                    </Button>
                  ))}
                  <Button
                    onClick={() => setDrawerOpen(false)}
                    className={classes.navButtonMobile}
                    style={{ height: `${Math.floor(100 / (navLinks.length + 2))}%`, maxHeight: 100 }}
                  >
                    <ExitToAppIcon/>
                    <div style={{ width: 20 }} />
                    Logout
                  </Button>
                </div>
              </Drawer>
            </React.Fragment>
          ) : 
            navLinks.map((text,index) => (
              <Button key={`navbar-navlink${index}`} component={RouterLink} to={text[1]}
                className={(props.selected === text[1] && !hovered) ? classes.navButtonSelected : classes.navButton }
                onMouseEnter={handleHovering}
                onMouseLeave={handleUnhovering}
              >{text[0]}</Button>
            ))
          }
        </div>
        {isMobile || <div style={{flexGrow: 1}}></div>}
        {isMobile || <div>
          <Button variant='contained' color='secondary' className={classes.navButton} component={RouterLink} to={'/logout'}>
            Logout
          </Button>
        </div>}
      </Toolbar>
    </AppBar>
  );
}