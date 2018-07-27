import React from "react";
import {shallow} from "enzyme";

import {UserListContainer} from "containers/UserListContainer";
import reducedUsers from "__fixtures__/reducedUsers";

describe("UserListContainer", () => {
  it("displays the UsersList component when it has fetched users", () => {
    const props = {
      fetchUsers: jest.fn(),
      users: reducedUsers
    };

    const container = shallow(<UserListContainer {...props} />);
    const userListComponent = container.find('UserList').length;

    expect(userListComponent).toEqual(1)
  });

  it("does not display the UserList when ther are no users", () => {
    const props = {
      fetchUsers: jest.fn(),
      users: []
    };

    const container = shallow(<UserListContainer {...props} />);
    const userListComponent = container.find('UserList').length;

    expect(userListComponent).toEqual(0)
  });
});

