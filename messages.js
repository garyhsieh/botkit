

var fs = require('fs');
fs.readFile('studylog.txt', 'utf8' , function (err, data) {
	if (err) {
		return console.log(err);
	}
	var arr = data.split("You will have up to 25 minutes");

	// total green, pre green, during green.
	// total purple. pre purple, during purple.
	// Total total, total pre, total during

	var preGreen = arr[0].match(/U6C7E37NC/g).length;
	var duringGreen = arr[1].match(/U6C7E37NC/g).length;
	var totalGreen = preGreen + duringGreen;

	var prePurple = arr[0].match(/U6BGQK2P5/g).length;
	var duringPurple = arr[1].match(/U6BGQK2P5/g).length;
	var totalPurple = prePurple + duringPurple;

	var total = totalGreen + totalPurple;
	var totalPre = preGreen + prePurple;
	var totalDuring = duringGreen + duringPurple


	console.log();
	console.log('Total Green: ' + totalGreen + ' Pre-Green: ' + preGreen + ' During-Green: ' + duringGreen);
	console.log('Total-Purple: ' + totalPurple + ' Pre-Purple: ' + prePurple + ' During-Purple: ' + duringPurple);
	console.log('Total: ' + total + ' Total-Pre: ' + totalPre + ' Total-During: ' + totalDuring);
	console.log();
	
});