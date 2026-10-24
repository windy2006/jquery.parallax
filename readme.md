整体描述：
--------
本插件对某一父元素下的所有一级子元素设置背景视差效果，并对该子元素下一级孙元素设定出现效果。

本插件可在 PC 或移动端使用，支持普通页面滚动和全屏容器滚动。

请参考：[演示页面](https://windy2006.github.io/jquery.parallax/)

调用条件：
--------
下载并复制 jquery.parallax.js 到网站目录，同时也需要事先准备好 jQuery 框架。

```html
<link href="/path/to/jquery.parallax.css" rel="stylesheet">
<script type="text/javascript" src="vendor/jquery-4.0.0.min.js"></script>
<script type="text/javascript" src="/path/to/jquery.parallax.js"></script>
```

调用方式：
--------
调用非常简单，只需向父元素执行parallax方法即可，如下：
```javascript
$(obj).parallax(opt);
```
其中opt为可选的设置项，默认为：
```javascript
{
    mode : 0,             //滚动响应模式：0 为正常模式，1 为全屏模式即每次滚动一个屏幕
    rate : 0.3,           //背景相对移动比例，1为与滚动条同步，0为完全静止
    effect : 'slide-up'   //孙元素呈现效果
}
```

个性设置：
--------
除了统一设置外，还需要在每个子元素中设置对应参数，如下：
- **data-bg** ： 子元素背景图，非必选项，但是为达到预期效果，长宽比尽可能小于1
- **data-rate** ： 非必选项，功能与统一设置中的 rate 参数相同
- **data-effect** ： 非必选项，功能与统一设置中的 effect 参数相同，该选项也可用于孙元素
- **data-func** ： 非必选项，可自定义孙元素的显示规则，插件默认有 show_1 和 show_2 两种方式，
                  用户也可以自定义自己的方法，该方法将传入两个参数，即：子元素 obj 和 显示效果 mode

显示效果：
--------
孙元素可用如下7种显示效果：
```
slide-up
slide-down
slide-right
slide-left,
flip-x
flip-y
zoom
```
如果定义为 random 或 rand 的话，会从以上效果中任意选取一种。

### 新增设置（2026-10-24）

`mode: 0` 普通页面滚动，`mode: 1` 全屏容器滚动（CSS Scroll Snap，支持滚轮与触控）。`repeat: false` 默认只播放一次；设为 true 时，元素完全滚出可视区域后再次进入会重播。示例顶部可直接切换，不改变原有内容。`offset` 为顶部工具栏高度。可重复调用 parallax(options) 更新配置，或调用 parallax('destroy') 清理。

## 2026-10-24 更新

保留原 jQuery 插件接口与样例主体，示例使用本地 jQuery 4.0.0、Bootstrap 5.3.8。`vendor/original-theme.css` 维持原示例的布局外观；上游许可证随依赖保留。

修复全屏滚动与重播同时开启时的内容偶发隐藏：根据未参与动画的区块边界判断进出，在滚动帧及吸附结束时更新状态，完全离开后才重置动画。保留原效果类型和自定义显示函数。

本地预览：在仓库目录运行 `python3 -m http.server 8765`，打开 http://localhost:8765/。

## 核心实现优化（2026-10-24）

具体修复、接口补充和兼容说明见 [CHANGELOG.md](CHANGELOG.md)。保留原演示主体与 CSS；[回归测试](tests/README.md) 可在本地运行。
