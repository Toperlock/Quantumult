var tlist = {
  1: ["中秋", "2022-09-10"],
  2: ["国庆", "2022-10-01"],
  3: ["元旦", "2023-01-01"],
  4: ["春节", "2023-01-22"],
  5: ["元宵", "2023-02-05"],
  6: ["清明", "2023-04-05"],
  7: ["劳动", "2023-05-01"],
  8: ["端午", "2023-06-22"],
  9: ["中秋", "2023-09-29"],
  10: ["国庆", "2023-10-01"],
  11: ["元旦", "2024-01-01"]
};

let tnow = new Date();
let tnowf =
  tnow.getFullYear() + "-" + (tnow.getMonth() + 1) + "-" + tnow.getDate();

function dateDiff(startDateString, endDateString) {
  var separator = "-";
  var startDates = startDateString.split(separator);
  var endDates = endDateString.split(separator);
  var startDate = new Date(startDates[0], startDates[1] - 1, startDates[2]);
  var endDate = new Date(endDates[0], endDates[1] - 1, endDates[2]);
  return parseInt((endDate - startDate) / 1000 / 60 / 60 / 24).toString();
}

function tnumcount(num) {
  let dnum = num;
  return dateDiff(tnowf, tlist[dnum][1]);
}

let nowlist = now();

function today(day) {
  let daythis = day;
  if (daythis == "0") {
    datenotice();
    return "🎉";
  } else {
    return daythis + "天";
  }
}

function datenotice() {
  if (
    $persistentStore.read("timecardpushed") != tlist[nowlist][1] &&
    tnow.getHours() >= 6
  ) {
    $persistentStore.write(tlist[nowlist][1], "timecardpushed");
    $notification.post(
      "假日祝福",
      "",
      "今天是" + tlist[nowlist][1] + "日 " + tlist[nowlist][0] + "   🎉"
    );
  } else if ($persistentStore.read("timecardpushed") == tlist[nowlist][1]) {
    //console.log("当日已通知");
  }
}

function icon_now(num) {
  if (num <= 7 && num > 3) {
    return "hare";
  } else if (num <= 3 && num > 0) {
    return "timer";
  } else if (num == 0) {
    return "gift";
  } else {
    return "tortoise";
  }
}

$task.fetch({}).then(response => {
    const notifyContent = tlist[nowlist][0] + ":" + today(tnumcount(nowlist)) + "," + tlist[Number(nowlist) + 1][0] + ":" + tnumcount(Number(nowlist) + 1) + "天," + tlist[Number(nowlist) + 2][0] + ":" + tnumcount(Number(nowlist) + 2) + "天";
    const title = title_random(tnumcount(Number(nowlist)));
    $notify("假日提醒", title, notifyContent);
    $done();
}, reason => {
    $notify("假日提醒", "请求失败");
    $done();
});

function now() {
  for (var i = 1; i <= Object.getOwnPropertyNames(tlist).length; i++) {
    if (Number(dateDiff(tnowf, tlist[i.toString()][1])) >= 0) {
      return i;
    }
  }
}

function title_random(num) {
  let r = Math.floor(Math.random() * 10) + 1;
  let dic = {
    1: "距离放假，还要摸鱼多少天？",
    2: "坚持住，就快放假啦！",
    3: "上班好累呀，下顿吃啥？",
    4: "努力，我还能加班24小时！",
    5: "今日宜：吃饭饭  忌：减肥",
    6: "躺平中，等放假",
    7: "只有摸鱼才是赚老板的钱",
    8: "一起摸鱼吧",
    9: "摸鱼中，期待下一个假日",
    10: "小乌龟慢慢爬"
  };
  return num == 0 ? "节日快乐，万事大吉" : dic[r];
}
