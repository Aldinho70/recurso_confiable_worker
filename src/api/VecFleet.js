// api/VecFleet.js

import axios from 'axios';
import { readSession, writeSession } from '../helpers/sessionManager.js';

const BASE_URL_VEC_FLEET = process.env.BASE_URL_VEC_FLEET;  
const TOKEN_VEC_FLEET = process.env.TOKEN_VEC_FLEET;

export class API_VecFleet {
    constructor(  ) {
        this.client = axios.create({
            BASE_URL_VEC_FLEET,
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${TOKEN_VEC_FLEET}`
            }
        });
    }

    /**
     * POST /gps/avl
     * Envia datos AVL de una unidad
     */
    async sendAvl(data) {
        try {
            const response = await this.client.post('https://api.staging.vecfleet.io/gps/avl', {
                data: data
            });
            return response;
            
        } catch (error) {
            if( error.status == 401 ){
                console.log('Actualizando Token');

                const responseLogin = await this.getToken();
                if( responseLogin ){
                    this.client.defaults.headers.Authorization = `Bearer ${ responseLogin }`;
                    writeSession({
                        token: responseLogin,
                        generatedAt: Date.now()
                    });
                }else{
                    console.log('No fue posible generar token');
                    
                    writeSession({
                        token: "Error_token",
                        generatedAt: Date.now()
                    });
                }

            }
        }
    }

    async getToken() {
        try {
            const response = await axios.post('https://api.staging.vecfleet.io/auth/login', {
                        "email": "gafi-test@vecfleet.io",
                        "password": "G4T3s-er56Gn7J"
            });
            
            if( response.status == 200 ){
                return response.data;
            }
            
        } catch (error) {
            console.log(error);
            
            // throw  this._handleError(error);
        }
    }
}
