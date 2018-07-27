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
