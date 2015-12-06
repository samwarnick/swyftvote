var React = require('react');
var Link = require('react-router').Link;
var Highcharts = require('highcharts');
var ReactHighcharts = require('react-highcharts/dist/bundle/highcharts');

var Demographics = React.createClass({
    render: function() {
	var config = {
	    chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Your matches'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Brands',
                colorByPoint: true,
                data: [{
                    name: 'Him',
                    y: 56.33
                }, {
                    name: 'Her',
                    y: 24.03,
                }, {
                    name: 'Me',
                    y: 10.38
                }, {
                    name: 'You',
                    y: 4.77
                }, {
                    name: 'It',
                    y: 0.91
                }, {
                    name: 'Trump',
                    y: 0.2
                }]
            }]
	};
	
	return(
		<div>
		    <ReactHighcharts config={config} ref="chart"></ReactHighcharts>
	        </div>
	);
    }
});

module.exports = Demographics;
