# vue-sfc-descriptor-write-back

@falconix fep 迁移工具

## 使用

```shell
npx fep-migrator <...dir>
```

`dir` 为需要迁移的 fep 项目目录，支持多个目录同时迁移，例如：

```shell
fep-migrator src1 src2
```

可以使用glob语法排除掉文件夹，例如：

```shell
fep-migrator src "!**/public"
```

## 注意事项

`fep-migrator` 会迁移两个包的内容：

- element-plus => @falconix/fep

- @element-plus/icons-vue => @falconix/icons-vue

使用前请备份好文件，确保文件已经提交到git仓库
