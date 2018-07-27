const initialState = {
  users: []
};

const receivedUsers = (state, data) => {
  const users = data.map(user => {
    const { id, first_name, last_name, email, nickname } = user;
    return { id, first_name, last_name, email, nickname };
  });
  return { ...state, users };
};

const users = (state = initialState, action) => {
  switch (action.type) {
    case "RECEIVED_USERS":
      return receivedUsers(state, action.data);
    default:
      return state;
  }
};

export default users;
