import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import UserList from "components/UserList";
import reducedUsers from "__fixtures__/reducedUsers";

describe("UserList", () => {
  it("renders correctly", () => {
    const tree = renderer.create(<UserList users={reducedUsers} />).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("renders a list of rows with users", () => {
    const componentWrapper = shallow(<UserList users={reducedUsers} />);
    const numberOfUserRows = componentWrapper.find("tr.User").length;

    expect(numberOfUserRows).toEqual(2);
  });
});
