import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';


export default function LazyTable({ route, columns, defaultPageSize, rowsPerPageOptions }) {
  const [data, setData] = useState([]);

  const [page, setPage] = useState(1); // 1 indexed
  const [pageSize, setPageSize] = useState(defaultPageSize ?? 10);

  // Now notice the dependency array contains route, page, pageSize, since we
  // need to re-fetch the data if any of these values change
  useEffect(() => {
    fetch(`${route}?page=${page}&page_size=${pageSize}`)
      .then(res => res.json())
      .then(resJson => setData(resJson));
  }, [route, page, pageSize]);

  const handleChangePage = (e, newPage) => {
    // Can always go to previous page (TablePagination prevents negative pages)
    // but only fetch next page if we haven't reached the end (currently have full page of data)
    if (newPage < page || data.length === pageSize) {
      // Note that we set newPage + 1 since we store as 1 indexed but the default pagination gives newPage as 0 indexed
      setPage(newPage + 1);
    }
  }

  const handleChangePageSize = (e) => {
    // when handling events such as changing a selection box or typing into a text box,
    // the handler is called with parameter e (the event) and the value is e.target.value
    const newPageSize = e.target.value;

    // TODO (TASK 18): set the pageSize state variable and reset the current page to 1
    setPageSize(newPageSize); 
    setPage(1);  
  }

  const defaultRenderCell = (col, row) => {
    return <div>{row[col.field]}</div>;
  }

  // Render cell for TeamLogo column to display the logo
  const renderTeamLogoCell = (col, row) => {
    return <img src={row[col.field]} alt={row['Name']} style={{ width: '50px', height: 'auto' }} />;
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map(col => (
              <TableCell key={col.headerName}><strong>{col.headerName}</strong></TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) =>
            <TableRow key={idx}>
              {columns.map(col => (
                // TODO (TASK 19): the next 3 lines of code render only the first column. Wrap this with another map statement to render all columns.
                // Hint: look at how we structured the map statement to render all the table headings within the <TableHead> element
                  <TableCell key={col.headerName}>
                    {/* Note the following ternary statement renders the cell using a custom renderCell function if defined, or defaultRenderCell otherwise */}
                    {col.field === 'TeamLogo' ? renderTeamLogoCell(col, row) : (col.renderCell ? col.renderCell(col, row) : defaultRenderCell(col, row))}
                  </TableCell>
                ))
              }
            </TableRow>
          )}
        </TableBody>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions ?? [5, 10, 25]}
          count={-1}
          rowsPerPage={pageSize}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangePageSize}
        />
      </Table>
    </TableContainer>
  )
}