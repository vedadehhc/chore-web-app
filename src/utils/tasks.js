import { v4 as uuidv4 } from 'uuid';


// get all of a user's tasks. if no user provided, use current user
export function listUserTasks(userID) {

}

// get all of a user's tasks in a specific group. if no user provided, use current user
export function listUserGroupTasks(userID, groupID) {

}

// get all tasks in a group - use gsi
export function listGroupTasks(groupID) {

}

// get all tasks in a group assigned to a specific user - use gsi
export function listGroupUserTasks(groupID, userID) {

}

// create a new task with specified information
export function createTask(groupID, userID, taskName, taskDescription, taskDue) {
  const taskID = uuidv4();
}

export function deleteTask(userID, groupID, taskID) {

}