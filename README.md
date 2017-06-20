此demo来源于官网中 [Flowchart Angular1.x Version](https://jsplumbtoolkit.com/demos/toolkit/angular-1.x/index.html), [jsPlumb](https://jsplumbtoolkit.com/) 提供了社区版(免费)和 toolkit 版(收费版).

## Install
```shell
git clone https://github.com/gosongs/test_js_plumb.git
cd test_js_plumb
npm install
```

## 注意:
+ 示例代码中需要引用 `data.json` 中的数据, 不要直接打开 `index.html`, 可以通过 `http-server` 启动一个 http 服务;
  ```shell
  sudo npm install -g http-server
  cd test_js_plumb
  http-server
  # open browser: http://127.0.0.1:8080
  ```
+ jsPlumb 本身不依赖于jquery、bootstrap、font-awesome, 只作为演示需要;
+ 此项目使用到的 jsPlumb 库强行移除了版权检测的代码, 挺有意思的加密方法, 写了一篇文章分析一下: ;
+ **[鼓励大家使用正版, 尊重知识产权](https://jsplumbtoolkit.com/purchase)**;
