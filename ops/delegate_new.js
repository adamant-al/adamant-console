/*

*/
const keys = require('../helpers/keys.js');
const constants = require('../helpers/constants.js')
const transactionFormer = require('../helpers/transactionFormer.js')
const config = require('../helpers/configReader.js')
const popsicle = require('popsicle')
module.exports=function (vorpal) {
    return vorpal.command('delegate new <input>').description('Registers new delegate name for current wallet').action(function(args, callback) {
    	var delegate_name = args.input
		var keypair = keys.createKeypairFromPassPhrase(config.getConfig().passPhrase)
    	var data = {type: constants.transactionTypes.DELEGATE, keyPair: keypair, username: delegate_name}
    	var transaction = transactionFormer.createTransaction(data.type, data);
    	var self = this
        popsicle.request({
            method: 'POST',
            url: config.getNodeConnectString()+'/api/delegates',
            body: transaction
        }).then(function (res) {
            self.log(JSON.stringify(JSON.parse(res.body),null,4))
            callback()
        })
    });
};