import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Morfologia from "./Morfologia";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import axios from 'axios';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from '@material-ui/core/FormControl';
import Paper from '@material-ui/core/Paper';
import {createMuiTheme} from '@material-ui/core/styles';

import * as Tipos from '../constants/morofologia-types';
import Add from '@material-ui/icons/Add';
import Clear from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import Grid from "@material-ui/core/Grid";
import {
    seleccionarMorfologia,
    thunk_agregar_capa_piso,
    thunk_agregar_capa_techo,
    thunk_aplicar_capa_pisos, thunk_aplicar_capa_techos,
    thunk_borrar_capa_piso, thunk_borrar_capa_techo,
    thunk_modificar_capa_piso, thunk_modificar_capa_techo,
    thunk_modificar_dimensiones_bloque
} from "../actions";
import {connect} from "react-redux";
import Button from "@material-ui/core/es/Button";

const ITEM_HEIGHT = 48;

const styles = theme => ({
    titulo: {
        margin: theme.spacing.unit * 2,
    },

    root: {
        width: '100%',
    },
    formControl: {
        width: '100%',
        'box-sizing': 'border-box',
    },
    textField: {
        width: 100,
    },
    textRotation: {
        marginLeft: '80%',
        '-mozTransform': 'rotate(90deg)',
        '-webkitTransform': 'rotate(90deg)',
        '-msTransform': 'rotate(90deg)',
        '-oTransform:': 'rotate(90deg)',
        'transform:': 'rotate(90deg)',
        '-msFilter': 'progid:DXImageTransform.Microsoft.BasicImage(rotation=1)',
        whiteSpace: 'nowrap',
        height: 0,
        width: 0,
        '-webkitUserSelect': 'none',
        '-khtmlUserSelect': 'none',
        '-mozUserSelect': 'none',
        '-msUserSelect': 'none',
        '-userSelect': 'none',

    },
    form: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
    paper: {
        height: 200,
        overflow: 'hidden',
        elevation: 24,
        width: 0,
        minWidth: '100%',
    },
    paperAdd: {
        height: 200,
        overflow: 'hidden',
        elevation: 24,
        width: 0,
        minWidth: '100%',
    },

});

const mapStateToProps = state => {
    return {
        morfologia: state.morfologia,
        seleccionados: state.app.seleccion_morfologia,
        info_material: state.app.materiales,
    }
};

//Las acciones se mapean a props.
const mapDispatchToProps = dispatch => {
    return {
        seleccionarMorfologia: (seleccion) => dispatch(seleccionarMorfologia(seleccion)),
        thunk_agregar_capa_piso: (nivel, bloque, capa) =>
            dispatch(thunk_agregar_capa_piso(nivel, bloque, capa)),
        thunk_borrar_capa_piso: (nivel, bloque, capa) =>
            dispatch(thunk_borrar_capa_piso(nivel, bloque, capa)),
        thunk_modificar_capa_piso: (nivel, bloque, indice, capa) =>
            dispatch(thunk_modificar_capa_piso(nivel, bloque, indice, capa)),
        thunk_aplicar_capa_pisos: (nivel, bloque, indices) =>
            dispatch(thunk_aplicar_capa_pisos(nivel, bloque, indices)),

        thunk_agregar_capa_techo: (nivel, bloque, capa) =>
            dispatch(thunk_agregar_capa_techo(nivel, bloque, capa)),
        thunk_borrar_capa_techo: (nivel, bloque, capa) =>
            dispatch(thunk_borrar_capa_techo(nivel, bloque, capa)),
        thunk_modificar_capa_techo: (nivel, bloque, indice, capa) =>
            dispatch(thunk_modificar_capa_techo(nivel, bloque, indice, capa)),
        thunk_aplicar_capa_techos: (nivel, bloque, indices) =>
            dispatch(thunk_aplicar_capa_techos(nivel, bloque, indices)),

        thunk_modificar_dimensiones_bloque: (bloque, nivel, dimensiones) =>
            dispatch(thunk_modificar_dimensiones_bloque(bloque, nivel, dimensiones)),
    }
};

class InformacionPisoTecho extends Component {

