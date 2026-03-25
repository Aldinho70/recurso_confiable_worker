import axios from 'axios'
import getInfoDevices from './src/api/wialon.js';
import { API_VecFleet } from './src/api/VecFleet.js';
import { destructWialon } from './src/utils/utils.js';

const ApiVecFleet = new API_VecFleet();

const app = async () => {
  try {
    const data = await getInfoDevices();
    const devices = destructWialon(data);
    console.table(devices);

    // const response = await ApiVecFleet.sendAvl(devices);
    // console.log(devices);
    // console.log(JSON.stringify(devices));
    
    // if( response.status === 200 ){
    //   console.log(`Response Ok, [Code]:200 in URL[${response.config.url}]`);
    //   // console.log(response.data);
    //   console.table(devices);
    // }
  } catch (error) {
    // console.error('❌ Error:', error);
  }
};

app();

setInterval(app, 60000);
