//set requirments

const moment = require('moment');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const json2csv = require('json2csv');
//define varibles
const urlBase = 'http://shirts4mike.com/shirts.php';
const fields = ['title', 'price','imageURL' ,'url', 'shirtTime'];
const fieldNames = ['Title','Price','ImageURL','URL', 'Time' ];
let time = moment().format('YYYY[-]MM[-]DD');

let shirtURL = [];

let shirts =[]

let alarm = function (error) {
  console.log('There has been an error it is ' + error.message + ' Please try your request later.');
} //friendly error message
// function to get individual shirt pages pushed into array
request(urlBase, function(error, response, body){
  if(!error && response.statusCode === 200){
    let $ = cheerio.load(body);
    $('.products a').each( function() {
      url = 'http://shirts4Mike.com/' + $(this).attr('href');
      shirtURL.push(url);
    });
  } else {
    alarm(error);
  }

//scrape individual pages for required info

  for(let i =0; i < shirtURL.length; i++) {
    request(shirtURL[i], function(error, response, body){
      if(!error && response.statusCode === 200){
        let $ = cheerio.load(body);
        let shirt = {}
        shirt.title = $('title').text();
        shirt.price = $('.price').text();
        shirt.url = shirtURL[i];
        shirt.imageURL = $('.shirt-picture img').attr('src');
        shirt.shirtTime = moment().format('YYYY MMM DD hh:mm:ss')
        if (shirts.indexOf(shirt.url) == -1){
          shirts.push(shirt);
        }
      } else alarm(error);
//begin file write
      let dir = './data';

      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }

      json2csv({ data: shirts, fields: fields, fieldNames: fieldNames}, function(error, csv) {
        fs.writeFile(dir + '/'+ time + ".csv", csv, function(error) {
          if (error) alarm(error);
        });
      });
    });
  }
  console.log('File Saved in the ./data directory as csv with the name ' + time + '.csv');
});
