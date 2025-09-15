import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
const data = [2, 3, 4, 5, 0, 7, 8];
const HoursSpent = () => {
  const options = {
    chart: {
      type: "column",
      width: 400,
      height: 250,
    },
    title: {
      text: "Hours Spent",
    },
    xAxis: {
      categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      title: {
        text: null,
      },
    },

    tooltip: {
      formatter: function () {
        return `${this.y} hours`;
      },
    },
    yAxis: {
      title: {
        text: null,
      },
    },
    series: [
      {
        name: "Time",
        data: data,
      },
    ],
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false, // Disable the legend
    },
  };

  return (
    <div>
      <HighchartsReact
        immutable={false}
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
};

export default HoursSpent;
