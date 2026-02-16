const { spawn, execSync } = require('child_process');

console.log('\n==================================================');
console.log('            UNIVERSAL WORLDWIDE ACCESS            ');
console.log('==================================================\n');

// Check if SSH is available
let hasSsh = false;
try {
    execSync('ssh -V', { stdio: 'ignore' });
    hasSsh = true;
} catch (e) {
    hasSsh = false;
}

if (hasSsh) {
    console.log('Detected SSH: Using Stable Secure Tunnel (Serveo/Pinggy)...');
    startSshTunnel();
} else {
    console.log('SSH Not Detected: Using Web-based Tunnel (LocalTunnel)...');
    startLocalTunnel();
}

/**
 * Method 1: SSH-based (Faster, No Password)
 */
function startSshTunnel() {
    const ssh = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', '-R', '80:localhost:3000', 'serveo.net']);

    const handleOutput = (data) => {
        const output = data.toString();
        if (output.includes('Forwarding HTTP traffic from')) {
            const urlMatch = output.match(/https?:\/\/[^\s]+/);
            if (urlMatch) {
                printSuccess(urlMatch[0], 'NO PASSWORD REQUIRED');
            }
        }
    };

    ssh.stdout.on('data', handleOutput);
    ssh.stderr.on('data', handleOutput);
}

/**
 * Method 2: LocalTunnel-based (Non-SSH Fallback)
 */
function startLocalTunnel() {
    console.log('Starting LocalTunnel... (Checking for tunnel password if needed)');
    const lt = spawn('npx', ['localtunnel', '--port', '3000']);

    lt.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('your url is:')) {
            const url = output.split('your url is:')[1].trim();
            printSuccess(url, 'MAY REQUIRE TUNNEL PASSWORD (Your IP)');
        }
    });

    lt.stderr.on('data', (data) => {
        console.error(data.toString());
    });
}

function printSuccess(url, note) {
    console.log('\n--------------------------------------------------');
    console.log(`>>> YOUR PATIENT LINK IS:  ${url}  <<<`);
    console.log('--------------------------------------------------');
    console.log(`NOTE: ${note}`);
    console.log('Keep this window OPEN & PC AWAKE.');
    console.log('--------------------------------------------------\n');
}