    constructor(props) {
        super(props);

        this.state = {
            capasPiso: [],
            capasTecho: [],
            capaSeleccionadaPiso: null,
            capaSeleccionadaTecho: null,
        };

        this.handleClickAgregarPiso = this.handleClickAgregarPiso.bind(this);
        this.handleClickAgregarTecho = this.handleClickAgregarTecho.bind(this);
        this.handleClickBorrarPiso = this.handleClickBorrarPiso.bind(this);
        this.handleClickBorrarTecho = this.handleClickBorrarTecho.bind(this);
        this.handleChangeDimension = this.handleChangeDimension.bind(this);
        this.handleChangeCapaPiso = this.handleChangeCapaPiso.bind(this);
        this.handleChangeCapaTecho = this.handleChangeCapaTecho.bind(this);
        this.clickCapaPiso = this.clickCapaPiso.bind(this);
        this.clickCapaTecho = this.clickCapaTecho.bind(this);
        this.handleClickAplicarPisos = this.handleClickAplicarPisos.bind(this);
        this.handleClickAplicarTechos = this.handleClickAplicarTechos.bind(this);

        var theme = createMuiTheme({
            palette: {
                primary: {
                    main: "#fc0f4f",
                },
            },
        });
        this.colorSelected = [theme.palette.primary.main, theme.palette.primary.contrastText];
    }

    componentDidUpdate(prevProps) {
        if (this.props.seleccionados !== prevProps.seleccionados) {
            this.setState({
                capaSeleccionadaPiso: null,
                capaSeleccionadaTecho: null,
            });
        }
        /*if (this.props.seleccion !== prevProps.seleccion) {
            if (this.props.seleccion !== null && this.props.seleccion.userData.tipo === Morfologia.tipos.PISO) {
                let seleccionados;
                if(this.props.seleccion.userData.techo !== undefined){
                    seleccionados = [this.props.seleccion, this.props.seleccion.userData.techo];
                }else{
                    seleccionados = [this.props.seleccion];
                }
                for(let seleccionado of seleccionados){
                    let capas = seleccionado.userData.capas;
                    for (let i = 0; i < capas.length; i++) {
                        capas[i].index = i;
                    }

                    let capasVacias = 9 - capas.length - 1;
                    this['vaciosArray'+Morfologia.tipos_texto[seleccionado.userData.tipo]] = [];
                    for(let i = 0 ; i < capasVacias ; i++){
                        this['vaciosArray'+Morfologia.tipos_texto[seleccionado.userData.tipo]].push(i);
                    }
                    
                    let nombreCapa = 'capas'+Morfologia.tipos_texto[seleccionado.userData.tipo];
                    let nombreCapaS = 'capaSeleccionada'+Morfologia.tipos_texto[seleccionado.userData.tipo];
                    
                    this.setState({
                        [nombreCapa]: capas,
                        [nombreCapaS]: null,
                    });
                }
                this.setState({
                    width: this.props.seleccion.userData.width,
                    depth: this.props.seleccion.userData.depth,
                })
            }
        }*/

    }

    handleChangeCapaPiso(event) {
        const indices = this.props.seleccionados[0].indices;

        let capa = this.props.morfologia.present
            .niveles[indices.nivel]
            .bloques[indices.bloque]
            .piso
            .capas[this.state.capaSeleccionadaPiso];

        let capaNueva = {
            material: capa.material,
            propiedad: capa.propiedad,
            tipo: capa.tipo,
            espesor: capa.espesor,
        };

        capaNueva[event.target.name] = event.target.value;

        if(event.target.name === 'material'){
            if(this.props.info_material[event.target.value].hasOwnProperty('tipos')){
                capaNueva.tipo = 0;
                capaNueva.propiedad = 0;
            }else{
                capaNueva.propiedad = 0;
            }
        }
        if(event.target.name === 'espesor'){
            capaNueva.espesor = event.target.value/1000;
        }

        this.props.thunk_modificar_capa_piso(indices.nivel,indices.bloque,this.state.capaSeleccionadaPiso,capaNueva);

    }

    handleChangeCapaTecho(event) {
        const indices = this.props.seleccionados[0].indices;

        let capa = this.props.morfologia.present
            .niveles[indices.nivel]
            .bloques[indices.bloque]
            .techo
            .capas[this.state.capaSeleccionadaTecho];

        let capaNueva = {
            material: capa.material,
            propiedad: capa.propiedad,
            tipo: capa.tipo,
            espesor: capa.espesor,
        };

        capaNueva[event.target.name] = event.target.value;

        if(event.target.name === 'material'){
            if(this.props.info_material[event.target.value].hasOwnProperty('tipos')){
                capaNueva.tipo = 0;
                capaNueva.propiedad = 0;
            }else{
                capaNueva.propiedad = 0;
            }
        }
        if(event.target.name === 'espesor'){
            capaNueva.espesor = event.target.value/1000;
        }

        this.props.thunk_modificar_capa_techo(indices.nivel,indices.bloque,this.state.capaSeleccionadaTecho,capaNueva);
    }

