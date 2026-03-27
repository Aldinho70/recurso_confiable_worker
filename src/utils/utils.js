import { formatToISODateTimeUTC } from "./DataFormatter.js";
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

const SENSORS = {
    ODO: 'VecFleet_Odo',
    FUEL: 'VecFleet_Fuel',
    RPM: 'VecFleet_RPM'
};

const CAN_DISTANCE_FACTOR = 0.005;

const getValueFlds = (flds = {}, field) =>
    Object.values(flds).find(f => f.n === field)?.v;

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


    if( getValueFlds(flds, "customer.name") ){
        return {
            // serialNumber: cid,
            name: nm,
            "customer.name": getValueFlds(flds, "customer.name"),
            "customer.id": getValueFlds(flds, "cid"),
            asset: nm.split(" ")[2],
            // date: parseDateTime(t),
            date: formatToISODateTimeUTC(t),
            longitude: x,
            latitude: y,
            speed: s,
            odometer: Math.round(odometro * CAN_DISTANCE_FACTOR) || 0,
            code: "1",
            direction: "0",
            // rpm,
            temperature: 0.0,
            battery: 0,
            ignition: (s > 0) ? true : false,
            vehicleType: getValueFlds(flds, "tipo_unidad"),
            
            // fuel
        };
    }else{
        return {}
    }
};


export const destructWialon = (data = []) => {
    try {
        return data.map(mapDevice);
    } catch (error) {
        console.error(error);
        return [];
    }
};
