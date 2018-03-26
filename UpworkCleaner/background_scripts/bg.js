console.log("My test BG");

// chrome.webRequest.onBeforeRequest.addListener(function (requestObj) {
//     // requestObj - объект запроса
//     console.log();
// }, {urls: ['https://www.upwork.com/ab/find-work/api/feeds/search']}, ['requestBody']);
//

chrome.webRequest.onBeforeRequest.addListener(function (requestObj) {
    // console.log('requestObj');
    // console.log(requestObj);
}, {urls: ['*://*/*']}, ['requestBody']);

( function() {
    // chrome.webRequest.onBeforeRequest.addListener(
    //     function(details) {
    //         console.log('onBeforeRequest', details);
    //     },
    //     {urls: ["http://www.beibei.com/"]},
    //     []
    // );
    //
    // chrome.webRequest.onCompleted.addListener(
    //     function(details) {
    //         console.log('onCompleted', details);
    //     },
    //     {urls: ["http://www.beibei.com/"]},
    //     []
    // );

})();