import express from 'express';

export class BaseRouter<T> {
  /**mock 路由器实例*/
  router: express.Router | null = null;
  /**加载*/
  load: (data: T[]) => void = (data) => {
    /**销毁路由器实例*/
    this.destroy();
  };
  /**销毁路由器实例*/
  destroy: () => void = () => {
    if (this.router) {
      // 清空路由器实例
      this.router.stack = [];
    }
  };

  use(mainRouter?: express.Router | null) {
    if (this.router && mainRouter)
      mainRouter.use(this.router);
  }

}