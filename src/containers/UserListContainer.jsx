import React from "react";
import { connect } from "react-redux";

import UserList from "components/UserList";
import * as userActions from "actions/users";

const GET_USERS_URL = `${process.env.REACT_APP_BASE_URL}/users.json`;

export class UserListContainer extends React.Component {
  componentDidMount() {
    const { fetchUsers } = this.props;

    fetchUsers(GET_USERS_URL);
  }

  render() {
    const { users } = this.props;
    return users && users.length > 0 ? (
      <UserList users={users} />
    ) : (
      <div>No Users!</div>
    );
  }
}

const mapStateToProps = ({ users }) => ({ ...users });

export default connect(
  mapStateToProps,
  userActions
)(UserListContainer);
