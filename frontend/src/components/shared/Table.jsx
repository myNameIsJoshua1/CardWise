import React from 'react';
import Button from '../ui/button';

export const Table = ({ 
  columns, 
  data, 
  actions, 
  emptyMessage = 'No data found.',
  className = '' 
}) => {
  if (data.length === 0) {
    return <p className="text-center text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            {columns.map((column, index) => (
              <th 
                key={index} 
                className={`border border-gray-300 px-4 py-2 ${column.align === 'center' ? 'text-center' : 'text-left'}`}
              >
                {column.header}
              </th>
            ))}
            {actions && (
              <th className="border border-gray-300 px-4 py-2 text-center">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="hover:bg-gray-100">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="border border-gray-300 px-4 py-2">
                  {column.render ? column.render(row) : row[column.field]}
                </td>
              ))}
              {actions && (
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex justify-center space-x-2">
                    {actions(row)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
