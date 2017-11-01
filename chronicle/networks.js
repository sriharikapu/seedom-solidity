const Web3 = require('web3');
const cli = require('./cli');
const net = require('net');
const h = require('./helper');

const jsonrpc = "2.0";

module.exports.getWeb3 = async (network) => {

    const web3 = createWeb3(network);
    const name = network.url ? network.url : 'test';
    if (await testWeb3(web3)) {
        cli.success("connected to %s network", name);
        return web3;
    }

    cli.error("could not connect to %s network", name);
    return null;

}

const createWeb3 = (network) => {

    let provider;

    if (!('url' in network)) {
        // assume local test; create web3 ipc provider
        provider = new Web3.providers.IpcProvider(h.parityIpcFile, net);
    } else {
        // use websocket; the next best thing to IPC (also http(s) is deprecated by web3)
        provider = new Web3.providers.WebsocketProvider(network.url);
    }

    return new Web3(provider);

}

const testWeb3 = async (web3) => {
    try {
        return await web3.eth.net.isListening();
    } catch (error) {
        return false;
    }
}

module.exports.destroyWeb3 = (web3) => {
    web3.currentProvider.connection.destroy();
}

module.exports.get = (networkName, networkConfig) => {

    if (!(networkName in networkConfig)) {
        cli.error("unable to find network name in network config");
        return null;
    }

    return networkConfig[networkName];

}

module.exports.providerCall = async (web3, method, args) => {

    const request = {
        jsonrpc: jsonrpc,
        method: method,
        id: new Date().getTime(),
        params: args
    };

    const result = await new Promise((fulfill, reject) => {
        web3.currentProvider.send(request, (error, result) => {
            if (error) reject(error)
            else fulfill(result);
        });
    });

    return result.result;

};