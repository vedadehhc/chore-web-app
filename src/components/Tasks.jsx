import React, { useState, useEffect } from "react";
import { Route, Switch, useParams, Link as RouterLink, useRouteMatch, Redirect, useLocation } from "react-router-dom";

import { makeStyles } from "@material-ui/core";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";

import RefreshIcon from '@material-ui/icons/Refresh';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';

import { createTask, deleteTask, getTask, listGroupTasks } from "../utils/tasks";
import useApi from "../utils/useApi";
import SnackbarAlert from "./SnackbarAlert";


const useStyles = makeStyles((theme) =>  ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: 'rgb(0,0,0,.7)',
  },
  closeButton: {
    backgroundColor: theme.palette.secondary.main,
    color: '#111',
    width: 36,
    height: 36,
    '&:hover': {
      backgroundColor: '#f55',
      color: '#fff'
    }
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  formControl: {
    minWidth: '10rem',
    marginTop: 5,
    marginBottom: 10,
  },
  formControl2: {
    minWidth: '6rem',
    marginBottom: 10,
    marginLeft: 7,
  },
  day: {
    margin: 2,
    color: '#bbb'
  },
  dayIncluded: {
    margin: 2,
    color: '#000',
  },
}));


const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export default function Tasks(props) {
  const { group, groupUsers } = props;
  const classes = useStyles();
  const { path, url } = useRouteMatch();

  // list all tasks
  const [filterUser, setFilterUser] = useState('');
  const [handleGetTasks, tasks, tasksStatus, tasksMessage] = useApi(listGroupTasks, () => [group]);

  // const [tasks, setTasks] = useState(null);
  // const [tasksStatus, setTasksStatus] = useState(0);
  // const [tasksMessage, setTasksMessage] = useState('');

  // async function handleGetTasks() {
  //   setTasksStatus(1);

  //   const result = await listGroupTasks(group);
  //   console.log(result);

  //   if (result.success) {
  //     setTasksStatus(2);
  //     setTasks(result.response.Items);
  //   } else {
  //     setTasksStatus(3);
  //     setTasksMessage(result.message);
  //   }
  // }

  useEffect(() => {
    if (group && group.role.S === 'owner' && path ===`/groups/${group.groupID.S}/tasks`) {
      handleGetTasks();
    }
  }, [group, path]);

  // create task
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedDays, setSelectedDays] = useState([])
  const [assignedUser, setAssignedUser] = useState('');

  function handleCloseCreateTask() {
    setShowCreateTask(false);
  }

  const [handleCreateTask, , createTaskStatus, createTaskMessage, [,,setCreateTaskMessage]] = useApi(
    createTask, 
    () => [group, assignedUser, taskName, taskDescription, selectedDays],
    (e) => {
      e.preventDefault();
    }
  );

  // const [createTaskStatus, setCreateTaskStatus] = useState(0); // 0 = waiting, 1 = loading, 2 = success, 3 = error
  // const [createTaskMessage, setCreateTaskMessage] = useState(''); 

  // async function handleCreateTask(event) {
  //   event.preventDefault();
  //   setCreateTaskStatus(1);

  //   const result = await createTask(group, assignedUser, taskName, taskDescription, selectedDays);
  //   console.log(result);

  //   if(result.success) {
  //     setCreateTaskStatus(2);
  //     setCreateTaskMessage('Task created successfully!');
  //   } else {
  //     setCreateTaskStatus(3);
  //     setCreateTaskMessage(result.message);
  //   }
  // }

  // delete task
  const [deleteTaskID, setDeleteTaskID] = useState('');

  const [handleDeleteTask, , deleteTaskStatus, deleteTaskMessage, [,,setDeleteTaskMessage]] = useApi(
    deleteTask, 
    () => [group],
    (userID, taskID) => {
      setDeleteTaskID(taskID);
    },
    (userID, taskID) => {
      setDeleteTaskID('');
    },
    () => handleGetTasks()
  );

  // const [deleteTaskStatus, setDeleteTaskStatus] = useState(0);
  // const [deleteTaskMessage, setDeleteTaskMessage] = useState('');

  // async function handleDeleteTask(task) {
  //   setDeleteTaskStatus(1);
  //   setDeleteTaskID(task.taskID.S);

  //   const result = await deleteTask(task.userID.S, group, task.taskID.S);
  //   console.log(result);
  //   setDeleteTaskID('');

  //   if(result.success) {
  //     setDeleteTaskStatus(2);
  //     handleGetTasks();
  //   } else {
  //     setDeleteTaskStatus(3);
  //     setDeleteTaskMessage(result.message);
  //   }
  // }

  return (
    group ?
    <Switch>
      <Route exact path={path}>
        {group.role.S === 'owner' ? 
          <React.Fragment>
            <h3>All group tasks ({tasksStatus === 2 && tasks && tasks.length})</h3>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#eee', paddingLeft: 5, paddingRight: 10}}>
              <div style={{display: 'flex', alignItems: 'center', height:'100%'}}>
                <IconButton disabled={tasksStatus < 2} onClick={() => handleGetTasks()}>
                  <RefreshIcon/>
                </IconButton>
                <IconButton onClick={()=>setShowCreateTask(true)}>
                  <AddIcon/>
                </IconButton>
              </div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                {/* <FormControl className={classes.formControl2}>
                  <InputLabel>Filter day</InputLabel>
                  <Select
                    labelId="filter-user-label"
                    id="filter-user"
                    value={assignedUser}
                    onChange={(e) => setAssignedUser(e.target.value)}
                    MenuProps={{ onExited: () => {
                      document.activeElement.blur();
                    }}}
                  >
                    <MenuItem value='' key='blank-user'>No filter</MenuItem>
                    {groupUsers && groupUsers.map((user) => (
                      <MenuItem value={user} key={`group-user-${user.userID.S}`}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-start',
                          alignItems: 'start'
                        }}>
                          <div>{user.userName.S}</div>
                          <div style={{color: '#888'}}>{user.userID.S}</div>
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl> */}
                <FormControl className={classes.formControl2}>
                  <InputLabel>Filter user</InputLabel>
                  <Select
                    labelId="filter-user-label"
                    id="filter-user"
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    MenuProps={{ onExited: () => {
                      document.activeElement.blur();
                    }}}
                  >
                    <MenuItem value='' key='blank-user'>No filter</MenuItem>
                    {groupUsers && groupUsers.map((user) => (
                      <MenuItem value={user.userID.S} key={`group-user-${user.userID.S}`}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-start',
                          alignItems: 'start'
                        }}>
                          <div>{user.userName.S}</div>
                          <div style={{color: '#888'}}>{user.userID.S}</div>
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>

            {tasksStatus === 1 ? 
              <CircularProgress/>
              : (tasksStatus === 2 && tasks) ?
              <List style={{marginBottom: 30}}>
                {tasks.length === 0 && 'There are currently no tasks in this group.'}
                {tasks.map((task, index) => {
                  if(!(filterUser && filterUser.length > 0) || filterUser === task.userID.S) {
                    return (
                      <ListItem 
                        key={`task-${index}-${task.taskID.S}`} 
                        button 
                        component={RouterLink} 
                        to={{
                          pathname: `${url}/${task.taskID.S}`,
                          state: {
                            userID: task.userID.S,
                          },
                        }}
                        style={{ borderWidth: 1, borderColor: '#333', borderStyle: 'solid', borderRadius: 5, marginBottom: 5 }}
                      >
                        <div style={{display: 'flex', width: '100%', alignItems:'center', justifyContent: 'space-between'}}>
                          <ListItemText 
                            primary={task.taskName.S.length > 10 ? `${task.taskName.S.substring(0,7)}...` : task.taskName.S}
                            secondary={task.taskDescription.S.length > 50 ? `${task.taskDescription.S.substring(0, 47)}...` : task.taskDescription.S}
                            style={{width: '20%', overflowWrap: 'anywhere', marginRight: 5}}
                          />
                          <ListItemText
                            primary={task.userName.S}
                            secondary={task.userID.S}
                            style={{overflowWrap: 'anywhere'}}
                          />
                          <div style={{display: 'flex', justifyContent: 'flex-end', marginLeft: 10}}>  
                            {days.map((day) => {
                              const included = task.taskDays.SS.includes(day);
                              return (
                              //task.taskDays.SS.includes(day) ? <Chip key={day} label={day} style={{margin: 2}} /> : null
                                <div className={included ? classes.dayIncluded : classes.day}>{day[0]}</div>
                              );
                            })}
                          </div>
                        </div>
                        <ListItemSecondaryAction>
                          {
                            deleteTaskStatus === 1 && deleteTaskID === task.taskID.S ?
                              <CircularProgress size={24}/>
                            : <IconButton edge='end' onClick={() => handleDeleteTask([task.userID.S], [task.taskID.S])} disabled={deleteTaskStatus===1}>
                                <DeleteIcon/>
                              </IconButton>
                          }
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  }
                })}
              </List>
              : 
              <div>
                <p>{tasksMessage}</p>
              </div>
            }
            
            <Dialog
              className={classes.backdrop}
              key={'create-task-modal'}
              open={showCreateTask}
              style={{overflow: 'auto'}} 
              maxWidth='md'
              fullWidth
              onClose={handleCloseCreateTask}
            >
              <div style={{backgroundColor:'#eee', padding: 40}} >
                <div style={{position: 'relative', float: 'right', top: -20, right: -20,}} onClick={handleCloseCreateTask}>
                  <IconButton className={classes.closeButton}>
                    <CloseIcon/>
                  </IconButton>
                </div>
                <Typography variant='h5'>Create task</Typography>
                <form onSubmit={(e) => handleCreateTask([],[e])}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    id="taskName"
                    label="Task name"
                    type="text"
                    name="taskName"
                    // error={emailError}
                    value={taskName}
                    onInput={(e) => {setTaskName(e.target.value);}}
                    disabled={createTaskStatus===1}
                  />
                  <br/>
                  <TextField
                    multiline
                    variant="outlined"
                    margin="normal"
                    required
                    id="taskDescription"
                    label="Task description"
                    type="text"
                    name="taskDescription"
                    // error={emailError}
                    value={taskDescription}
                    onInput={(e) => {setTaskDescription(e.target.value);}}
                    style={{width: '100%', maxWidth: 500}}
                    disabled={createTaskStatus===1}
                  />
                  <br/>
                  <FormControl required className={classes.formControl} disabled={createTaskStatus===1}>
                    <InputLabel id="demo-mutiple-chip-label">Days due</InputLabel>
                    <Select
                      labelId="demo-mutiple-chip-label"
                      id="demo-mutiple-chip"
                      multiple
                      value={selectedDays}
                      onChange={(e) => {setSelectedDays(e.target.value);}}
                      input={<Input id="select-multiple-chip" />}
                      renderValue={(selected) => (
                        <div className={classes.chips}>
                          {days.map((value) => (
                            selected.includes(value) && <Chip key={value} label={value} className={classes.chip} />
                          ))}
                        </div>
                      )}
                      MenuProps={{ onExited: () => {
                        document.activeElement.blur();
                      }}}
                      // MenuProps={MenuProps}
                    >
                      {days.map((day) => (
                        <MenuItem key={`day-${day}`} value={day}>
                          <Checkbox checked={selectedDays.includes(day)} />
                          <ListItemText primary={day}/>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <br/>
                  <FormControl required className={classes.formControl} disabled={createTaskStatus===1}>
                    <InputLabel id="demo-simple-select-label">Assigned user</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={assignedUser}
                      onChange={(e) => setAssignedUser(e.target.value)}
                      MenuProps={{ onExited: () => {
                        document.activeElement.blur();
                      }}}
                    >
                      {groupUsers && groupUsers.map((user) => (
                        <MenuItem value={user} key={`group-user-${user.userID.S}`}>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'start'
                          }}>
                            <div>{user.userName.S}</div>
                            <div style={{color: '#888'}}>{user.userID.S}</div>
                          </div>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <br/>
                  <br/>
                  <Button style={{width: 150}} variant='contained' color='secondary' type='submit' disableElevation disabled={createTaskStatus===1}>
                    {createTaskStatus === 1 ? <CircularProgress size={24}/> : 'Create task'}
                  </Button>
                </form>
              </div>
            </Dialog>

            <SnackbarAlert message={createTaskMessage} setMessage={setCreateTaskMessage} status={createTaskStatus}/>
            <SnackbarAlert message={deleteTaskMessage} setMessage={setDeleteTaskMessage} status={deleteTaskStatus}/>
          </React.Fragment> 
        : <Redirect to={`/groups/${group.groupID.S}`}/>
        }
      </Route>
      <Route path={`${path}/:taskID`}>
        <Task group={group}/>
      </Route>
    </Switch>
    : <Redirect to='/groups'/>
  );
} 


function Task(props) {
  const { group } = props;
  const { taskID } = useParams();
  const location = useLocation();
  const classes = useStyles();

  // get task
  const [handleGetTask, task, taskStatus, taskMessage] = useApi(getTask, () => [group, taskID]);

  // const [task, setTask] = useState(null);
  // const [taskStatus, setTaskStatus] = useState(0);
  // const [taskMessage, setTaskMessage] = useState('');

  // async function handleGetTask() {
  //   setTaskStatus(1);

  //   const result = await getTask(group, taskID);
  //   console.log(result);

  //   if(result.success) {
  //     setTaskStatus(2);
  //     setTask(result.response);
  //   } else {
  //     setTaskStatus(3);
  //     setTaskMessage(result.message);
  //   }
  // }

  useEffect(() => handleGetTask(), [taskID, group, location]);

  return (
    taskStatus === 1 ? (
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: '100%' }}
      >
        <Grid item xs={3}>
          <CircularProgress/>
        </Grid>
      </Grid>
    ) 
    : taskStatus === 2 && task ? (
      <div>
        <Typography variant='h4'>{task.taskName.S}</Typography>
        <Typography variant='h6'>Group: {group.groupName.S} <span style={{color: '#888'}}>({task.groupID.S})</span></Typography>
        <Typography variant='h6'>Assigned to: {task.userName.S} <span style={{color: '#888'}}>({task.userID.S})</span></Typography>
        <div className={classes.chips} style={{marginTop:5, marginBottom: 15}}>
          {days.map((value) => (
            task.taskDays.SS.includes(value) && <Chip key={value} label={value} className={classes.chip} />
          ))}
        </div>
        <p style={{overflowWrap: 'anywhere'}}>
          {task.taskDescription.S}
        </p>
      </div>
    )
    : (
      <div>
        {taskMessage}
      </div>
    )
  );
}