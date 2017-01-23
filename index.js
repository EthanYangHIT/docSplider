const superAgent = require('superAgent');
const cheerio = require('cheerio');

const path = require('path');
const fs = require('fs');
const filePath = './download';

function log(name, msg) { //
    fs.appendFile('./log.log', name + ': ' + msg + '\r', function (err) {
        if (err) throw err;
    })
}

function getChapter(chapterName, href, callback) {
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, 0777, function (err) {
            if (err) throw err;
        });
    }
    superAgent.get(href).end(function (err, sres) {
        if (err) {
            console.log('err in load chapter: ' + chapterName + '  href: ' + href);
            log('log-err', 'err in load chapter: ' + chapterName + '  href: ' + href);
            throw err;
        }
        var $ = cheerio.load(sres.text, {decodeEntities: false});
        var content = $('#nr1').html().replace(/&nbsp;/g, ' ').replace(/<br>/g, '\n\r');
        var fileName = '赘婿.txt';
        fs.stat(filePath + '/' + fileName, function (err, stat) {
            if (stat && stat.isFile()) {
                fs.appendFile(filePath + '/' + fileName, content, function (err) {
                    if (err) {
                        log('log-err', 'err in write chapter： ' + chapterName + '  href: ' + href);
                        throw err
                    }
                    console.log('下载完成：' + chapterName);
                    log('log-download', '下载完成：' + chapterName);
                    callback();
                })
            } else {
                fs.writeFile(filePath + '/' + fileName, content, function (err) {
                    if (err) {
                        log('log-err', 'err in write chapter： ' + chapterName + '  href: ' + href);
                        throw err
                    }
                    console.log('下载完成：' + chapterName)
                    log('log-download', '下载完成：' + chapterName);
                    callback();
                });
            }
        });
    })
}

function start() {
    //模拟PC端请求
    var url = 'http://m.biquge.com/booklist/285.html';
    superAgent.get(url).set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36').end(function (err, sres) {
        if (err) throw err;
        var $ = cheerio.load(sres.text);
        var index = 0;
        var nodeList = $('ul.chapter a');
        var length = nodeList.length;

        function getNextChapter() {
            if (index == length) return;
            index++;
            var chapterName = $(nodeList[index]).text();
            var href = 'http://m.biquge.com' + $(nodeList[index]).attr('href');
            if (chapterName.indexOf('第') != -1 && chapterName.indexOf('章') != -1) {
                console.log('开始下载： ' + chapterName + '  url: ' + href);
                log('log-download', '开始下载： ' + chapterName + '  url: ' + href);
                getChapter(chapterName, href, getNextChapter);
            } else {
                getNextChapter();
            }
        }

        if (length) {
            getNextChapter();
        }
    })
}

start();