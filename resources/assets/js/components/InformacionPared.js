import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from '@material-ui/core/FormControl';
import Paper from '@material-ui/core/Paper';
import { createMuiTheme } from '@material-ui/core/styles';

import * as Tipos from '../constants/morofologia-types';

import Add from '@material-ui/icons/Add';
import Clear from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import Grid from "@material-ui/core/Grid";
import SvgIcon from "@material-ui/core/SvgIcon/SvgIcon";
import {
    seleccionarMorfologia,
    thunk_agregar_capa_pared,
    thunk_aplicar_capa_paredes,
    thunk_borrar_capa_pared,
    thunk_modificar_capa_pared, thunk_modificar_dimensiones_bloque,
} from "../actions";
import {connect} from "react-redux";
import Button from "@material-ui/core/es/Button/Button";

const ITEM_HEIGHT = 48;

const styles = theme => ({
    titulo:{
        margin: theme.spacing.unit*2,
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
        '-webkitTransform' : 'rotate(90deg)',
        '-msTransform' : 'rotate(90deg)',
        '-oTransform:' : 'rotate(90deg)',
        'transform:' : 'rotate(90deg)',
        '-msFilter' : 'progid:DXImageTransform.Microsoft.BasicImage(rotation=1)',
        whiteSpace: 'nowrap',
        height: 0,
        width: 0,
        '-webkitUserSelect' : 'none',
        '-khtmlUserSelect' : 'none',
        '-mozUserSelect' : 'none',
        '-msUserSelect' : 'none',
        '-userSelect' : 'none',

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
        elevation:24,
        width: 0,
        minWidth: '100%',
    },
    paperAdd: {
        height: 200,
        overflow: 'hidden',
        elevation:24,
        width: 0,
        minWidth: '100%',
    },

});

function SunPathIcon() {
    return (
        <SvgIcon viewBox="0 0 64 64">
            <path d="M62 30H47.9a15.9 15.9 0 0 0-3.2-7.8l10-10a2 2 0 0 0-2.8-2.8l-10 10a15.9 15.9 0 0 0-7.9-3.3V2a2 2 0
             0 0-4 0v14.2a15.9 15.9 0 0 0-7.8 3.2l-10-10a2 2 0 1 0-2.8 2.8l10 10a15.9 15.9 0 0 0-3.2 7.8H2a2 2 0 1 0 0
             4subheading4.2a15.9 15.9 0 0 0 3.2 7.8l-10 10a2 2 0 1 0 2.8 2.8l10-10a15.9 15.9 0 0 0 7.8 3.3V62a2 2 0 0 0
              4 0V47.9a15.9 15.9 0 0 0 7.8-3.2l10 10a2 2 0 1 0 2.8-2.8l-10-10a15.9 15.9 0 0 0 3.3-7.9H62a2 2 0 1 0 0-4z"
    fill="#757575"/>
        </SvgIcon>
    );
}

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
        thunk_agregar_capa_pared: (nivel,bloque,pared,capa) =>
            dispatch(thunk_agregar_capa_pared(nivel,bloque,pared,capa)),
        thunk_borrar_capa_pared: (nivel,bloque,pared,capa) =>
            dispatch(thunk_borrar_capa_pared(nivel,bloque,pared,capa)),
        thunk_modificar_capa_pared: (nivel,bloque,pared,indice,capa) =>
            dispatch(thunk_modificar_capa_pared(nivel,bloque,pared,indice,capa)),
        thunk_aplicar_capa_paredes: (nivel,bloque,pared,indices) =>
            dispatch(thunk_aplicar_capa_paredes(nivel,bloque,pared,indices)),
        thunk_modificar_dimensiones_bloque: (bloque,nivel,dimensiones) =>
            dispatch(thunk_modificar_dimensiones_bloque(bloque,nivel,dimensiones)),
    }
};

class InformacionPared extends Component {

    constructor(props) {
        super(props);

        this.state = {
            capas: [],
            single: null,
            capaS : null,

        };

        this.handleClickAgregar = this.handleClickAgregar.bind(this);
        this.handleClickBorrar = this.handleClickBorrar.bind(this);
        this.handleChangeDimension = this.handleChangeDimension.bind(this);
        this.handleChangeCapa = this.handleChangeCapa.bind(this);
        this.clickCapa = this.clickCapa.bind(this);
        this.handleClickAplicar = this.handleClickAplicar.bind(this);


        var theme = createMuiTheme({
            palette: {
                primary: {
                    main: "#fc0f4f",
                },
            },
        });
        this.colorSelected = [theme.palette.primary.main,theme.palette.primary.contrastText];
    }

