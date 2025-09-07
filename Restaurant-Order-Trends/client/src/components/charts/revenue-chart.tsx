import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueChartProps {
  data: Array<{ date: string; revenue: string }>;
  title?: string;
}

export function RevenueChart({ data, title = "Daily Revenue Trend" }: RevenueChartProps) {
  const chartData = {
    labels: data.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: "Revenue ($)",
        data: data.map(item => parseFloat(item.revenue)),
        borderColor: "hsl(221.2, 83.2%, 53.3%)",
        backgroundColor: "hsla(221.2, 83.2%, 53.3%, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => `Revenue: $${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "hsl(214.3, 31.8%, 91.4%)",
        },
        ticks: {
          callback: (value: any) => `$${value}`,
        },
      },
      x: {
        grid: {
          color: "hsl(214.3, 31.8%, 91.4%)",
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-chart-line text-2xl text-muted-foreground"></i>
        </div>
        <h4 className="text-lg font-medium mb-2">No data available</h4>
        <p className="text-muted-foreground">No revenue data found for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
}
