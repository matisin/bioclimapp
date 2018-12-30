import React, {Component} from 'react';
import { connect } from "react-redux";
import { thunk_cambiar_variables_internas} from "../actions/index";
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Paper from "@material-ui/core/Paper/Paper";
import Grid from "@material-ui/core/Grid/Grid";
import TextField from "@material-ui/core/TextField/TextField";
import InputAdornment from "@material-ui/core/InputAdornment/InputAdornment";
import SvgIcon from "@material-ui/core/SvgIcon/SvgIcon";
import WbIncandescent from "@material-ui/icons/WbIncandescent";
import People from "@material-ui/icons/People";


const styles = theme => ({
    root: {
        //flexGrow: 1,
        background: '#F0F0F0'
    },
    paper: {
        //padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
        background: '#fdfdfd',
    },
    title: {
        textAlign: 'center',
        color: 'black',
        padding: theme.spacing.unit,
    },
});

const mapStateToProps = state => {
    return {
        personas: state.variables.personas,
        temperatura: state.variables.temperatura,
        iluminacion:  state.variables.iluminacion,
        aire: state.variables.aire,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        thunk_cambiar_variables_internas: variable => dispatch(thunk_cambiar_variables_internas(variable)),
    }
};

class InfoVariablesInternas extends React.Component {
    constructor(props){
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleChange(event,prop){
        event.preventDefault();
        this.props.thunk_cambiar_variables_internas({
            name :event.target.name,
            value: parseInt(event.target.value),
        });
    }

    handleClick(){
        this.props.handleClose();
    }

    render(){
        const {personas,temperatura,iluminacion, aire} = this.props;
        return(
            <div style={{marginLeft:'30%',marginRight:'30%',padding:20}}>
                <Paper>
                    <Grid container spacing={32} alignItems="center" style={{margin: 0,
                        width: '100%',
                        padding: 32}}>
                        <Grid item xs={4}>
                            <People/>
                        </Grid>
                        <Grid item xs={8}>
                            <TextField
                                type="number"
                                label="Número de Personas"
                                value={personas}
                                name={'personas'}
                                onChange={this.handleChange}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <SvgIcon viewBox="0 0 64 64">
                                <path data-name="layer1"
                                      d="M40 36.5V10a8 8 0 1 0-16 0v26.5a14 14 0 1 0 16 0zM32 54a6 6 0 0 1-2-11.7V26a2 2 0 1 1 4 0v16.3A6 6 0 0 1 32 54z"
                                      fill="#202020"/>
                            </SvgIcon>
                        </Grid>
                        <Grid item xs={8}>
                            <TextField
                                type="number"
                                label="Temperatura de Confort"
                                value={temperatura}
                                name={'temperatura'}
                                onChange={this.handleChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            °C
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <WbIncandescent/>
                        </Grid>
                        <Grid item xs={8}>
                            <TextField
                                type="number"
                                name={'iluminacion'}
                                label="Horas de iluminación"
                                value={iluminacion}
                                onChange={this.handleChange}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <SvgIcon viewBox="0 0 64 64">
                                <circle data-name="layer1"
                                        cx="32" cy="27" r="4" fill="#202020"/>
                                <path data-name="layer2" d="M36 5.7C36 2.2 33.8 1 32 1c-1.8 0-4 1.2-4 4.7S30 19 32 19s4-9.8 4-13.3zM25.9 31.4c-1-1.7-10.5 1.4-13.5 3.2s-3 4.2-2.1 5.8c.9 1.6 3 2.9 6.1 1.1s10.5-8.3 9.5-10.1zm25.7 3.3c-3-1.8-12.5-4.9-13.5-3.2-1 1.7 6.5 8.4 9.5 10.1s5.1.5 6.1-1.1c.9-1.6 1-4.1-2.1-5.8z"
                                      fill="#202020"/>
                                <path data-name="layer1" d="M44 59H34V34.7l-2 .3-2-.3V59H20a2 2 0 1 0 0 4h24a2 2 0 0 0 0-4z"
                                      fill="#202020"/>
                            </SvgIcon>
                        </Grid>
                        <Grid item xs={8}>
                            <TextField
                                type="number"
                                label="Renovacion de aire diaria"
                                value={aire}
                                name={'aire'}
                                onChange={this.handleChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            m<sup>3</sup>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        );
    }
}
InfoVariablesInternas.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(InfoVariablesInternas));