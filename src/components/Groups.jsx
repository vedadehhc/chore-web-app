import React, { useState, useEffect } from "react";
import { Route, Switch, useParams, Link as RouterLink, useLocation, Redirect, useHistory, useRouteMatch } from "react-router-dom";

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import AssignmentIcon from '@material-ui/icons/Assignment';
import GroupIcon from '@material-ui/icons/Group';
import InfoIcon from '@material-ui/icons/Info';
import DeleteIcon from '@material-ui/icons/Delete';
import RefreshIcon from '@material-ui/icons/Refresh';
import SettingsIcon from '@material-ui/icons/Settings';

import Tasks from './Tasks';

import { deleteGroup, listUsersInGroup, removeUserFromGroup } from "../utils/groups";
import useCheckMobile from "../utils/useCheckMobile";
import { listUserGroupTasks } from "../utils/tasks";

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
    adminOnly: false,
  },
  {
    path: '/users',
    label: 'Users',
    icon: <GroupIcon/>,
    adminOnly: false,
  },
  {
    path: '/info',
    label: 'Info',
    icon: <InfoIcon/>,
    adminOnly: false,
  },
  {
    path: '/tasks',
    label: 'Manage',
    icon: <SettingsIcon/>,
    adminOnly: true,
  }
];

const useStyles = makeStyles((theme) => ({
  day: {
    margin: 2,
    color: '#bbb'
  },
  dayIncluded: {
    margin: 2,
    color: '#000',
  },
}));

