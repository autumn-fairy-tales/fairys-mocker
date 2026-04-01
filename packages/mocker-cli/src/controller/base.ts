import express from 'express';

export class BaseController {
  /**路由实例*/
  mainRouter: express.Router | null = null;
  /**应用实例*/
  app: express.Express | null = null;
}