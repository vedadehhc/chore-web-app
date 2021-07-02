import { useState } from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { createGroup } from "../utils/groups";

export default function CreateGroup(props) {
  
  const [groupName, setGroupName] = useState('');

  function handleGroupNameChange(event) {
    setGroupName(event.target.value);
  }
  
  async function handleCreateGroup(event){
    event.preventDefault();

    const result = await createGroup(groupName);
    // console.log(result);
    props.handleLoadGroups();
  }

  return (
    <div>
      <form onSubmit={handleCreateGroup}>
      <TextField
            variant="outlined"
            margin="normal"
            required
            id="groupName"
            label="Group name"
            type="groupName"
            name="groupName"
            autoComplete="groupName"
            // error={emailError}
            value={groupName}
            onInput={handleGroupNameChange}
            autoFocus
          />
        <br/>
        <Button variant='contained' disableElevation color='secondary' type='submit'>Create group</Button>
      </form>
    </div>
  );
}