    componentDidUpdate(prevProps) {
        if(this.props.seleccionados !== prevProps.seleccionados){
            this.setState({
                capaS: null
            });
        }
        //console.log("selec pared",this.props.seleccion);
        /*if (this.props.seleccion !== prevProps.seleccion) {
            if(this.props.seleccion !== null  && this.props.seleccion.userData.tipo === Morfologia.tipos.PARED ){
                let capas = this.props.seleccion.userData.capas;
                for (let i = 0; i < capas.length; i++) {
                    capas[i].index = i;
                }

                let capasVacias = 9 - capas.length - 1;
                this.vaciosArray = [];
                for(let i = 0 ; i < capasVacias ; i++){
                    this.vaciosArray.push(i);
                }

                this.setState({
                    capas: capas,
                    capaS: null,
                });
                if(this.props.seleccion.userData.separacion === Morfologia.separacion.EXTERIOR && this.props.seleccion.userData.hasOwnProperty('omegas')) {
                    this.info_rb = <div/>;
                    if (this.props.seleccion.userData.omegas.wm.desde != null && this.props.seleccion.userData.omegas.wt.desde == null) {
                        this.info_rb = <Grid container spacing={8} justify="center" alignItems="center">
                            <Grid item xs={12} style={{textAlign:'center'}}><Typography variant="subheading">Información Solar</Typography></Grid>
                            <Grid item xs={6} container spacing={0}>
                                <Grid item xs={12} >Hoy el muro recibe sol</Grid>
                                <Grid item xs={6}>
                                    Desde:
                                </Grid>
                                <Grid item xs={6}>
                                    Hasta:
                                </Grid>
                                <Grid item xs={6}>
                                    {this.props.seleccion.userData.omegas.wm.desde.toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'})}
                                </Grid>
                                <Grid item xs={6}>
                                    {this.props.seleccion.userData.omegas.wm.hasta.toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'})}
                                </Grid>
                            </Grid>
                            <Grid item xs={6}>
                                RB: {this.props.seleccion.userData.omegas.rb}
                            </Grid>
                        </Grid>
                    }
                    else if (this.props.seleccion.userData.omegas.wm.desde == null && this.props.seleccion.userData.omegas.wt.desde != null) {
                        this.info_rb = <Grid container spacing={8} justify="center" alignItems="center">
                            <Grid item xs={12} style={{textAlign:'center'}}><Typography variant="subheading">Información Solar</Typography></Grid>
                            <Grid item xs={6} container spacing={0}>
                                <Grid item xs={12} >Hoy el muro recibe sol</Grid>
                                <Grid item xs={6}>
                                    Desde:
                                </Grid>
                                <Grid item xs={6}>
                                    Hasta:
                                </Grid>
                                <Grid item xs={6}>
                                    {this.props.seleccion.userData.omegas.wt.desde.toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'})}
                                </Grid>
                                <Grid item xs={6}>
                                    {this.props.seleccion.userData.omegas.wt.hasta.toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'})}
                                </Grid>
                            </Grid>
                            <Grid item xs={6}>
                                RB: {this.props.seleccion.userData.omegas.rb}
                            </Grid>
                        </Grid>
                    }
                    else if (this.props.seleccion.userData.omegas.wm.desde != null && this.props.seleccion.userData.omegas.wt.desde != null) {
                        this.info_rb = <Grid container spacing={8} justify="center" alignItems="center">
                            <Grid item xs={12} style={{textAlign:'center'}}><Typography variant="subheading">Información Solar</Typography></Grid>
                            <Grid item xs={6} container spacing={0}>
                                <Grid item xs={12} >Hoy el muro recibe sol</Grid>
                                <Grid item xs={6}>
                                    Desde:
                                </Grid>
                                <Grid item xs={6}>
                                    Hasta:
                                </Grid>
                                <Grid item xs={6}>
                                    {this.props.seleccion.userData.omegas.wm.desde.toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'})}
                                </Grid>
                                <Grid item xs={6}>
                                    {this.props.seleccion.userData.omegas.wm.hasta.toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'})}
                                </Grid>
                                <Grid item xs={6}>
                                    {this.props.seleccion.userData.omegas.wt.desde.toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'})}
                                </Grid>
                                <Grid item xs={6}>
                                    {this.props.seleccion.userData.omegas.wt.hasta.toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'})}
                                </Grid>
                            </Grid>
                            <Grid item xs={6}>
                                RB: {this.props.seleccion.userData.omegas.rb}
                            </Grid>
                        </Grid>
                    }
                    else {
                        this.info_rb = <Grid container spacing={8} justify="center" alignItems="center">
                            <Grid item xs={12} style={{textAlign:'center'}}><Typography variant="subheading">Información Solar</Typography></Grid>
                            <Grid item xs={6} container spacing={0}>
                                <Grid item xs={12} >Hoy el muro no recibe sol</Grid>
                            </Grid>
                            <Grid item xs={6}>
                                RB: {this.props.seleccion.userData.omegas.rb}
                            </Grid>
                        </Grid>
                    }
                }
            }
        }*/
    }

