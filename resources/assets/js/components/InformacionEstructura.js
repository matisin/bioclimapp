import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import InformacionPared from './InformacionPared'
import InformacionVentana from './InformacionVentana'
import InformacionPuerta from "./InformacionPuerta";
import InformacionPisoTecho from "./InformacionPisoTecho";

const ITEM_HEIGHT = 48;

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    root: {
        width: '100%',
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 200,
        maxWidth: 220,
    },
    textField: {
        width: 100,
    },
    form: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },

});


class InformacionEstructura extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div>
                <InformacionPared
                />

                <InformacionVentana

                />

                <InformacionPuerta

                />

                <InformacionPisoTecho
                />

            </div>
        );
    }
}

InformacionEstructura.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(InformacionEstructura);