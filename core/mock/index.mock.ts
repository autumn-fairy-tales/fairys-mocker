// Mock 配置文件
// 自动生成于 2026-03-30T04:42:16.287Z

interface MockerItem {
  /**该接口允许的 请求方法，默认同时支持 GET 和 POST*/
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  /**状态码*/
  status: string;
  //配置响应延迟时间, 如果传入的是一个数组，则代表延迟时间的范围
  delay: number | [number, number];
  /**响应体(可以自定义返回格式)*/
  body: any;
  /**接口地址*/
  url: string;
  /**响应体格式类型*/
  bodyFormat: 'object' | 'list';
  /**列表数据条数（仅 list 格式有效）*/
  listCount: number;
}

/**mock配置 列表*/
export type DefineMockList = MockerItem[];

export const mockList: DefineMockList = [
  {
    "url": "/api/test",
    "method": "POST",
    "status": "200",
    "delay": 0,
    "body": {
      "code": 200,
      "data": {
        "id": "650000200603111285",
        "name": "Brenda Perez",
        "email": "s.yjjhoto@wfndtekojd.cc"
      },
      "message": "success"
    },
    "bodyFormat": "object",
    "listCount": 20
  },
  {
    "url": "/api/list",
    "method": "POST",
    "status": "200",
    "delay": 0,
    "body": {
      "code": 200,
      "message": "success",
      "data": {
        "rows": [
          {
            "id": "620000200302195352",
            "name": "Brian Moore"
          },
          {
            "id": "210000199005094588",
            "name": "Melissa Martin"
          },
          {
            "id": "520000202302206782",
            "name": "Larry Garcia"
          },
          {
            "id": "410000199704037555",
            "name": "Michelle Allen"
          },
          {
            "id": "620000201904197720",
            "name": "Donna Young"
          },
          {
            "id": "310000197808263685",
            "name": "Jennifer Lee"
          },
          {
            "id": "520000199905161478",
            "name": "Sandra Lee"
          },
          {
            "id": "220000199106143141",
            "name": "Kevin Hall"
          },
          {
            "id": "140000198004044535",
            "name": "Larry Brown"
          },
          {
            "id": "540000198502068358",
            "name": "Amy Harris"
          },
          {
            "id": "65000020120925280X",
            "name": "Kimberly Robinson"
          },
          {
            "id": "540000198208113402",
            "name": "Cynthia Walker"
          },
          {
            "id": "540000197212012423",
            "name": "Paul Walker"
          },
          {
            "id": "410000199903190659",
            "name": "Anthony Hernandez"
          },
          {
            "id": "360000197408157065",
            "name": "Jose Martinez"
          },
          {
            "id": "420000198901268448",
            "name": "Kenneth Garcia"
          },
          {
            "id": "810000201804248717",
            "name": "David Jackson"
          },
          {
            "id": "530000198710181070",
            "name": "Kimberly Johnson"
          },
          {
            "id": "230000199512307350",
            "name": "Laura Thomas"
          },
          {
            "id": "440000199612034176",
            "name": "Mark Jones"
          }
        ],
        "list": [
          {
            "id": "37000019710618561X",
            "name": "Maria Johnson"
          },
          {
            "id": "540000200710093312",
            "name": "Carol Wilson"
          },
          {
            "id": "320000197302178813",
            "name": "Barbara Miller"
          },
          {
            "id": "230000200611247774",
            "name": "Charles Robinson"
          },
          {
            "id": "350000202308274151",
            "name": "Mary Thompson"
          },
          {
            "id": "150000199006213159",
            "name": "Jeffrey Young"
          },
          {
            "id": "710000199810285203",
            "name": "Robert Rodriguez"
          },
          {
            "id": "810000197910304269",
            "name": "Karen Jones"
          },
          {
            "id": "220000197105316646",
            "name": "Cynthia Wilson"
          },
          {
            "id": "510000198512125533",
            "name": "Donald Lee"
          }
        ],
        "total": 63
      }
    },
    "bodyFormat": "list",
    "listCount": 20
  }
];
