'use strict';

const got = require('got');
const money = require('money');
const chalk = require('chalk');
const ora = require('ora');
const currencies = require('../lib/currencies.json'); //Json file pour recup les infos des valeurs de change

const {API} = require('./constants'); //API pour changer les valeurs entre les changes

const cash = async command => { //Asynch command pour attendre le résultats avant d'enchainer
	const {amount} = command;
	const from = command.from.toUpperCase(); 
	const to = command.to.filter(item => item !== from).map(item => item.toUpperCase());

	console.log();
	const loading = ora({ //Affiche le taux 
		text: 'Converting...',
		color: 'green',
		spinner: {
			interval: 150,
			frames: to
		}
	}); 

	loading.start();//Chargement de la data
	
	await got(API, { //Utilisation de l'API
		json: true
	}).then(response => {
		money.base = response.body.base;
		money.rates = response.body.rates;

		to.forEach(item => { //Boucle pour chaque change
			if (currencies[item]) { //Si on a l'information sur la currency de l'item alors on load l'item
				loading.succeed(`${chalk.green(money.convert(amount, {from, to: item}).toFixed(3))} ${`(${item})`} ${currencies[item]}`); //Convert amount from the base currency to the other currencies in the list
			} else { //Sinon on affiche qu'on a pas trouvé la currency
				loading.warn(`${chalk.yellow(`The "${item}" currency not found `)}`);
			}
		});

		console.log(chalk.underline.gray(`\nConversion of ${chalk.bold(from)} ${chalk.bold(amount)}`));
	}).catch(error => { //Prise en charge des erreurs
		if (error.code === 'ENOTFOUND') {
			loading.fail(chalk.red('Please check your internet connection!\n'));
		} else {
			loading.fail(chalk.red(`Internal server error :(\n${error}`));
		}
		process.exit(1);
	});
};

module.exports = cash; //Affiche module.exports
