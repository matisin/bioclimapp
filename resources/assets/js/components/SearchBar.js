import React, { Component } from 'react';
import Popup from "reactjs-popup";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import {MapControl} from 'react-leaflet';
import {thunk_set_state_mapa} from "../actions";
import {connect} from "react-redux";


const mapDispatchToProps = dispatch => {
    return {
        thunk_set_state_mapa : (lat,lng) => dispatch(thunk_set_state_mapa(lat,lng)),
    }
};

class SearchBar extends MapControl{
    constructor(props) {
        super(props);
        this.locationFound = this.locationFound.bind(this);
    }
    locationFound(e) {
        this.props.thunk_set_state_mapa(parseFloat(e.location.y),parseFloat(e.location.x));
    }
  createLeafletElement() {
    return GeoSearchControl({
      provider: new OpenStreetMapProvider({ params: { countrycodes: 'CL' ,featuretype: 'city'}, }),
      style:'button',
      autoComplete: true,
      autoClose:true,
      autoCompleteDelay: 250,
      retainZoomLevel: false,
      searchLabel: 'Ingrese localidad',
      keepResult: true,
      showMarker: false,
      animateZoom: true,

    });
  }

    componentDidMount() {
        super.componentDidMount();
        this.leafletElement.map.on('geosearch/showlocation', this.locationFound);
    }


}

export default connect(null,mapDispatchToProps)(SearchBar);