import { combineReducers } from 'redux'
import morfologia from './morfologia';
import contexto from './contexto'
import app from './app';
import barra_herramientas_morfologia from './barraHerramientasMorfologia';
import barra_herramientas_contexto from './barraHerramientasContexto';
import variables from "./variables";

const App = combineReducers({
    morfologia,
    contexto,
    app,
    variables,
    barra_herramientas_morfologia,
    barra_herramientas_contexto,
});

export default App;