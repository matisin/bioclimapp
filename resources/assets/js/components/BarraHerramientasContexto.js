import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Delete from '@material-ui/icons/Delete';
import AddCircle from '@material-ui/icons/AddCircle';
import Tooltip from '@material-ui/core/Tooltip';
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import * as icons from '../icons/index';
import { connect } from 'react-redux'
import {
    mostrarOcultarMapa,
    activarAgregarContexto,
    activarEliminarContexto,
    activarSeleccionarContexto, contextoUndo, contextoRedo,
} from "../actions";

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    input: {
        display: 'none',
    },
    avatar: {
        margin: 10,
    },
    root: {
        display: 'flex',
    },
    paper: {
        marginRight: theme.spacing.unit * 2,
    },
    popperClose: {
        pointerEvents: 'none',
    },
});

const mapDispatchToProps = dispatch => {
    return {
        mostrarOcultarMapa: () => dispatch(mostrarOcultarMapa()),
        activarAgregarContexto: () => dispatch(activarAgregarContexto()),
        activarEliminarContexto: () => dispatch(activarEliminarContexto()),
        activarSeleccionarContexto: () => dispatch(activarSeleccionarContexto()),
        onUndo: () => dispatch(contextoUndo()),
        onRedo: () => dispatch(contextoRedo()),
    }
};

const mapStateToProps = state => {
    return {
        canUndo: state.contexto.past.length > 0,
        canRedo: state.contexto.future.length > 0,
        mostrar_mapa: state.barra_herramientas_contexto.mostrar_mapa,
        acciones: state.barra_herramientas_contexto.acciones,
    }
};

class BarraHerramientasContexto extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {classes,width,mostrarOcultarMapa,activarAgregarContexto,
            activarEliminarContexto,activarSeleccionarContexto, canUndo, canRedo,
            onUndo,onRedo,mostrar_mapa,acciones
        } = this.props;

        return (
            <div style={{
                display: 'table',
                marginLeft: 'auto',
                marginRight:'auto',
            }}>
            <div className={classes.root} align="center">

                <Tooltip title="Seleccionar obstrucción"
                         disableFocusListener={true}>
                    <IconButton className={classes.button}
                                aria-label="Seleccionar"
                                disabled={acciones.seleccionar}
                                onClick={activarSeleccionarContexto}>
                        <icons.CursorIcon/>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Agregar obstrucción"
                         disableFocusListener={true}>
                    <IconButton
                        className={classes.button}
                        aria-label="Agregar"
                        disabled={acciones.agregar}
                        onClick={activarAgregarContexto}
                    >
                        <AddCircle/>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Borrar obstrucción"
                         disableFocusListener={true}>
                    <IconButton
                        className={classes.button}
                        aria-label="Borrar"
                        disabled={acciones.eliminar}
                        onClick={activarEliminarContexto}
                    >
                        <Delete/>
                    </IconButton>
                </Tooltip>

                <Tooltip title="Deshacer"
                         disableFocusListener={true}>
                    <div>
                        <IconButton
                            className={classes.button}
                            aria-label="Seleccionar"
                            disabled={true}
                            disabled={!canUndo}
                            onClick={onUndo}
                        >
                            <Undo/>
                        </IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Rehacer"
                         disableFocusListener={true}>
                    <div>
                        <IconButton
                            className={classes.button}
                            aria-label="Seleccionar"
                            disabled={true}
                            disabled={!canRedo}
                            onClick={onRedo}
                            >
                            <Redo/>
                        </IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Seleccionar localidad"
                         disableFocusListener={true}>
                    <IconButton className={classes.button} aria-label="Undo" onClick={mostrarOcultarMapa}>
                        {mostrar_mapa ?
                            <KeyboardArrowRight/>:<KeyboardArrowLeft/>
                        }
                        <icons.MapIcon/>
                    </IconButton>
                </Tooltip>
            </div></div>

        );
    }
}

BarraHerramientasContexto.propTypes = {
    classes: PropTypes.object.isRequired,
};


export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(BarraHerramientasContexto));
