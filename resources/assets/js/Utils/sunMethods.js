var SunCalc = require('suncalc');

export function getSunPosition(lat, lng, date = new Date()) {
    let sun = SunCalc.getPosition(/*Date*/ date, /*Number*/ lat, /*Number*/ lng);
    let altitude = sun.altitude * 180 / Math.PI;
    let azimuth = sun.azimuth * 180 / Math.PI;
    return {
        altitude: altitude,
        azimuth: azimuth
    }
}

export function getSunPath(lat, lng){
    let sunPath = [];
    let now = new Date();
    let start = new Date(now.getFullYear(),0,0);
    let invierno = new Date(now.getFullYear(),5,21);
    let verano = new Date(now.getFullYear(),11,21);
    let diff_invierno = (invierno - start) + ((start.getTimezoneOffset() - invierno.getTimezoneOffset()) * 60 * 1000);
    let diff_verano = (verano - start) + ((start.getTimezoneOffset() - verano.getTimezoneOffset()) * 60 * 1000);
    let oneDay = 1000 * 60 * 60 * 24;
    let day_invierno = Math.floor(diff_invierno / oneDay);
    let day_verano = Math.floor(diff_verano / oneDay);
    for(let i = day_invierno; i < day_verano; i++){
        let daySunPath = [];
        for(let j = 0; j < 24; j++){
            let date = dateFromDay(now.getFullYear(),i);
            let dateWithTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), j);
            let sunPosition = getSunPosition(lat, lng, dateWithTime);
            daySunPath.push(sunPosition);
        }
        sunPath.push(daySunPath);
    }
    return sunPath;
}

function dateFromDay(year, day){
    let date = new Date(year, 0); // initialize a date in `year-01-01`
    return new Date(date.setDate(day)); // add the number of days
}