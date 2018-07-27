import axios from "axios";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import MockAdapter from "axios-mock-adapter";

import { fetchUsers } from "actions/users";
import getUsersResponse from "__fixtures__/getUsersResponse";

const axiosMock = new MockAdapter(axios);
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("actions", () => {
  afterEach(() => {
    axiosMock.reset();
  });

  describe("fetchUsers", () => {
    it("should make an http request for users", () => {
      const uri = "http://localhost/users.json";
      axiosMock.onGet(uri).reply(200, getUsersResponse);

      const receiveUsersAction = {
        type: "RECEIVED_USERS",
        data: getUsersResponse
      };

      const store = mockStore({ users: [] });

      store.dispatch(fetchUsers(uri)).then(() => {
        const result = store.getActions();

        expect(result).toMatchObject([receiveUsersAction]);
      });
    });
  });
});
