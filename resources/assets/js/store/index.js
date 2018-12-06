import {createStore, applyMiddleware} from "redux";
import thunk from 'redux-thunk';
import App from "../reducers/index";

const store = createStore(App, applyMiddleware(thunk));

export default store;