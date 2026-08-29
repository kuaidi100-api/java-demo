# NestJS Passport 依赖注入故障记录

## 原始异常

以下是删除临时无参构造后，由启动回归测试复现的完整 Nest 依赖注入异常：

```text
Error: Nest can't resolve dependencies of the JwtAuthGuard (?). Please make sure that the argument AuthModuleOptions at index [0] is available in the UsersModule module.

Potential solutions:
- Is UsersModule a valid NestJS module?
- If AuthModuleOptions is a provider, is it part of the current UsersModule?
- If AuthModuleOptions is exported from a separate @Module, is that module imported within UsersModule?
  @Module({
    imports: [ /* the Module containing AuthModuleOptions */ ]
  })

For more common dependency resolution issues, see: https://docs.nestjs.com/faq/common-errors
    at Injector.lookupComponentInParentModules (file:///F:/DK100/java-demo/node_modules/@nestjs/core/injector/injector.js:313:19)
    at async resolveParam (file:///F:/DK100/java-demo/node_modules/@nestjs/core/injector/injector.js:149:38)
    at async Promise.all (index 0)
    at async Injector.resolveConstructorParams (file:///F:/DK100/java-demo/node_modules/@nestjs/core/injector/injector.js:181:27)
    at async Injector.loadInstance (file:///F:/DK100/java-demo/node_modules/@nestjs/core/injector/injector.js:75:13)
    at async Injector.loadInjectable (file:///F:/DK100/java-demo/node_modules/@nestjs/core/injector/injector.js:102:9)
    at async file:///F:/DK100/java-demo/node_modules/@nestjs/core/injector/instance-loader.js:81:13
    at async Promise.all (index 0)
    at async InstanceLoader.createInstancesOfInjectables (file:///F:/DK100/java-demo/node_modules/@nestjs/core/injector/instance-loader.js:80:9)
    at async file:///F:/DK100/java-demo/node_modules/@nestjs/core/injector/instance-loader.js:42:13
```

启动进程中的异常类型和上下文为：

```text
UnknownDependenciesException [Error]: Nest can't resolve dependencies of the JwtAuthGuard (?).
Please make sure that the argument AuthModuleOptions at index [0] is available in the UsersModule module.

type: 'JwtAuthGuard'
context.index: 0
context.dependencies: [ AuthModuleOptions ]
context.name: AuthModuleOptions
module: UsersModule
```

## 依赖注入链

```text
UsersController / OrdersController
  -> @UseGuards(JwtAuthGuard)
  -> JwtAuthGuard extends AuthGuard('jwt')
  -> @nestjs/passport MixinAuthGuard
  -> constructor(@Optional() AuthModuleOptions)
  -> PassportModule.register(...) 提供并导出 AuthModuleOptions
```

原实现只在 `AuthModule` 中导入了未注册的 `PassportModule`，而 Guard 是在声明控制器的
`UsersModule` 和 `OrdersModule` 上下文中解析，因此该上下文找不到 `AuthModuleOptions`。
临时增加无参构造会绕过这一条依赖链，但也会掩盖模块边界缺失，不是最终方案。

最终修复为：

1. `PassportModule.register({ defaultStrategy: 'jwt', session: false })`；
2. `JwtModule.registerAsync(...)` 从 `ConfigService` 读取 Access Token 密钥和 TTL；
3. `JwtStrategy` 与 `JwtAuthGuard` 均注册为 `AuthModule` provider；
4. `AuthModule` 导出 `JwtAuthGuard` 和已注册的 `PassportModule`；
5. `UsersModule` 与 `OrdersModule` 导入 `AuthModule`；
6. `JwtAuthGuard` 恢复官方形式 `extends AuthGuard('jwt') {}`，不保留无参构造。

参考：

- https://docs.nestjs.com/recipes/passport
- https://docs.nestjs.com/security/authentication
- https://docs.nestjs.com/openapi/security
