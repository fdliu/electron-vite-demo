# electron-vite-vue
![image](/./public/electron.png)
桌面应用,含主窗口，三个子窗口，窗口间可以互相通信，含菜单栏，可配置，每个窗口相当一个浏览器的tab，窗口内容就是使用前端技术开发的网页内容。

🥳 技术栈： Electron + html + js + Vite，

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
