import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { useEffect, useState } from 'react';
 
DataTable.use(DT);

interface DispayTableProps {
  headers: string[];
  data: any[][];
}

const DisplayTable = (props: DispayTableProps) => {
  // Styling options: https://datatables.net/manual/styling/classes
  const [tableData, setTableData] = useState([]);
  useEffect(() => {
    setTableData(props.data);
  }, [props]);

  return <>
    <DataTable  className='row-border stripe' data={tableData} options={{
      columnDefs: [
        {
            targets: "*",
            className: 'dt-head-left dt-body-left'
        }
      ],
      autoWidth: true,
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