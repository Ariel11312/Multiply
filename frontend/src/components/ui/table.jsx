import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export const Table = ({ children, className = "" }) => (
  <div className={`w-full overflow-auto ${className}`}>
    <table className="w-full border-collapse">{children}</table>
  </div>
);

export const TableHeader = ({ children, className = "" }) => (
  <thead className={`bg-gray-50 ${className}`}>{children}</thead>
);

export const TableBody = ({ children, className = "" }) => (
  <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = "", isHeader = false }) => (
  <tr
    className={`
    ${isHeader ? "" : "hover:bg-gray-50 transition-colors"}
    ${className}
  `}
  >
    {children}
  </tr>
);

export const TableHead = ({
  children,
  className = "",
  sortable = false,
  sortDirection = null,
  onSort = () => {},
}) => (
  <th
    className={`
    px-6 py-3 
    text-left text-xs font-medium 
    text-gray-500 uppercase tracking-wider
    ${sortable ? "cursor-pointer select-none" : ""}
    ${className}
  `}
    onClick={() => sortable && onSort()}
  >
    <div className="flex items-center gap-2">
      {children}
      {sortable && (
        <div className="flex flex-col">
          <ChevronUp
            className={`h-3 w-3 ${
              sortDirection === "asc" ? "text-blue-500" : "text-gray-300"
            }`}
          />
          <ChevronDown
            className={`h-3 w-3 ${
              sortDirection === "desc" ? "text-blue-500" : "text-gray-300"
            }`}
          />
        </div>
      )}
    </div>
  </th>
);

export const TableCell = ({ children, className = "" }) => (
  <td
    className={`
    px-6 py-4 
    whitespace-nowrap 
    text-sm text-gray-900
    ${className}
  `}
  >
    {children}
  </td>
);

// Example usage component
export const TableExample = () => {
  const [sortField, setSortField] = React.useState(null);
  const [sortDirection, setSortDirection] = React.useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const data = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "User",
      status: "Inactive",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "User",
      status: "Active",
    },
  ];

  return (
    <div className="rounded-lg border border-gray-200 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow isHeader>
            <TableHead
              sortable
              sortDirection={sortField === "name" ? sortDirection : null}
              onSort={() => handleSort("name")}
            >
              Name
            </TableHead>
            <TableHead
              sortable
              sortDirection={sortField === "email" ? sortDirection : null}
              onSort={() => handleSort("email")}
            >
              Email
            </TableHead>
            <TableHead
              sortable
              sortDirection={sortField === "role" ? sortDirection : null}
              onSort={() => handleSort("role")}
            >
              Role
            </TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>{item.role}</TableCell>
              <TableCell>
                <span
                  className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${
                    item.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                `}
                >
                  {item.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableExample;
