function fetchLifeismoneyDataAndSendToLine() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var range = sheet.getDataRange(); 
  var values = range.getValues(); 
  
  // 取得今天日期並轉換為 YYYY/MM/DD 格式
  var today = new Date();
  today = Utilities.formatDate(today, Session.getScriptTimeZone(), "yyyy/MM/dd");
  
  var newsItems = values.slice(1).map(function(row) { 
    // 格式化 Sheet 中的日期為 YYYY/MM/DD
    var sheetDate = Utilities.formatDate(new Date(row[3]), Session.getScriptTimeZone(), "yyyy/MM/dd");
    return {
      date: sheetDate,
      title: row[0],
      url: row[1],
      nrec: row[2]
    };
  });
  
  var filteredLifeismoneyItems = newsItems.filter(function(newsItem) {
    var nrec = String(newsItem.nrec).toUpperCase(); // 將 nrec 轉換為字串並轉換為大寫
    // 比較日期
    return (nrec === "爆" || parseInt(nrec) > 20 || nrec.startsWith("X")) && (newsItem.date === today);
  });

  if (filteredLifeismoneyItems.length > 0) {
    sendTodaysLifeismoneyToLine(filteredLifeismoneyItems);
  } else {
    Logger.log("没有符合條件的省錢資訊。");
  }
}



function sendTodaysLifeismoneyToLine(filteredLifeismoneyItems) {
  var message = "省錢資訊:\n\n"; 
  filteredLifeismoneyItems.forEach(function(lifeismoneyItem) {
    message += `${lifeismoneyItem.date} | ${lifeismoneyItem.title}\n${lifeismoneyItem.url}\n推文數: ${lifeismoneyItem.nrec}\n\n`;
  });

  var token1 = ""; //  LINE Token

  sendLine(message, token1);
}

function sendLine(message, token) {
  var options = {
    'method': 'post',
    'headers': {
      'Authorization': 'Bearer ' + token
    },
    'payload': {
      'message': message
    },
    'muteHttpExceptions': true
  };

  // 送請求到LINE通知API
  var response = UrlFetchApp.fetch('https://notify-api.line.me/api/notify', options);
  Logger.log(response.getContentText()); // 列印出內容，是否有連結
}
