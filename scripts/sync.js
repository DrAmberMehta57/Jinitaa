require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * DATABASE SYNC SCRIPT
 * Downloads the latest database from the web host and replaces the local one.
 */

const WEB_URL = process.env.WEB_APP_URL;
const SYNC_TOKEN = process.env.ADMIN_PASSWORD;
const DB_PATH = path.resolve(__dirname, '../clinic_data.db');

async function syncDatabase() {
    console.log('\n==================================================');
    console.log('           DATABASE SYNCHRONIZATION               ');
    console.log('==================================================\n');

    if (!WEB_URL) {
        console.error('Error: WEB_APP_URL not set in .env');
        console.log('Please add: WEB_APP_URL=https://your-site.onrender.com');
        return;
    }

    const exportUrl = `${WEB_URL}/admin/sync/export?token=${SYNC_TOKEN}`;

    console.log(`Connecting to: ${WEB_URL}...`);

    try {
        const response = await axios({
            method: 'get',
            url: exportUrl,
            responseType: 'stream'
        });

        console.log('Downloading latest database...');

        const writer = fs.createWriteStream(DB_PATH);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log('\nSUCCESS: Database synchronized successfully!');
                console.log(`Local database updated at: ${DB_PATH}`);
                console.log('--------------------------------------------------\n');
                resolve();
            });
            writer.on('error', (err) => {
                console.error('File Write Error:', err);
                reject(err);
            });
        });

    } catch (error) {
        console.error('\nSYNC FAILED:');
        if (error.response) {
            console.error(`Host returned error ${error.response.status}: ${error.response.statusText}`);
            if (error.response.status === 403) console.log('Check your ADMIN_PASSWORD in .env - it must match the server.');
        } else {
            console.error(error.message);
            console.log('Ensure your internet connection is active and the URL is correct.');
        }
    }
}

syncDatabase();
