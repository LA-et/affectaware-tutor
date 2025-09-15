import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const BotInteractionChart = () => {
  const [interactionData, setInteractionData] = useState({
    lectureInteraction: 33,
    quizInteraction: 67,
  });

  useEffect(() => {
    const lectureInteractions = Array.from({ length: 24 }, () => Math.random() * 10);
    const quizInteractions = Array.from({ length: 24 }, () => Math.random() * 5);

    const totalLectureInteractions = lectureInteractions.reduce((acc, val) => acc + val, 0);
    const totalQuizInteractions = quizInteractions.reduce((acc, val) => acc + val, 0);

    setInteractionData({
      lectureInteraction: totalLectureInteractions,
      quizInteraction: totalQuizInteractions,
    });
  }, []);

  const options = {
    chart: {
      type: "pie",
      width: 400,
      height: 250,
    },
    title: {
      text: "Bot Interactions Today",
    },
    series: [
      {
        name: "Interaction",
        data: [
          { name: "Lectures", y: interactionData.lectureInteraction },
          { name: "Quizzes", y: interactionData.quizInteraction },
        ],
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
    <div>
      <div className="highcharts-container">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
};

export default BotInteractionChart;
