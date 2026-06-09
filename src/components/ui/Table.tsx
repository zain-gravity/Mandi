import React from 'react';
import styles from './Table.module.css';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  
  if (isLoading) {
    return (
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} style={{ width: col.width, textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {columns.map((col, j) => (
                  <td key={j}>
                    <div className={styles.skeletonCell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{ width: col.width, textAlign: col.align || 'left' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.emptyCell}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr 
                key={keyExtractor(item)} 
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? styles.clickableRow : ''}
              >
                {columns.map((col, j) => (
                  <td key={j} style={{ textAlign: col.align || 'left' }}>
                    {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey]) : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
