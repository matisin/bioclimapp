import { combineReducers } from 'redux'
import morfologia from './morfologia';
import variables_internas from './variablesInternas';


const App = combineReducers({
    morfologia,
    variables_internas,
});

export default App;