// import React, { useState, useEffect, useRef } from 'react';
// import { Line } from 'react-chartjs-2';
// import { useAppContext } from '../contexts/AppContext';
// import { useTheme } from '../contexts/ThemeContext';
// import { useFrankfurterAPI } from '../hooks/useFrankfurterAPI';
//
// function HistoricalTrendChart() {
//     const { fromCurrency, toCurrency, isCurrenciesLoading } = useAppContext();
//     const { theme } = useTheme();
//     const { isLoading, error: apiError, fetchHistoricalData, formatDate } = useFrankfurterAPI(); // formatDate from hook
//     const [chartData, setChartData] = useState(null);
//     const [chartError, setChartError] = useState('');
//     const chartRef = useRef(null); // For potential direct manipulation or destruction if needed
//
//     useEffect(() => {
//         if (isCurrenciesLoading || !fromCurrency || !toCurrency) {
//             setChartData(null); // Clear chart if currencies are loading or not set
//             setChartError(isCurrenciesLoading ? 'Waiting for currency selection...' : '');
//             return;
//         }
//
//         const loadChartData = async () => {
//             setChartError('');
//             setChartData(null); // Clear previous data
//             try {
//                 const historicalData = await fetchHistoricalData(fromCurrency, toCurrency);
//                 const labels = Object.keys(historicalData.rates).sort();
//                 const values = labels.map(date => historicalData.rates[date][toCurrency]);
//
//                 setChartData({
//                     labels,
//                     datasets: [
//                         {
//                             label: `${fromCurrency} → ${toCurrency}`,
//                             data: values,
//                             fill: true,
//                             tension: 0.3,
//                             pointRadius: 3,
//                             pointHoverRadius: 6,
//                         },
//                     ],
//                 });
//             } catch (err) {
//                 console.error("Failed to load chart data:", err);
//                 setChartError(err.message || `Could not load chart data for ${fromCurrency}/${toCurrency}.`);
//                 setChartData(null);
//             }
//         };
//
//         loadChartData();
//     }, [fromCurrency, toCurrency, fetchHistoricalData, isCurrenciesLoading]);
//
//     const getChartOptions = () => {
//         const isDark = theme === 'dark';
//         const textColor = isDark ? "#f0f0f0" : "#1a1a1a";
//         const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
//         const pointBgColor = isDark ? '#818cf8' : '#4f46e5';
//         const borderColor = pointBgColor;
//         const backgroundColor = isDark ? 'rgba(129, 140, 248, 0.2)' : 'rgba(79, 70, 229, 0.2)';
//
//
//         return {
//             responsive: true,
//             maintainAspectRatio: false,
//             scales: {
//                 y: {
//                     beginAtZero: false,
//                     ticks: { color: textColor },
//                     grid: { color: gridColor },
//                 },
//                 x: {
//                     ticks: { color: textColor },
//                     grid: { color: gridColor },
//                 },
//             },
//             plugins: {
//                 legend: {
//                     labels: { color: textColor },
//                 },
//                 tooltip: {
//                     backgroundColor: isDark ? '#333' : '#fff',
//                     titleColor: textColor,
//                     bodyColor: textColor,
//                     borderColor: isDark ? '#555' : '#ccc',
//                     borderWidth: 1,
//                 },
//             },
//             datasets: { // Default dataset options, will be merged
//                 line: {
//                     borderColor: borderColor,
//                     backgroundColor: backgroundColor,
//                     pointBackgroundColor: pointBgColor,
//                 }
//             }
//         };
//     };
//
//     const chartTitle = chartError
//         ? `Chart error for ${fromCurrency}/${toCurrency}`
//         : `${fromCurrency} to ${toCurrency} - 7 Day Trend`;
//
//     return (
//         <div className="historical-chart">
//             <h2>{chartTitle}</h2>
//             <div style={{ position: 'relative', height: '300px', width: '100%' }}>
//                 {isLoading && <p>Loading chart data...</p>}
//                 {apiError && !isLoading && <p>Error: {apiError}</p>}
//                 {chartError && !isLoading && !apiError && <p>{chartError}</p>}
//                 {!isLoading && !apiError && !chartError && chartData && (
//                     <Line ref={chartRef} options={getChartOptions()} data={chartData} />
//                 )}
//                 {!isLoading && !apiError && !chartError && !chartData && !isCurrenciesLoading && (
//                     <p>Select currencies to view the trend.</p>
//                 )}
//             </div>
//         </div>
//     );
// }
//
// export default HistoricalTrendChart;

