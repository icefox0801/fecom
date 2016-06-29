# fecom
A magic component management tool

[![Build Status](https://travis-ci.org/icefox0801/fecom.svg?branch=master)](https://travis-ci.org/icefox0801/fecom)
[![Build status](https://ci.appveyor.com/api/projects/status/3relf1c4ns7xs6s8?svg=true)](https://ci.appveyor.com/project/icefox0801/fecom)
[![Coverage Status](https://coveralls.io/repos/github/icefox0801/fecom/badge.svg?branch=master)](https://coveralls.io/github/icefox0801/fecom?branch=master)
[![Dependency Status](https://david-dm.org/icefox0801/fecom.svg)](https://david-dm.org/icefox0801/fecom)

---
## 简介
`fecom`是依托于[Gitlab](https://about.gitlab.com/)的组件管理工具，只需要满足下面条件，就可以通过`fecom`管理组件：

+ 对`fecom`进行正确配置
+ 组件中包含`component.json`配置文件
+ 组件中有与版本相对应的`tag`

组件示例可以参考：[https://gitlab.com/u/icefox0801/projects](https://gitlab.com/u/icefox0801/projects)

## 安装
```sh
npm install -g fecom
```

## 配置
首次执行`fecom`命令，会提示输入`用户名`、`邮箱`和`Gitlab Token`
```sh
icefox@icefoxmac:~ $ fecom
11:55:51 INFO  用户配置文件未找到，初始化"~/.fecomrc"
? 请输入您的用户名: icefox0801
? 请输入您的邮箱: icefox0801@hotmail.com
? 请输入您的Gitlab token: ********************
11:56:06 INFO  完成初始化用户配置文件
```
输入以上信息后，用户信息会被保存到`~/.fecomrc`文件中，以后每次执行`fecom`会读取`~/.fecomrc`中的用户配置

除此之外，还需要配置`Gitlab`的`API`地址和默认组件所属的用户/组。例如，`Gitlab`的地址为`https://gitlab.exaplem.com`，默认组件的仓库都放下`fe-group`下，那么还需执行：
```sh
icefox@icefoxmac:~ $ fecom p -d "domain=https://gitlab.example.com&owner=fe-group"
```

## 用法
  Usage: fecom [options]


  Commands:

    init [options]                         初始化组件
    install|i [options] [component...]     安装组件
    uninstall|un [options] <component...>  卸载组件
    list|ls [options] [component...]       列出组件版本
    info <component>                       显示组件的详细信息
    link [component]                       链接组件
    search|s [options] <pattern>           搜索组件
    profile|p [options] [query]            管理用户配置
    tree|t [options] [component...]        打印组件依赖树
    version|v [options] [releaseType]      组件版本更新
    update|u [component...]                更新组件

  A magic component management tool

  Options:

    -h, --help  output usage information

## component.json
`component.json`配置文件可能存在于项目或者组件中，在不同的应用场景，并非所有的配置项都有用，请酌情进行配置！

+ `name`: 名称，请和[Gitlab](https://about.gitlab.com/)项目名称保持一致
+ `description`: 描述，请用简洁的语言描述项目或者组件
+ `version`: 版本号，**仅适用于组件**
+ `dependencies`: 依赖的组件
+ `dir`: 组件安装的目录，**仅适用于项目**
+ `author`: 组件作者信息
+ `main`: 入口文件，**仅适用于组件**
+ `exclude`: 安装时排除的文件和目录，仅适用于组件，配置规则可以参考[node-glob](https://github.com/isaacs/node-glob)

`fecom`的默认配置项：
+ `name`: 执行`fecom`命令的目录
+ `dir`: `components`
+ `owner`: `fecom-fe`
+ `domain`: `http://gitlab.58corp.com`

综上所述：

+ 项目应该配置的项有`name`、`description`、`dir`、`dependencies`、`author`
+ 组件应该配置的项有`name`、`description`、`version`、`main`、`author`、`dependencies`、`exclude`

## 常用命令介绍
+ `fecom init`: 初始化组件的目录结构，如果指定`-S`参数则跳过所有问题直接通过默认配置生成组件目录结构
+ `fecom install`: 安装`component.json`中`dependencies`项所指定的所有组件
+ `fecom install compA`: 安装`compA`组件以及它的依赖，并保存到`component.json`中
+ `fecom link`: 将当前目前的组件注册为全局的链接，以便进行本地开发
+ `fecom link compA`: 软链接`components/compA`到全局注册的`compA`组件目录
+ `fecom uninstall compA`: 卸载`compA`组件以及它的依赖
+ `fecom update compA`: 更新`compA`到最新版本，只更新`compA`本身
+ `fecom info compA`: 显示`compA`的详细信息以及版本更新历史
+ `fecom list`: 列出本地安装的所有组件，如果指定`-U`参数则检查是否有更新
+ `fecom list compA`: 列出本地安装的`compA`组件，如果指定`-U`参数则检查是否有更新
+ `fecom search compA`: 按照`compA`搜索`Gitlab`中的组件，如果指定`-O`参数则按用户/组搜索
+ `fecom profile`: 列出用户配置
+ `fecom profile "username=icefox0801"`: 以`query`形式设置用户配置项
+ `fecom profile -D "domain=https://gitlab.example.com"`: 以`query`形式设置`fecom`默认配置项
+ `fecom tree`: 以依赖树的形式列出本地安装的所有组件
+ `fecom tree compA`: 以依赖树的形式列出本地安装的`compA`组件，如果指定`-R`参数，则列出远程`compA`组件的依赖树
+ `fecom version`: 提示选择并更新组件的版本号，会更新`component.json`中的`version`和自动添加`tag`，注意还需执行`git push --follow-tags`来推送到远程仓库
+ `fecom version patch`: 以`patch`类型更新组件版本号，类型也可以为`major`或者`minor`

## 组件安装格式
组件名称格式 `[source:][owner/]name[@version][?args]`，以`group/compA`为例
+ `fecom install compA`
+ `fecom install group/compA`
+ `fecom install group/compA@1.8.3`
+ `fecom install npm:group/compA@1.8.3（目前未实现，后续根据需要实现扩展npm包）`
