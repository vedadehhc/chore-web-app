import React, { useState, useEffect } from 'react';
import {Link as RouterLink, useLocation } from "react-router-dom";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

import AddIcon from '@material-ui/icons/Add';
import CreateIcon from '@material-ui/icons/Create';
import HomeIcon from '@material-ui/icons/Home';
import MenuIcon from '@material-ui/icons/Menu';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import GroupIcon from '@material-ui/icons/Group';

import {makeStyles} from "@material-ui/core/styles";
import useCheckMobile from '../utils/useCheckMobile';

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
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
    width: '100%',
    '&:hover':{
      backgroundColor: '#ddd',
    }
  },
  navButtonSelected: {
    color: '#333',
    width: '100%',
    backgroundColor: theme.palette.secondary.light,
    '&:hover':{
      backgroundColor: theme.palette.secondary.main,
    }
  },
  drawerDiv: {
    height: '100vh',
    // backgroundColor: theme.palette.primary.main,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  drawerPaperMobile: {
    width: '80%',
  },
  drawerPaper: {
    width: '20rem',
  },
  paperAnchorLeftMobile: {
    width: '80%',
  },
  paperAnchorLeft: {
    width: '20rem',
  },
}));

const navLinks = [
  ['Home', '/', <HomeIcon/>], 
  ['Create group', '/createGroup', <CreateIcon/>],
  ['Join group', '/joinGroup', <AddIcon/>],
];

export default function Header(props) {
  const classes = useStyles();

  const { handleLoadGroups, groupsStatus, groups, groupsError } = props;
  useEffect(() => {
    handleLoadGroups();
  }, []);

  const location = useLocation();

  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedGroupID, setSelectedGroupID] = useState('');

  useEffect(() => {
    setSelectedGroup('');
    setSelectedGroupID('');
    groups.forEach(group => {
      if (location.pathname.startsWith(`/groups/${group.groupID.S}`)) {
        setSelectedGroup(group.groupName.S);
        setSelectedGroupID(group.groupID.S);
      }
    });
  }, [groups, location])
  
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

  // render
  return (
    <React.Fragment>
      <AppBar position='fixed' elevation={navElevation} className={isMobile || classes.appBar}>
        <Toolbar>
          {isMobile && <div>
            <IconButton className={classes.navButton} onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          </div>}
          <div>
            <Button component={RouterLink} to="/" className={classes.logoButton}>
              {/* <img src="http://usaco.org/current/images/usaco_logo.png" alt="logo" className={classes.logo} style={{
                maxHeight: logoRatio*navHeight,
                transition: navTransitionSpeed,
              }}/> */}
              <Typography variant="h6" className={classes.title}>
                Chores
              </Typography>
            </Button>
          </div>
          <div style={{flexGrow: 1}}></div>
          <div><Typography variant='h5'>{selectedGroup}</Typography></div>
          <div style={{flexGrow: 1}}></div>
          {/*isMobile || <div>
            <Button variant='contained' color='secondary' className={classes.navButton} component={RouterLink} to={'/logout'}>
              Logout
            </Button>
          </div> */ }
        </Toolbar>
      </AppBar>
      <Drawer 
        variant={isMobile ? 'temporary' : 'permanent'}
        anchor='left'
        open={drawerOpen}
        classes={{
          paperAnchorLeft: isMobile ? classes.paperAnchorLeftMobile : classes.paperAnchorLeft,
          paper: isMobile ? classes.drawerPaperMobile : classes.drawerPaper,
        }}
        style={{
          width: isMobile ? '80%' : '20rem',
          flexShrink: 0,
        }}
        onClose={() => setDrawerOpen(false)}
      >
        {isMobile || <Toolbar/>}
        <div className={classes.drawerDiv}>
          {/*isMobile && <Button
            onClick={() => setDrawerOpen(false)}
            className={classes.navButtonMobile}
            style={{ height: `${Math.floor(100 / (navLinks.length + 2))}%`, maxHeight: 100 }}
            onMouseEnter={handleHovering}
            onMouseLeave={handleUnhovering}
          >
            <CloseIcon />
          </Button>*/}
          <List style={{overflow:'auto'}}>
            {navLinks.map((text, index) => (
              <ListItem button key={`navlink-${index}`} component={RouterLink} to={text[1]}
                onClick={() => setDrawerOpen(false)}
                className={props.selected === text[1] ? classes.navButtonSelected : classes.navButton}
              >
                <ListItemIcon>{text[2]}</ListItemIcon>
                <ListItemText primary={text[0]}/>
              </ListItem>
            ))}
            <Divider/>
            <ListSubheader disableSticky>
              <Typography variant='h6' style={{marginTop: '1rem',marginBottom: '.5rem'}}>
                Your groups
              </Typography>
            </ListSubheader>
            {groupsStatus === 1 && 
              <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center"
              >
                <Grid item xs={3}>
                  <CircularProgress/>
                </Grid>
              </Grid>
            }
            {groupsStatus === 2 && 
              groups.map((group, index) => (
                  <ListItem button 
                    key={`group-${group.groupID.S}`} 
                    component={RouterLink}
                    onClick={() => setDrawerOpen(false)}
                    to={`/groups/${group.groupID.S}`}
                    className={selectedGroupID === group.groupID.S ? classes.navButtonSelected : classes.navButton}
                  >
                    <ListItemIcon><GroupIcon/></ListItemIcon>
                    <ListItemText primary={group.groupName.S} secondary={group.groupID.S}></ListItemText>
                  </ListItem>
              ))
            }
            {groupsStatus === 3 && 
              <Typography variant='body1' style={{color: '#e57373'}}>Error: {groupsError}</Typography>
            }
          </List>
          <div style={{flexGrow: 1}}></div>
          <Divider/>
          <List><ListItem button component={RouterLink} to={'/logout'}
            onClick={() => setDrawerOpen(false)}
            className={classes.navButton}
          >
            <ListItemIcon><ExitToAppIcon/></ListItemIcon>
            <ListItemText primary='Logout'/>
          </ListItem></List>
        </div>
      </Drawer>
    </React.Fragment>
  );
}