import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useAppContext } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFrankfurterAPI } from '../hooks/useFrankfurterAPI';

function HistoricalTrendChart() {
    // Переименовал isCurrenciesLoading из AppContext, чтобы избежать конфликта
    const { fromCurrency, toCurrency, isCurrenciesLoading: appCurrenciesLoadingStatus } = useAppContext();
    const { theme } = useTheme();
    const { isLoading: isChartApiLoading, error: chartApiError, fetchHistoricalData } = useFrankfurterAPI();
    const [chartData, setChartData] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const chartRef = useRef(null);

    useEffect(() => {
        // Ждем, пока основные валюты загрузятся и будут выбраны from/to
        if (appCurrenciesLoadingStatus) {
            setStatusMessage('Waiting for initial currency data to load...');
            setChartData(null);
            return;
        }
        // Также ждем, пока fromCurrency и toCurrency будут установлены в AppContext
        if (!fromCurrency || !toCurrency) {
            setStatusMessage('Select currencies to view the trend.');
            setChartData(null);
            return;
        }

        const loadChartData = async () => {
            setStatusMessage('Loading chart data...');
            setChartData(null);
            try {
                const historicalData = await fetchHistoricalData(fromCurrency, toCurrency);
                const labels = Object.keys(historicalData.rates).sort();
                const values = labels.map(date => historicalData.rates[date][toCurrency]);

                setChartData({
                    labels,
                    datasets: [ /* ... dataset config ... */ {
                        label: `${fromCurrency} → ${toCurrency}`,
                        data: values,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                    }],
                });
                setStatusMessage('');
            } catch (err) {
                console.error("Failed to load chart data:", err);
                setStatusMessage(err.message || `Could not load chart data for ${fromCurrency}/${toCurrency}.`);
                setChartData(null);
            }
        };

        loadChartData();
    }, [fromCurrency, toCurrency, fetchHistoricalData, appCurrenciesLoadingStatus]); // Добавлена зависимость

    const getChartOptions = () => { /* ... остается без изменений ... */
        const isDark = theme === 'dark';
        const textColor = isDark ? "#f0f0f0" : "#1a1a1a";
        const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
        const pointBgColor = isDark ? '#818cf8' : '#4f46e5';
        const borderColor = pointBgColor;
        const backgroundColor = isDark ? 'rgba(129, 140, 248, 0.2)' : 'rgba(79, 70, 229, 0.2)';

        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: false, ticks: { color: textColor }, grid: { color: gridColor } },
                x: { ticks: { color: textColor }, grid: { color: gridColor } },
            },
            plugins: {
                legend: { labels: { color: textColor } },
                tooltip: {
                    backgroundColor: isDark ? '#333' : '#fff',
                    titleColor: textColor, bodyColor: textColor,
                    borderColor: isDark ? '#555' : '#ccc', borderWidth: 1,
                },
            },
            datasets: { line: { borderColor: borderColor, backgroundColor: backgroundColor, pointBackgroundColor: pointBgColor }}
        };
    };

    let chartTitleText = "7 Day Trend";
    if (fromCurrency && toCurrency && !appCurrenciesLoadingStatus) {
        chartTitleText = `${fromCurrency} to ${toCurrency} - 7 Day Trend`;
    }
    // Если API графика вернуло ошибку, и нет другого statusMessage, покажем ее
    if (chartApiError && !statusMessage && !isChartApiLoading) {
        // setStatusMessage(chartApiError); // Осторожно, может вызвать цикл, если ошибка постоянная
    }


    return (
        <div className="historical-chart">
            <h2>{chartTitleText}</h2>
            <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                { (isChartApiLoading || (statusMessage && statusMessage.includes('Loading'))) && <p>Loading chart data...</p>}
                { chartApiError && !isChartApiLoading && <p className="error-message">Chart API Error: {chartApiError}</p> }
                { statusMessage && !statusMessage.includes('Loading') && statusMessage !== chartApiError &&
                    <p className={chartData ? "" : "error-message"}>{statusMessage}</p>
                }

                {!isChartApiLoading && !chartApiError && !statusMessage && chartData && (
                    <Line ref={chartRef} options={getChartOptions()} data={chartData} />
                )}
                {/* Запасной вариант, если ничего не отображается, но и ошибок нет */}
                {!isChartApiLoading && !chartApiError && !statusMessage && !chartData &&
                    (appCurrenciesLoadingStatus || !fromCurrency || !toCurrency) &&
                    <p>Waiting for currency selection or initial data...</p>
                }
            </div>
        </div>
    );
}

export default HistoricalTrendChart;