    handleChangeCapa(event){
        const indices = this.props.seleccionados[0].indices;

        let capa = this.props.morfologia.present
            .niveles[indices.nivel]
            .bloques[indices.bloque]
            .paredes[indices.pared]
            .capas[this.state.capaS];

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

        this.props.thunk_modificar_capa_pared(indices.nivel,indices.bloque,indices.pared,this.state.capaS,capaNueva);

    }

    handleChangeDimension(event) {
        let indiceCapa = parseInt(event.currentTarget.value);
        const indices = this.props.seleccionados[0].indices;

        let bloque = this.props.morfologia.present.niveles[indices.nivel].bloques[indices.bloque];

        let pared = bloque.paredes[indices.pared];



        let alto = pared.dimensiones.alto, ancho = pared.dimensiones.ancho;
        if (event.target.name === 'altura') {
            alto = parseFloat(event.target.value);
        }else{
            ancho = parseFloat(event.target.value);
        }
        let dimensiones;
        if(pared.orientacion.z !== 0){
            dimensiones = {
                alto: alto,
                ancho: ancho,
                largo: bloque.dimensiones.largo,
            }
        }else{
            dimensiones = {
                alto: alto,
                ancho: bloque.dimensiones.ancho,
                largo: ancho,
            }
        }
        this.props.thunk_modificar_dimensiones_bloque(indices.bloque,indices.nivel,dimensiones);

    }

    handleClickBorrar(event) {
        event.preventDefault();
        let indiceCapa = parseInt(event.currentTarget.value);
        const indices = this.props.seleccionados[0].indices;

        this.props.thunk_borrar_capa_pared(indices.nivel,indices.bloque,indices.pared,indiceCapa);

        if(this.state.capaS === indiceCapa){
            this.setState({
                capaS: null,
            })
        }else if(this.state.capaS > indiceCapa){
            this.setState({
                capaS: this.state.capaS - 1,
            })
        }
    }

    clickCapa(event) {
        if(event.target.attributes.value !== undefined){
            let capaS = parseInt(event.target.attributes.value.value);
            this.setState({capaS: capaS});
        }
    }

    handleClickAplicar() {
        const indiceSel = this.props.seleccionados[0].indices;
        const seleccionados = this.props.seleccionados;
        let indices = [];
        for(let seleccionado of seleccionados){
            indices.push(seleccionado.indices);
        }
        this.props.thunk_aplicar_capa_paredes(indiceSel.nivel,indiceSel.bloque,indiceSel.pared,indices);


    }

    handleClickAgregar() {
        const indices = this.props.seleccionados[0].indices;/*
        let capas = this.state.capas;*/
        let capa = {
            material: 0,
            tipo: null,
            espesor: 0.01,
            propiedad: 0,
        };

        this.props.thunk_agregar_capa_pared(indices.nivel,indices.bloque,indices.pared,capa);

    }

