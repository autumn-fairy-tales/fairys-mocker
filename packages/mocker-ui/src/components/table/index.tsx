import { useMemo } from "react";


export interface TableColumnItemType {
  /**表头*/
  title: React.ReactNode
  /**数据索引*/
  dataIndex?: string
  /**宽度*/
  width?: number
  /**自定义渲染函数*/
  render?: (rowData: any, index: number) => React.ReactNode;
  /**自定义td类名*/
  tdClassName?: string
  // 是否是索引列
  isIndex?: boolean
  /**其他定义的属性*/
  [key: string]: any
}
export interface TableProps<T = Record<string, any>> {
  /**列*/
  columns: TableColumnItemType[]
  /**数据*/
  dataSource: T[],
  /**行键*/
  rowKey?: string | ((rowData: T) => string)
}

export function Table<T = Record<string, any>>(props: TableProps<T>) {
  const { columns, dataSource, rowKey } = props;

  const theadTr = useMemo(() => {
    return <tr className="bg-zinc-100 dark:bg-zinc-800 sticky -top-px z-10">
      {columns.map((item, index) => (
        <th key={item.dataIndex || index} className="px-2 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
          {item.title}
        </th>
      ))}
    </tr>
  }, [columns])

  return <div className="flex-1 flex flex-col box-border overflow-auto">
    <table className="border-collapse min-w-full border border-zinc-200 dark:border-zinc-700 relative">
      <thead>
        {theadTr}
      </thead>
      <tbody>
        {dataSource.map((it: any, index) => {
          const key = typeof rowKey === 'function' ? rowKey(it) : (rowKey ? it[rowKey] : index)
          return <tr key={key} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
            {columns.map((column) => {
              let render = column.dataIndex ? it[column.dataIndex] : it;
              if (column.isIndex) {
                render = index + 1
              }
              if (column.render) {
                render = column.render?.(it, index);
              }
              return <td
                className={`px-2 py-2 border-b border-zinc-200 dark:border-zinc-700 ${column.tdClassName || ""}`}
                key={`${key}-${column.dataIndex}`}
              >
                {render}
              </td>
            })}
          </tr>
        })}
      </tbody>
    </table>
  </div>
}