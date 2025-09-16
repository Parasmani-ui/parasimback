import React from "react";
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Card from 'react-bootstrap/Card';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Line } from 'react-chartjs-2';

Chart.register(CategoryScale);
Chart.register(LinearScale);
Chart.register(PointElement);
Chart.register(LineElement);

const DashboardTabbedCharts = (props) => {
    const allQuartersData = props.allQuartersData;
    const caseStudy = props.caseStudy;

    var labels = {};
    const nqtrs = props.mode == 'edit' ? (Object.keys(caseStudy.quarters.labels).length - 1) : parseInt(props.selectedGame.no_of_qtrs);
    const keys = Object.keys(caseStudy.quarters.labels).slice(0, nqtrs + 1);
  
    keys.forEach(key => {
      labels[key] = caseStudy.quarters.labels[key];
    });

    labels = Object.values(labels);

    const revenues = [];
    const stock = [];
    const profits = [];
    const sold = [];

    const noOfQtr = Object.keys(allQuartersData).length;

    for (var i = 0; i < noOfQtr - 1; i++) {
        const qtr = i.toString();
        const _gameData = allQuartersData[i];
        revenues.push(_gameData.financials.revenue);
        stock.push(_gameData.financials.stock_price);
        profits.push(_gameData.financials.profit);
        sold.push(_gameData.financials.unitsSold);
    }

    const options = {
        scales: {
          y:
          {
            beginAtZero: false
          },
        },
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        }
      };    

    const revenuesChartData = {
        labels: labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenues,
            fill: false,
            borderColor: 'rgba(75,192,192,1)',
            lineTension: 0.1
          }
        ]
      };
    
      const stockChartData = {
        labels: labels,
        datasets: [
          {
            label: 'Stock Price',
            data: stock,
            fill: false,
            borderColor: 'rgba(75,192,192,1)',
            lineTension: 0.1
          }
        ]
      };
    
      const profitsChartData = {
        labels: labels,
        datasets: [
          {
            label: 'Profit',
            data: profits,
            fill: false,
            borderColor: 'rgba(75,192,192,1)',
            lineTension: 0.1
          }
        ]
      };
    
      const soldChartData = {
        labels: labels,
        datasets: [
          {
            label: caseStudy.text.units_sold_label,
            data: sold,
            fill: false,
            borderColor: 'rgba(75,192,192,1)',
            lineTension: 0.1
          }
        ]
      };
    


    return (
        <Card style={{height: '100%'}} className="tabbed_charts">
            <Card.Body>
                <Tabs
                    defaultActiveKey="revenue"
                    name="dashboard_tabs"
                    className="dashboard_tabs"
                    fill
                >
                    <Tab eventKey="revenue" title="Revenues">
                    <Line data={revenuesChartData} options={options} />
                    </Tab>
                    <Tab eventKey="stock-price" title="Stock Price">
                    <Line data={stockChartData} options={options} />
                    </Tab>
                    <Tab eventKey="profits" title="Profits">
                    <Line data={profitsChartData} options={options} />
                    </Tab>
                    <Tab eventKey="market-share" title="Units Sold">
                    <Line data={soldChartData} options={options} />
                    </Tab>
                </Tabs>
            </Card.Body>
        </Card>
    );
};

export default DashboardTabbedCharts;
