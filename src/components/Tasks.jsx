import React, { useState, useEffect } from "react";
import { Route, Switch, useParams, Link as RouterLink, useRouteMatch, Redirect } from "react-router-dom";

import { makeStyles } from "@material-ui/core";
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Backdrop from '@material-ui/core/Backdrop';
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

import CloseIcon from '@material-ui/icons/Close';
import { createTask } from "../utils/tasks";
import { CircularProgress } from "@material-ui/core";

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
}));


export default function Tasks(props) {
  const { group, groupUsers } = props;
  const classes = useStyles();
  const { path, url } = useRouteMatch();

  // create task
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const [selectedDays, setSelectedDays] = useState([])
  const [assignedUser, setAssignedUser] = useState('');

  function handleCloseCreateTask() {
    setShowCreateTask(false);
  }

  const [createTaskStatus, setCreateTaskStatus] = useState(0); // 0 = waiting, 1 = loading, 2 = success, 3 = error
  const [createTaskMessage, setCreateTaskMessage] = useState(''); 

  async function handleCreateTask(event) {
    event.preventDefault();
    setCreateTaskStatus(1);

    const result = await createTask(group.groupID.S, assignedUser, taskName, taskDescription, selectedDays);
    console.log(result);

    if(result.success) {
      setCreateTaskStatus(2);
      setCreateTaskMessage('Task created successfully!');
    } else {
      setCreateTaskStatus(3);
      setCreateTaskMessage(result.message);
    }
  }

  return (
    group && group.role.S === 'owner' ?
    <Switch>
      <Route exact path={path}>
        <h3>select a task</h3>
        <button onClick={()=>setShowCreateTask(true)}>create task</button>
        <List>

        </List>
        
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
            <form onSubmit={handleCreateTask}>
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
                style={{width: '90%', maxWidth: 500}}
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
                    <MenuItem value={user.userID.S} key={`group-user-${user.userID.S}`}>{user.userName.S}</MenuItem>
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

  return (
    <div>
      <p>{taskID}</p>
      <p>{group.groupID.S}</p>
    </div>
  );
}