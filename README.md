# $ARB claim 脚本

## 使用步骤 
1. .env.example 中配置 PRIVATE_KEYS=私钥(多个私钥使用 ， 分割) NOTE: 如果有自己想用的节点也可以配置节点 PROVIDER，否则使用默认的 public 节点

2. 重命名配置文件
```shell
mv .env.example .env
```

3. 运行
```shell
npm i
npx hardhat claim
```