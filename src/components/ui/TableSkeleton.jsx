import Skeleton from "./Skeleton";

export default function TableSkeleton({ rows = 7, columns = 6 }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {Array.from({
              length: columns,
            }).map((_, index) => (
              <th key={index} className="px-5 py-3.5 text-left">
                <Skeleton className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({
            length: rows,
          }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-border last:border-b-0"
            >
              {Array.from({
                length: columns,
              }).map((_, columnIndex) => (
                <td key={columnIndex} className="px-5 py-4">
                  <Skeleton
                    className={columnIndex === 0 ? "h-4 w-36" : "h-4 w-24"}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
