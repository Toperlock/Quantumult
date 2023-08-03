/******************************************
 *转自https://raw.githubusercontent.com/RS0485/network-rules/main/scripts/gas-price.js
 *感谢 @Peng-YM, @Keywos
 *把'fujian'修改为其他地区拼音，支持省/市/区'fujian/fuzhou/gulou'
 *因为陕西和山西拼音一样，陕西需要改为"shanxi-3"
******************************************

BoxJs重写链接：https://raw.githubusercontent.com/chavyleung/scripts/master/box/rewrite/boxjs.rewrite.quanx.conf
BoxJs网址链接：https://boxjs.com 或者新版：https://dompling.github.io/boxjs.react
BoxJs订阅地址：https://raw.githubusercontent.com/Toperlock/Quantumult/main/boxjs.json

[task_local]
0 8 * * * https://raw.githubusercontent.com/Toperlock/Quantumult/main/task/oil_price.js, tag=今日油价, img-url=https://raw.githubusercontent.com/Toperlock/Quantumult/main/icon/oil.png, enabled=true
******************************************/

const $ = API("查询油价");
// 默认福建
var region = $.read("地区") || "fujian";

$.http.get({
    url: `http://m.qiyoujiage.com/${region}.shtml`,
    headers:{
        'referer': 'http://m.qiyoujiage.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    }
  })
    .then((response) => {
        const data = response.body;
        const reg_price = /<dl>[\s\S]+?<dt>(.*油)<\/dt>[\s\S]+?<dd>(.*)\(元\)<\/dd>/gm;
        var prices = [];
        var m = null;
        while ((m = reg_price.exec(data)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === reg_price.lastIndex) {
                reg_price.lastIndex++;
            }
            prices.push({
                name: m[1],
                value: `${m[2]} 元/L`
            });
        }
        
        var adjust_date = '';
        var adjust_trend = '';
        var adjust_value = '';
        
        const reg_adjust_tips = /<div class="tishi"> <span>(.*)<\/span><br\/>([\s\S]+?)<br\/>/;
        const adjust_tips_match = data.match(reg_adjust_tips);
        if (adjust_tips_match && adjust_tips_match.length === 3) {
            adjust_date = adjust_tips_match[1].split('价')[1].slice(0, -2);
            adjust_value = adjust_tips_match[2];
            adjust_trend = (adjust_value.indexOf('下调') > -1 || adjust_value.indexOf('下跌') > -1) ? '↓' : '↑';
            const adjust_value_re = /([\d\.]+)元\/升-([\d\.]+)元\/升/;
            const adjust_value_re2 = /[\d\.]+元\/吨/;
            const adjust_value_match = adjust_value.match(adjust_value_re);
            if (adjust_value_match && adjust_value_match.length === 3) {
                adjust_value = `${adjust_value_match[1]}-${adjust_value_match[2]}元/L`;
            } else {
                const adjust_value_match2 = adjust_value.match(adjust_value_re2);
                if (adjust_value_match2) {
                    adjust_value = adjust_value_match2[0];
                }
            }
        }
        
        const friendly_tips = `${adjust_date}调整\t${adjust_trend} ${adjust_value}`;
        if (prices.length !== 4) {
            console.log(`解析油价信息失败, URL=${query_addr}`);
            $.notify("油价查询", "解析失败", "请检查脚本或反馈给开发者")
        } else {
            const content = `${prices[0].name}\t\t\t${prices[0].value}\n${prices[1].name}\t\t\t${prices[1].value}\n${prices[2].name}\t\t\t${prices[2].value}\n${prices[3].name}\t\t\t${prices[3].value}`;
            $.notify("油价查询", `${friendly_tips}`, content);
            console.log("油价查询成功")
            //console.log(`油价查询结果：\n${friendly_tips}\n${content}`)
        }
    })
    .catch((error) => {
        console.log(`查询油价信息失败, URL=${query_addr}`);
        $.notify("油价查询", "请求失败", "请检查网络或反馈给开发者")
    })
    .then(() => $.done());

// prettier-ignore: https://github.com/Peng-YM/QuanX/blob/master/Tools/OpenAPI/README.md
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!t,i="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!i,isJSBox:i,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:i,isScriptable:n,isNode:o}=ENV(),r=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;const u={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(l=>u[l.toLowerCase()]=(u=>(function(u,l){l="string"==typeof l?{url:l}:l;const h=e.baseURL;h&&!r.test(l.url||"")&&(l.url=h?h+l.url:l.url);const a=(l={...e,...l}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...l.events};let f,d;if(c.onRequest(u,l),t)f=$task.fetch({method:u,...l});else if(s||i||o)f=new Promise((e,t)=>{(o?require("request"):$httpClient)[u.toLowerCase()](l,(s,i,n)=>{s?t(s):e({statusCode:i.status||i.statusCode,headers:i.headers,body:n})})});else if(n){const e=new Request(l.url);e.method=u,e.headers=l.headers,e.body=l.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const p=a?new Promise((e,t)=>{d=setTimeout(()=>(c.onTimeout(),t(`${u} URL: ${l.url} exceeds the timeout ${a} ms`)),a)}):null;return(p?Promise.race([p,f]).then(e=>(clearTimeout(d),e)):f).then(e=>c.onResponse(e))})(l,u))),u}function API(e="untitled",t=!1){const{isQX:s,isLoon:i,isSurge:n,isNode:o,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(o){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(i||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),o){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(i||n)&&$persistentStore.write(e,this.name),o&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||i)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);o&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||i?$persistentStore.read(e):s?$prefs.valueForKey(e):o?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||i)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);o&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",l="",h={}){const a=h["open-url"],c=h["media-url"];if(s&&$notify(e,t,l,h),n&&$notification.post(e,t,l+`${c?"\n多媒体:"+c:""}`,{url:a}),i){let s={};a&&(s.openUrl=a),c&&(s.mediaUrl=c),"{}"===JSON.stringify(s)?$notification.post(e,t,l):$notification.post(e,t,l,s)}if(o||u){const s=l+(a?`\n点击跳转: ${a}`:"")+(c?`\n多媒体: ${c}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||i||n?$done(e):o&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}
/*****************************************************************************/
