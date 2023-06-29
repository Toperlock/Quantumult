/*
 * 本脚本是假日倒计时，支持Surge(Panel,Cron),Stash(Tile,Cron),Loon,QuantumultX,Shadowrocket
 * @author: @zqzess, @GN006
 * 感谢@chavyleung提供的Env
 * 本地修改你想要的日期，或者自己建库
 * 可订阅BoxJS添加自定义日期 https://raw.githubusercontent.com/Toperlock/Quantumult/main/boxjs.json
 * 定时任务添加： 0 8 * * * https://raw.githubusercontent.com/Toperlock/Quantumult/main/task/TimeCard.js, tag=节假提醒, img-url=https://raw.githubusercontent.com/Toperlock/Quantumult/main/icon/date.png, enabled=true
 * 申明：部分函数方法来源于TimeCard.js，其原始作者@smartmimi
 */

const $ = new Env('DaysMatter', true)
let title = '📅 倒数日'
let url = 'https://raw.githubusercontent.com/zqzess/openApiData/main/calendar/cnholiday2.json'
let option = {
    url: url,
    headers: {}
}
let nowDate = new Date().toLocaleDateString()
let year = nowDate.split('/')[0]
// 各日期区分开方便日后区分放假通知与倒数日通知
let holidayData = $.getjson('@DaysMatter.holidayData', null) // 法定节假日，放假的那种
let daysData = [] // 节日集合，包含法定节假日，内置假日，用户假日（固定+浮动）
let userDays = $.getdata('@DaysMatter.userDays') // 用户固定假日
let userDaysName = $.getdata('@DaysMatter.userDaysName')
let userDays2 = $.getdata('@DaysMatter.userDays2') // 用户浮动假日
let userDaysName2 = $.getdata('@DaysMatter.userDaysName2')
let userDaysData = $.getjson('@DaysMatter.userDaysData', {'list': []}) // 备用变量
// 内置假日
let defaultDaysData =
    [
        {'date': '2023-5-14', 'name': '母亲节'},
        {'date': '2023-6-18', 'name': '父亲节'},
        {'date': '2023-8-22', 'name': '七夕'},
        {'date': '2023-12-24', 'name': '平安夜'},
        {'date': '2024-1-18', 'name': '腊八节'},
        {'date': '2024-2-2', 'name': '小年'},
        {'date': '2024-2-9', 'name': '除夕'}
    ]

let tnow = new Date()
let tnowf = tnow.getFullYear() + "-" + (tnow.getMonth() + 1) + "-" + tnow.getDate()
let dateDiffArray = []

startWork()

async function startWork() {
    await setHoliDayData()
    let nowlist = now();
    $.log('距离最近的节日：' + daysData[nowlist].name)
    let notifyContent = dateDiffArray[0].name + ":" + today(tnumCount(0)) + "," + dateDiffArray[Number(0) + Number(1)].name + ":" + tnumCount(Number(0) + Number(1)) + "天," + dateDiffArray[Number(0) + Number(2)].name + ":" + tnumCount(Number(0) + Number(2)) + "天"
    $.isSurge() ? body = {
        title: title_random(tnumCount(Number(0))),
        content: notifyContent,
        icon: icon_now(tnumCount(Number(0))),
        'icon-color': '#5AC8FA'
    } : body = {
        title: title_random(tnumCount(Number(0))),
        content: notifyContent,
        icon: icon_now(tnumCount(Number(0))),
        backgroundColor: '#339900'
    }
    $.msg(title, '', notifyContent)
    $.log('\n面板显示内容：\n' + notifyContent)
    $.isSurge || $.isStash ? $.done(body) : $.done()
}

