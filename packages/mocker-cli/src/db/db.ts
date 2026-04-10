import sqlite3 from 'sqlite3';
import { MockerItem, ProxyItem } from '@fairys/create-mock-data';
import nodePath from "node:path";
import { fileURLToPath } from "node:url";


// 转换成 __filename 和 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = nodePath.dirname(__filename);

const verbose = sqlite3.verbose();

export class DBInstanceBase {

  db: sqlite3.Database | undefined = undefined;

  /**初始化*/
  init = () => {
    // const dbPath = nodePath.join(__dirname, './fairys-mocker.db');
    const dbPath = nodePath.join(process.cwd(), './fairys-mocker.db');
    this.db = new verbose.Database(dbPath);
    this.createTable();
  }

  private createMockTable = () => {
    // 创建 mock 表
    // 判断表是否存在
    try {
      if (this.db) {
        this.db?.run(`CREATE TABLE IF NOT EXISTS mock (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          method TEXT,
          status TEXT,
          delay INTEGER,
          body TEXT,
          url TEXT,
          listCount INTEGER,
          cwd TEXT
        )`);
      } else {
        console.log('数据库实例不存在,请初始化数据库');
      }
    } catch (error) {

    }
  }

  private createProxyTable = () => {
    // 创建 proxy 表
    // 判断表是否存在
    try {
      if (this.db) {
        this.db?.run(`CREATE TABLE IF NOT EXISTS proxy (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          path TEXT,
          target TEXT,
          pathRewrite INTEGER
          ws TEXT,
          cwd TEXT
        )`);
      } else {
        console.log('数据库实例不存在,请初始化数据库');
      }
    } catch (error) {

    }
  }

  all = <T>(sql: string, value?: any[],): Promise<T[]> => {
    if (this.db) {
      return new Promise((resolve, reject) => {
        this.db?.all(sql, value, (err, rows: T[]) => {
          if (err) reject(err);
          else resolve(rows);
        });
      })
    }
    return Promise.reject(new Error('数据库实例不存在,请初始化数据库'));
  }

  run = (sql: string, value?: any[]) => {
    if (this.db) {
      return new Promise((resolve, reject) => {
        this.db?.run(sql, value, (err) => {
          if (err) reject(err);
          else resolve(this);
        });
      })
    }
    return Promise.reject(new Error('数据库实例不存在,请初始化数据库'));
  }


  /**创建两张表*/
  createTable = () => {
    this.createMockTable();
    this.createProxyTable();
  }

