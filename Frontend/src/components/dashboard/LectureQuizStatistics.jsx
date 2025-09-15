import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const LectureQuizStatistics = () => {
  const options = {
    chart: {
      type: "spline",
      width: 800,
      height: 250,
    },
    title: {
      text: null,
    },
    xAxis: {
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ],
    },
    yAxis: {
      title: {
        text: null,
      },
    },
    series: [
      {
        name: "Lectures Watched",
        data: [10, 12, 5, 18, 22, 25, 28, 30, 32, 35, 38, 40],
      },
      {
        name: "Quizzes Attempted",
        data: [5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27],
      },
    ],
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
  };

  return (
      <div className="highcharts-container">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>

  );
};

export default LectureQuizStatistics;