function Group(props) {
  const { groupID } = useParams();
  const isMobile = useCheckMobile();
  const location = useLocation();
  const classes = useStyles();
  const history = useHistory();

  const { groups, groupsStatus, handleLoadGroups } = props;

  // navigation
  const [navigation, setNavigation] = useState(0);
  useEffect(() => {
    bottomNavLinks.forEach((val, index) => {
      if(location.pathname === `/groups/${groupID}${val.path}`) {
        setNavigation(index);
      }
    });
  }, [groupID, location]);

  const [group, setGroup] = useState(null);
  const [groupAuth, setGroupAuth] = useState(0); // 0 = waiting, 1 = loading, 2 = success, 3 = error
  const [groupAuthMessage, setGroupAuthMessage] = useState('');

  useEffect(checkGroups, [groupID, groupsStatus, groups]);


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


  // tasks
  const [userTasks, setUserTasks] = useState(null);
  const [userTasksStatus, setUserTasksStatus] = useState(0); // 0 = waiting, 1 = loading, 2 = success, 3 = error
  const [userTasksMessage, setUserTasksMessage] = useState('');
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  async function handleGetUserTasks() {
    setUserTasksStatus(1);
    const result = await listUserGroupTasks(group.groupID.S);
    console.log(result);

    if(result.success) {
      setUserTasks(result.response.Items);
      setUserTasksStatus(2);
    } else {
      setUserTasksStatus(3);
      setUserTasksMessage(result.message);
    }
  }
  useEffect(() => {
    if (group && groupAuth === 2 && location.pathname === `/groups/${group.groupID.S}`) {
      handleGetUserTasks();
    }
  }, [group, groupAuth, location]);


  // users
  const [groupUsers, setGroupUsers] = useState(null);
  const [groupUsersStatus, setGroupUsersStatus] = useState(0); // 0 = waiting, 1 = loading, 2 = success, 3 = error
  const [groupUsersMessage, setGroupUsersMessage] = useState('');

  async function handleGetGroupUsers() {
    setGroupUsersStatus(1);
    const result = await listUsersInGroup(group.groupID.S);
    console.log(result);

    if (result.success) {
      setGroupUsers(result.response.Items);
      setGroupUsersStatus(2);
    } else {
      setGroupUsersStatus(3);
      setGroupUsersMessage(result.message);
    }
  }

  useEffect(() => {
    if (group && groupAuth === 2) {
      handleGetGroupUsers();
    }
  }, [group, groupAuth]);

  useEffect(() => {
    if (group && groupAuth === 2 && location.pathname === `/groups/${group.groupID.S}/users`) {
      handleGetGroupUsers();
    }
  }, [group, groupAuth, location]);
  
  // useEffect(() => {
  //   if (group && groupAuth === 2 && bottomNavLinks[navigation].path === '/users' && !groupUsers) {
  //     handleGetGroupUsers();
  //   }
  // }, [group, navigation]);

  // delete user
  const [deleteUserID, setDeleteUserID] = useState('');
  const [deleteUserStatus, setDeleteUserStatus] = useState(0);
  const [deleteUserMessage, setDeleteUserMessage] = useState('');

  async function handleRemoveUser(user) {
    setDeleteUserStatus(1);
    if(user) {
      setDeleteUserID(user.userID.S);
    }

    const result = await removeUserFromGroup(group, user);
    console.log(result);

    if(user) {
      setDeleteUserID('');
    }

    if(result.success) {
      if(user) { 
        setDeleteUserStatus(2);
        handleGetGroupUsers();
      } else {
        await handleLoadGroups();
        setDeleteUserStatus(2);
        history.push('/groups');
      }
    } else {
      setDeleteUserStatus(3);
      setDeleteUserMessage(result.message);
    }
  }

  // delete group, TODO - add func
  const [deleteGroupStatus, setDeleteGroupStatus] = useState(0);
  const [deleteGroupMessage, setDeleteGroupMessage] = useState('');

  async function handleDeleteGroup() {
    setDeleteGroupStatus(1);

    const result = await deleteGroup(group);
    console.log(result);

    if(result.success) {
      await handleLoadGroups();
      setDeleteGroupStatus(2);
      history.push('/groups');
    } else {
      setDeleteGroupStatus(3);
      setDeleteGroupMessage(result.message);
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
      <React.Fragment>
        <Switch>
          <Route exact path={`/groups/${groupID}`}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <IconButton disabled={userTasksStatus < 2} onClick={handleGetUserTasks}>
                <RefreshIcon/>
              </IconButton>
              <Typography variant='h6'>{userTasksStatus === 2 && userTasks && `You have ${userTasks.length} tasks in this group`}</Typography>
            </div>
            {userTasksStatus === 1 ? 
              <CircularProgress/>
              : (userTasksStatus === 2 && userTasks) ?
              <List style={{marginBottom: 30}}>
                {userTasks.length === 0 && 'You do not have any tasks at this time.'}
                {userTasks.map((task, index) => (
                  <ListItem 
                    key={`user-task-${index}-${task.taskID.S}`}
                    button
                    component={RouterLink}
                    to={`/groups/${groupID}/tasks/${task.taskID.S}`}
                  >
                    <div style={{display: 'flex', width: '100%', alignItems:'center', justifyContent: 'space-between'}}>
                      <ListItemText 
                        primary={task.taskName.S}
                        secondary={`${task.taskDescription.S.length > 47 ? `${task.taskDescription.S.substring(0, 47)}...` : task.taskDescription.S}`}
                        // style={{overflow: 'hidden'}}
                      />
                      <div style={{display: 'flex', justifyContent: 'flex-end', flexGrow: 1, marginLeft: 10}}>  
                        {days.map((day) => {
                          const included = task.taskDays.SS.includes(day);
                          return (
                          //task.taskDays.SS.includes(day) ? <Chip key={day} label={day} style={{margin: 2}} /> : null
                            <div className={included ? classes.dayIncluded : classes.day}>{day[0]}</div>
                          );
                        })}
                      </div>
                    </div>
                  </ListItem>
                ))}
              </List>
              : 
              <div>
                <p>{userTasksMessage}</p>
              </div>
            }
          </Route>
          <Route exact path={`/groups/${groupID}/info`}>
            <div>
              <h3>{group.groupName.S}</h3>
              <p>Group code: {group.groupID.S}</p>
              <p>Your role: {group.role.S}</p>
              {group.role.S === 'owner' ? 
                <Button variant='outlined' style={{color: '#f44336', borderColor: '#f44336'}} onClick={handleDeleteGroup}>
                  Delete group
                </Button>
                :
                <Button variant='outlined' style={{color: '#f44336', borderColor: '#f44336'}} onClick={() => handleRemoveUser()}>
                  {deleteUserStatus === 1 ?
                    <CircularProgress size={24}/>
                    : 'Leave group'
                  }
                </Button>
              }
            </div>
          </Route>
          <Route exact path={`/groups/${groupID}/users`}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <IconButton disabled={groupUsersStatus < 2} onClick={handleGetGroupUsers}>
                <RefreshIcon/>
              </IconButton>
              <Typography variant='h6'>{groupUsersStatus === 2 && groupUsers && `${groupUsers.length} users in group`}</Typography>
            </div>
            {groupUsersStatus === 1 ? 
              <CircularProgress/>
              : groupUsersStatus === 2 && groupUsers ?
              <List>
                {groupUsers.map((user, index) => (
                  <ListItem key={`group-user-${index}-${user.userID.S}`}>
                    <ListItemText primary={user.userName.S} secondary={user.userID.S}></ListItemText>
                    <ListItemText secondary={user.role.S}></ListItemText>

                    <ListItemSecondaryAction>
                      {group.role.S === 'owner' && user.role.S !== 'owner' && (
                        deleteUserStatus === 1 && deleteUserID === user.userID.S ? 
                          <CircularProgress size={24}/>
                        : <IconButton edge='end' onClick={() => handleRemoveUser(user)} disabled={deleteUserStatus === 1}>
                            <DeleteIcon/>
                          </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              : 
              <div>
                {groupUsersMessage}
              </div>
            }
          </Route>
          <Route path={`/groups/${groupID}/tasks`}>
            <Tasks group={group} groupUsers={groupUsers}/>
          </Route>
          <Route render={() => <Redirect to={`/groups/${groupID}`}/>}/>
        </Switch>
        <BottomNavigation 
          showLabels
          value={navigation}
          onChange={(event, newValue) => {
            // setNavigation(newValue);
          }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: isMobile ? 0 : '20rem',
            right: 0,
            backgroundColor: '#e0e0e0'
          }}
        >
          {bottomNavLinks.map((nav, index) => {
            if(group.role.S === 'owner' || !nav.adminOnly) {
              return (
                <BottomNavigationAction 
                  key={`bottom-nav-${index}`}
                  label={nav.label}
                  icon={nav.icon}
                  component={RouterLink}
                  to={`/groups/${groupID}${nav.path}`}
                  style={{textDecoration: 'none'}}
                />
              );
            } else {
              return null;
            }
          })}
        </BottomNavigation>
      </React.Fragment>
    )
    : (
      <div>
        <h3>{groupAuthMessage}</h3>
      </div>
    )
  );
}