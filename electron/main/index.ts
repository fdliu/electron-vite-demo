import { app, BrowserWindow, shell, ipcMain, Menu, dialog, contextBridge,ipcRenderer } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import db from '../preload/lowdb'
import remote from '@electron/remote/main'
let win: BrowserWindow | null = null
let onewin: BrowserWindow | null = null
let twowin: BrowserWindow | null = null
let threewin: BrowserWindow | null = null
let mainwindowState: object = {}
let mainState = getMainWindowStatus();
let aState = getAWindowStatus();
let bState = getBWindowStatus();
let cState = getCWindowStatus();
//菜单数组
const menuTemplate = [
  {
    label: "打开子窗口",
    click() {
      aWindowSetting()
      bWindowSetting()
      cWindowSetting()
    }
  },
  {
    label: "保存窗口布局",
    click() {
      savesetting()
    }
  },
  {
    label: "关闭所有子窗口",
    click() {
      closeAllChildWindow()
    }
  }
]

remote.initialize()
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST
process.env.CHILDPATH = process.env.VITE_DEV_SERVER_URL
? join(process.env.DIST_ELECTRON, '../src')
: process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

//创建主窗口
async function createWindow() {
  //获取窗口数据
  mainState = getMainWindowStatus();
  win = new BrowserWindow({
    title: 'Main window（主）',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    x: mainState['x'] || 200,
    y: mainState['y']|| 300,
    width: mainState['width']|| 1000,
    height: mainState['height'] || 800,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
  })
  remote.enable(win.webContents)

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    if(mainwindowState && mainwindowState['manage']){
      mainwindowState['manage'](win)
    }
    win.loadURL(url)
    // Open devTool if the app is not packaged
    // win.webContents.openDevTools()
  } else {
    if(mainwindowState && mainwindowState['manage']){
      mainwindowState['manage'](win)
    }
    win.loadFile(indexHtml)
    // win.webContents.openDevTools()
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  win.on("will-move", (e) => {
    win.webContents.send('updateMain', getStatus(win));
  })
  win.on("moved", (e) => {
    win.webContents.send('updateMain', getStatus(win));
  })
  win.on("resize", (e) => {
    win.webContents.send('updateMain', getStatus(win));
  })

  // 子窗口1发送过来的数据
  ipcMain.on("message", (event, title) => {
    win.webContents.send('getChildMessage', title);
  });
  // 子窗口2发送过来的数据
  ipcMain.on("message2", (event, title) => {
    win.webContents.send('getChildMessage2', title);
  });
  // 子窗口3发送过来的数据
  ipcMain.on("message3", (event, title) => {
    win.webContents.send('getChildMessage3', title);
  }); 
  
  // 主窗口关闭
  win&&win.on("close", () => {
    onewin&&onewin.close()
    twowin&&twowin.close()
    threewin&&threewin.close()
    win = null
    onewin = null
    twowin = null
    threewin = null
  }); 
  win&&win.webContents.send('updateMain', getStatus(win));
  win.webContents.send('setPath', db.lowdbPath);
}
//应用启动加载
app.whenReady().then(()=>{
  // app.commandLine.appendSwitch( "ignore-certificate-errors");
  //创建主进程窗口
  createWindow()
  //重新初始化菜单
  createMenu()
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

//定义菜单
function createMenu() {
  //macos系统
  if (process.platform === 'darwin'){
    let templates = [{
      label:'Electron',
      submenu: [{
          role: "about"
        },{
        role:"quit"
      }]
    }]
    const menu = Menu.buildFromTemplate(templates);
    Menu.setApplicationMenu(menu);
  }else {
    //windows，linux系统
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
  }
}
//保存布局
function savesetting() {
  setMainWindowStatus()
  setAWindowStatus()
  setBWindowStatus()
  setCWindowStatus()
  dialog.showMessageBox(win,{message:"保存成功!",title:"提示"})
}
//关闭所有子窗口
function closeAllChildWindow(){
  onewin&&onewin.close()
  twowin&&twowin.close()
  threewin&&threewin.close()
  onewin = null;
  twowin = null;
  threewin = null;
}
//子窗口a
function aWindowSetting(){
  if (!onewin) {
      //获取窗口数据
      aState = getAWindowStatus();
      onewin = new BrowserWindow({
        title:"子窗口1",
        x: aState['x'] || 300,
        y: aState['y']|| 400,
        width: aState['width']|| 800,
        height: aState['height'] || 800,
        autoHideMenuBar : true,
        // parent: win,
        icon: join(process.env.PUBLIC, 'favicon.ico'),
        webPreferences: {
          webSecurity: false,
          nodeIntegration: true, //f开node集成
          contextIsolation: false, //打开上下文隔离
        }
      })
    win.webContents.send('update', getStatus(onewin));
  }
  onewin && onewin.loadFile('./src/a.html')
  onewin && onewin.on("close", ()=>{
    onewin = null;
  })
  // onewin.webContents.openDevTools()
  onewin.on("will-move", (e) => {
    win.webContents.send('update', getStatus(onewin));
  })
  onewin.on("moved", (e) => {
    win.webContents.send('update', getStatus(onewin));
  })
  onewin.on("resize", (e) => {
    win.webContents.send('update', getStatus(onewin));
  })
  // 子窗口1发送过来的数据
  ipcMain.on("mainMess", (event, msg) => {
    onewin&&onewin.webContents.send('messageFromMain', msg);
  });
}
function getStatus(W){
  const winPosition = W!.getPosition();
  const winSize = W!.getSize();
  return {
    x: winPosition[0],
    y: winPosition[1],
    width: winSize[0],
    height: winSize[1],
  }
}
//子窗口b
function bWindowSetting(){
  if (!twowin) {
    //获取窗口数据
    bState = getBWindowStatus();
    twowin = new BrowserWindow({
      title:"子窗口2",
      x: bState['x'] || 500,
      y: bState['y']|| 600,
      width: bState['width']|| 800,
      height: bState['height'] || 800,
      autoHideMenuBar : true,
      // parent: win, //是否关联父窗口
      icon: join(process.env.PUBLIC, 'favicon.ico'),
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true, //f开node集成
        contextIsolation: false, //打开上下文隔离
      }
    })
    win.webContents.send('update2', getStatus(twowin));
  }
  twowin && twowin.loadFile('./src/b.html')
  twowin && twowin.on("close", ()=>{
    twowin = null;
  })
  twowin.on("will-move", (e) => {
    win.webContents.send('update2', getStatus(twowin));
  })
  twowin.on("moved", (e) => {
    win.webContents.send('update2', getStatus(twowin));
  })
  twowin.on("resize", (e) => {
    win.webContents.send('update2', getStatus(twowin));
  })
  // 子窗口1发送过来的数据
  ipcMain.on("getChild1", (event, title) => {
    twowin&&twowin.webContents.send('messageFrom1', title);
  });
}
//子窗口c
function cWindowSetting(){
  if (!threewin) {
    //获取窗口数据
    cState = getCWindowStatus();
    threewin = new BrowserWindow({
      title:"子窗口3",
      x: cState['x'] || 700,
      y: cState['y']|| 800,
      width: cState['width']|| 800,
      height: cState['height'] || 800,
      autoHideMenuBar : true,
      // parent: win,
      icon: join(process.env.PUBLIC, 'favicon.ico'),
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true, //f开node集成
        contextIsolation: false, //打开上下文隔离
      }
    })
    win.webContents.send('update3', getStatus(threewin));
  }
  threewin && threewin.loadFile('./src/c.html')
  threewin && threewin.on("close", ()=>{
    threewin = null;
  })
  threewin.on("will-move", (e) => {
    win.webContents.send('update3', getStatus(threewin));
  })
  threewin.on("moved", (e) => {
    win.webContents.send('update3', getStatus(threewin));
  })
  threewin.on("resize", (e) => {
    win.webContents.send('update3', getStatus(threewin));
  })
  // 子窗口1发送过来的关闭消息
  ipcMain.on("closeTheWindow3", (event, mse) => {
    if(mse === "close"){
      threewin&&threewin.close()
      threewin = null;
    }
  });
}

