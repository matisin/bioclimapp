import React, {Component} from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import {withStyles} from "@material-ui/core/styles";
import PropTypes from "prop-types";
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Undo from "@material-ui/icons/Undo";
import Redo from "@material-ui/icons/Redo";
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import {modificarObstrucion, thunk_modificar_obstruccion} from "../actions";
import {connect} from "react-redux";



const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    typography: {
        padding: theme.spacing.unit * 2,
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 100,
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
});

const mapDispatchToProps = dispatch => {
    return {
        thunk_modificar_obstruccion: (obstruccion, indice) => dispatch(thunk_modificar_obstruccion(obstruccion,indice)),
    }
};

const mapStateToProps = state => {
    return {
        seleccion: state.app.seleccion_contexto,
        obstrucciones: state.contexto.present.obstrucciones,
    }
};

class InfoObstruccion extends Component{
    constructor(props){
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }


    handleChange(event){
        const target = event.target;
        const value = target.value;

        let obstruccionState = this.props.obstrucciones[this.props.seleccion];
        let obstruccion = {
            longitud: obstruccionState.longitud,
            altura: obstruccionState.altura,
            posicion: {
                x: obstruccionState.posicion.x,
                z: obstruccionState.posicion.z,
            },
            rotacion : obstruccionState.rotacion,
        };
        if(target.name === 'rotacion'){
            let valor = parseInt(value);
            while (valor > 90){
                valor-= 180;
            }
            while(valor < -90){
                valor+=180;
            }
                obstruccion[target.name] = valor* Math.PI / 180;

        }else{
            obstruccion[target.name] = parseInt(value);
        }

        this.props.thunk_modificar_obstruccion(obstruccion,this.props.seleccion);
    }

    render(){
        //
        const {classes, seleccion, obstrucciones} = this.props;
        return(

            <div className={classes.root}>
                {
                    seleccion !== null ? <Paper className={classes.paper}>
                        <Grid container spacing={0}>
                            <Grid item xs={4}>
                                <TextField
                                    name="altura"
                                    type="number"
                                    label="Altura"
                                    className={classes.textField}
                                    value={obstrucciones[seleccion].altura}
                                    onChange={this.handleChange}
                                />
                            </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        name="longitud"
                                        type="number"
                                        label="Longitud"
                                        className={classes.textField}
                                        value={obstrucciones[seleccion].longitud}
                                        onChange={this.handleChange}
                                    />
                                </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    name="rotacion"
                                    type="number"
                                    label="Rotación (grados)"
                                    className={classes.textField}
                                    value={Math.round(obstrucciones[seleccion].rotacion* 180/Math.PI)}
                                    onChange={this.handleChange}
                                />
                            </Grid>
                        </Grid>
                    </Paper> : <div/>
                }


            </div>
        )
    }
}

InfoObstruccion.propTypes = {
    classes: PropTypes.object.isRequired,
    thunk_modificar_obstruccion: PropTypes.func,
};
export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(InfoObstruccion));