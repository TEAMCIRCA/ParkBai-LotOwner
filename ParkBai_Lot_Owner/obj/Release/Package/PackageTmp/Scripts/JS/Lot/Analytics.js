import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";

$(function () {
    const firebaseConfig = {
        apiKey: "AIzaSyBrmIkzH9xI9BHHSJOJMYDd-J3UkPJsS7k",
        authDomain: "parkbai-c8f04.firebaseapp.com",
        databaseURL: "https://parkbai-c8f04-default-rtdb.firebaseio.com",
        projectId: "parkbai-c8f04",
        storageBucket: "parkbai-c8f04.appspot.com",
        messagingSenderId: "195961929914",
        appId: "1:195961929914:web:f609827668b79399b80283",
        measurementId: "G-0THPRYGBY6"
    };
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    var UID = uid;

    const dailyIncomeRef = ref(db, "PARK_OWNER/" + UID + "/INCOME/Daily_Income");
    const dailyVisit = ref(db, "PARK_OWNER/" + UID + "/PARKING_HISTORY");


    CreateChart();
    function CreateChart() {
        let chart;

        onValue(dailyIncomeRef, (incomeSnapshot) => {
            const dailyIncomeData = incomeSnapshot.val();
            var dates = [];
            var income = [];
            let totalCount = 0;
            const segregatedData = {};
            const sortedDates = [];

            onValue(dailyVisit, (visitSnapshot) => {
                visitSnapshot.forEach((childSnapshot) => {
                    const childData = childSnapshot.val();
                    totalCount++;
                    const originalDate = childData.date;
                    const formattedDate = formatDate(originalDate);

                    sortedDates.push(formattedDate);

                    if (!segregatedData[formattedDate]) {
                        segregatedData[formattedDate] = 1;
                    } else {
                        segregatedData[formattedDate]++;
                    }
                });

                for (const key in dailyIncomeData) {
                    if (dailyIncomeData.hasOwnProperty(key)) {
                        var amount = dailyIncomeData[key].amount;
                        dates.push(key);
                        income.push(amount.toFixed(2));
                    }
                }

                var dateObjects = dates.map((dateStr) => {
                    var parts = dateStr.split('-');
                    if (parts.length === 3) {
                        return new Date(parts[2], parts[1] - 1, parts[0]);
                    }
                    return null;
                });

                dateObjects = dateObjects.filter((date) => date !== null);
                var sortedData = dateObjects
                    .map((date, index) => ({ date, amount: income[index] }))
                    .sort((a, b) => a.date - b.date);
                dates = sortedData.map((item) => {
                    var month = (item.date.getMonth() + 1).toString().padStart(2, '0');
                    var day = item.date.getDate().toString().padStart(2, '0');
                    var year = item.date.getFullYear();
                    return `${month}-${day}-${year}`;
                });
                income = sortedData.map((item) => item.amount);

                updateTable(dates, income, Object.values(segregatedData));

                const ctx = document.getElementById('incomeChart');

                const chartWidth = 800; // Set your desired width
                const chartHeight = 200; // Set your desired height
                if (!chart) {
                    chart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: dates,
                            datasets: [
                                {
                                    label: 'Daily Income',
                                    data: income,
                                    yAxisID: 'incomeAxis',
                                    borderWidth: 1,
                                    borderColor: '#ff0000',
                                    backgroundColor: '#ff0000',
                                    pointStyle: 'circle',
                                    pointRadius: 10,
                                    pointHoverRadius: 15,
                                    yAxisID: 'y',
                                },
                                {
                                    label: 'Daily Visit',
                                    data: Object.values(segregatedData),
                                    yAxisID: 'visitAxis',
                                    borderWidth: 1,
                                    borderColor: '#0000FF',
                                    backgroundColor: '#0000FF',
                                    pointStyle: 'circle',
                                    pointRadius: 10,
                                    pointHoverRadius: 15,
                                    yAxisID: 'y1',
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            interaction: {
                                mode: 'index',
                                intersect: false,
                            },
                            stacked: false,
                            plugins: {
                                title: {
                                    display: true,
                                }
                            },
                            scales: {
                                y: {
                                    type: 'linear',
                                    display: true,
                                    position: 'left',
                                },
                                y1: {
                                    type: 'linear',
                                    display: true,
                                    position: 'right',
                                    grid: {
                                        drawOnChartArea: false,
                                    },
                                },
                            },

                        },
                    });
                } else {
                    chart.data.labels = dates;
                    chart.data.datasets[0].data = income;
                    chart.data.datasets[1].data = Object.values(segregatedData);
                    chart.update();
                }

                // Update the width and height of the canvas
                ctx.width = chartWidth;
                ctx.height = chartHeight;


                function updateChart(timeRange) {
                    var filteredDates = [];
                    var filteredIncome = [];
                    var filteredVisit = [];

                    var today = new Date();
                    var startDate = new Date();

                    if (timeRange === "lastWeek") {
                        startDate.setDate(today.getDate() - 7);
                    } else if (timeRange === "lastMonth") {
                        startDate.setMonth(today.getMonth() - 1);
                    } else if (timeRange === "lastYear") {
                        startDate.setFullYear(today.getFullYear() - 1);
                    } else if (timeRange === "allData") {
                        startDate = new Date(0);
                    }

                    for (var i = 0; i < dates.length; i++) {
                        var date = new Date(dates[i]);
                        if (date >= startDate && date <= today) {
                            filteredDates.push(dates[i]);
                            filteredIncome.push(income[i]);
                            filteredVisit.push(segregatedData[dates[i]]);
                        }
                    }

                    chart.data.labels = filteredDates;
                    chart.data.datasets[0].data = filteredIncome;
                    chart.data.datasets[1].data = filteredVisit;
                    chart.update();

                    // Update the table as well
                    updateTable(filteredDates, filteredIncome, filteredVisit);
                }

                $("#btnLastWeek").on("click", function () {
                    updateChart("lastWeek");
                });
                $("#btnLastMonth").on("click", function () {
                    updateChart("lastMonth");
                });
                $("#btnLastYear").on("click", function () {
                    updateChart("lastYear");
                });
                $("#btnAllData").on("click", function () {
                    updateChart("allData");
                    document.getElementById('datePicker').value = 'Select Date Range';
                });

                $(function () {
                    $('#datePicker').daterangepicker({
                        autoUpdateInput: false,
                        locale: {
                            cancelLabel: 'Clear'
                        }
                    });

                    $('#datePicker').on('apply.daterangepicker', function (ev, picker) {
                        $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
                        updateChartWithDateRange(picker.startDate.format('MM/DD/YYYY'), picker.endDate.format('MM/DD/YYYY'));
                    });

                    $('#datePicker').on('cancel.daterangepicker', function (ev, picker) {
                        $(this).val('');
                        updateChartWithDateRange('start_date', 'end_date');
                    });
                });

                function updateChartWithDateRange(startDate, endDate) {
                    var filteredDates = [];
                    var filteredIncome = [];
                    var filteredVisit = [];
                    console.log(filteredDates)
                    var start = new Date(startDate);
                    var end = new Date(endDate);

                    for (var i = 0; i < dates.length; i++) {
                        var date = new Date(dates[i]);
                        if (date >= start && date <= end) {
                            filteredDates.push(dates[i]);
                            filteredIncome.push(income[i]);

                            // Use the date key to access visit count in segregatedData
                            var visitCount = segregatedData[dates[i]] || 0;
                            filteredVisit.push(visitCount);
                        }
                    }

                    chart.data.labels = filteredDates;
                    chart.data.datasets[0].data = filteredIncome;
                    chart.data.datasets[1].data = filteredVisit; // Update the filteredVisit array
                    chart.update();
                    updateTable(filteredDates, filteredIncome, filteredVisit);
                }

                function updateTable(dates, income, visit) {
                    var tableBody = document.querySelector('#data-table tbody');
                    tableBody.innerHTML = ''; // Clear existing data
                    for (var i = 0; i < dates.length; i++) {
                        var row = `<tr>
                           <td>${dates[i]}</td>
                           <td>${numberWithSpaces(income[i])}</td>
                           <td>${visit[i]}</td>
                       </tr>`;
                        tableBody.innerHTML += row;
                    }
                }

                var jsPDF = window.jspdf.jsPDF;

                function downloadPDF() {
                    var pdf = new jsPDF();

                    var chartCanvas = document.getElementById('incomeChart');
                    var chartDataURL = chartCanvas.toDataURL('image/png');
                    pdf.addImage(chartDataURL, 'PNG', 10, 10, 180, 100);

                    var currentY = 120;

                    var columns = ["Date", "Income", "Visits"];
                    var rows = [];

                    var tableRows = document.querySelectorAll('#data-table tbody tr');
                    tableRows.forEach(function (row) {
                        var rowData = [];
                        row.querySelectorAll('td').forEach(function (cell) {
                            rowData.push(cell.textContent.trim());
                        });
                        rows.push(rowData);
                    });

                    pdf.autoTable({
                        head: [columns],
                        body: rows,
                        startY: currentY
                    });

                    pdf.save('Parking_Lot_Data');
                }

                $("#btnDownloadPDF").on("click", function () {
                    downloadPDF();
                });
            });
        });

        function formatDate(originalDate) {
            const parts = originalDate.split('-');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = parts[1].padStart(2, '0');
                const year = parts[2];
                return `${month}-${day}-${year}`; // Ensure consistent format
            }
            return null;
        }

        function numberWithSpaces(x) {
            var parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            return parts.join(".");
        }
    }
});