    handleClickAplicarPisos() {
        const indiceSel = this.props.seleccionados[0].indices;
        const seleccionados = this.props.seleccionados;
        let indices = [];
        for(let seleccionado of seleccionados){
            indices.push(seleccionado.indices);
        }
        console.log(indices,indiceSel);
        this.props.thunk_aplicar_capa_pisos(indiceSel.nivel,indiceSel.bloque,indices);

    }

    handleClickAplicarTechos() {
        const indiceSel = this.props.seleccionados[0].indices;
        const seleccionados = this.props.seleccionados;
        let indices = [];
        for(let seleccionado of seleccionados){
            indices.push(seleccionado.indices);
        }
        this.props.thunk_aplicar_capa_techos(indiceSel.nivel,indiceSel.bloque,indices);

    }

    handleChangeDimension(event) {
        const indices = this.props.seleccionados[0].indices;

        let bloque = this.props.morfologia.present.niveles[indices.nivel].bloques[indices.bloque];

        let ancho = bloque.dimensiones.ancho, largo = bloque.dimensiones.largo;
        if (event.target.name === 'ancho') {
            ancho = parseFloat(event.target.value);
        }else{
            largo = parseFloat(event.target.value);
        }
        let dimensiones = {
            alto: bloque.dimensiones.alto,
            ancho: ancho,
            largo: largo,
        };
        this.props.thunk_modificar_dimensiones_bloque(indices.bloque,indices.nivel,dimensiones);
    }

    handleClickBorrarPiso(event) {
        event.preventDefault();
        let indiceCapa = parseInt(event.currentTarget.value);
        const indices = this.props.seleccionados[0].indices;

        this.props.thunk_borrar_capa_piso(indices.nivel,indices.bloque,indiceCapa);

        if(this.state.capaSeleccionadaPiso === indiceCapa){
            this.setState({
                capaSeleccionadaPiso: null,
            })
        }else if(this.state.capaSeleccionadaPiso > indiceCapa){
            this.setState({
                capaSeleccionadaPiso: this.state.capaSeleccionadaPiso - 1,
            })
        }
    }

    handleClickBorrarTecho(event) {
        event.preventDefault();
        let indiceCapa = parseInt(event.currentTarget.value);
        const indices = this.props.seleccionados[0].indices;

        this.props.thunk_borrar_capa_techo(indices.nivel,indices.bloque,indiceCapa);

        if(this.state.capaSeleccionadaTecho === indiceCapa){
            this.setState({
                capaSeleccionadaTecho: null,
            })
        }else if(this.state.capaSeleccionadaTecho > indiceCapa){
            this.setState({
                capaSeleccionadaTecho: this.state.capaSeleccionadaTecho - 1,
            })
        }
    }

    clickCapaPiso(event) {
        if(event.target.attributes.value !== undefined){
            let capaSeleccionadaPiso = parseInt(event.target.attributes.value.value);
            this.setState({capaSeleccionadaPiso: capaSeleccionadaPiso});
        }else{
            this.setState({capaSeleccionadaPiso: null});
        }
    }

    clickCapaTecho(event) {
        if(event.target.attributes.value !== undefined){
            let capaSeleccionadaTecho = parseInt(event.target.attributes.value.value);
            this.setState({capaSeleccionadaTecho: capaSeleccionadaTecho});
        }
        else{
            this.setState({capaSeleccionadaTecho: null});
        }
    }

    handleClickAgregarPiso() {
        const indices = this.props.seleccionados[0].indices;
        let capa = {
            material: 0,
            tipo: null,
            espesor: 0.01,
            propiedad: 0,
        };

        this.props.thunk_agregar_capa_piso(indices.nivel,indices.bloque,capa);

    }

    handleClickAgregarTecho() {
        const indices = this.props.seleccionados[0].indices;
        let capa = {
            material: 0,
            tipo: null,
            espesor: 0.01,
            propiedad: 0,
        };

        this.props.thunk_agregar_capa_techo(indices.nivel,indices.bloque,capa);

    }

