import {
  Controller,
  Get,
  Post,
  MethodPath,
  ClassAttributeDefault,
  registerControllerRoute,
} from '@fairys/mocker-cli/esm/utils/decorator';

@Controller("/api")
class Demo {

  @ClassAttributeDefault("默认值")
  testVar: string | undefined = undefined;

  @Get("/test")
  get_test(req: express.Request, res: express.Response) {
    res.json({
      code: 200,
      message: 'Mock 配置服务成功',
      data: this.testVar,
    });
  }

  @Post("/test")
  post_test(req: express.Request, res: express.Response) {
    res.json({
      code: 200,
      message: 'Mock 配置服务成功',
      data: this.testVar,
    });
  }

  @MethodPath("/test", 'post')
  post_test_method(req: express.Request, res: express.Response) {
    res.json({
      code: 200,
      message: 'Mock 配置服务成功',
      data: this.testVar,
    });
  }
}

const demo = new Demo();
registerControllerRoute(demo);
console.log(demo.testVar);

