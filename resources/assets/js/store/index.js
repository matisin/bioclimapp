import {createStore} from "redux";
import App from "../reducers/index";

const store = createStore(App);

export default store;