import React from 'react'
import { render } from 'react-dom'
import TabPanel from "./TabPanel";

import store from "../store/index";
import { addArticle } from "../actions/index";

window.store = store;
window.addArticle = addArticle;


render(<TabPanel/>, document.getElementById('root'))
