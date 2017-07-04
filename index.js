const fetchUrl = require('fetch').fetchUrl;
const _ = require('lodash');
const request = require('sync-request');

const instapaperConfig = {
  'username' : 'sfai05@gmail.com',
  'password' : ''
}

// columnid : In list view ( e.g. http://hk.apple.nextmedia.com/apple/index/15537405 ) search for 'columnid'
// secid : In post view ( e.g. http://hk.apple.nextmedia.com/financeestate/art/20170625/20067492 ) search for 'sec_id' 
const columns = [
  {
    'name': '梧桐河畔',
    'columnid' : '11007374',
    'secid' : '12187389'
  },
  {
    'name': '黃金冒險號',
    'columnid' : '3530509',
    'secid' : '12187389'
  },
  {
    'name': 'What we are reading',
    'columnid' : '15537405',
    'secid' : '15307'
  },
  {
    'name': '征服英語',
    'columnid' : '2459955',
    'secid' : '12187389'
  },
  {
    'name': '黑客思維',
    'columnid' : '16635689',
    'secid' : '15307'
  },
  {
    'name': '草草不工',
    'columnid' : '256',
    'secid' : '12187389'
  },
  {
    'name': '普通讀者',
    'columnid' : '16635645',
    'secid' : '12187389'
  }
];

// 'ALL' / 'TODAY'
const mode = 'TODAY';

for (let column of columns) {
  // construct column list
  var columnUrl = 'http://hk.apple.nextmedia.com/supplement/columnistcolumnartlistpaging/' + column.columnid + '/1/0';
  fetchUrl(columnUrl, function(error, meta, body){
    console.log('Fetching ' + column.name + '...' );
    // get all links in the html
    var matches = [];
    body.toString().replace(/[^<]*(<a href="([^"]+)">([^<]+)<\/a>)/g, function () {
      matches.push(arguments[2]);
    });
    var links = _.uniq(matches);
    // the second is always the user profile
    delete links[1];
    links = _.compact(links);
    for (let link of links) {
      // check if today articles
      var today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      var linkComp = link.split('/');
      if( mode == 'ALL' || today == linkComp[7]){
        pushToInstapaper(link, column);
      }
    }
  });
}

// Use Instapaper simple API
// https://www.instapaper.com/api/simple
function pushToInstapaper(link, column) {
  var linkComp = link.split('/');
  if( !linkComp[7] || !linkComp[8] )
    return console.log('Unknown URL schema');
  var articleType = 'apple_sub';
  // depends on sec, the link structure is different
  if ( column.secid == '15307' )
    articleType = 'apple';
  // constructure the article links that used backend rendering
  var articleLink = 'http://s.nextmedia.com/' + articleType + '/a.php?i=' + linkComp[7] + '&sec_id=' + column.secid + '&a=' + linkComp[8];
  console.log('Article pushing to Instapaper...');
  return request('GET', 'http://www.instapaper.com/api/add?username=' + instapaperConfig.username + '&password=' + instapaperConfig.password + '&url=' + encodeURIComponent(articleLink) );
}
