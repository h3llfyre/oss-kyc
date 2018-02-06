module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "20581",
            gmoCns: "0x65877b114cb9230b74c90fb95d43cf2743476e8c"
        },
        production: {
            host: "localhost",
            port: 8545,
            network_id: "9449",
            gasPrice: 10000000000,
            gmoCns: "0x9148550103573a730535f95a01323a9fc3dc6aa0"
        }
    }
};
