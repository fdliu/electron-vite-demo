# electron-vite-vue
![image](/./public/electron.png)
🥳 Really simple `Electron` + `Vue` + `Vite` boilerplate.

```
下载：
git clone https://github.com/fdliu/electron-vite-demo.git

npm 下载依赖:
npm install

本地启动：
npm run dev

打包应用：
npm run build
```
## 目录

```diff
+ ├─┬ electron
+ │ ├─┬ main
+ │ │ └── index.ts    entry of Electron-Main
+ │ └─┬ preload
+ │   └── index.ts    entry of Preload-Scripts
  ├─┬ src
  │ └── main.ts       entry of Electron-Renderer
  ├── index.html
  ├── package.json
  └── vite.config.ts
```

```diff
# vite.config.ts

export default {
  plugins: [
-   // Use Node.js API in the Renderer-process
-   renderer({
-     nodeIntegration: true,
-   }),
  ],
}
```
