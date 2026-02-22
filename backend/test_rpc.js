const { Connection } = require('@solana/web3.js');
const rpc = 'https://api.devnet.solana.org';
const connection = new Connection(rpc);

async function test() {
    try {
        console.log('Connecting to:', rpc);
        const version = await connection.getVersion();
        console.log('Connection successful, version:', version);
        const blockhash = await connection.getLatestBlockhash();
        console.log('Latest blockhash:', blockhash.blockhash);
    } catch (e) {
        console.error('Connection failed:', e);
    }
}

test();
