import axios from "axios";

const fetchUsers = uri => {
  return dispatch =>
    axios.get(uri).then(response => dispatch(receivedUsers(response.data)));
};

const receivedUsers = data => {
  return {
    type: "RECEIVED_USERS",
    data
  };
};

export { fetchUsers };
