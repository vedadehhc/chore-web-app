import { useState } from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import SnackbarAlert from './SnackbarAlert';

import { joinGroup } from "../utils/groups";
import useApi from '../utils/useApi';

export default function JoinGroup(props) {
  
  const [groupCode, setGroupCode] = useState('');

  function handleGroupCodeChange(event) {
    setGroupCode(event.target.value.toUpperCase());
  }
  
  const [handleJoinGroup, , joinGroupStatus, joinGroupMessage, [,,setJoinGroupMessage]] = useApi(
    joinGroup, 
    () => [groupCode],
    () => {},
    () => {},
    () => props.handleLoadGroups()
  );

  // async function handleJoinGroup(event){
  //   event.preventDefault();

  //   const result = await joinGroup(groupCode);
  //   console.log(result);
  //   props.handleLoadGroups();
  // }

  return (
    <div>
      <form onSubmit={(e) => {e.preventDefault(); handleJoinGroup()}}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          id="groupCode"
          label="Group code"
          type="groupCode"
          name="groupCode"
          autoComplete="groupCode"
          // error={emailError}
          value={groupCode}
          onInput={handleGroupCodeChange}
          disabled={joinGroupStatus===1}
          autoFocus
        />
        <br/>
        <Button 
          variant='contained'
          disableElevation
          disabled={joinGroupStatus===1}
          color='secondary'
          type='submit'
        >
        {joinGroupStatus === 1 ? 
          <CircularProgress size={24}/>
          : 'Join group'
        }
        </Button>
      </form>
      <SnackbarAlert message={joinGroupMessage} setMessage={setJoinGroupMessage} status={joinGroupStatus}/>
    </div>
  );
}