import dynamic from "next/dynamic";
import React from "react";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });




// Helper function to return a color based on index
const getColor = (index) => {
  const colors = [
    "#FF4560",
    "#00E396",
    "#008FFB",
    "#FEB019",
    "#775DD0",
    "#FF66C3",
    "#FFA600",
  ];
  return colors[index % colors.length];
};

// Transform the Chart.js-like data to ApexCharts series data for a timeline.
// We assume data.datasets[0].data is an array of items where:
// - item.x is a Date (start time)
// - We simulate a duration by adding a minute (you can adjust as needed)
// - item.label is used for the x-axis label in the timeline.
const transformDataToSeries = (data) => {
  if (!data || !data.datasets || data.datasets.length === 0) return [];
  const dataset = data.datasets[0]; // assuming only one dataset is relevant
  const seriesData = dataset.data.map((item, index) => {
    const startTime = item.x.getTime();
    const endTime = startTime + 60000; // simulate a 1-minute duration
    return {
      x: item.label, // use the provided label (or you can customize this)
      y: [startTime, endTime],
      fillColor: dataset.backgroundColor || getColor(index),
    };
  });
  return [
    {
      name: dataset.label,
      data: seriesData,
    },
  ];
};

export default function Chart({ type, data, options, height }) {
  // If type is not "bar", pass through to ApexChart unchanged.
  if (type !== "bar") {
    return (
      <ApexChart options={options} series={data} type={type} height={height || 350} />
    );
  }

  // For type "bar", we assume the data is in Chart.js style.
  const evidences = data.datasets && data.datasets[0]?.data;
  if (!evidences || evidences.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
        <h2>Case Timeline</h2>
        <p>No timeline data available.</p>
      </div>
    );
  }

  // Transform the data into the series format required for a rangeBar timeline.
  const series = transformDataToSeries(data);

  // Create timeline-specific options.
  const timelineOptions = {
    chart: {
      type: "rangeBar",
      toolbar: { show: true },
      animations: { enabled: true },
      ...(options.chart || {}), // merge any passed chart options
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        rangeBarGroupRows: true,
        ...(options.plotOptions?.bar || {}),
      },
    },
    xaxis: {
      type: "datetime",
      title: { text: "Time" },
      ...(options.scales?.x || {}),
    },
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const range = w.globals.seriesRangeBarDates[seriesIndex][dataPointIndex];
        if (!range || range.length !== 2) return "";
        return `
          <div style="padding: 8px;">
            <strong>${w.globals.seriesNames[seriesIndex]}</strong><br/>
            ${new Date(range[0]).toLocaleString()} - ${new Date(range[1]).toLocaleString()}
          </div>
        `;
      },
      ...(options.plugins?.tooltip || {}),
    },
    noData: {
      text: "No timeline data available",
      align: "center",
      verticalAlign: "middle",
      style: {
        color: "#666",
        fontSize: "14px",
      },
      ...(options.noData || {}),
    },
  };

  return (
    <div>
      <h2>Case Timeline</h2>
      <ApexChart
        options={timelineOptions}
        series={series}
        type="rangeBar"
        height={height || 350}
      />
    </div>
  );
}
