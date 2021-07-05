import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';

import CloseIcon from '@material-ui/icons/Close';
import ErrorIcon from '@material-ui/icons/Error';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import DoneIcon from '@material-ui/icons/Done';

const useStyles = makeStyles((theme) => ({
  error: {
    backgroundColor: theme.palette.error.main,
    color: '#fff',
  },
  success: {
    backgroundColor: theme.palette.success.main,
    color: '#fff',
  },
  default: {
    backgroundColor: '#333',
    color: '#fff',
  },
}));

export default function SnackbarAlert(props) {
  const { message, setMessage, status } = props;
  const classes = useStyles();

  return (
    <Snackbar open={message}>
      <Card className={[classes.default, classes.default, classes.success, classes.error][status]}>
        <div style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: 7}}>
          {[null,<HourglassEmptyIcon/>,<DoneIcon/>,<ErrorIcon/>][status]}
          <div style={{marginLeft: 10, marginRight: 10}}>
            {message}
          </div>
          <div style={{flexGrow: 1}}/>
          <IconButton 
            onClick={() => setMessage('')}
            aria-label="close"
            size="small"
            style={{color: '#fff'}}
          >
            <CloseIcon fontSize="inherit"/>
          </IconButton>
        </div>
      </Card>
    </Snackbar>
  );
}