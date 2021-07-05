import { useState } from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import SnackbarAlert from './SnackbarAlert';

import { createGroup } from "../utils/groups";
import useApi from '../utils/useApi';

export default function CreateGroup(props) {
  
  const [groupName, setGroupName] = useState('');

  function handleGroupNameChange(event) {
    setGroupName(event.target.value);
  }

  const [handleCreateGroup, , createGroupStatus, createGroupMessage, [ , , setCreateGroupMessage]] = useApi(
    createGroup, 
    () => [groupName],
    () => {},
    () => {},
    () => props.handleLoadGroups()
  );
  
  // async function handleCreateGroup(event){
  //   event.preventDefault();

  //   const result = await createGroup(groupName);
  //   // console.log(result);
  //   props.handleLoadGroups();
  // }

  return (
    <div>
      <form onSubmit={(e) => {e.preventDefault(); handleCreateGroup()}}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          id="groupName"
          label="Group name"
          type="text"
          name="groupName"
          autoComplete="groupName"
          // error={emailError}
          value={groupName}
          onInput={handleGroupNameChange}
          disabled={createGroupStatus===1}
          autoFocus
        />
        <br/>
        <Button 
          variant='contained'
          disableElevation
          disabled={createGroupStatus===1}
          color='secondary'
          type='submit'
        >
          {createGroupStatus === 1 ? 
            <CircularProgress size={24}/>
            : 'Create group'
          }
        </Button>
      </form>
      <SnackbarAlert message={createGroupMessage} setMessage={setCreateGroupMessage} status={createGroupStatus}/>
    </div>
  );
}