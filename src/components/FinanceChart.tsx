import type { ComponentProps } from "react";
import { Chart } from "react-google-charts";

interface FinanceChartProps {
  chartType: ComponentProps<typeof Chart>["chartType"];
  data: ComponentProps<typeof Chart>["data"];
  options?: ComponentProps<typeof Chart>["options"];
}

export default function FinanceChart({ chartType, data, options }: FinanceChartProps) {
  return (
    <Chart
      chartType={chartType}
      data={data}
      options={options}
      width="100%"
      height="400px"
    />
  );
}
