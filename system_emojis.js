

var fs = require('fs');
fs.readFile('studylog.txt', 'utf8' , function (err, data) {
	if (err) {
		return console.log(err);
	}
	var arr = data.split("You will have up to 25 minutes");

	// total green, pre green, during green.
	// total purple. pre purple, during purple.
	// Total total, total pre, total during

	

	var preTask = arr[0].match(/adding_reaction/g).length;
	var duringTask = arr[1].match(/adding_reaction/g).length;

	console.log();
	if (data.match(/green.txt/g)) {
		console.log('Green Data');
	}
	if (data.match(/purple.txt/g)) {
		console.log('Purple Data');
	}
	console.log('Pre-task: ' + preTask);
	console.log('During-task: ' + duringTask);
	console.log('Total: ' + (preTask + duringTask));
	console.log();
	
});