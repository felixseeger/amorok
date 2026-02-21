import dotenv from 'dotenv';
import ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, '..');
const buildDir = path.join(__dirname, '../dist');

async function deploy() {
    console.log('Building project (includes all files from public/)...');
    execSync('npm run build', { cwd: appDir, stdio: 'inherit' });
    console.log('Build complete. Uploading to FTP...\n');
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        });

        console.log('Connected to FTP server');

        const remoteDir = '/'; // Target root directory

        // Ensure remote directory exists
        // await client.ensureDir(remoteDir);
        // await client.clearWorkingDir(); 

        console.log(`Uploading files from ${buildDir} to ${remoteDir}`);
        await client.uploadFromDir(buildDir, remoteDir);

        console.log('Deployment complete!');
    } catch (err) {
        console.error('Deployment failed:', err);
        process.exit(1);
    } finally {
        client.close();
    }
}

deploy();
