import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Delete from '@material-ui/icons/Delete';
import AddCircle from '@material-ui/icons/AddCircle';
import Tooltip from '@material-ui/core/Tooltip';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Videocam from '@material-ui/icons/Videocam';
import Home from '@material-ui/icons/Home';
import RotateRight from '@material-ui/icons/RotateRight';
import RemoveRedEye from '@material-ui/icons/RemoveRedEye';
import Grid from "@material-ui/core/Grid/Grid";
import Select from "@material-ui/core/Select/Select";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import PanTool from '@material-ui/icons/PanTool';
import CalendarToday from "@material-ui/icons/CalendarToday";
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import { connect } from 'react-redux';
import * as icons from '../icons/index';
import {
    casaPredefinidaDoble,
    casaPredefinidaDobleDosPisos,
    casaPredefinidaSimple,
    casaPredefinidaSimpleDosPisos,
    cambioTipoCamara,
    activarAgregarBloque,
    activarAgregarVentana,
    activarAgregarPuerta,
    activarEliminarMorfologia,
    activarSeleccionarMorfologia,
    verSol,
    cambiarFecha,
    activarRotar,
    activarMoverCamara, morfologiaUndo, morfologiaRedo, thunk_cambiar_fecha,
} from "../actions";

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
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


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        },
    },
};