    render() {
        const {capaSeleccionadaPiso, capaSeleccionadaTecho} = this.state;

        const {seleccionados, classes} = this.props;

        let capasTecho, capasPiso, width, depth;

        let materialPiso, tipoPiso, espesorPiso, propiedadPiso;
        let materialTecho, tipoTecho, espesorTecho, propiedadTecho;
        let vaciosArrayPiso = [];
        let vaciosArrayTecho = [];
        const esTecho = seleccionados[0] !== null && seleccionados[0].tipo === Tipos.TECHO;
        if (esTecho) {
            const indices = this.props.seleccionados[0].indices;
            const bloque = this.props.morfologia.present
                .niveles[indices.nivel]
                .bloques[indices.bloque];

            const techo = bloque.techo;
            const piso = bloque.piso;

            capasTecho = techo.capas;
            capasPiso = piso.capas;

            if (capaSeleccionadaPiso !== null) {
                materialPiso = capasPiso[capaSeleccionadaPiso].material;
                tipoPiso = capasPiso[capaSeleccionadaPiso].tipo;
                espesorPiso = capasPiso[capaSeleccionadaPiso].espesor;
                propiedadPiso = capasPiso[capaSeleccionadaPiso].propiedad;
            }

            if (capaSeleccionadaTecho !== null) {
                materialTecho = capasTecho[capaSeleccionadaTecho].material;
                tipoTecho = capasTecho[capaSeleccionadaTecho].tipo;
                espesorTecho = capasTecho[capaSeleccionadaTecho].espesor;
                propiedadTecho = capasTecho[capaSeleccionadaTecho].propiedad;
            }
            depth = bloque.dimensiones.largo;
            width = bloque.dimensiones.ancho;

            let capasVaciasPiso = 9 - capasPiso.length - 1;
            for (let i = 0; i < capasVaciasPiso; i++) {
                vaciosArrayPiso.push(i);
            }

            let capasVaciasTecho = 9 - capasTecho.length - 1;
            for (let i = 0; i < capasVaciasTecho; i++) {
                vaciosArrayTecho.push(i);
            }
        }
        let hasTiposPiso;
        let hasTiposTecho;

        if (esTecho && capaSeleccionadaPiso !== null) {
            hasTiposPiso = this.props.info_material[materialPiso].hasOwnProperty('tipos');
        } else {
            hasTiposPiso = null;
        }

        if (esTecho && capaSeleccionadaTecho !== null) {
            hasTiposTecho = this.props.info_material[materialTecho].hasOwnProperty('tipos');
        } else {
            hasTiposTecho = null;
        }

        return (
            <div>
                {esTecho ?
                    <div className={classes.root}>
                        <Typography
                            variant={"title"}
                            className={classes.titulo}
                            align={"center"}
                        >
                            {'Configuración Piso y Techo'}

                        </Typography>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Capas piso</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>
                                    <Grid item xs={12}>
                                        <Grid container spacing={0}>
                                            {capasPiso.map(capa => (
                                                <Grid item xs>
                                                    {capaSeleccionadaPiso === capasPiso.indexOf(capa) ?
                                                        <Paper className={classes.paper}
                                                               style={{backgroundColor: this.colorSelected[0]}}
                                                               value={capasPiso.indexOf(capa)}
                                                               onClick={this.clickCapaPiso}
                                                               elevation={0}
                                                        >
                                                            <IconButton style={{
                                                                color: this.colorSelected[1],
                                                                margin: 0,
                                                                position: 'relative',
                                                                left: '50%',
                                                                transform: 'translate(-50%, 0%)',
                                                            }}
                                                                        className={classes.button}
                                                                        value={capasPiso.indexOf(capa)}
                                                                        onClick={this.handleClickBorrarPiso}

                                                            >
                                                                <Clear/>
                                                            </IconButton>
                                                            {this.props.info_material[capa.material]
                                                                .hasOwnProperty('tipos') ?
                                                                <div>
                                                                    <Typography
                                                                        className={classes.textRotation}
                                                                        style={{color: this.colorSelected[1]}}
                                                                        value={capasPiso.indexOf(capa)}
                                                                        onClick={this.clickCapaPiso}>
                                                                        {this.props.info_material[capa.material]
                                                                            .material + this.props
                                                                            .info_material[capa.material]
                                                                            .tipos[capa.tipo].nombre}
                                                                    </Typography>
                                                                </div>
                                                                :
                                                                <Typography
                                                                    className={classes.textRotation}
                                                                    style={{color: this.colorSelected[1]}}
                                                                    value={capasPiso.indexOf(capa)}
                                                                    onClick={this.clickCapaPiso}>
                                                                    {this.props.info_material[capa.material].material}
                                                                </Typography>
                                                            }
                                                        </Paper> :
                                                        <Paper className={classes.paper}
                                                               style={{
                                                                   backgroundColor: this.props
                                                                       .info_material[capa.material].color
                                                               }}
                                                               value={capasPiso.indexOf(capa)}
                                                               onClick={this.clickCapaPiso}
                                                               elevation={10}
                                                        >
                                                            <IconButton style={{
                                                                color: this.props
                                                                    .info_material[capa.material].textColor,
                                                                margin: 0,
                                                                position: 'relative',
                                                                left: '50%',
                                                                transform: 'translate(-50%, 0%)',
                                                            }}
                                                                        className={classes.button}
                                                                        value={capasPiso.indexOf(capa)}
                                                                        onClick={this.handleClickBorrarPiso}

                                                            >
                                                                <Clear/>
                                                            </IconButton>
                                                            {this.props.info_material[capa.material]
                                                                .hasOwnProperty('tipos') ?
                                                                <div>
                                                                    <Typography
                                                                        className={classes.textRotation}
                                                                        style={{
                                                                            color: this.props
                                                                                .info_material[capa.material]
                                                                                .textColor
                                                                        }}
                                                                        value={capasPiso.indexOf(capa)}
                                                                        onClick={this.clickCapaPiso}>
                                                                        {this.props.info_material[capa.material]
                                                                            .material
                                                                        + this.props.info_material[capa.material]
                                                                            .tipos[capa.tipo].nombre}
                                                                    </Typography>

                                                                </div>
                                                                :
                                                                <div>
                                                                    <Typography
                                                                        className={classes.textRotation}
                                                                        style={{
                                                                            color: this.props
                                                                                .info_material[capa.material]
                                                                                .textColor
                                                                        }}
                                                                        value={capasPiso.indexOf(capa)}
                                                                        onClick={this.clickCapaPiso}>
                                                                        {this.props.info_material[capa.material]
                                                                            .material}
                                                                    </Typography>
                                                                </div>
                                                            }
                                                        </Paper>
                                                    }
                                                </Grid>
                                            ), this)}

                                            {9 - capasPiso.length - 1 >= 0 ?
                                                <Grid item xs>
                                                    <Paper className={classes.paperAdd}>
                                                        <IconButton
                                                            style={{
                                                                margin: 0,
                                                                position: 'relative',
                                                                top: '50%',
                                                                left: '50%',
                                                                transform: 'translate(-50%, -50%)',
                                                            }}
                                                            className={classes.button}
                                                            onClick={this.handleClickAgregarPiso}>
                                                            <Add/>
                                                        </IconButton>
                                                    </Paper>
                                                </Grid> : <div/>
                                            }

                                            {vaciosArrayPiso.map(vacio => (
                                                <Grid item xs>
                                                    <Paper className={classes.paper}>
                                                    </Paper>
                                                </Grid>
                                            ), this)}

                                        </Grid>

                                    </Grid>

                                    {capaSeleccionadaPiso !== null ?
                                        <Grid container spacing={8}>
                                            {hasTiposPiso ?
                                                <Grid container spacing={0} style={{
                                                    marginTop: 12,
                                                    marginBottom: 4,
                                                    marginLeft: 4,
                                                    marginRight: 4,
                                                }}>
                                                    <Grid item xs={6}>
                                                        <FormControl className={classes.formControl}>
                                                            <InputLabel
                                                                htmlFor="material-simple">
                                                                Material
                                                            </InputLabel>
                                                            <Select
                                                                value={materialPiso}
                                                                onChange={this.handleChangeCapaPiso}
                                                                input={<Input name="material" id="material-simple"/>}
                                                            >
                                                                {this.props.info_material.map(material => (
                                                                    <MenuItem value={material.index}>
                                                                        {material.material}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <FormControl className={classes.formControl}>
                                                            <InputLabel htmlFor="tipo-simple">Tipo</InputLabel>
                                                            <Select
                                                                value={tipoPiso}
                                                                onChange={this.handleChangeCapaPiso}
                                                                input={<Input name="tipo" id="tipo-simple"/>}
                                                            >
                                                                {this.props.info_material[materialPiso]
                                                                    .tipos.map(tipo => (
                                                                        <MenuItem value={tipo.index}>
                                                                            {tipo.nombre}
                                                                        </MenuItem>
                                                                    ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                </Grid>
                                                : <Grid item xs={12} style={{
                                                    marginTop: 8,
                                                }}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="material-simple">Material</InputLabel>
                                                        <Select
                                                            value={materialPiso}
                                                            onChange={this.handleChangeCapaPiso}
                                                            input={<Input name="material" id="material-simple"/>}
                                                        >
                                                            {this.props.info_material.map(material => (
                                                                <MenuItem value={material.index}>
                                                                    {material.material}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            }
                                            {hasTiposPiso ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="conductividad-simple">Densidad</InputLabel>
                                                        <Select
                                                            value={propiedadPiso}
                                                            onChange={this.handleChangeCapaPiso}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.props.info_material[materialPiso]
                                                                .tipos[tipoPiso].propiedades.map(propiedades => (
                                                                <MenuItem value={propiedades.index}>
                                                                    {propiedades.densidad !== -1 ? propiedades.densidad
                                                                        : "No tiene"}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid> : <div/>
                                            }

                                            {hasTiposPiso ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel
                                                            htmlFor="conductividad-simple">
                                                            Conductividad
                                                        </InputLabel>
                                                        <Select
                                                            value={propiedadPiso}
                                                            onChange={this.handleChangeCapaPiso}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.props.info_material[materialPiso]
                                                                .tipos[tipoPiso].propiedades.map(propiedades => (
                                                                <MenuItem value={propiedades.index}>
                                                                    {propiedades.conductividad}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid> : <div/>
                                            }
                                            {!hasTiposPiso ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="conductividad-simple">Densidad</InputLabel>
                                                        <Select
                                                            value={propiedadPiso}
                                                            onChange={this.handleChangeCapaPiso}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.props.info_material[materialPiso]
                                                                .propiedades.map(propiedades => (
                                                                    <MenuItem value={propiedades.index}>
                                                                        {propiedades.densidad !== -1 ? propiedades.densidad
                                                                            : "No tiene"}
                                                                    </MenuItem>
                                                                ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid> : <div/>
                                            }

                                            {!hasTiposPiso ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel
                                                            htmlFor="conductividad-simple">
                                                            Conductividad
                                                        </InputLabel>
                                                        <Select
                                                            value={propiedadPiso}
                                                            onChange={this.handleChangeCapaPiso}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.props.info_material[materialPiso]
                                                                .propiedades.map(propiedades => (
                                                                    <MenuItem value={propiedades.index}>
                                                                        {propiedades.conductividad}
                                                                    </MenuItem>
                                                                ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid> : <div/>
                                            }
                                            <Grid item xs={4}>
                                                <FormControl className={classes.formControl}>
                                                    <TextField
                                                        label="Espesor (mm)"
                                                        name="espesor"
                                                        value={1000 * espesorPiso}
                                                        onChange={this.handleChangeCapaPiso}
                                                        type="number"
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                    />
                                                </FormControl>
                                            </Grid>

                                        </Grid> : <div/>
                                    }{seleccionados.length > 1 ?
                                    <Grid container spacing={8}>
                                        <Grid container spacing={0} style={{
                                            marginTop : 12,
                                            marginBottom : 4,
                                            marginLeft : 4,
                                            marginRight : 4,}}>
                                            <Grid item xs={12}>
                                                <FormControl className={classes.formControl}>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        className={classes.button}
                                                        onClick={this.handleClickAplicarPisos}>
                                                        IGUALAR CAPAS DE PISOS SELECCIONADAS
                                                    </Button>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    : <div/>
                                }
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Capas techo</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>
                                    <Grid item xs={12}>
                                        <Grid container spacing={0}>
                                            {capasTecho.map(capa => (
                                                <Grid item xs>
                                                    {capaSeleccionadaTecho === capasTecho.indexOf(capa) ?
                                                        <Paper className={classes.paper}
                                                               style={{backgroundColor: this.colorSelected[0]}}
                                                               value={capasTecho.indexOf(capa)}
                                                               onClick={this.clickCapaTecho}
                                                               elevation={0}
                                                        >
                                                            <IconButton style={{
                                                                color: this.colorSelected[1],
                                                            }}
                                                                        className={classes.button}
                                                                        value={capasTecho.indexOf(capa)}
                                                                        onClick={this.handleClickBorrarTecho}

                                                            >
                                                                <Clear/>
                                                            </IconButton>
                                                            {this.props.info_material[capa.material]
                                                                .hasOwnProperty('tipos') ?
                                                                <div>
                                                                    <Typography
                                                                        className={classes.textRotation}
                                                                        style={{color: this.colorSelected[1]}}
                                                                        value={capasTecho.indexOf(capa)}
                                                                        onClick={this.clickCapaTecho}>
                                                                        {this.props.info_material[capa.material]
                                                                            .material + this.props
                                                                            .info_material[capa.material]
                                                                            .tipos[capa.tipo].nombre}
                                                                    </Typography>
                                                                </div>
                                                                :
                                                                <Typography
                                                                    className={classes.textRotation}
                                                                    style={{color: this.colorSelected[1]}}
                                                                    value={capasTecho.indexOf(capa)}
                                                                    onClick={this.clickCapaTecho}>
                                                                    {this.props.info_material[capa.material].material}
                                                                </Typography>
                                                            }
                                                        </Paper> :
                                                        <Paper className={classes.paper}
                                                               style={{backgroundColor: this.props
                                                                       .info_material[capa.material].color
                                                               }}
                                                               value={capasTecho.indexOf(capa)}
                                                               onClick={this.clickCapaTecho}
                                                               elevation={10}
                                                        >
                                                            <IconButton
                                                                style={{
                                                                    color: this.props
                                                                        .info_material[capa.material].textColor
                                                                }}
                                                                className={classes.button}
                                                                value={capasTecho.indexOf(capa)}
                                                                onClick={this.handleClickBorrarTecho}

                                                            >
                                                                <Clear/>
                                                            </IconButton>
                                                            {this.props.info_material[capa.material]
                                                                .hasOwnProperty('tipos') ?
                                                                <div>
                                                                    <Typography
                                                                        className={classes.textRotation}
                                                                        style={{
                                                                            color: this.props
                                                                                .info_material[capa.material]
                                                                                .textColor
                                                                        }}
                                                                        value={capasTecho.indexOf(capa)}
                                                                        onClick={this.clickCapaTecho}>
                                                                        {this.props.info_material[capa.material]
                                                                            .material
                                                                        + this.props.info_material[capa.material]
                                                                            .tipos[capa.tipo].nombre}
                                                                    </Typography>

                                                                </div>
                                                                :
                                                                <div>
                                                                    <Typography
                                                                        className={classes.textRotation}
                                                                        style={{
                                                                            color: this.props
                                                                                .info_material[capa.material]
                                                                                .textColor
                                                                        }}
                                                                        value={capasTecho.indexOf(capa)}
                                                                        onClick={this.clickCapaTecho}>
                                                                        {this.props.info_material[capa.material]
                                                                            .material}
                                                                    </Typography>
                                                                </div>
                                                            }
                                                        </Paper>
                                                    }
                                                </Grid>
                                            ), this)}

                                            {9 - capasTecho.length - 1 >= 0 ?
                                                <Grid item xs>
                                                    <Paper className={classes.paperAdd}>
                                                        <IconButton
                                                            style={{
                                                                margin: 0,
                                                                position: 'relative',
                                                                top: '50%',
                                                                left: '50%',
                                                                transform: 'translate(-50%, -50%)',
                                                            }}
                                                            className={classes.button}
                                                            onClick={this.handleClickAgregarTecho}>
                                                            <Add/>
                                                        </IconButton>
                                                    </Paper>
                                                </Grid> : <div/>
                                            }

                                            {vaciosArrayTecho.map(vacio => (
                                                <Grid item xs>
                                                    <Paper className={classes.paper}>
                                                    </Paper>
                                                </Grid>
                                            ), this)}

                                        </Grid>

                                    </Grid>

                                    {capaSeleccionadaTecho !== null ?
                                        <Grid container spacing={8}>
                                            {hasTiposTecho ?
                                                <Grid container spacing={0} style={{
                                                    marginTop: 12,
                                                    marginBottom: 4,
                                                    marginLeft: 4,
                                                    marginRight: 4,
                                                }}>
                                                    <Grid item xs={6}>
                                                        <FormControl className={classes.formControl}>
                                                            <InputLabel
                                                                htmlFor="material-simple">
                                                                Material
                                                            </InputLabel>
                                                            <Select
                                                                value={materialTecho}
                                                                onChange={this.handleChangeCapaTecho}
                                                                input={<Input name="material" id="material-simple"/>}
                                                            >
                                                                {this.props.info_material.map(material => (
                                                                    <MenuItem value={material.index}>
                                                                        {material.material}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <FormControl className={classes.formControl}>
                                                            <InputLabel htmlFor="tipo-simple">Tipo</InputLabel>
                                                            <Select
                                                                value={tipoTecho}
                                                                onChange={this.handleChangeCapaTecho}
                                                                input={<Input name="tipo" id="tipo-simple"/>}
                                                            >
                                                                {this.props.info_material[materialTecho]
                                                                    .tipos.map(tipo => (
                                                                    <MenuItem value={tipo.index}>
                                                                        {tipo.nombre}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                </Grid>
                                                : <Grid item xs={12} style={{
                                                    marginTop: 8,
                                                }}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="material-simple">Material</InputLabel>
                                                        <Select
                                                            value={materialTecho}
                                                            onChange={this.handleChangeCapaTecho}
                                                            input={<Input name="material" id="material-simple"/>}
                                                        >
                                                            {this.props.info_material.map(material => (
                                                                <MenuItem value={material.index}>
                                                                    {material.material}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            }
                                            {hasTiposTecho ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="conductividad-simple">Densidad</InputLabel>
                                                        <Select
                                                            value={propiedadTecho}
                                                            onChange={this.handleChangeCapaTecho}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.props.info_material[materialTecho]
                                                                .tipos[tipoTecho].propiedades.map(propiedades => (
                                                                <MenuItem value={propiedades.index}>
                                                                    {propiedades.densidad !== -1 ? propiedades.densidad
                                                                        : "No tiene"}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid> : <div/>
                                            }

                                            {hasTiposTecho ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel
                                                            htmlFor="conductividad-simple">
                                                            Conductividad
                                                        </InputLabel>
                                                        <Select
                                                            value={propiedadTecho}
                                                            onChange={this.handleChangeCapaTecho}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.props.info_material[materialTecho]
                                                                .tipos[tipoTecho].propiedades.map(propiedades => (
                                                                <MenuItem value={propiedades.index}>
                                                                    {propiedades.conductividad}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid> : <div/>
                                            }
                                            {!hasTiposTecho ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="conductividad-simple">Densidad</InputLabel>
                                                        <Select
                                                            value={propiedadTecho}
                                                            onChange={this.handleChangeCapaTecho}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.props.info_material[materialTecho]
                                                                .propiedades.map(propiedades => (
                                                                    <MenuItem value={propiedades.index}>
                                                                        {propiedades.densidad !== -1 ? propiedades.densidad
                                                                            : "No tiene"}
                                                                    </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid> : <div/>
                                            }

                                            {!hasTiposTecho ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel
                                                            htmlFor="conductividad-simple">
                                                            Conductividad
                                                        </InputLabel>
                                                        <Select
                                                            value={propiedadTecho}
                                                            onChange={this.handleChangeCapaTecho}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.props.info_material[materialTecho]
                                                                .propiedades.map(propiedades => (
                                                                    <MenuItem value={propiedades.index}>
                                                                        {propiedades.conductividad}
                                                                    </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid> : <div/>
                                            }
                                            <Grid item xs={4}>
                                                <FormControl className={classes.formControl}>
                                                    <TextField
                                                        label="Espesor (mm)"
                                                        name="espesor"
                                                        value={1000 * espesorTecho}
                                                        onChange={this.handleChangeCapaTecho}
                                                        type="number"
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                    />
                                                </FormControl>
                                            </Grid>

                                        </Grid> : <div/>
                                    }{seleccionados.length > 1 ?
                                    <Grid container spacing={8}>
                                        <Grid container spacing={0} style={{
                                            marginTop : 12,
                                            marginBottom : 4,
                                            marginLeft : 4,
                                            marginRight : 4,}}>
                                            <Grid item xs={12}>
                                                <FormControl className={classes.formControl}>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        className={classes.button}
                                                        onClick={this.handleClickAplicarTechos}>
                                                        IGUALAR CAPAS DE TECHOS SELECCIONADAS
                                                    </Button>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    : <div/>
                                }
                                </Grid>

                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Dimensiones</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>
                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                label="Profundidad (m)"
                                                name="profundidad"
                                                value={depth}
                                                type="number"
                                                inputProps={
                                                    { step: 1}
                                                }
                                                onChange={this.handleChangeDimension}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                label="Ancho (m)"
                                                name="ancho"
                                                value={width}
                                                type="number"
                                                inputProps={
                                                    { step: 1}
                                                }
                                                onChange={this.handleChangeDimension}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                    </div>
                    :
                    <div/>
                }
            </div>
        );
    }
}

InformacionPisoTecho.propTypes = {
    classes: PropTypes.object.isRequired,
    seleccion: PropTypes.object,
    onDimensionChanged: PropTypes.func,/*
    onCapaChanged: PropTypes.func,*/
};

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(InformacionPisoTecho));