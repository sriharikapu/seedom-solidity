const Web3 = require('web3');
const h = require('./helper');
const cli = require('./cli');
const deploy = require('./deployer');
const parity = require('./parity');

module.exports = async () => {

    const state = {};
    
    // first deploy (test network, no force, yes forget, and yes persist)
    state.deployer = await deployer.all(null, false, true, true);

    // make sure parity is running
    if ('parity' in state.deployer) {
        state.parity = state.deployer.parity;
    } else {
        state.parity = await parity.start();
    }

    cli.section("runner");

    cli.important("press ctl-c to end");

    // wait for ctl-c or for something to die on its own
    await state.parity.execution.closed;

}