import {ipcMain} from 'electron'

const fs = require('fs');
const exec = require('child_process').exec
const spawn = require('child_process').spawn


// 主进程监听 窗口控制与值的返回
// global类似与process,node里面自带的,变量定义的时候就先定义到global里面去
export default function () {
  // ipcMain.on('pingCmd', (event, args) => {
  //   const pingCmd = spawn('ping', ['10.10.0.199', '/t'])
  //   pingCmd.stdout.on('data', data => {
  //     let data2 = iconv.decode(data, 'GBK')
  //     event.reply('getCmdResult', {data: data2, pid: pingCmd.pid})
  //   })
  //   pingCmd.stderr.on('data', err => {
  //     console.log(err)
  //   })
  //   pingCmd.on('close', code => {
  //     console.log(code)
  //   })
  // })

  // 主进程收到消息后,给子进程返回值
  ipcMain.on('test', (event) => {
    // cwd()当前执行node命令的文件夹地址
    event.returnValue = ""
  });

  // 导出本地数据 arg是表名
  ipcMain.on('exportLocalData', (event, arg) => {
    let cmdPath = process.cwd() + "\\static\\mongodb"
    let spawnObj = spawn('.\\bin\\mongoexport.exe', ['-h', 'localhost:27017', '-d', 'nipDb', '-c', arg, '-o', `.\\mustTable\\${arg}.json`], {cwd: cmdPath})
    spawnObj.stdout.on('data', function (chunk) {
      event.returnValue = ""
    })
    spawnObj.on('close', function (code) {
      console.log("导出成功")
      event.returnValue = ""
    })
  });

  // 往本地数据库导入东西
  ipcMain.on('importToLocalData', (event, arg) => {
    // G:\gs_books\8.0electron\electron_gyy\static\mongodb\exportData\1.json  arg{filePath,tableName}
    let cmdPath = process.cwd() + "\\static\\mongodb"
    let spawnObj = spawn('.\\bin\\mongoimport.exe', ['-h', 'localhost:27017', '-d', 'gs_db', '-c', arg.tableName, '--file', arg.filePath], {cwd: cmdPath})
    spawnObj.stdout.on('data', function (chunk) {
      console.log("没在成功打印,在子进程关闭那里打印的")
      event.returnValue = ""
    });
    // 失败
    spawnObj.stderr.on('data', (data) => {
      // console.log(data.toString());
    });
    // 子进程关闭
    spawnObj.on('close', function (code) {
      console.log("导入成功")
      event.returnValue = ""
    })
  });
  //dump并查询  由于在这边实现不了,放于子进程
  ipcMain.on('readDumpFile', (event) => {
    let cmdPath = process.cwd() + "\\static\\mongodb"
    let spawnObj = spawn('.\\bin\\mongodump.exe', ['-o', '.\\bin\\dump'], {cwd: cmdPath})
    // 成功
    spawnObj.stdout.on('data', function (chunk) {
      console.log(chunk)
    });
    // 失败
    spawnObj.stderr.on('data', (data) => {
      // console.log(data.toString());
    });
    // 子进程关闭
    spawnObj.on('close', function (code) {
      // 先dump成功再读
      let allFiles = readFileFunc(cmdPath + "\\bin\\dump")
      event.returnValue = allFiles
    })
  });


// 定义一个读dump文件夹里面读文件的方法
  // 文件夹为key,里面的元素为value
  let readFileFunc = (path) => {
    // 读出数据库dump里面的东西
    let folders = []
    let files = fs.readdirSync(path);
    // console.log(files)
    files.forEach(function (item, index) {
      if (item !== "gs_db") return
      let fileSons = fs.readdirSync(`${path}\\${item}`)
      let obj = {}
      obj[item] = fileSons
      folders.push(obj)
    })
    return folders;
  }
}