async function setHoliDayData() {
    if (holidayData === null || holidayData.year !== year) {
        await $.http.get(option).then(function (response) {
            let jsonObj = JSON.parse(response.body)
            let result = jsonObj.data[0].holiday
            result.forEach(function (i) {
                if (i.year === year) {
                    holidayData = i
                    $.setjson(i, '@DaysMatter.holidayData')
                }
            })
        })
    }
    daysData = daysData.concat(holidayData.list) // 法定节假日并入假日集合
    let clearFlag = false
    // 如果用户填写了固定日期，就解析并入节日集合，如公历生日，每年都是一样的，所以填入月和日即可，3-1。会自动解析并加入当前年份
    if (userDays !== '' && userDays !== undefined && userDays !== null && userDaysName !== '' && userDaysName !== undefined && userDaysName !== null) {
        userDays = userDays.replace(/，/g, ',')
        userDaysName = userDaysName.replace(/，/g, ',')
        let userDaysArray = userDays.split(',')
        let userDaysNameArray = userDaysName.split(',')
        if (userDaysArray.length !== userDaysNameArray.length) {
            $.msg(title, '❌错误', '用户填写的固定日期和名称没有对应')
        } else {
            userDaysData = []
            for (let i in userDaysArray) {
                userDaysArray[i] = userDaysArray[i].replace(/\./g, '-').replace(/\//g, '-').replace(/。/g, '-').replace(/年/g, '-').replace(/月/g, '-').replace(/日/g, '').replace(/号/g, '')
                // 如果用户填写的是浮动日期，此处与下面的重复了，目前设计是浮动日期和固定日期分开填写，后期可视情况合并（删除下面）
                if (userDaysArray[i].split('-').length > 2) {
                    daysData.push({'date': userDaysArray[i], 'name': userDaysNameArray[i]})
                    userDaysData.push({'date': userDaysArray[i], 'name': userDaysNameArray[i]}) // 此变量备用
                } else if (userDaysArray[i].split('-').length === 2) { // 用户填写的是固定日期
                    daysData.push({'date': year + '-' + userDaysArray[i], 'name': userDaysNameArray[i]})
                    userDaysData.push({'date': year + '-' + userDaysArray[i], 'name': userDaysNameArray[i]}) // 此变量备用
                }
            }
            $.setjson(userDaysData, '@DaysMatter.userDaysData')
            clearFlag = true
        }
    }

    // 如果用户填写了浮动日期，如母亲节每年5月第二个星期日这种，需要填入年份2024-5-4
    if (userDays2 !== '' && userDays2 !== undefined && userDays2 !== null && userDaysName2 !== '' && userDaysName2 !== undefined && userDaysName2 !== null) {
        userDays2 = userDays2.replace(/，/g, ',')
        userDaysName2 = userDaysName2.replace(/，/g, ',')
        let userDaysArray = userDays2.split(',')
        let userDaysNameArray = userDaysName2.split(',')
        if (userDaysArray.length !== userDaysNameArray.length) {
            $.msg(title, '❌错误', '用户填写的浮动日期和名称没有对应')
        } else {
            if (!clearFlag) {
                userDaysData = []
            }
            for (let i in userDaysArray) {
                // 如果用户填写的是浮动日期
                userDaysArray[i] = userDaysArray[i].replace(/\./g, '-').replace(/\//g, '-').replace(/。/g, '-').replace(/年/g, '-').replace(/月/g, '-').replace(/日/g, '').replace(/号/g, '')
                console.log(userDaysArray[i])
                if (userDaysArray[i].split('-').length > 2) {
                    daysData.push({'date': userDaysArray[i], 'name': userDaysNameArray[i]})
                    userDaysData.push({'date': userDaysArray[i], 'name': userDaysNameArray[i]}) // 此变量备用
                }
            }
            $.setjson(userDaysData, '@DaysMatter.userDaysData')
        }
    }
    if (defaultDaysData.length > 0) {
        defaultDaysData.forEach(function (day){
            day.date = day.date.replace(/\./g, '-').replace(/\//g, '-').replace(/。/g, '-').replace(/年/g, '-').replace(/月/g, '-').replace(/日/g, '').replace(/号/g, '')
            if(day.date.split('-').length === 2)
            {
                day.date = year + '-' + day.date
            }
        })
        daysData = daysData.concat(defaultDaysData)
    }
    console.log('节日集合: ')
    daysData.forEach(function (i) {
        console.log(i)
    })
    // console.log(daysData)
}

/* 计算2个日期相差的天数，不包含今天，如：2016-12-13到2016-12-15，相差2天
 * @param startDateString
 * @param endDateString
 * @returns
 */
function dateDiff(startDateString, endDateString) {
    let separator = "-"; //日期分隔符
    let startDates = startDateString.split(separator);
    let endDates = endDateString.split(separator);
    let startDate = new Date(startDates[0], startDates[1] - 1, startDates[2]);
    let endDate = new Date(endDates[0], endDates[1] - 1, endDates[2]);
    return parseInt((endDate - startDate) / 1000 / 60 / 60 / 24).toString();
}

//计算输入序号对应的时间与现在的天数间隔
function tnumCount(num) {
    return dateDiff(tnowf, dateDiffArray[num].date);
}

//获取最接近的日期
function now() {
    let tmp = 400
    let res = 0
    for (let i = 0; i < daysData.length; i++) {
        let key = Number(dateDiff(tnowf, daysData[i].date))
        if (key >= 0) {
            dateDiffArray.push({'date': daysData[i].date, 'name': daysData[i].name, 'key': key})
        }
        if (key >= 0 && tmp > key) {
            // 上面的思路是对差值数组排序，选出最小值，即日期差最小
            tmp = key
            res = i
        }
    }
    dateDiffArray = mergeSort(dateDiffArray) // 对集合排序
    return res
}

// 归并排序，速度更快
function mergeSort(list) {
    const rec = arr => {
        if (arr.length === 1) return arr
        const mid = arr.length >> 1
        const left = arr.slice(0, mid)
        const right = arr.slice(mid)
        const arr1 = rec(left)
        const arr2 = rec(right)
        let i = 0, j = 0
        let res = []
        while (i < arr1.length && j < arr2.length) {
            if (arr1[i].key < arr2[j].key) {
                res.push(arr1[i++])
            } else {
                res.push(arr2[j++])
            }
        }
        if (i < arr1.length) res = res.concat(arr1.slice(i))
        if (j < arr2.length) res = res.concat(arr2.slice(j))
        return res
    }
    return rec(list)
}


function today(day) {
    let daythis = day;
    if (daythis === "0") {
        datenotice();
        return "🎉";
    } else {
        return daythis + "天";
    }
}

function datenotice() {
    if ($.getdata("@DaysMatter.DaysMatterPushed") !== dateDiffArray[0].date && tnow.getHours() >= 6) {
        $.setdata(dateDiffArray[0].date, "@DaysMatter.DaysMatterPushed");
        $.msg("假日祝福", "", "今天是" + dateDiffArray[0].date + "日 " + dateDiffArray[0].name + "   🎉")
    } else if ($.getdata("@DaysMatter.DaysMatterPushed") === dateDiffArray[0].date) {
        //console.log("当日已通知");
    }
}

//>图标依次切换乌龟、兔子、闹钟、礼品盒
function icon_now(num) {
    if (num <= 7 && num > 3) {
        return "hare"
    } else if (num <= 3 && num > 0) {
        return "timer"
    } else if (num === 0) {
        return "gift"
    } else {
        return "tortoise"
    }
}

function title_random(num) {
    let r = Math.floor((Math.random() * 10) + 1);
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
    return num === 0 ? "节日快乐，万事大吉" : dic[r]
}

// https://github.com/chavyleung/scripts/blob/master/Env.min.js
/*********************************** API *************************************/
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), a = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(a, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t) { let e = { "M+": (new Date).getMonth() + 1, "d+": (new Date).getDate(), "H+": (new Date).getHours(), "m+": (new Date).getMinutes(), "s+": (new Date).getSeconds(), "q+": Math.floor(((new Date).getMonth() + 3) / 3), S: (new Date).getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length))); for (let s in e) new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))); let h = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; h.push(e), s && h.push(s), i && h.push(i), console.log(h.join("\n")), this.logs = this.logs.concat(h) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
/*****************************************************************************/
