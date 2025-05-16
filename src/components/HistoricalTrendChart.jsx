import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../contexts/ThemeContext';
import { useFrankfurterAPI } from '../hooks/useFrankfurterAPI';
import {useAppContext} from "../hooks/useAppContext.js";

function HistoricalTrendChart() {
    const { fromCurrency, toCurrency, isCurrenciesLoading: appCurrenciesLoadingStatus } = useAppContext();
    const { theme } = useTheme();
    const { isLoading: isChartApiLoading, error: chartApiError, fetchHistoricalData } = useFrankfurterAPI();
    const [chartData, setChartData] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const chartRef = useRef(null);

    useEffect(() => {
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
                    datasets: [{
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
    }, [fromCurrency, toCurrency]);

    const getChartOptions = () => {
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
    if (fromCurrency && toCurrency) {
        chartTitleText = `${fromCurrency} to ${toCurrency} - 7 Day Trend`;
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
                {!isChartApiLoading && !chartApiError && !statusMessage && !chartData &&
                    (appCurrenciesLoadingStatus || !fromCurrency || !toCurrency) &&
                    <p>Waiting for currency selection or initial data...</p>
                }
            </div>
        </div>
    );
}

export default HistoricalTrendChart;