import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { useEffect, useRef, useState } from 'react';
 
DataTable.use(DT);

interface DispayTableProps {
  headers: string[];
  data: any[][];
  activeTab: string;
}

const DisplayTable = (props: DispayTableProps) => {
  const tableRef = useRef<any>(null);
  const [tableData, setTableData] = useState([]);
  useEffect(() => {
    setTableData(props.data);
  }, [props]);

  useEffect(() => {
    if (tableRef.current) {
      setTimeout(() => {
        tableRef.current.dt().columns.adjust().draw()
      }, 0);
    }
  }, [props.activeTab]);

  return <>
    <DataTable className='row-border stripe' ref={tableRef} data={tableData} options={{
        columnDefs: [
          {
            targets: '*',
            className: 'dt-head-left dt-body-left',
          },
        ],
        pageLength: 25,
      }}>
      <thead>
          <tr>
            {props.headers.map((headerName) => 
              <th>{headerName}</th>
            )}
          </tr>
      </thead>
  </DataTable>
  </>
}

export default DisplayTable;