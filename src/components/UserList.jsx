import React from "react";

const UserList = ({ users }) => (
  <table>
    <thead>
      <tr>
        <td>Full Name</td>
        <td>Email</td>
        <td>Nickname</td>
      </tr>
    </thead>
    <tbody>
      {users.map(user => {
        const { id, first_name, last_name, email, nickname } = user;
        return (
          <tr className="User" key={id}>
            <td>
              {first_name} {last_name}
            </td>
            <td>{email}</td>
            <td>{nickname}</td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

export default UserList;
