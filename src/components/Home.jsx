import React, { useEffect } from 'react';
import { Link as RouterLink } from "react-router-dom";

import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import RefreshIcon from '@material-ui/icons/Refresh';

import { listUserTasks } from '../utils/tasks';
import useApi from '../utils/useApi';
import SnackbarAlert from './SnackbarAlert';

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

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export default function Home() {
  const classes = useStyles();

  // tasks
  const [handleGetUserTasks, userTasks, userTasksStatus, userTasksMessage, [,,setUserTasksMessage]] = useApi(listUserTasks);
  useEffect(() => handleGetUserTasks(), []);
  
  // const [userTasks, setUserTasks] = useState(null);
  // const [userTasksStatus, setUserTasksStatus] = useState(0); // 0 = waiting, 1 = loading, 2 = success, 3 = error
  // const [userTasksMessage, setUserTasksMessage] = useState('');

  // async function handleGetUserTasks() {
  //   setUserTasksStatus(1);
  //   const result = await listUserTasks();
  //   console.log(result);

  //   if(result.success) {
  //     setUserTasks(result.response.Items);
  //     setUserTasksStatus(2);
  //   } else {
  //     setUserTasksStatus(3);
  //     setUserTasksMessage(result.message);
  //   }
  // }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <IconButton disabled={userTasksStatus < 2} onClick={() => handleGetUserTasks()}>
          <RefreshIcon />
        </IconButton>
        <Typography variant='h6'>{userTasksStatus === 2 && userTasks && `You have ${userTasks.length} tasks`}</Typography>
      </div>
      {userTasksStatus === 1 ?
        <CircularProgress />
        : (userTasksStatus === 2 && userTasks) ?
          <List style={{ marginBottom: 30 }}>
            {userTasks.length === 0 && 'You do not have any tasks at this time.'}
            {userTasks.map((task, index) => (
              <ListItem 
                key={`user-task-${index}-${task.taskID.S}`} 
                button 
                component={RouterLink} 
                to={`/groups/${task.groupID.S}/tasks/${task.taskID.S}`}
                style={{ borderWidth: 1, borderColor: '#333', borderStyle: 'solid', borderRadius: 5, marginBottom: 5 }}
              >
                <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                  <ListItemText
                    primary={task.taskName.S}
                    secondary={`${task.taskDescription.S.length > 47 ? `${task.taskDescription.S.substring(0, 47)}...` : task.taskDescription.S}`}
                  style={{overflowWrap: 'anywhere'}}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 1, marginLeft: 10 }}>
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
          : <SnackbarAlert message={userTasksMessage} setMessage={setUserTasksMessage} status={userTasksStatus}/>
      }
    </div>
  );
}