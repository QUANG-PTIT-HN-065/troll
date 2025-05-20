const score = 65;
const total = 100;

const ctx = document.getElementById("resultChart").getContext("2d");

new Chart(ctx, {
  type: "doughnut",
  data: {
    datasets: [
      {
        data: [score, total - score],
        backgroundColor: ["#a61b1b", "#e0e0e0"],
        borderWidth: 0,
        borderRadius: 10,
        circumference: 360,
      },
    ],
  },
  options: {
    cutout: "80%",
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
  },
});

document.querySelector(".chart-center-text").innerText = `${score}/${total}`;
