// Mock 配置文件
// 自动生成于 2026-03-30T05:21:20.194Z

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
  listCount?: number;
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
        "id": "120000199208193584",
        "name": "Angela Hernandez",
        "email": "b.stmrydgo@kgoowqm.so",
        "d": 13
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
            "id": "230000199408081136",
            "name": "Jose Taylor"
          },
          {
            "id": "370000202302271842",
            "name": "Ruth Rodriguez"
          },
          {
            "id": "320000201008080371",
            "name": "Melissa Miller"
          },
          {
            "id": "620000201604293139",
            "name": "Robert Lewis"
          },
          {
            "id": "510000201803146742",
            "name": "Thomas Davis"
          },
          {
            "id": "710000200812253315",
            "name": "Deborah Davis"
          },
          {
            "id": "810000197110249273",
            "name": "Sarah Thompson"
          },
          {
            "id": "32000019710527841X",
            "name": "David Perez"
          },
          {
            "id": "410000198507128162",
            "name": "Michael Wilson"
          },
          {
            "id": "410000200812226332",
            "name": "Donald Clark"
          },
          {
            "id": "310000197701123842",
            "name": "Sandra Johnson"
          },
          {
            "id": "460000201606029366",
            "name": "Thomas Rodriguez"
          },
          {
            "id": "820000202112167285",
            "name": "Brenda Walker"
          },
          {
            "id": "360000198206018125",
            "name": "Susan Martinez"
          },
          {
            "id": "820000202302106280",
            "name": "Anna Wilson"
          },
          {
            "id": "32000019760120855X",
            "name": "Charles Wilson"
          },
          {
            "id": "640000201003313935",
            "name": "Karen Clark"
          },
          {
            "id": "330000199205015095",
            "name": "Betty Allen"
          },
          {
            "id": "350000201607139537",
            "name": "Kevin Davis"
          },
          {
            "id": "430000198105196289",
            "name": "Eric Jones"
          }
        ],
        "list": [
          {
            "id": "310000200306077529",
            "name": "Jason Moore"
          },
          {
            "id": "350000198701194861",
            "name": "Eric Hernandez"
          },
          {
            "id": "410000201409253351",
            "name": "Brenda Miller"
          },
          {
            "id": "460000197910279643",
            "name": "John Perez"
          },
          {
            "id": "530000197209295459",
            "name": "Scott Gonzalez"
          },
          {
            "id": "710000201004195625",
            "name": "John Jackson"
          },
          {
            "id": "310000200111208525",
            "name": "Nancy Hall"
          },
          {
            "id": "150000201909271077",
            "name": "Steven Robinson"
          },
          {
            "id": "820000201305069687",
            "name": "Lisa Hall"
          },
          {
            "id": "450000201110142689",
            "name": "Paul Perez"
          }
        ],
        "total": 30
      }
    },
    "bodyFormat": "list",
    "listCount": 20
  }
];