  /**插入数据*/
  insertMockData = (item: MockerItem) => {
    return this.run(`INSERT INTO mock (method, status, delay, body, url, listCount, cwd) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
      item.method,
      item.status,
      item.delay,
      item.body ? JSON.stringify(item.body) : '',
      item.url,
      item.listCount,
      process.cwd(),
    ]);
  }

  /**插入数据*/
  insertProxyData = (item: ProxyItem) => {
    return this.run(`INSERT INTO proxy (path, target, pathRewrite, ws, cwd) VALUES (?, ?, ?, ?, ?)`, [
      item.path,
      item.target,
      item.pathRewrite ? JSON.stringify(item.pathRewrite) : '',
      item.ws,
      process.cwd(),
    ]);
  }

  /**更新 mock 数据*/
  updateMockData = async (item: MockerItem) => {
    // 判断是否存在库中
    const exist = await this.all<MockerItem>(`SELECT * FROM mock where id=?`, [item.id]);
    if (exist.length) {
      return this.run(`UPDATE mock SET method=?, status=?, delay=?, body=?, url=?, listCount=? WHERE id=?`, [
        item.method,
        item.status,
        item.delay,
        item.body ? JSON.stringify(item.body) : '',
        item.url,
        item.listCount,
        item.id,
      ]);
    } else {
      return this.insertMockData(item);
    }
  }

  /**更新 proxy 数据*/
  updateProxyData = async (item: ProxyItem) => {
    // 判断是否存在库中
    const exist = await this.all<ProxyItem>(`SELECT * FROM proxy where id=?`, [item.id]);
    if (exist.length) {
      return this.run(`UPDATE proxy SET path=?, target=?, pathRewrite=?, ws=? WHERE id=?`, [
        item.path,
        item.target,
        item.pathRewrite ? JSON.stringify(item.pathRewrite) : '',
        item.ws,
        item.id,
      ]);
    } else {
      return this.insertProxyData(item);
    }
  }

  /**删除 mock 数据*/
  deleteMockData = (id: number) => {
    return this.run(`DELETE FROM mock WHERE id=?`, [
      id,
    ]);
  }

  /**批量 删除 mock 数据*/
  bathDeleteMockData = async (ids: number[]) => {
    for (let index = 0; index < ids.length; index++) {
      const element = ids[index];
      await this.deleteMockData(element);
    }
  }

  /**删除 proxy 数据*/
  deleteProxyData = (id: number) => {
    return this.run(`DELETE FROM proxy WHERE id=?`, [
      id,
    ]);
  }

  /**批量 删除 proxy 数据*/
  bathDeleteProxyData = async (ids: number[]) => {
    for (let index = 0; index < ids.length; index++) {
      const element = ids[index];
      await this.deleteProxyData(element);
    }
  }

  /**查询 mock 数据, 默认查询当前目录*/
  queryMockData = async (cwd?: string) => {
    try {
      const list = await this.all<MockerItem>(`SELECT * FROM mock where cwd=?`, [cwd || process.cwd()])
      if (Array.isArray(list)) {
        return list.map((item) => {
          const { body } = item;
          const _item = { ...item }
          _item.body = body ? JSON.parse(body) : {};
          return _item;
        });
      }
      return []
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  }

  /**查询 proxy 数据, 默认查询当前目录*/
  queryProxyData = async (cwd?: string) => {
    try {
      const list = await this.all<ProxyItem>(`SELECT * FROM proxy where cwd=?`, [cwd || process.cwd()]);
      if (Array.isArray(list)) {
        return list.map((item) => {
          const { pathRewrite } = item;
          const _item = { ...item }
          _item.pathRewrite = pathRewrite ? JSON.parse(pathRewrite as unknown as string) : {};
          return _item;
        });
      }
      return []
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  }

  /**查询 mock中所有的 cwd 数据*/
  selectMockCwd = async () => {
    try {
      const list = await this.all<string[]>(`SELECT cwd FROM mock  GROUP BY cwd`)
      if (Array.isArray(list)) {
        return list
      }
      return []
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  }

  /**查询 proxy中所有的 cwd 数据*/
  selectProxyCwd = async () => {
    try {
      const list = await this.all<string[]>(`SELECT cwd FROM proxy GROUP BY cwd`)
      if (Array.isArray(list)) {
        return list
      }
      return []
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  }

  /**处理 mock 数据*/
  handleMockSaveData = async (deleteIds: number[], items: MockerItem[]) => {
    try {
      // 删除、新增、修改
      try {
        await this.bathDeleteMockData(deleteIds);
      } catch (error) {
        console.log('批量 删除 mock 数据失败:', error);
      }
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        if (!item.id) {
          try {
            await this.insertMockData(item);
          } catch (error) {
            console.log('插入 mock 数据失败:', error);
          }
        } else {
          try {
            await this.updateMockData(item);
          } catch (error) {
            console.log('更新 mock 数据失败:', error);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**处理 proxy 数据*/
  handleProxySaveData = async (deleteIds: number[], items: ProxyItem[]) => {
    try {
      // 删除、新增、修改
      try {
        await this.bathDeleteProxyData(deleteIds);
      } catch (error) {
        console.log('批量 删除 proxy 数据失败:', error);
      }
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        if (!item.id) {
          try {
            await this.insertProxyData(item);
          } catch (error) {
            console.log('插入 proxy 数据失败:', error);
          }
        } else {
          try {
            await this.updateProxyData(item);
          } catch (error) {
            console.log('更新 proxy 数据失败:', error);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  close = () => {
    try {
      this.db?.close((err) => {
        if (err) console.log(err.message);
        else console.log('数据库已关闭');
      });
    } catch (error) {
      console.log(error);
    }
  }

}

export const dbInstance = new DBInstanceBase();
