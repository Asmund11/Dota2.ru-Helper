function upload (url) {
    return fetch(chrome.extension.getURL(url))
        .then ( function (response) { return response.text() })
        .then ( function (html) { 
        let doc = document.createElement('script');
        doc.innerHTML = html;
        
        document.head.append(doc);
    });
}
upload('scrypt.js');
