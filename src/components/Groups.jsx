import React, { useState, useEffect } from "react";
import { Route, Switch, useParams, Link as RouterLink } from "react-router-dom";

import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

import AssignmentIcon from '@material-ui/icons/Assignment';
import GroupIcon from '@material-ui/icons/Group';
import InfoIcon from '@material-ui/icons/Info';

import { listUsersInGroup } from "../utils/groups";
import useCheckMobile from "../utils/useCheckMobile";

export default function Groups(props) {
  return (
    <Switch>
      <Route exact path='/groups'>
        <h3>Please select a group from the side menu.</h3>
      </Route>
      <Route path='/groups/:groupID'>
        <Group {...props} />
      </Route>
    </Switch>
  );
}


const bottomNavLinks = [
  {
    path: '',
    label: 'My tasks',
    icon: <AssignmentIcon/>,
  },
  {
    path: '/users',
    label: 'Users',
    icon: <GroupIcon/>,
  },
  {
    path: '/info',
    label: 'Info',
    icon: <InfoIcon/>,
  },
];

function Group(props) {
  const { groupID } = useParams();
  const isMobile = useCheckMobile();

  const { groups, groupsStatus } = props;

  // navigation
  const [navigation, setNavigation] = useState(0);
  useEffect(() => setNavigation(0), [groupID]);


  const [group, setGroup] = useState(null);
  const [groupAuth, setGroupAuth] = useState(0); // 0 = waiting, 1 = loading, 2 = success, 3 = error
  const [groupAuthMessage, setGroupAuthMessage] = useState('');

  useEffect(checkGroups, [groupID, groupsStatus, groups]);
  useEffect(() => {
    if (group && groupAuth === 2) {
      handleGetGroupUsers();
    }
  }, [group]);


  function checkGroups() {
    // console.log(groupID);
    // console.log(groups);
    setGroupAuth(0);
    if (groupsStatus === 1) {
      setGroupAuth(1);
      setGroup(null);
      return;
    }

    if(groupsStatus !== 2) {
      setGroupAuth(3);
      setGroupAuthMessage('Groups not loaded. Try again later.');
      setGroup(null);
      return;
    }

    for(let i = 0; i < groups.length; i++) {
      if (groups[i].groupID.S === groupID) {
        setGroupAuth(2);
        setGroup(groups[i]);
        return;
      }
    }

    setGroupAuth(3);
    setGroupAuthMessage('You do not have access to this group.');
    setGroup(null);
  }

  const [groupUsers, setGroupUsers] = useState([]);
  const [groupUsersStatus, setGroupUsersStatus] = useState(0); // 0 = waiting, 1 = loading, 2 = success, 3 = error
  const [groupUsersMessage, setGroupUsersMessage] = useState('');

  async function handleGetGroupUsers() {
    setGroupUsersStatus(1);
    const result = await listUsersInGroup(group.groupID.S);
    console.log(result);

    if (result.success) {
      setGroupUsersStatus(2);
      setGroupUsers(result.response.Items);
    } else {
      setGroupUsersStatus(3);
      setGroupUsersMessage(result.message);
    }
  }

  return (
    groupAuth === 1 ? (
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: '100vh' }}
      >
        <Grid item xs={3}>
          <CircularProgress/>
        </Grid>
      </Grid>
    )
    : groupAuth === 2 ? (
      <div>
        <Switch>
          <Route exact path={`groups/${groupID}`}>

          </Route>
          <Route exact path={`/groups/${groupID}/info`}>
            <div>
              <h3>{group.groupName.S}</h3>
              <p>{group.groupID.S}</p>
              <h5>Your role: {group.role.S}</h5>
            </div>
          </Route>
          <Route exact path={`/groups/${groupID}/users`}>
            <button onClick={handleGetGroupUsers}>get users</button>
            <br/>
            {groupUsersStatus === 1 ? 
              <CircularProgress/>
              : groupUsersStatus === 2 ?
              <List>
                {groupUsers.map((user, index) => (
                  <ListItem key={`group-user-${index}-${user.userID.S}`}>
                    <ListItemText primary={user.userName.S} secondary={user.userID.S}></ListItemText>
                  </ListItem>
                ))}
              </List>
              : 
              <div>
                {groupUsersMessage}
              </div>
            }
          </Route>
          <Route exact path={`/groups/${groupID}/tasks`}>

          </Route>
        </Switch>
        <BottomNavigation 
          showLabels
          value={navigation}
          onChange={(event, newValue) => {
            setNavigation(newValue);
          }}
          style={{
            width: '100%',
            position: 'fixed',
            bottom: 0,
            left: isMobile ? 0 : '10rem',
            right: 0,
            backgroundColor: '#e0e0e0'
          }}
        >
          {bottomNavLinks.map((nav, index) => (
            <BottomNavigationAction 
              key={`bottom-nav-${index}`}
              label={nav.label}
              icon={nav.icon}
              component={RouterLink}
              to={`/groups/${groupID}${nav.path}`}
              style={{textDecoration: 'none'}}
            />
          ))}
        </BottomNavigation>
      </div>
    )
    : (
      <div>
        <h3>{groupAuthMessage}</h3>
      </div>
    )
  );
}