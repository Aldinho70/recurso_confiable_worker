import { parseStringPromise } from "xml2js";

export async function getTokenFromXML(xml) {
    try {
        const result = await parseStringPromise(xml, {
            explicitArray: false, // evita arrays innecesarios
        });

        return result["s:Envelope"]
            ["s:Body"]
            ["GetUserTokenResponse"]
            ["GetUserTokenResult"]
            ["a:token"];

    } catch (error) {
        console.error("Error parsing XML:", error);
        return null;
    }
}

export async function getIdJobFromXML(xml) {
    try {
        const result = await parseStringPromise(xml, {
            explicitArray: false,
        });

        return result["s:Envelope"]
            ["s:Body"]
            ["GPSAssetTrackingResponse"]
            ["GPSAssetTrackingResult"]
            ["a:AppointResult"]
            ["a:idJob"];

    } catch (error) {
        console.error("Error parsing XML:", error);
        return null;
    }
}
const buildEventsXML = (devices = []) => {
    return devices.map(d => `
        <iron:Event>
            <iron:altitude>0</iron:altitude>
            <iron:asset>${d.asset || ""}</iron:asset>
            <iron:battery>${d.battery ?? 0}</iron:battery>
            <iron:code>${d.code || 0}</iron:code>
            <iron:course>${d.course ?? 0}</iron:course>
            <iron:customer>
                <iron:id>${d["customer.id"] || ""}</iron:id>
                <iron:name>${d["customer.name"] || ""}</iron:name>
            </iron:customer>
            <iron:date>${d.date || ""}</iron:date>
            <iron:direction>${d.direction ?? 0}</iron:direction>
            <iron:humidity>0</iron:humidity>
            <iron:ignition>${d.ignition ?? false}</iron:ignition>
            <iron:latitude>${d.latitude ?? 0}</iron:latitude>
            <iron:longitude>${d.longitude ?? 0}</iron:longitude>
            <iron:odometer>${d.odometer ?? 0}</iron:odometer>
            <iron:serialNumber>${d.serialNumber ?? 1}</iron:serialNumber>
            <iron:shipment>0</iron:shipment>
            <iron:speed>${d.speed ?? 0}</iron:speed>
            <iron:temperature>${d.temperature ?? 0}</iron:temperature>
            <iron:vehicleType>${d.vehicleType || ""}</iron:vehicleType>
            <iron:vehicleBrand></iron:vehicleBrand>
            <iron:vehicleModel></iron:vehicleModel>
        </iron:Event>
    `).join("");
};

export const buildGPSAssetTrackingXML = (token, devices) => {
    const eventsXML = buildEventsXML(devices);

    return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:tem="http://tempuri.org/"
                      xmlns:iron="http://schemas.datacontract.org/2004/07/IronTracking">
       <soapenv:Header/>
       <soapenv:Body>
          <tem:GPSAssetTracking>
             <tem:token>${token}</tem:token>
             <tem:events>
                ${eventsXML}
             </tem:events>
          </tem:GPSAssetTracking>
       </soapenv:Body>
    </soapenv:Envelope>
    `;
};