function DatePicker(props){

    return(
        <Grid container spacing={8} style={{margin: 5}}>
            <Grid item xs={4}>
                <InputLabel htmlFor="dia-simple">Día</InputLabel>
            </Grid>
            <Grid item xs={4}>
                <InputLabel htmlFor="mes-simple">Mes</InputLabel>
            </Grid>
            <Grid item xs={4}>
                <InputLabel htmlFor="hora-simple">Hora</InputLabel>
            </Grid>
            <Grid item xs={4}>
                <Select
                    MenuProps={MenuProps}
                    value={props.dia}
                    onChange={props.onDateChange}
                    inputProps={{
                        name: 'dia',
                        id: 'dia-simple',
                    }}
                >
                    {Array.from(Array(new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate()), (x,index) => index+1).map(dia => (
                        <MenuItem value={dia} key={dia}>
                            {dia}
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
            <Grid item xs={4}>
                <Select
                    MenuProps={MenuProps}
                    value={props.mes}
                    onChange={props.onDateChange}
                    inputProps={{
                        name: 'mes',
                        id: 'mes-simple',
                    }}
                >
                    {Array.from(Array(12), (x,index) => index+1).map(mes => (
                        <MenuItem value={mes} key={mes}>
                            {mes}
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
            <Grid item xs={4}>
                <Select
                    MenuProps={MenuProps}
                    value={props.hora}
                    onChange={props.onDateChange}
                    inputProps={{
                        name: 'hora',
                        id: 'hora-simple',
                    }}
                >
                    {Array.from(Array(24), (x,index) => index).map(hora => (
                        <MenuItem value={hora} key={hora}>
                            {hora >= 10 ? hora : '0'+hora}
                        </MenuItem>

                    ))}
                </Select>
                <Select
                    MenuProps={MenuProps}
                    value={props.minutos}
                    onChange={props.onDateChange}
                    inputProps={{
                        name: 'minutos',
                        id: 'minutos-simple',
                    }}
                >
                    {Array.from(Array(60), (x,index) => index).map(minutos => (
                        <MenuItem value={minutos} key={minutos}>
                            {minutos >= 10 ? minutos : '0'+minutos}
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
        </Grid>
    );
}

const mapDispatchToProps = dispatch => {
    return {
        casaPredefinidaSimple: () => dispatch(casaPredefinidaSimple()),
        casaPredefinidaDoble: () => dispatch(casaPredefinidaDoble()),
        casaPredefinidaSimpleDosPisos: () => dispatch(casaPredefinidaSimpleDosPisos()),
        casaPredefinidaDobleDosPisos: () => dispatch(casaPredefinidaDobleDosPisos()),
        onUndo: () => dispatch(morfologiaUndo()),
        onRedo: () => dispatch(morfologiaRedo()),
        cambioTipoCamara : () => dispatch(cambioTipoCamara()),
        activarAgregarBloque : () => dispatch(activarAgregarBloque()),
        activarAgregarVentana : () => dispatch(activarAgregarVentana()),
        activarAgregarPuerta : () => dispatch(activarAgregarPuerta()),
        activarEliminarMorfologia : () => dispatch(activarEliminarMorfologia()),
        activarSeleccionarMorfologia : () => dispatch(activarSeleccionarMorfologia()),
        verSol : () => dispatch(verSol()),
        activarRotar : () => dispatch(activarRotar()),
        activarMoverCamara : () => dispatch(activarMoverCamara()),
        thunk_cambiar_fecha: (fecha) => dispatch(thunk_cambiar_fecha(fecha)),
    }
};

const mapStateToProps = state => {
    return {
        canUndo: state.morfologia.past.length > 0,
        canRedo: state.morfologia.future.length > 0,
        camara3D: state.barra_herramientas_morfologia.camara3D,
        acciones: state.barra_herramientas_morfologia.acciones,
        fecha: state.barra_herramientas_morfologia.fecha,
        sol: state.barra_herramientas_morfologia.sol,
    }
};

class BarraHerramientasMorfologia extends Component {

    constructor(props) {
        super(props);

        var dibujandoStatesButtons = new Array(5).fill(false);

        this.state = {
            spacing: '16',
            dibujandoStatesButtons: dibujandoStatesButtons,
            anchorEl: null,
            anchor: null,
            anchorCamara: null,
            anchorSol: null,
        };

        this.handleCasaPredefinida = this.handleCasaPredefinida.bind(this);
        this.handleClickAgregar = this.handleClickAgregar.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleClickCamara = this.handleClickCamara.bind(this);
        this.handleCloseCamara = this.handleCloseCamara.bind(this);
        this.handleClickSol = this.handleClickSol.bind(this);
        this.handleCloseSol = this.handleCloseSol.bind(this);
        this.handleClickCasa = this.handleClickCasa.bind(this);
        this.handleCloseCasa = this.handleCloseCasa.bind(this);
        this.handleClickAddPredefined = this.handleClickAddPredefined.bind(this);
        this.handleSunPathClick = this.handleSunPathClick.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
        this.handleClickFecha = this.handleClickFecha.bind(this);

    };

    handleClickCamara(event){
      this.setState({anchorCamara: event.currentTarget})
    };

    handleCloseCamara(event){
      this.setState({anchorCamara: null})
    };

    handleClickSol(event){
        this.setState({anchorSol: event.currentTarget})
    };

    handleCloseSol(event){
        this.setState({anchorSol: null, anchorFecha: null})
    };


    handleClickAgregar(event) {
        this.setState({anchorEl: event.currentTarget});
    };

    handleClickCasa(event) {
        let dibujandoStatesButtons = this.state.dibujandoStatesButtons;
        dibujandoStatesButtons[this.state.dibujando] = false;
        dibujandoStatesButtons[event.currentTarget.value] = true;
        this.setState({
            anchor: event.currentTarget,
            dibujandoStatesButtons: dibujandoStatesButtons,
            dibujando: parseInt(event.currentTarget.value),
        });
    };

    handleCloseCasa() {
        let dibujandoStatesButtons = this.state.dibujandoStatesButtons;
        dibujandoStatesButtons[this.state.dibujando] = false;
        this.setState({
            anchor: null,
            dibujando: -1,
            dibujandoStatesButtons: dibujandoStatesButtons,
        });
    };
    handleClickFecha(event){
        this.setState({anchorFecha: event.currentTarget});
    }

    handleClose() {
        this.setState({anchorEl: null});
    };

    handleCasaPredefinida(event){
        this.handleClose();
        this.handleCloseCasa();
        let casaPredefinida = parseInt(event.currentTarget.value);
        this.setState({
            casaPredefinida: casaPredefinida,
        });
        switch (casaPredefinida) {
            case 0:
                this.props.casaPredefinidaSimple();
                break;
            case 1:
                this.props.casaPredefinidaDoble();
                break;
            case 2:
                this.props.casaPredefinidaSimpleDosPisos();
                break;
            case 3:
                this.props.casaPredefinidaDobleDosPisos();
                break;

        }
    }

    handleClickAddPredefined(event) {
        this.setState({dibujo: event.target.value});
        this.props.onDrawingChanged(event.target.value);
    }

    handleSunPathClick(){
        this.props.onSunPathClicked();
    }


    onDateChange(event){
        const fecha = this.props.fecha;

        let date = {
            mes : fecha.getMonth(), //months from 1-12
            dia : fecha.getDate(),
            minutos : fecha.getMinutes(),
            hora : fecha.getHours(),
            year : fecha.getFullYear(),
        };

        date[event.target.name] = event.target.value;

        let newFecha = new Date(date.year,date.mes-1,date.dia,date.hora,date.minutos);
        this.props.thunk_cambiar_fecha(newFecha);
        /*this.setState({ [event.target.name]: event.target.value }, () => {
            let year = new Date().getFullYear();
            let fecha = new Date(year,this.state.mes-1, this.state.dia, this.state.hora, this.state.minutos);
            this.props.handleChangeFecha("fecha",fecha);
        });*/
    }


    render() {
        const {classes,width,canUndo, canRedo, onUndo, onRedo,
            cambioTipoCamara,
            activarAgregarBloque,
            activarAgregarVentana,
            activarAgregarPuerta,
            activarEliminarMorfologia,
            activarSeleccionarMorfologia,
            verSol,
            cambiarFecha,
            activarRotar,
            activarMoverCamara,
            camara3D,
            acciones,
            fecha,
            sol} = this.props;

        const month = fecha.getMonth() + 1; //months from 1-12
        const day = fecha.getDate();
        const min = fecha.getMinutes();
        const hour = fecha.getHours();

        const {dibujandoStatesButtons, anchorEl, anchor, anchorCamara, anchorSol, anchorFecha} = this.state;
        return (
            <div style={{display: 'table',
                marginLeft: 'auto',
                marginRight: 'auto',
                }}>
            <div className={classes.root} align="center" >

                <Tooltip title="Cambiar tipo camara"
                         disableFocusListener={true}>
                    <div>
                        <IconButton
                            className={classes.button}
                            aria-label="Seleccionar"
                            aria-owns={anchorCamara ? 'simple-menu-camara' : null}
                            aria-haspopup="true"
                            onClick={this.handleClickCamara}
                        >
                            <Videocam/>
                        </IconButton>
                    </div>
                </Tooltip>

                <Menu
                    id="simple-menu-camara"
                    anchorEl={anchorCamara}
                    open={Boolean(anchorCamara)}
                    onClose={this.handleCloseCamara}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    elevation={9}
                >
                    <Tooltip title="Tipo 2D"
                             disableFocusListener={true}
                    >
                        <MenuItem onClick={this.handleCloseCamara}
                                  disabled={!camara3D}>
                            <IconButton
                                className={classes.button}
                                aria-label="2D"
                                disabled={!camara3D}
                                onClick={cambioTipoCamara}>
                                <icons.IconTwoD/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>
                    <Tooltip title="Tipo 3D"
                             disableFocusListener={true}
                    >
                        <MenuItem onClick={this.handleCloseCamara}
                                  disabled={camara3D}>
                            <IconButton
                                className={classes.button}
                                aria-label="3D"
                                disabled={camara3D}
                                onClick={cambioTipoCamara}>
                                <icons.IconThreeD/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>
                    <Tooltip title="Mover camara"
                             disableFocusListener={true}
                    >
                        <MenuItem onClick={this.handleCloseCamara}
                                  disabled={acciones.mover_camara}>
                            <IconButton
                                className={classes.button}
                                aria-label="3D"
                                disabled={acciones.mover_camara}
                                onClick={activarMoverCamara}>
                                <PanTool/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>

                </Menu>

                <Tooltip title="Agregar elementos"
                         disableFocusListener={true}>
                    <div>
                        <IconButton
                            className={classes.button}
                            aria-label="Seleccionar"
                            aria-owns={anchorEl ? 'simple-menu' : null}
                            aria-haspopup="true"
                            onClick={this.handleClickAgregar}
                        >
                            <AddCircle/>
                        </IconButton>
                    </div>
                </Tooltip>

                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    elevation={9}
                >
                    <Tooltip title="Agregar bloques de paredes"
                             disableFocusListener={true}
                             placement="left">
                        <MenuItem onClick={this.handleClose}
                                  disabled={acciones.agregar_bloque}>
                            <IconButton
                                className={classes.button}
                                aria-label="AgregarPared"
                                value={0}
                                disabled={acciones.agregar_bloque}
                                onClick={activarAgregarBloque}>
                                <icons.WallIcon/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>

                    <Tooltip title="Agregar ventanas"
                             disableFocusListener={true}
                             placement="left">
                        <MenuItem onClick={this.handleClose}
                                  disabled={acciones.agregar_ventana}>
                            <IconButton
                                className={classes.button}
                                aria-label="AgregarVentana"
                                value={1}
                                 disabled={acciones.agregar_ventana}
                                onClick={activarAgregarVentana}>
                                <icons.WindowIcon/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>

                    <Tooltip title="Agregar puertas"
                             disableFocusListener={true}
                             placement="left">
                        <MenuItem onClick={this.handleClose}
                                  disabled={acciones.agregar_puerta}>
                            <IconButton
                                className={classes.button}
                                aria-label="AgregarPuerta"
                                value={2}
                                disabled={acciones.agregar_puerta}
                                onClick={activarAgregarPuerta}>
                                <icons.DoorIcon/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>

                    <Tooltip title="Cambiar a casa predefinida"
                             disableFocusListener={true}
                             placement="left">
                        <MenuItem disabled={dibujandoStatesButtons[4]}>
                            <IconButton
                                className={classes.button}
                                aria-label="Predefinida"
                                aria-owns={anchor ? 'simple-menu2' : null}
                                aria-haspopup="false"
                                disabled={dibujandoStatesButtons[4]}
                                value={4}
                                onClick={this.handleClickCasa}>
                                <Home/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>

                    <Menu
                        id="simple-menu2"
                        anchorEl={anchor}
                        open={Boolean(anchor)}
                        onClose={this.handleCloseCasa}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        elevation={9}
                    >
                        <Tooltip title="Casa simple"
                                 disableFocusListener={true}
                                 placement="left">
                            <MenuItem onClick={this.handleCloseCasa}>
                                <IconButton
                                    className={classes.button}
                                    aria-label="Simple"
                                    value={0}
                                    onClick={this.handleCasaPredefinida}>
                                    <icons.SimpleIcon/>
                                </IconButton>
                            </MenuItem>
                        </Tooltip>

                        <Tooltip title="Casa pareada"
                                 disableFocusListener={true}
                                 placement="left">
                            <MenuItem onClick={this.handleCloseCasa}>
                                <IconButton
                                    className={classes.button}
                                    aria-label="Double"
                                    value={1}
                                    onClick={this.handleCasaPredefinida}>
                                    <icons.DoubleIcon/>
                                </IconButton>
                            </MenuItem>
                        </Tooltip>

                        <Tooltip title="Casa simple dos pisos"
                                 disableFocusListener={true}
                                 placement="left">
                            <MenuItem onClick={this.handleCloseCasa}>
                                <IconButton
                                    className={classes.button}
                                    aria-label="Simple dos pisos"
                                    value={2}
                                    onClick={this.handleCasaPredefinida}>
                                    <icons.SimpleTwoFloorIcon/>
                                </IconButton>
                            </MenuItem>
                        </Tooltip>

                        <Tooltip title="Casa pareada dos pisos"
                                 disableFocusListener={true}
                                 placement="left">
                            <MenuItem onClick={this.handleCloseCasa}>
                                <IconButton
                                    className={classes.button}
                                    aria-label="Simple"
                                    value={3}
                                    onClick={this.handleCasaPredefinida}>
                                    <icons.DoubleTwoFloorIcon/>
                                </IconButton>
                            </MenuItem>
                        </Tooltip>
                    </Menu>

                </Menu>

                <Tooltip title="Deshacer"
                         disableFocusListener={true}>
                    <div>
                        <IconButton
                            className={classes.button}
                            aria-label="Seleccionar"
                            disabled={!canUndo}
                            onClick={onUndo}>
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
                            disabled={!canRedo}
                            onClick={onRedo}>
                            <Redo/>
                        </IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Seleccionar elementos"
                         disableFocusListener={true}>
                    <div>
                        <IconButton
                            className={classes.button}
                            aria-label="Seleccionar"
                            disabled={acciones.seleccionar}
                            onClick={activarSeleccionarMorfologia}>
                            <icons.CursorIcon/>
                        </IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Eliminar elementos"
                         disableFocusListener={true}>
                    <div>
                        <IconButton
                            className={classes.button}
                            aria-label="AgregarPuerta"
                            disabled={acciones.eliminar}
                            onClick={activarEliminarMorfologia}>
                            <Delete/>
                        </IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Configuración sol"
                         disableFocusListener={true}>
                    <div>
                        <IconButton
                            className={classes.button}
                            aria-label="ConfigSol"
                            aria-owns={anchor ? 'simple-menu-sol' : null}
                            aria-haspopup="true"
                            onClick={this.handleClickSol}
                        >
                            <icons.SunPathIcon/>
                        </IconButton>
                    </div>
                </Tooltip>

                <Menu
                    id="simple-menu-sol"
                    anchorEl={anchorSol}
                    open={Boolean(anchorSol)}
                    onClose={this.handleCloseSol}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    elevation={9}
                >

                    <Tooltip title="Ver/Ocultar sol"
                             disableFocusListener={true}
                            placement="left">
                        <MenuItem onClick={this.handleCloseSol}>
                            <IconButton
                                className={classes.button}
                                aria-label="Sunpath"
                                aria-haspopup="true"
                                onClick={verSol}>
                                <RemoveRedEye/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>

                    <Tooltip title="Rotar coordenadas"
                             disableFocusListener={!this.state.rotando}
                             placement="left"
                    >
                        <MenuItem onClick={this.handleCloseSol}
                                  disabled={acciones.rotar}>
                            <IconButton
                                className={classes.button}
                                aria-label="Rotar"
                                aria-haspopup="true"
                                onClick={activarRotar}
                                disabled={acciones.rotar}>
                                <RotateRight/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>
                    <Tooltip title="Cambiar Fecha"
                             placement="left"
                    >
                        <MenuItem onClick={this.handleClickFecha}>
                            <IconButton
                                className={classes.button}
                                aria-label="Fecha"
                                aria-haspopup="true">
                                <CalendarToday/>
                            </IconButton>
                        </MenuItem>
                    </Tooltip>

                    <Menu
                        id="simple-menu-sol"
                        anchorEl={anchorFecha}
                        open={Boolean(anchorFecha)}
                        onClose={this.handleCloseSol}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        elevation={9}

                    >
                        <DatePicker
                            dia={day}
                            mes={month}
                            hora={hour}
                            minutos={min}
                            onDateChange={this.onDateChange}/>
                    </Menu>

                </Menu>

            </div>
            </div>


        );
    }

}

BarraHerramientasMorfologia.propTypes = {
    classes: PropTypes.object.isRequired,
    onPerspectiveChanged: PropTypes.func,
    onSeleccionandoMorfChanged: PropTypes.func,
    onBorrandoMorfChanged: PropTypes.func,
    onDibujandoMorfChanged: PropTypes.func,
    onCasaPredefinidaChanged: PropTypes.func,
};

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(BarraHerramientasMorfologia));