//获取主窗口数据
function getMainWindowStatus(){
  let mData = db.read().get('mainWindowState');
  return mData&&mData.value()?mData.value():{};
}
//设置主窗口数据
function setMainWindowStatus(){
  if(win){
    const posi = win.getPosition();
    const size = win.getSize();
    db.set('mainWindowState',{
      x: posi[0],
      y: posi[1],
      width: size[0],
      height: size[1],
    }).write()
  }
}

//获取子窗口A数据
function getAWindowStatus(){
  let aData = db.read().get('awindowState');
  return aData&&aData.value()?aData.value():{};
}
//设置子窗口A数据
function setAWindowStatus(){
  if(onewin){
    const posi = onewin.getPosition();
    const size = onewin.getSize();
    db.set('awindowState',{
      x: posi[0],
      y: posi[1],
      width: size[0],
      height: size[1],
    }).write()
  }
}

//获取子窗口B数据
function getBWindowStatus(){
  let bData = db.read().get('bwindowState');
  return bData&&bData.value()?bData.value():{};
}
//设置子窗口B数据
function setBWindowStatus(){
  if(twowin){
    const posi = twowin.getPosition();
    const size = twowin.getSize();
    db.set('bwindowState',{
      x: posi[0],
      y: posi[1],
      width: size[0],
      height: size[1],
    }).write()
  }
}

//获取子窗口C数据
function getCWindowStatus(){
  let cData = db.read().get('cwindowState');
  return cData&&cData.value()?cData.value():{};
}
//设置子窗口C数据
function setCWindowStatus(){
  if(threewin){
    const posi = threewin.getPosition();
    const size = threewin.getSize();
    db.set('cwindowState',{
      x: posi[0],
      y: posi[1],
      width: size[0],
      height: size[1],
    }).write()
  }
}