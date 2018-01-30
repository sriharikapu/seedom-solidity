## Dependencies
- NodeJS v8.6.0+
- Parity v1.8.7 (https://parity.io)

## Getting started
- Clone this repo
- Run `npm link` to install and link chronicle

## Chronicle commands
### `chronicle p|parity -f|--fresh -k|--kill`
start parity indefinitely (do this first)
### `chronicle c|compile -f|--force`
compiles all of the contracts
### `chronicle d|deploy [network=test] -f|--force`
deploys contracts to the network specified
### `chronicle t|test [...suites]`
runs the test suites (or all if none specified)
### `chronicle --help`
chronicle help and list of stages

# Notes

- Deployer is no more
- Move deployer logic to stager
- Stage decides whether or not to deploy
- Tests still work off stages