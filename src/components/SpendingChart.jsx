import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const SpendingChart = ({ data }) => {
    const hasData = Array.isArray(data) && data.length > 0;

    const chartConfig = {
        labels: data.map(item => item.category || "General"),
        datasets: [{
            data: data.map(item => item.total || 0),
            backgroundColor: data.map((_, i) => `hsl(${(i * 360) / data.length}, 70%, 60%)`),
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    return (
        <div className="w-full">
            <h2 className="text-lg font-black mb-6 text-gray-700 text-center">
                Spending Breakdown
            </h2>

            <div style={{ height: "320px", position: "relative" }}>
                {hasData ? (
                    <Pie
                        key={JSON.stringify(data)} // Forces chart refresh on data change
                        data={chartConfig}
                        options={{
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
                            }
                        }}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-2xl">📊</div>
                        <p>No data found for this period</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpendingChart;