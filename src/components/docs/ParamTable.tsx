import React from "react";

export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface ParamTableProps {
  parameters: Parameter[];
}

export function ParamTable({ parameters }: ParamTableProps) {
  if (!parameters || parameters.length === 0) return null;

  return (
    <div className="ptable-wrap my-4">
      <table className="ptable">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((param) => (
            <tr key={param.name}>
              <td>
                <span className="font-mono font-semibold text-zinc-950 dark:text-zinc-50">{param.name}</span>
                {param.required ? (
                  <span className="req">Required</span>
                ) : (
                  <span className="opt">Optional</span>
                )}
              </td>
              <td>
                <code>{param.type}</code>
              </td>
              <td>{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
