/******************************************
 * @name        多平台今日热搜
 * @description 整合常用热搜榜|随机（指定）热搜通知
 * @platforms   微博、知乎、微信、头条、抖音、百度、贴吧 bilibili、澎湃、36氪、少数派、财新、ZAKER、新京报、南方周末、科普中国、威锋网、起点小说、纵横小说、北美票房
 * @author      @Toperlock
 * @thanks      @Peng-YM、@𝒀𝒖𝒉𝒆𝒏𝒈、@deezertidal
 * @use         可通过BoxJS修改通知的热搜平台与显示的热搜数量
 * @update      2023.08.03
******************************************

BoxJS订阅地址：https://raw.githubusercontent.com/Toperlock/Quantumult/main/boxjs.json

[task_local]
30 6-23 * * * https://raw.githubusercontent.com/Toperlock/Quantumult/main/task/hotday.js, tag=今日热搜, img-url=https://raw.githubusercontent.com/Toperlock/Quantumult/main/icon/hot.png, enabled=true

******************************************/
const $ = API("今日热搜");

let platforms = [
  { name: '微博', tag: 'KqndgxeLl9' },
  { name: '知乎', tag: 'mproPpoq6O' },
  { name: '微信', tag: 'WnBe01o371' },
  { name: '头条', tag: 'x9ozB4KoXb' },
  { name: '抖音', tag: 'K7GdaMgdQy' },
  { name: '百度', tag: 'Jb0vmloB1G' },
  { name: '贴吧', tag: 'Om4ejxvxEN' },
  { name: '哔哩哔哩', tag: '74KvxwokxM' },
  { name: '澎湃', tag: 'wWmoO5Rd4E' },
  { name: '36氪', tag: 'Q1Vd5Ko85R' },
  { name: '少数派', tag: 'NaEdZZXdrO' },
  { name: '财新', tag: 'x9ozBY7oXb' },
  { name: 'ZAKER', tag: '5VaobJgoAj' },
  { name: '新京报', tag: 'YqoXQ8XvOD' },
  { name: '南方周末', tag: 'ENeYQBweY4' },
  { name: '科普中国', tag: 'DgeyxkwdZq' },
  { name: '威锋网', tag: 'n4qv90roaK' },
  { name: '起点小说', tag: 'VaobmGneAj' },
  { name: '纵横小说', tag: 'b0vmYyJvB1' },
  { name: '北美票房', tag: 'n6YoVPadZa' },
];
var platform = platforms[Math.floor(Math.random() * platforms.length)];
var platformName = $.read("#平台") || `${platform.name}`;
let New_platform = platforms.find(item => item.name === platformName);
const count = $.read("#条数") || 8;

const query_addr = `https://tophub.today/n/${New_platform.tag}`;

$.http.get({
  url: query_addr
})
  .then((response) => {
    const body = response.body;

    const hotSearchList = parseHotSearchList(body);
    const notificationTitle = `${New_platform.name}热榜`;
    const notificationSubtitle = '';
  
    let notificationContent = '';
    for (let i = 0; i < hotSearchList.length && i < count; i++) {
      const keyword = hotSearchList[i];
      notificationContent += `${i + 1}🔥${keyword}\n`;
    }
  
    $.notify(notificationTitle, '', notificationContent, {'open-url': query_addr});
  })
  .catch((error) => {
    $.notify("获取热榜失败", error, '');
  })
  .then(() => $.done());

function parseHotSearchList(html) {
  const regex = /<td class="al"><a href="\/l\?e=[^"]+"[^>]+>([^<]+)<\/a><\/td>\s+<td>([^<]*)<\/td>/g;
  const hotSearchList = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const keyword = match[1];
    hotSearchList.push(keyword);
  }

  return hotSearchList;
}


// prettier-ignore: https://github.com/Peng-YM/QuanX/blob/master/Tools/OpenAPI/README.md
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!t,i="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!i,isJSBox:i,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:i,isScriptable:n,isNode:o}=ENV(),r=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;const u={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(l=>u[l.toLowerCase()]=(u=>(function(u,l){l="string"==typeof l?{url:l}:l;const h=e.baseURL;h&&!r.test(l.url||"")&&(l.url=h?h+l.url:l.url);const a=(l={...e,...l}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...l.events};let f,d;if(c.onRequest(u,l),t)f=$task.fetch({method:u,...l});else if(s||i||o)f=new Promise((e,t)=>{(o?require("request"):$httpClient)[u.toLowerCase()](l,(s,i,n)=>{s?t(s):e({statusCode:i.status||i.statusCode,headers:i.headers,body:n})})});else if(n){const e=new Request(l.url);e.method=u,e.headers=l.headers,e.body=l.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const p=a?new Promise((e,t)=>{d=setTimeout(()=>(c.onTimeout(),t(`${u} URL: ${l.url} exceeds the timeout ${a} ms`)),a)}):null;return(p?Promise.race([p,f]).then(e=>(clearTimeout(d),e)):f).then(e=>c.onResponse(e))})(l,u))),u}function API(e="untitled",t=!1){const{isQX:s,isLoon:i,isSurge:n,isNode:o,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(o){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(i||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),o){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(i||n)&&$persistentStore.write(e,this.name),o&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||i)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);o&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||i?$persistentStore.read(e):s?$prefs.valueForKey(e):o?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||i)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);o&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",l="",h={}){const a=h["open-url"],c=h["media-url"];if(s&&$notify(e,t,l,h),n&&$notification.post(e,t,l+`${c?"\n多媒体:"+c:""}`,{url:a}),i){let s={};a&&(s.openUrl=a),c&&(s.mediaUrl=c),"{}"===JSON.stringify(s)?$notification.post(e,t,l):$notification.post(e,t,l,s)}if(o||u){const s=l+(a?`\n点击跳转: ${a}`:"")+(c?`\n多媒体: ${c}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||i||n?$done(e):o&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}
/*****************************************************************************/
