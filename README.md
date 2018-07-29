I love testing because it helps me understand better the code I write. One particular problem it solves is how I expect data that I'm fetching to render. Since the same data often gets passed around to multiple functions, I find using fixtures a to be a really useful way to confirm that everything is working as expected. I've put together what I think is a practical demonstration below.

Let's assume the following

- We have an endpoint `GET /users`
- We want to render a list of users with a response from the endpoint
- We are going to use redux to manage the state of our app
- We want to test all the things (reducer, actions, components and containers) with [jest](https://jestjs.io/) and [enzyme](https://github.com/airbnb/enzyme)

You'll need to have some familiarity with redux including [async actions](https://redux.js.org/advanced/async-actions) and [thunk](https://github.com/reduxjs/redux-thunk). 
If you have trouble with the portions of this article that involve redux, the [docs](https://redux.js.org/) are really well written.

### Step 1 - Setup
For this post you can either create your own project from scratch or refer to the [Github](https://github.com/davidimoore/blog-article-1) repo

1.  Install [yarn](https://yarnpkg.com/lang/en/docs/install/#mac-stable)
2.  Install [create-react-app](https://github.com/facebook/create-react-app)
3.  Use create-react-app to [create your app](https://github.com/facebook/create-react-app#yarn)
4.  Change to the root of your new project and install dependenices    
    `yarn add axios redux redux-thunk`    
    `yarn add -D axios-mock-adapter enzyme enzyme-adapter-react-16 react-test-renderer redux-mock-store`
5. Create a global setup file `src/setupTests.js` and the following enzyme configuration:
    ```
    import Enzyme from 'enzyme';
    import Adapter from 'enzyme-adapter-react-16';
    
    Enzyme.configure({ adapter: new Adapter() });
    ```
6. Last we'll add a .env file in the root of the project and add a couple of environment variables.
    -  NODE_PATH - Makes importing files easier.
    - REACT_APP_BASE_URL - Since we often use different servers for different environments we want to set the base url 
    to whatever server we use for development. I'll be using `http://localhost:3001`
    ```
    NODE_PATH=src/
    REACT_APP_BASE_URL=http://localhost:3001
    ```

### Step 2 - Generate a snapshot with static data
In order to fetch and render data in our app we need to answer a couple of questions:
- What data do we get from our endpoint
- How is that data being rendered in our app?

Our endpoint `GET /users` returns an array of users.

```
[
  {
    "id": 1,
    "first_name": "Diana",
    "last_name": "Prince",
    "email": "dianaprince@flatley.com",
    "nickname": "Wonder Woman",
    "created_at": "2018-07-25T22:18:13.337Z",
    "updated_at": "2018-07-25T22:18:13.337Z"
  },
  {
    "id": 2,
    "first_name": "Bruce",
    "last_name": "Wayne",
    "email": "brucewayne@cummerata.com",
    "nickname": "Batman",
    "created_at": "2018-07-25T22:18:13.340Z",
    "updated_at": "2018-07-25T22:18:13.340Z"
  }
]
```

Let's create component with static values we want to render based on some of the data in the response:

```javascript

// src/components/UserList.jsx

import React from "react";

const UserList = () => (
    <table>
      <thead>
        <tr>
          <td>Full Name</td>
          <td>Email</td>
          <td>Nickname</td>
        </tr>
      </thead>
      <tbody>
        <tr className="User">
          <td>Diana Prince</td>
          <td>dianaprince@flatley.com</td>
          <td>Wonder Woman</td>
        </tr>
        <tr className="User">
          <td>Bruce Wayne</td>
          <td>brucewayne@cummerata.com</td>
          <td>Batman</td>
        </tr>
      </tbody>
    </table>
  );

export default UserList
``` 

Let's create a a couple of tests. One tells us how many user rows we expect and the second is a snapshot test. Having these test in place early helps guide the refactoring and catches us from making any unwanted changes to the "markup" in our component.

```javascript
// src/__tests__/UserList.test.jsx
import React from "react";
import UserList from "components/UserList";

import renderer from "react-test-renderer";

describe("UserList", () => {
  it("displays a list of users", () => {		
    const tree = renderer.create(<UserList/>).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("renders a list of rows with users", () => {
    const componentWrapper = shallow(<UserList />);
    const numberOfUserRows = componentWrapper.find("tr.User").length;
    
    expect(numberOfUserRows).toEqual(2);
    });
});
```

### Step 3 - Create our reducer

Let's take a step back and conceptualize the data flow and how things will come together.

- We'll fetch some users by dispatching an action. It would be named `fetchUsers` or something similiar
- When we receive the users we'll pass those to a users reducer
- The users reducer will transform the data from the action into an array of users that is "shaped" like the array of users we used in our test
- That array of users will eventually get passed to a `UsersList` component to be rendered.

Let's build a test to define our reducers behavior.

```
//__tests__/usersReducer.test.js
```

We have two important pieces of data to help us test further:

- Our example response
- A users array based on that response we pass to our `UserList` component

Our test wUserListContainer like this:

```javascript
import users from "reducers/users";

describe("users reducer", () => {
  it("handles a RECEIVED_USERS action", () => {
    const action = {
      type: "RECEIVED_USERS",
      data: [
        {
          id: 1,
          first_name: "Diana",
          last_name: "Prince",
          email: "dianaprince@flatley.com",
          nickname: "Wonder Woman",
          created_at: "2018-07-25T22:18:13.337Z",
          updated_at: "2018-07-25T22:18:13.337Z"
        },
        {
          id: 2,
          first_name: "Bruce",
          last_name: "Wayne",
          email: "brucewayne@cummerata.com",
          nickname: "Batman",
          created_at: "2018-07-25T22:18:13.340Z",
          updated_at: "2018-07-25T22:18:13.340Z"
        }
      ]
    };

    const result = users(null, action);

    expect(result.users).toEqual([
      {
        id: 1,
        first_name: "Diana",
        last_name: "Prince",
        email: "dianaprince@flatley.com",
        nickname: "Wonder Woman"
      },
      {
        id: 2,
        first_name: "Bruce",
        last_name: "Wayne",
        email: "brucewayne@cummerata.com",
        nickname: "Batman"
      }
    ]);
  });
});
```

And our reducer
```javascript
// src/reducers/user.js
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
```

Let's also update our `index.js` file to use redux
```javascript
// src/index.js

import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import thunkMiddleware from "redux-thunk";
import { applyMiddleware, combineReducers, createStore } from "redux";

import users from "reducers/users";
import "./index.css";
import App from "./components/App";
import registerServiceWorker from "./registerServiceWorker";

const appReducer = combineReducers({
  users
});

let store = createStore(appReducer, applyMiddleware(thunkMiddleware));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
```

## Step 4 Extract fixtures
You might have noticed we are repeating ourselves in our tests
- The `UserList` component gets a users array
- The same users array is the result of our reducer test.

Let's extract the users array to a fixture. 
You can put your fixtures wherever you want, I use a folder like `src/__fixtures__`.

```javascript
// src/__fixtures__/reducedUsers.js
const reducedUsers = [
  {
    id: 1,
    first_name: "Diana",
    last_name: "Prince",
    email: "dianaprince@flatley.com",
    nickname: "Wonder Woman"
  },
  {
    id: 2,
    first_name: "Bruce",
    last_name: "Wayne",
    email: "brucewayne@cummerata.com",
    nickname: "Batman"
  }
];

export default reducedUsers;
```

We are using the response data in our reducer test and we'll use it in our user actions test later as well. So we should make a fixture for it too.

```javascript
// src/__fixtures__/getUsersResponse.js

const getUsersResponse = [
  {
    id: 1,
    first_name: "Diana",
    last_name: "Prince",
    email: "dianaprince@flatley.com",
    nickname: "Wonder Woman",
    created_at: "2018-07-25T22:18:13.337Z",
    updated_at: "2018-07-25T22:18:13.337Z"
  },
  {
    id: 2,
    first_name: "Bruce",
    last_name: "Wayne",
    email: "brucewayne@cummerata.com",
    nickname: "Batman",
    created_at: "2018-07-25T22:18:13.340Z",
    updated_at: "2018-07-25T22:18:13.340Z"
  }
];

export default getUsersResponse;
```

- Let's update our reducer test
```javascript
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
```
- Let's also update our `UserList` test. Again this should not require any change to our snapshot test. Simply refactoring shouldn't render things differently.

```javascript
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
```

You might be thinking, "but if I change the fixture now I have to update every test that uses it". That is exactly the point. 
If what is returned from the reducer changes it would affect our `UserList` component. *Our tests might break which informs us we may need to handle changes in the data*.

## Step 5 Add redux actions
Our user actions test will make user of our getUsersResponse fixture
```javascript
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
```

And our users actions
```javascript
// actions/users.js
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
```

## Step 6 Integrate redux and react
It's helpful to [separate](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) containers for fetching data from components for rendering the fetched data . 
So the last major step is to create a `UserListContainer` to fetch users and pass the result on to the `UsersList` component.

We'll import the `UserListContainer` instead of the default export which is the 
`UserListContainer` wrapped with redux. We'll also mock out our `fetchUsers` 
function since we don't want to actually test the endpoint.

Our example tests will define expected behavior for two scenarios. 
- When users were successfully fetched and passed on to the `UserList` component
- When the users array is empty
 
```javascript
// __tests__/UserListContainer.test.js
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
    const userListComponentLength = container.find('UserList').length;

    expect(userListComponentLength).toEqual(0)
  });
});
```

Finally our UserListContainer
```javascript
// src/containers/UserListContainer.jsx

import React from "react";
import { connect } from "react-redux";

import UserList from "components/UserList";
import * as userActions from "actions/users";

// REACT_APP_BASE_URL stored in our .env file
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
```

Let's render everything in the App component
```javascript
import React, { Component } from 'react';

import logo from 'logo.svg';
import UserListContainer from "containers/UserListContainer";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div>
          <UserListContainer />
        </div>
      </div>
    );
  }
}

export default App;
```

### Summary
There are solid arguments for and against using fixtures in tests. 
They can become unwieldily and too numerous if overused. 
I believe there is a place for fixtures in addition to functions that generate data more dynamically, like factories. 
In a follow up article I'll continue on with how the same fixtures can be used with 
[storybook](https://github.com/storybooks/storybook).