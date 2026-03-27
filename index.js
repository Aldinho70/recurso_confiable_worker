import axios from 'axios'
import getInfoDevices from './src/api/wialon.js';
import { API_VecFleet } from './src/api/VecFleet.js';
import { destructWialon } from './src/utils/utils.js';

import RCServiceClient from './src/api/RControl.js';
import { getTokenFromXML, buildGPSAssetTrackingXML, getIdJobFromXML } from './src/helpers/xmlParsed.js';

const ApiVecFleet = new API_VecFleet();
const ApiRControl = new RCServiceClient();

const app = async () => {
  try {
    // Obtener token
    const tokenResponse = await ApiRControl.getUserToken("user_avl_Geckotech", "vujK#818ZJOe*9");
    // console.log( await getTokenFromXML(tokenResponse) );
    
    const data = await getInfoDevices();
    const devices = destructWialon(data);
    
    const validDevices = devices.filter(d => Object.keys(d).length > 0);
    const payloadGPSAssetTracking = buildGPSAssetTrackingXML( await getTokenFromXML(tokenResponse), validDevices );
    const resp = await ApiRControl.gpsAssetTracking(payloadGPSAssetTracking);
    
    if( await getIdJobFromXML(resp) ){
      console.log("Enviando paquete de datos");
      console.table(devices);
      console.log( `Paquete de datos recibido de manera correcta con id ${await getIdJobFromXML(resp)} de respuesta` );
    }else{
      console.log('No se puedo hacer la peticion');
      
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

app();

setInterval(app, 60000);
