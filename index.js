const core = require('@actions/core');
const os = require('os');
const { execSync } = require('child_process');
const { mkdirSync, readFileSync, writeFileSync } = require('fs');

function exec(cmd) {
    console.info(`> ${cmd}`);
    execSync(cmd, { stdio: "inherit" });
}

try {
    const version = core.getInput('version');
    let platform = os.platform();
    console.log(`Installing foundationdb ${version} (${platform})!`);
    let base_url = `https://github.com/apple/foundationdb/releases/download/${version}`;
    switch (platform) {
        case 'linux': {
            let client_url = `${base_url}/foundationdb-clients_${version}-1_amd64.deb`;
            exec(`curl -L -O ${client_url}`);
            exec(`sudo dpkg -i foundationdb-clients_${version}-1_amd64.deb`);

            let server_url = `${base_url}/foundationdb-server_${version}-1_amd64.deb`;
            exec(`curl -L -O ${server_url}`);
            exec(`sudo dpkg -i foundationdb-server_${version}-1_amd64.deb`);
            break;
        }
        case 'darwin': {
            let arch = os.arch();
            console.log(`Detected architecture: ${arch}`); // Debug logging
            let arch_suffix = arch === 'arm64' ? 'arm64' : 'x86_64';
            console.log(`Architecture suffix: ${arch_suffix}`); // More debug logging
            let url = `${base_url}/FoundationDB-${version}_${arch_suffix}.pkg`;
            let pkg_name = `FoundationDB-${version}_${arch_suffix}.pkg`;

            exec(`curl -L -O ${url}`);
            exec(`sudo installer -pkg ${pkg_name} -target /`);
            break;
        }
        default:
            throw Error(`Unsupported OS platform: ${platform}. Supported options are linux and darwin.`
            + ` Check that this action is being used with either ubuntu-latest or macos-latest.`);
    }

} catch (error) {
    core.setFailed(error.message);
}
