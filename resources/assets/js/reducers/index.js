import { combineReducers } from 'redux'
import morfologia from './morfologia';
import contexto from './contexto'
import variables_internas from './variablesInternas';
import barra_herramientas_morfologia from './barraHerramientasMorfologia';
import barra_herramientas_contexto from './barraHerramientasContexto';
import seleccion from "./seleccion";

const App = combineReducers({
    morfologia,
    contexto,
    variables_internas,
    barra_herramientas_morfologia,
    barra_herramientas_contexto,
    seleccion,
});

export default App;