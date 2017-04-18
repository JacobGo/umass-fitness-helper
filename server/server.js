// CRAWLING


// We use a cheerio, server based subset of jQuery to crawl data from the online UMass dining menu
// The goal is store a local database in the server and cache the data so as not to bother UMass IT too much.
var request = require('request');
var cheerio = require('cheerio');

// fs = FileSystem
var fs = require('fs');

// currMenu is a JSON representation of the UMass Dining Commons menu for Worcester DC
var currMenu;

// Below crawls the live website, replace UMASSMENU with the url to the menu.
/*
request('UMASSMENU', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(body);
    $('p').each(function (index, el) {
      console.log($(this).text());
    });
  }
  else {
  	console.log(error);
  }
});
*/

function crawlData(){
	// Add the date so we can check it later.
	var d = new Date()
	var dateString = (d.getMonth()+1) + "/" + d.getDate() + "/" + (1900 +d.getYear())
	
	var menu = {
		"date" : dateString,
		"meals" : {}
	};

	// Initialize the jQuery representation of the page, currently pointed locally.
	var $ = cheerio.load(fs.readFileSync('./menu.htm'));

	// Uses DOM elements to gather menu information.
	/* Creates a JSON object matching the following:
	menu = { date: '...',
  			 meals:
   				{ breakfast_menu:
		   			"0": {
			            "name": "...",
			            "serving": "...",
			            "calories": "...",
			            "fat": "...",
			            "protein": "...",
			            "carbs": "..."
			        },
			        ...
	*/
	$('.panel-container').children('div').each(function (indexMeal, meal){
		var mealName = $(meal).attr('id')
		menu.meals[mealName] = {}
		$(meal).children('div').children('.lightbox-nutrition').children('a').each(function (indexDish, dish) {
			var dishName = indexDish
			menu.meals[mealName][dishName] = {}
			menu.meals[mealName][dishName].name = $(dish).attr('data-dish-name')
			menu.meals[mealName][dishName].serving = $(dish).attr('data-serving-size')
			menu.meals[mealName][dishName].calories = $(dish).attr('data-calories');
			menu.meals[mealName][dishName].fat = $(dish).attr('data-total-fat');
			menu.meals[mealName][dishName].protein = $(dish).attr('data-protein');
			menu.meals[mealName][dishName].carbs = $(dish).attr('data-total-carb');
		});
	});

	currMenu = menu;
	writeToFile(menu);

};

function writeToFile(menu){
	json = JSON.stringify(menu)
	fs.writeFile('menu.json', json, 'utf8', function cb (){
	})
}

function updateMenu(){
	// We check the date to see if we need to crawl a new menu, updated daily by UMass.
	var d = new Date()
	var dateString = (d.getMonth()+1) + "/" + d.getDate() + "/" + (1900 +d.getYear())
	
	var tempMenu;
	if(fs.existsSync('menu.json')){
		console.log("")
		fs.readFile('menu.json', 'utf8', function (err, data) {
  		if (err) {
  			throw err;
  		}
  		tempMenu = JSON.parse(data);
  		if (!(tempMenu.date === dateString)){
  			console.log("Crawl again!")
			crawlData();
		}
		else {
			console.log("Loaded old menu")
			currMenu = tempMenu
		}
	});
	}
	else{
		console.log("File does not exist!")
		crawlData()
	}

}


// WEB SERVER


var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';

router.get("/",function(req,res){
  updateMenu()
  res.render('index', currMenu);
});

app.set('view engine', 'pug')

app.use(express.static('public'));

app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(8080,function(){
  updateMenu()
});



