/**
 * Convierte coordenadas decimales a formato DMS (Latitud)
 */
export function decimalToDMS(decimal) {
    const degrees = Math.floor(decimal);
    const minutes = (decimal - degrees) * 60;
    return `${degrees}${minutes.toFixed(2).padStart(5, '0')}`;
}

/**
 * Convierte coordenadas decimales a formato DMS (Longitud)
 */
export function decimalToDMSLong(decimal) {
    const isNegative = decimal < 0;
    const absDecimal = Math.abs(decimal);
    const degrees = Math.floor(absDecimal);
    const minutes = (absDecimal - degrees) * 60;
    const formattedDegrees = String(degrees).padStart(3, '0');
    const formattedMinutes = minutes.toFixed(2).padStart(5, '0');
    return `${formattedDegrees}${formattedMinutes}`;
}

export function parseDateTime(timestamp) {
    // Verificar si el timestamp es válido
    if (!timestamp) return "NA";

    try {
        // Convertir el timestamp a un objeto Date en UTC
        const date = new Date(timestamp * 1000); // Multiplicamos por 1000 para convertir a milisegundos
        if (isNaN(date.getTime())) return "NA";

        // Formatear la fecha en YYYY-MM-DD
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');

        // Formatear la hora en HH:MM:SS
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');

        // Retornar el formato final
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
        // En caso de error, retornar "NA"
        return "NA";
    }
}


/**
 * Desestrucuturar las respuesta de getInfoDevice
 */

// export const destructWialon = (data) => {
//     try {
//         const deviceInfoList = [];
//         data.map(element => {

//             const name_sens = ["VecFleet_Odo", "VecFleet_Fuel", "VecFleet_RPM"];
//             let odometer = 0, fuel = 0, RPM = 0;
//             const { nm, pos, prms, sens, uid, flds } = element;
//             const { y, x, s, t } = pos;
//             const time = parseDateTime(t);
//             let plate;

//             /**
//              * Obtener el valor del campo personalizado 'plate'
//              */
//                 for (const key in flds) {
//                     if (!Object.hasOwn(flds, key)) continue;
//                     const fld = flds[key];
//                     if (fld.n == "plates") {
//                         plate = fld.v
//                     }
//                 }

//             /**
//              * Obtener los valores de RPM, Fuel y Odometro
//              */
//                 for (const key in sens) {
//                     if (!Object.hasOwn(sens, key)) continue;

//                     const sen = sens[key];
//                     if (name_sens.includes(sen.n)) {
//                         switch (sen.n) {

//                             case 'VecFleet_Odo': {
//                                 odometer = prms['can_distance']?.v ?? 0;
//                                 break;
//                             }

//                             case 'VecFleet_Fuel': {
//                                 fuel = prms[sen.p]?.v ?? 0;
//                                 break;
//                             }

//                             case 'VecFleet_RPM': {
//                                 RPM = prms[sen.p]?.v ?? 0;
//                                 break;
//                             }

//                             default: {
//                                 return
//                             }
//                         }
//                     }
//                 }

//             deviceInfoList.push({
//                 imei: uid,
//                 name: nm,
//                 plate: plate,
//                 date: time,
//                 lat: x,
//                 lon: y,
//                 speed: s,
//                 odometer: odometer,
//                 direction: 0,
//                 rpm: RPM,
//                 temperature: 0,
//                 fuel: fuel
//             });
//         });

//         return deviceInfoList;
//     } catch (error) {
//         console.log(error);
//     }
// }

const SENSORS = {
    ODO: 'VecFleet_Odo',
    FUEL: 'VecFleet_Fuel',
    RPM: 'VecFleet_RPM'
};

const CAN_DISTANCE_FACTOR = 0.005;

const getPlate = (flds = {}) =>
    Object.values(flds).find(f => f.n === 'plates')?.v;

const getSensorValues = (sens = {}, prms = {}) => {
    try{
        let odometro = 0, fuel = 0, rpm = 0;

        for (const sensor of Object.values(sens)) {
            switch (sensor.n) {
                case SENSORS.ODO:
                    odometro = (prms['can_distance']?.v ?? 0);
                    break;
                case SENSORS.FUEL:
                    fuel = prms[sensor.p]?.v ?? 0;
                    break;
                case SENSORS.RPM:
                    rpm = prms[sensor.p]?.v ?? 0;
                    break;
            }
        }

        return { odometro, fuel, rpm };
    }catch ( error ) {
        console.log(error);
        
    }
};

const mapDevice = (element) => {
    const { nm, pos = {}, prms, sens, uid, flds } = element;
    const { x, y, s, t } = pos;

    const { odometro, fuel, rpm } = getSensorValues(sens, prms);

    return {
        imei: uid,
        name: nm,
        plate: getPlate(flds),
        date: parseDateTime(t),
        lon: x,
        lat: y,
        speed: s,
        odometer: Math.round(odometro * CAN_DISTANCE_FACTOR) || 0,
        // odometer,
        direction: 0,
        rpm,
        temperature: 0,
        fuel
    };
};


export const destructWialon = (data = []) => {
    try {
        return data.map(mapDevice);
    } catch (error) {
        console.error(error);
        return [];
    }
};
