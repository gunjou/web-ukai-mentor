import { cn } from "../../utils/cn";

export function Table({ children, className }) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full min-w-[760px]">{children}</table>
    </div>
  );
}

export function TableHeader({ children, className }) {
  return (
    <thead className={cn("bg-background-tertiary", className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className }) {
  return (
    <tr
      className={cn(
        "border-b border-border",
        "transition-colors",
        "last:border-b-0",
        "hover:bg-background-tertiary/60",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className }) {
  return (
    <th
      className={cn(
        "whitespace-nowrap",
        "px-5 py-3",
        "text-left",
        "text-xs font-semibold",
        "text-foreground-secondary",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className }) {
  return (
    <td className={cn("px-5 py-3.5", "text-sm", "text-foreground", className)}>
      {children}
    </td>
  );
}
