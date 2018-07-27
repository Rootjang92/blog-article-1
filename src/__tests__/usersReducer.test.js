import users from "reducers/users";
import reducedUsers from "__fixtures__/reducedUsers";
import getUsersResponse from "__fixtures__/getUsersResponse";

describe("users reducer", () => {
  it("handles a RECEIVED_USERS action", () => {
    const action = {
      type: "RECEIVED_USERS",
      data: getUsersResponse
    };

    const result = users(null, action);

    expect(result.users).toEqual(reducedUsers);
  });
});