    render() {
        const {capaS} = this.state;

        const {seleccionados,classes} = this.props;

        let material ,tipo ,espesor ,propiedad,height,width,capas;
        let vaciosArray = [];
        const esPared = seleccionados[0] !== null && seleccionados[0].tipo === Tipos.PARED;
        if(esPared){
            const indices = this.props.seleccionados[0].indices;
            const pared = this.props.morfologia.present
                .niveles[indices.nivel]
                .bloques[indices.bloque]
                .paredes[indices.pared];
            capas = pared.capas;

            if(capaS !== null){
                material = capas[capaS].material;
                tipo = capas[capaS].tipo;
                espesor = capas[capaS].espesor;
                propiedad = capas[capaS].propiedad;
            }
            height = pared.dimensiones.alto;
            width = pared.dimensiones.ancho;

            let capasVacias = 9 - capas.length - 1;
            for(let i = 0 ; i < capasVacias ; i++){
                vaciosArray.push(i);
            }
        }
        let hasTipos;

        if (esPared && capaS !== null){
            hasTipos = this.props.info_material[material].hasOwnProperty('tipos');
        }else{
            hasTipos = null;
        }
        return (
            <div>

                {esPared ?
                    <div className={classes.root}>
                        <Typography
                            variant={"title"}
                            className={classes.titulo}
                            align={"center"}
                        >
                            {'Configuración Pared'}
                        </Typography>
                        {/*ARREGLAR CCUANDO SE TENGA LA INFO RB*/}
                        {/*{seleccionado.userData.separacion === Morfologia.separacion.EXTERIOR &&
                        <Paper style={{padding:20, margin:0}}>{this.info_rb}</Paper>
                        }*/}

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Capas</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>
                                    <Grid item xs={12}>
                                        <Grid container spacing={0}>
                                            {capas.map(capa => (
                                                <Grid item xs>
                                                    {capaS === capas.indexOf(capa) ?
                                                        <Paper className={classes.paper}
                                                               style={{backgroundColor: this.colorSelected[0]}}
                                                               value={capas.indexOf(capa) }
                                                               onClick={this.clickCapa}
                                                               elevation={0}
                                                        >
                                                            <IconButton style={{color: this.colorSelected[1],
                                                                    margin: 0,
                                                                    position: 'relative',
                                                                    left: '50%',
                                                                    transform: 'translate(-50%, 0%)',}}
                                                                        className={classes.button}
                                                                        value={capas.indexOf(capa)}
                                                                        onClick={this.handleClickBorrar}

                                                            >
                                                                <Clear/>
                                                            </IconButton>
                                                            {this.props.info_material[capa.material]
                                                                .hasOwnProperty('tipos') ?
                                                                <div>
                                                                    <Typography
                                                                        className={classes.textRotation}
                                                                        style={{color: this.colorSelected[1]}}
                                                                        value={capas.indexOf(capa) }
                                                                        onClick={this.clickCapa}>
                                                                        {this.props.info_material[capa.material]
                                                                            .material
                                                                        + this.props.info_material[capa.material]
                                                                            .tipos[capa.tipo].nombre}
                                                                    </Typography>
                                                                </div>
                                                                :
                                                                <Typography
                                                                    className={classes.textRotation}
                                                                    style={{color: this.colorSelected[1]}}
                                                                    value={capas.indexOf(capa) }
                                                                    onClick={this.clickCapa}>
                                                                    {this.props.info_material[capa.material].material}
                                                                </Typography>
                                                            }
                                                        </Paper> :
                                                        <Paper className={classes.paper}
                                                               style={{backgroundColor: this.props
                                                                       .info_material[capa.material]
                                                                       .color
                                                               }}
                                                               value={capas.indexOf(capa) }
                                                               onClick={this.clickCapa}
                                                                elevation={10}
                                                        >
                                                            <IconButton
                                                                style={{color: this.props.info_material[capa.material]
                                                                        .textColor,
                                                                    margin: 0,
                                                                    position: 'relative',
                                                                    left: '50%',
                                                                    transform: 'translate(-50%, 0%)',
                                                                   }}
                                                                        className={classes.button}
                                                                        value={capas.indexOf(capa) }
                                                                        onClick={this.handleClickBorrar}

                                                            >
                                                                <Clear/>
                                                            </IconButton>
                                                            {this.props.info_material[capa.material]
                                                                .hasOwnProperty('tipos') ?
                                                                <div >
                                                                    <Typography
                                                                        className={classes.textRotation}
                                                                        style={{color: this.props
                                                                                .info_material[capa.material]
                                                                                .textColor}}
                                                                        value={capas.indexOf(capa) }
                                                                        onClick={this.clickCapa}>
                                                                        {this.props.info_material[capa.material]
                                                                            .material
                                                                        + this.props.info_material[capa.material]
                                                                            .tipos[capa.tipo].nombre}
                                                                    </Typography>

                                                                </div>
                                                                :
                                                                <div >
                                                                    <Typography
                                                                        className={classes.textRotation}
                                                                        style={{color: this.props
                                                                                .info_material[capa.material]
                                                                                .textColor}}
                                                                        value={capas.indexOf(capa) }
                                                                        onClick={this.clickCapa}>
                                                                        {this.props.info_material[capa.material]
                                                                            .material}
                                                                    </Typography>
                                                                </div>
                                                            }
                                                        </Paper>
                                                    }
                                                </Grid>
                                            ), this)}

                                            {9 - capas.length - 1 >= 0 ?
                                                <Grid item xs>
                                                    <Paper className={classes.paperAdd}>
                                                        <IconButton
                                                            style={{margin: 0,
                                                                position: 'relative',
                                                                top: '50%',
                                                                left: '50%',
                                                                transform: 'translate(-50%, -50%)',}}
                                                            className={classes.button}
                                                            onClick={this.handleClickAgregar}>
                                                            <Add/>
                                                        </IconButton>
                                                    </Paper>
                                                </Grid> : <div/>
                                            }

                                            {vaciosArray.map(vacio => (
                                                <Grid item xs>
                                                    <Paper className={classes.paper}>
                                                    </Paper>
                                                </Grid>
                                            ), this)}

                                        </Grid>

                                    </Grid>

                                    {capaS !== null ?
                                        <Grid container spacing={8}>
                                            {hasTipos ?
                                                <Grid container spacing={0} style={{
                                                    marginTop : 12,
                                                    marginBottom : 4,
                                                    marginLeft : 4,
                                                    marginRight : 4,}}>
                                                    <Grid item xs={6}>
                                                        <FormControl className={classes.formControl}>
                                                            <InputLabel
                                                                htmlFor="material-simple">
                                                                Material capa seleccionada
                                                            </InputLabel>
                                                            <Select
                                                                value={material}
                                                                onChange={this.handleChangeCapa}
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
                                                                value={tipo}
                                                                onChange={this.handleChangeCapa}
                                                                input={<Input name="tipo" id="tipo-simple"/>}
                                                            >
                                                                {this.props.info_material[material].tipos.map(tipo => (
                                                                    <MenuItem value={tipo.index}>
                                                                        {tipo.nombre}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                </Grid>
                                                 : <Grid item xs={12} style={{
                                                     marginTop : 8,
                                                }}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel
                                                            htmlFor="material-simple">
                                                            Material capa seleccionada
                                                        </InputLabel>
                                                        <Select
                                                            value={material}
                                                            onChange={this.handleChangeCapa}
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
                                            {hasTipos ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="conductividad-simple">Densidad</InputLabel>
                                                        <Select
                                                            value={propiedad}
                                                            onChange={this.handleChangeCapa}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.props.info_material[material]
                                                                .tipos[tipo].propiedades.map(propiedades => (
                                                                <MenuItem value={propiedades.index}>
                                                                    {propiedades.densidad !== -1 ? propiedades.densidad
                                                                    : "No tiene"}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>  : <div/>
                                            }

                                            {hasTipos ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel
                                                            htmlFor="conductividad-simple">
                                                            Conductividad
                                                        </InputLabel>
                                                        <Select
                                                            value={propiedad}
                                                            onChange={this.handleChangeCapa}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.props.info_material[material]
                                                                .tipos[tipo].propiedades.map(propiedades => (
                                                                <MenuItem value={propiedades.index}>
                                                                    {propiedades.conductividad}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid> : <div/>
                                            }
                                            {!hasTipos?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="conductividad-simple">Densidad</InputLabel>
                                                        <Select
                                                            value={propiedad}
                                                            onChange={this.handleChangeCapa}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.props.info_material[material]
                                                                .propiedades.map(propiedades => (
                                                                <MenuItem value={propiedades.index}>
                                                                    {propiedades.densidad !== -1 ? propiedades.densidad
                                                                        : "No tiene"}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>  : <div/>
                                            }

                                            {!hasTipos ?
                                                <Grid item xs={4}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel
                                                            htmlFor="conductividad-simple">
                                                            Conductividad
                                                        </InputLabel>
                                                        <Select
                                                            value={propiedad}
                                                            onChange={this.handleChangeCapa}
                                                            input={<Input name="propiedad" id="conductividad-simple"/>}
                                                        >
                                                            {this.props.info_material[material]
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
                                                        value={1000*espesor}
                                                        onChange={this.handleChangeCapa}
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
                                                        onClick={this.handleClickAplicar}>
                                                        IGUALAR CAPAS DE PAREDES SELECCIONADAS
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
                                                label="Altura (m)"
                                                name="altura"
                                                value={height}
                                                type="number"
                                                inputProps={
                                                    { step: 0.1}
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

InformacionPared.propTypes = {
    classes: PropTypes.object.isRequired,
    seleccion: PropTypes.object,
    onDimensionChanged: PropTypes.func,
    onCapaChanged: PropTypes.func,
};

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(InformacionPared));