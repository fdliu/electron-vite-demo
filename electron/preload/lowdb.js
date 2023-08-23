// const low = require('lowdb')
// const FileSync = require('lowdb/adapters/FileSync')
// import LodashId from 'lodash-id'
// import { app } from 'electron'
// import path from 'path'
// const APP = process.type === 'renderer' ? app : app 
// const STORE_PATH = APP.getPath('userData') 
// const adapter =  new FileSync(path.join(STORE_PATH, '/data.json')) 
// const db = low(adapter)
// db._.mixin(LodashId)

// export default db;

import Datastore from 'lowdb'
import LodashId from 'lodash-id'
import FileSync from 'lowdb/adapters/FileSync'
import path from 'path'
import fs from 'fs-extra'
import { remote, app } from 'electron'

const APP = process.type === 'renderer' ? remote.app : app
const STORE_PATH = APP.getPath('userData')

if (process.type !== 'renderer') {
  if (!fs.pathExistsSync(STORE_PATH)) {
    fs.mkdirpSync(STORE_PATH)
  }
}
console.log("STORE_PATH---",STORE_PATH)
const adapter = new FileSync(path.join(STORE_PATH, '/data.json'))
const db = Datastore(adapter)
db._.mixin(LodashId)
//保存文件路径
db['lowdbPath'] = `${STORE_PATH}\\data.json`

// if (!db.has('uploaded').value()) {
//   db.set('uploaded', []).write()
// }

// if (!db.has('picBed').value()) {
//   db.set('picBed', {
//     current: 'weibo'
//   }).write()
// }

// if (!db.has('shortKey').value()) {
//   db.set('shortKey', {
//     upload: 'CommandOrControl+Shift+P'
//   }).write()
// }

export default db