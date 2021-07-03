import { useState } from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { joinGroup } from "../utils/groups";

export default function JoinGroup(props) {
  
  const [groupCode, setGroupCode] = useState('');

  function handleGroupCodeChange(event) {
    setGroupCode(event.target.value.toUpperCase());
  }
  
  async function handleJoinGroup(event){
    event.preventDefault();

    const result = await joinGroup(groupCode);
    console.log(result);
    props.handleLoadGroups();
  }

  return (
    <div>
      <form onSubmit={handleJoinGroup}>
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
          autoFocus
        />
        <br/>
        <Button variant='contained' disableElevation color='secondary' type='submit'>Join group</Button>
      </form>
    </div>
  );
}