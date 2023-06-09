/**************
脚本功能: 🏆BingSearch Task
作者:     @MCdasheng
设置每天10点整每10秒就执行，执行7分钟，确保刷满
请抓取bing cookie再开启任务！！！
这里只抓取大陆的cookie，只做大陆的任务
Reward cookie:  https://raw.githubusercontent.com/Toperlock/Quantumult/main/Rewrites/Scripts/bingPoint.cookie.js
Search cookie:  https://raw.githubusercontent.com/Toperlock/Quantumult/main/Rewrites/Scripts/bingSearch.cookie.js
BoxJs订阅地址:  https://raw.githubusercontent.com/MCdasheng/QuantumultX/main/mcdasheng.boxjs.json
注意事项:
  Bing每天只能在一个地区进行积分任务or搜索任务,注意配置分流
  Bing跨区执行任务可能导致积分无法兑换     (别乱换区啊，好几千积分兑换不了了555)
  Bing搜索任务刷新时间以做任务时间为准,24h后刷新,最好每天定时完成
**************/
/*
[task_local]
0-59/10 0-7 10 * * * https://raw.githubusercontent.com/Toperlock/Quantumult/main/task/bingSearch.js, tag=Bing签到, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png, enabled=false
*/

mbSearch();
pcSearch();

function mbSearch() {
  const mb_cookie = $prefs.valueForKey("bingSearchCookieMobileKey");
  console.log("mbSearching...");
  // console.log(mb_cookie);
  const rd = Math.random().toString(36).slice(-8);
  const url = `https://www.bing.com/search?q=${rd}&PC=OPALIOS&form=LWS001&ssp=1&cc=JP&setlang=zh-hans&darkschemeovr=0&safesearch=moderate`;
  const method = `GET`;
  const headers = {
    Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`,
    "Sapphire-DeviceType": `iPhone12`,
    Connection: `keep-alive`,
    "Accept-Encoding": `gzip, deflate, br`,
    "X-Search-ClientId": `7E00FB3699C442AB9F0F3DF7049AEE5D`,
    "Sapphire-Configuration": `Production`,
    "Sapphire-Market": `ja-jp`,
    "User-Agent": `Mozilla/5.0 (iPhone; CPU iPhone OS 16_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Mobile/15E148 Safari/605.1.15 BingSapphire/1.0.410308003`,
    "x-search-location": ``,
    Host: `www.bing.com`,
    "Sapphire-ApiVersion": `40`,
    "Accept-Language": `zh-CN,zh-Hans;q=0.9`,
    "Sapphire-OSVersion": `16.1`,
  };
  headers["Cookie"] = mb_cookie;
  const body = ``;

  const myRequest = {
    url: url,
    method: method,
    headers: headers,
    body: body,
  };

  $task.fetch(myRequest).then(
    (response) => {
      console.log("mb:" + response.statusCode + " " + rd);
      // $done();
    },
    (reason) => {
      console.log(reason.error);
      $done();
    }
  );
}

function pcSearch() {
  const pc_cookie = $prefs.valueForKey("bingSearchCookiePCKey");
  console.log("pcSearching...");
  // console.log(pc_cookie);
  const rd = Math.random().toString(36).slice(-8);
  const url = `https://www.bing.com/search?q=${rd}&PC=OPALIOS&form=LWS001&ssp=1&cc=JP&setlang=zh-hans&darkschemeovr=0&safesearch=moderate`;
  const method = `GET`;
  const headers = {
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.44",
  };
  headers["Cookie"] = pc_cookie;
  const body = ``;

  const myRequest = {
    url: url,
    method: method,
    headers: headers,
    body: body,
  };

  $task.fetch(myRequest).then(
    (response) => {
      console.log("pc:" + response.statusCode + " " + rd);
      $done();
    },
    (reason) => {
      console.log(reason.error);
      $done();
    }
  );
}
