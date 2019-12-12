/*var GroupOfModers = document.querySelector("#user-profile > div.profile-header.profile-header-special > div > div:nth-child(2) > div > span:nth-child(2)");
var stringGroupOfModers = GroupOfModers.innerHTML;
if (stringGroupOfModers.indexOf('Модератор основного раздела') != -1) {
    ;
}*/
//var UrlOfTopic = document.querySelector("#user-profile > div.profile-content > div.profile-tab-content > div > div.stream-container > ul > li:nth-child(1) > div > div.stream-item-header > div > p > a");

//var NameOfSection = document.querySelector(".search-results-list .meta a[href*="forums"]");
//let massive = document.querySelectorAll('.search-results-list .meta a[href*="forums/geroi-obschie-obsuzhdenija"]').map(a => a.innerHTML);

//let massive = [...document.querySelectorAll(`.search-results-list .meta a[href*="forums/obschie-voprosy-i-obsuzhdenija"]`)].map(a => a.innerHTML);
//document.getElementById("test").style.color = "#00FF00";

function upload (url) {
    return fetch(chrome.extension.getURL(url))
        .then ( function (response) { return response.text() })
        .then ( function (html) { 
        let doc = document.createElement('script');
        doc.innerHTML = html;
        
        document.head.append(doc);
    });
}

function getCategoryList (category) {
    let contentList = document.querySelectorAll('.page-container > ul.content-list > li'), result = {};

    console.log(`LOC: ${location.href}`, `CAT: ${category}`, `CONTENT_LIST: `, contentList);

    for (list of contentList) {
        let categoryName = list.querySelector('a[href*="category"]').innerHTML.trim();
        result[categoryName] = [...list.querySelectorAll('a[href*="forums/"]')].map(a => a.innerHTML.trim());
    }

    return category ? result[category] : result;
}
let massive = getCategoryList('Основной раздел');
if (massive.indexOf('Киберспорт') != -1) {
    alert("!!!");
}