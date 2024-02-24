function fetchPostsFromLifeismoneyMultiplePages() {
  var baseUrl = "https://www.ptt.cc/bbs/Lifeismoney/index.html";
  var options = {
    "method": "get",
    "headers": {
      "Cookie": "over18=1"
    },
    "muteHttpExceptions": true
  };
  
  var pageCount = 2; // 抓取頁數
  var postsData = [];
  var currentPageUrl = baseUrl;

  for (var i = 0; i < pageCount; i++) {
    Logger.log("Fetching data from: " + currentPageUrl);
    
    var response = UrlFetchApp.fetch(currentPageUrl, options); // 抓取內容
    var content = response.getContentText();
    
    // 使用 Cheerio 分析網頁內容
    var $ = Cheerio.load(content);
  
    $('div.r-ent').each(function() {
      var title = $(this).find('.title a').text().trim();
      var link = "https://www.ptt.cc" + $(this).find('.title a').attr('href');
      var nrec = $(this).find('.nrec span').text().trim() || '0';
      var date = $(this).find('.meta .date').text().trim();

      postsData.push({ title, link, nrec, date });
    });

    // 獲取上一頁連結
    var prevPageLink = $('.btn-group-paging a').eq(1).attr('href');
    if (prevPageLink) {
      currentPageUrl = "https://www.ptt.cc" + prevPageLink;
    } else {
      break; // 如果没有上一頁，退出循環
    }
  }

  Logger.log("Total posts processed: " + postsData.length);
  writePostsToSheet(postsData); // 寫入 Sheets
}

function writePostsToSheet(postsData) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.clear(); //清空資料表
  sheet.appendRow(['標題', '連結', '推文數', '日期']);

  // 更改順序，其實沒啥用
  postsData.reverse().forEach(function(post) {
    sheet.appendRow([post.title, post.link, post.nrec, post.date]);
  });
  fetchLifeismoneyDataAndSendToLine();
  Logger.log("All posts written to sheet.");
}
