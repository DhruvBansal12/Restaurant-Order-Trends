import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PeakHoursChartProps {
  data: Array<{ hour: number; count: number }>;
  title?: string;
}

export function PeakHoursChart({ data, title = "Peak Order Hours" }: PeakHoursChartProps) {
  // Group hours into time periods
  const timePeriodsMap = new Map([
    ["6-9h", 0],
    ["9-12h", 0],
    ["12-15h", 0],
    ["15-18h", 0],
    ["18-21h", 0],
    ["21-24h", 0],
    ["0-6h", 0],
  ]);

  data.forEach(({ hour, count }) => {
    if (hour >= 6 && hour < 9) timePeriodsMap.set("6-9h", timePeriodsMap.get("6-9h")! + count);
    else if (hour >= 9 && hour < 12) timePeriodsMap.set("9-12h", timePeriodsMap.get("9-12h")! + count);
    else if (hour >= 12 && hour < 15) timePeriodsMap.set("12-15h", timePeriodsMap.get("12-15h")! + count);
    else if (hour >= 15 && hour < 18) timePeriodsMap.set("15-18h", timePeriodsMap.get("15-18h")! + count);
    else if (hour >= 18 && hour < 21) timePeriodsMap.set("18-21h", timePeriodsMap.get("18-21h")! + count);
    else if (hour >= 21 || hour < 6) {
      if (hour >= 21) timePeriodsMap.set("21-24h", timePeriodsMap.get("21-24h")! + count);
      else timePeriodsMap.set("0-6h", timePeriodsMap.get("0-6h")! + count);
    }
  });

  const chartData = {
    labels: Array.from(timePeriodsMap.keys()),
    datasets: [
      {
        data: Array.from(timePeriodsMap.values()),
        backgroundColor: [
          "hsl(221.2, 83.2%, 53.3%)",
          "hsl(173, 58%, 39%)",
          "hsl(12, 76%, 61%)",
          "hsl(43, 74%, 66%)",
          "hsl(197, 37%, 24%)",
          "hsl(27, 87%, 67%)",
          "hsl(215.4, 16.3%, 46.9%)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed} orders`,
        },
      },
    },
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-chart-pie text-2xl text-muted-foreground"></i>
        </div>
        <h4 className="text-lg font-medium mb-2">No data available</h4>
        <p className="text-muted-foreground">No peak hours data found for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
