import axios from "axios";

class RCServiceClient {
  constructor() {
    this.baseURL = "http://gps.rcontrol.com.mx/Tracking/wcf/RCService.svc";
  }

  async request(method, body) {
    const headers = {
      "Content-Type": "text/xml; charset=utf-8",
      "SOAPAction": `http://tempuri.org/IRCService/${method}`,
    };

    try {
      const response = await axios.post(this.baseURL, body, { headers });
      return response.data;
    } catch (error) {
      console.error("SOAP Error:", error.response?.data || error.message);
      throw error;
    }
  }

  // GetUserToken (ya estructurado)
  async getUserToken(userId, password) {
    const body = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                        xmlns:tem="http://tempuri.org/">
        <soapenv:Header/>
        <soapenv:Body>
          <tem:GetUserToken>
            <tem:userId>${userId}</tem:userId>
            <tem:password>${password}</tem:password>
          </tem:GetUserToken>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    return this.request("GetUserToken", body);
  }

  // ✔ GPSAssetTracking recibe el XML completo
  async gpsAssetTracking(xmlPayload) {
    return this.request("GPSAssetTracking", xmlPayload);
  }
}

export default RCServiceClient;