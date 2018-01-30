function init_flot_chart(){

  if( typeof ($.plot) === 'undefined'){ return; }

  console.log('init_flot_chart');



  var arr_data1 = [
    [gd(2012, 1, 1), 17],
    [gd(2012, 1, 2), 74],
    [gd(2012, 1, 3), 6],
    [gd(2012, 1, 4), 39],
    [gd(2012, 1, 5), 20],
    [gd(2012, 1, 6), 85],
    [gd(2012, 1, 7), 7]
  ];

  var arr_data2 = [
    [gd(2012, 1, 1), 82],
    [gd(2012, 1, 2), 23],
    [gd(2012, 1, 3), 66],
    [gd(2012, 1, 4), 9],
    [gd(2012, 1, 5), 119],
    [gd(2012, 1, 6), 6],
    [gd(2012, 1, 7), 9]
  ];

  var arr_data3 = [
    [0, 1],
    [1, 9],
    [2, 6],
    [3, 10],
    [4, 5],
    [5, 17],
    [6, 6],
    [7, 10],
    [8, 7],
    [9, 11],
    [10, 35],
    [11, 9],
    [12, 12],
    [13, 5],
    [14, 3],
    [15, 4],
    [16, 9]
  ];

  var chart_plot_02_data = [];

  var chart_plot_03_data = [
    [0, 1],
    [1, 9],
    [2, 6],
    [3, 10],
    [4, 5],
    [5, 17],
    [6, 6],
    [7, 10],
    [8, 7],
    [9, 11],
    [10, 35],
    [11, 9],
    [12, 12],
    [13, 5],
    [14, 3],
    [15, 4],
    [16, 9]
  ];


  for (var i = 0; i < 30; i++) {
    chart_plot_02_data.push([new Date(Date.today().add(i).days()).getTime(), randNum() + i + i + 10]);
  }


  var chart_plot_01_settings = {
    series: {
      lines: {
        show: false,
        fill: true
      },
      splines: {
        show: true,
        tension: 0.4,
        lineWidth: 1,
        fill: 0.4
      },
      points: {
        radius: 0,
        show: true
      },
      shadowSize: 2
    },
    grid: {
      verticalLines: true,
      hoverable: true,
      clickable: true,
      tickColor: "#d5d5d5",
      borderWidth: 1,
      color: '#fff'
    },
    colors: ["rgba(38, 185, 154, 0.38)", "rgba(3, 88, 106, 0.38)"],
    xaxis: {
      tickColor: "rgba(51, 51, 51, 0.06)",
      mode: "time",
      tickSize: [1, "day"],
      //tickLength: 10,
      axisLabel: "Date",
      axisLabelUseCanvas: true,
      axisLabelFontSizePixels: 12,
      axisLabelFontFamily: 'Verdana, Arial',
      axisLabelPadding: 10
    },
    yaxis: {
      ticks: 8,
      tickColor: "rgba(51, 51, 51, 0.06)",
    },
    tooltip: false
  };

  var chart_plot_02_settings = {
    grid: {
      show: true,
      aboveData: true,
      color: "#3f3f3f",
      labelMargin: 10,
      axisMargin: 0,
      borderWidth: 0,
      borderColor: null,
      minBorderMargin: 5,
      clickable: true,
      hoverable: true,
      autoHighlight: true,
      mouseActiveRadius: 100
    },
    series: {
      lines: {
        show: true,
        fill: true,
        lineWidth: 2,
        steps: false
      },
      points: {
        show: true,
        radius: 4.5,
        symbol: "circle",
        lineWidth: 3.0
      }
    },
    legend: {
      position: "ne",
      margin: [0, -25],
      noColumns: 0,
      labelBoxBorderColor: null,
      labelFormatter: function(label, series) {
        return label + '&nbsp;&nbsp;';
      },
      width: 40,
      height: 1
    },
    colors: ['#96CA59', '#3F97EB', '#72c380', '#6f7a8a', '#f7cb38', '#5a8022', '#2c7282'],
    shadowSize: 0,
    tooltip: true,
    tooltipOpts: {
      content: "%s: %y.0",
      xDateFormat: "%d/%m",
      shifts: {
        x: -30,
        y: -50
      },
      defaultTheme: false
    },
    yaxis: {
      min: 0
    },
    xaxis: {
      mode: "time",
      minTickSize: [1, "day"],
      timeformat: "%d/%m/%y",
      min: chart_plot_02_data[0][0],
      max: chart_plot_02_data[20][0]
    }
  };

  var chart_plot_03_settings = {
    series: {
      curvedLines: {
        apply: true,
        active: true,
        monotonicFit: true
      }
    },
    colors: ["#26B99A"],
    grid: {
      borderWidth: {
        top: 0,
        right: 0,
        bottom: 1,
        left: 1
      },
      borderColor: {
        bottom: "#7F8790",
        left: "#7F8790"
      }
    }
  };


  if ($("#chart_plot_01").length){
    console.log('Plot1');
    $.plot( $("#chart_plot_01"), [ arr_data1, arr_data2 ],  chart_plot_01_settings );
  }
  if ($("#chart_plot_02").length){
    console.log('Plot2');
    $.plot( $("#chart_plot_02"),
    [{
      label: "Email Sent",
      data: chart_plot_02_data,
      lines: {
        fillColor: "rgba(150, 202, 89, 0.12)"
      },
      points: {
        fillColor: "#fff" }
      }], chart_plot_02_settings);
    }

    if ($("#chart_plot_03").length){
      console.log('Plot3');
      $.plot($("#chart_plot_03"), [{
        label: "Registrations",
        data: chart_plot_03_data,
        lines: {
          fillColor: "rgba(150, 202, 89, 0.12)"
        },
        points: {
          fillColor: "#fff"
        }
      }], chart_plot_03_settings);
    }
  }
