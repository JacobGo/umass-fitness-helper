// CRAWLING


// We use a cheerio, server based subset of jQuery to crawl data from the online UMass dining menu
// The goal is store a local database in the server and cache the data so as not to bother UMass IT too much.
var request = require('request');
var cheerio = require('cheerio');

var fs = require('fs');

var currMenu;

/*
request('UMASSMENUU', function (error, response, body) {
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
	var d = new Date()
	var dateString = (d.getMonth()+1) + "/" + d.getDate() + "/" + (1900 +d.getYear())
	
	var menu = {
		"date" : dateString,
		"meals" : {}
	};

	var $ = cheerio.load(fs.readFileSync('./menu.htm'));

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
	var d = new Date()
	var dateString = (d.getMonth()+1) + "/" + d.getDate() + "/" + (1900 +d.getYear())
	
	var tempMenu;
	fs.readFile('menu.json', 'utf8', function (err, data) {
  		if (err) throw err;
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


// MENU SELECTION

function getChoices(menu, numOfItems){

	var totals = {
		'carbs' : '0',
		'fat' : '0',
		'protein' : '0',
		'calories' : '0'
	}

	var items = {
		'item' : {}
	}

	if (numOfItems > Object.keys(menu.meals.breakfast_menu).length)
		numOfItems = Object.keys(menu.meals.breakfast_menu).length
	for (i = 0; i < numOfItems; i++){
		items.item[i] = menu.meals.breakfast_menu[i]
	}

	console.log(items)
	return items
}


// WEB SERVER


var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';

router.get("/",function(req,res){
  updateMenu()
  res.render('index', getChoices(currMenu, 10));
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



