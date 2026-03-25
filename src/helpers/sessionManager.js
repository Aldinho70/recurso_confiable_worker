// helpers/sessionManager.js
import fs from 'fs';

const SESSION_PATH = './src/logs/vecfleet.log.json';

export const readSession = () => {
    const raw = fs.readFileSync(SESSION_PATH);
    return JSON.parse(raw);
};

export const writeSession = (data) => {
    fs.writeFileSync(SESSION_PATH, JSON.stringify(data, null, 2));
};
