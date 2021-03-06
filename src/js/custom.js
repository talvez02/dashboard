/* Resize function without multiple trigger
 * $(window).smartresize(function(){
 *     // code
 * });
 */

(function($, sr) {
  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function(func, threshold, execAsap) {
    var timeout;

    return function debounced() {
      var obj = this;
      var args = arguments;

      function delayed() {
        if (!execAsap) {
          func.apply(obj, args);
        }
        timeout = null;
      }

      if (timeout) {
        clearTimeout(timeout);
      } else if (execAsap) {
        func.apply(obj, args);
      }
      timeout = setTimeout(delayed, threshold || 100);
    };
  };

  // Smartresize
  jQuery.fn[sr] = function(fn) {
    return fn ? this.bind("resize", debounce(fn)) : this.trigger(sr);
  };
})(jQuery, "smartresize");

// First written by Ariel
// https://stackoverflow.com/questions/12274748/
function setAttributes(el, attrs) {
  for (var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}

(function() {
  // NProgress
  if (typeof NProgress !== "undefined") {
    NProgress.start();
  }
})();

var CURRENT_URL = window.location.href.split("#")[0].split("?")[0];
var $BODY = $("body");
var $MENU_TOGGLE = $("#menu_toggle");
var $SIDEBAR_MENU = $("#sidebar-menu");
var $SIDEBAR_FOOTER = $(".sidebar-footer");
var $LEFT_COL = $(".left_col");
var $RIGHT_COL = $(".right_col");
var $NAV_MENU = $(".nav_menu");
var $FOOTER = $("footer");

// Menu components functions
function init_sidebar() {
  var setContentHeight = function() {
    // reset height
    $RIGHT_COL.css("min-height", $(window).height());

    var bodyHeight = $BODY.outerHeight();
    var footerHeight = $BODY.hasClass("footer_fixed") ? -10 : $FOOTER.height();
    var leftColHeight = $LEFT_COL.eq(1).height() + $SIDEBAR_FOOTER.height();
    var contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;

    // normalize content
    contentHeight -= $NAV_MENU.height() + footerHeight;

    $RIGHT_COL.css("min-height", contentHeight);
  };

  $SIDEBAR_MENU.find("a").on("click", function(ev) {
    // console.log("clicked - sidebar_menu");
    var $li = $(this).parent();

    if ($li.is(".active")) {
      $li.removeClass("active active-sm");
      $("ul:first", $li).slideUp(function() {
        setContentHeight();
      });
    } else {
      // prevent closing menu if we are on child menu
      if (!$li.parent().is(".child_menu")) {
        $SIDEBAR_MENU.find("li").removeClass("active active-sm");
        $SIDEBAR_MENU.find("li ul").slideUp();
      } else {
        if ($BODY.is(".nav-sm")) {
          $SIDEBAR_MENU.find("li").removeClass("active active-sm");
          $SIDEBAR_MENU.find("li ul").slideUp();
        }
      }
      $li.addClass("active");

      $("ul:first", $li).slideDown(function() {
        setContentHeight();
      });
    }
  });

  // toggle small or large menu
  $MENU_TOGGLE.on("click", function() {
    // console.log("clicked - menu toggle");

    if ($BODY.hasClass("nav-md")) {
      $SIDEBAR_MENU.find("li.active ul").hide();
      $SIDEBAR_MENU.find("li.active").addClass("active-sm").removeClass("active");
    } else {
      $SIDEBAR_MENU.find("li.active-sm ul").show();
      $SIDEBAR_MENU.find("li.active-sm").addClass("active").removeClass("active-sm");
    }

    $BODY.toggleClass("nav-md nav-sm");

    setContentHeight();

    $(".dataTable").each(function() {
      $(this).dataTable().fnDraw();
    });
  });

  // check active menu
  $SIDEBAR_MENU.find("a[href='" + CURRENT_URL + "']").parent("li").addClass("current-page");

  $SIDEBAR_MENU.find("a").filter(function() {
    return this.href == CURRENT_URL;
  }).parent("li").addClass("current-page").parents("ul").slideDown(function() {
    setContentHeight();
  }).parent().addClass("active");

  // recompute content when resizing
  $(window).smartresize(function() {
    setContentHeight();
  });

  setContentHeight();

  // fixed sidebar
  if ($.fn.mCustomScrollbar) {
    $(".menu_fixed").mCustomScrollbar({
      autoHideScrollbar: true,
      theme: "minimal",
      mouseWheel: {
        preventDefault: true
      }
    });
  }
}

// init Panel toolbox
function init_panel() {
  $(".collapse-link").on("click", function() {
    var $BOX_PANEL = $(this).closest(".x_panel");
    var $ICON = $(this).find("i");
    var $BOX_CONTENT = $BOX_PANEL.find(".x_content");

    // fix for some div with hardcoded fix class
    if ($BOX_PANEL.attr("style")) {
      $BOX_CONTENT.slideToggle(200, function() {
        $BOX_PANEL.removeAttr("style");
      });
    } else {
      $BOX_CONTENT.slideToggle(200);
      $BOX_PANEL.css("height", "auto");
    }

    $ICON.toggleClass("fa-chevron-up fa-chevron-down");
  });

  $(".close-link").click(function() {
    var $BOX_PANEL = $(this).closest(".x_panel");

    $BOX_PANEL.remove();
  });
}

// Tooltip
function init_tooltip() {
  $("[data-toggle='tooltip']").tooltip({
    container: "body"
  });
}
// ---- Menu component functions end

// initialize menu components
$(document).ready(function() {
  init_sidebar();
  init_panel();
  init_tooltip();
});

// Custom functions
var chartOption = {
  hover: {
    intersect: false
  },
  tooltips: {
    mode: "index",
    intersect: false,
    itemSort: function(a, b) {
      return b.datasetIndex - a.datasetIndex;
    }
  },
  scales: {
    yAxes: [{
      stacked: true
    }]
  },
  elements: {
    line: {
      tension: 0,
      borderWidth: 1
    },
    point: {
      radius: 0,
      borderWidth: 2,
      hitRadius: 20,
    }
  }
  /*animation: {
    duration: 0
  },
  hover: {
    animationDuration: 0
  },
  responsiveAnimationDuration: 0*/
};

function processdata(responseText) {
  var labels = [];
  var chartData = [];
  var innerData = [];
  var pjIndex = [];

  // UI info - pj_name / pj_id / pj_link / build_id
  var pjLabel = [];
  var pjlink = [];
  var buildTime = [];
  var duration = [];

  // initialModalData - pj_platform / pj_team / pj_author
  var initialModalData = [];

  var totalChartCount = responseText.totalChartCount;
  pjLabel = responseText.pj_label.slice();

  if (totalChartCount) {
    var platformtmp = responseText.pj_label[0].pj_platform;

    if (platformtmp === "pcWeb") {
      platformtmp = "PC Web";
    } else if (platformtmp === "mobileWeb") {
      platformtmp = "Mobile Web";
    } else if (platformtmp === "mobileApp") {
      platformtmp = "Mobile App";
    } else {
      platformtmp = "Error";
    }
    initialModalData.push(platformtmp);
    initialModalData.push(responseText.pj_label[0].pj_team);
    initialModalData.push(responseText.pj_label[0].pj_author);
  }

  for (var k = 0; k < totalChartCount; k++) {
    labels[k] = [];
    chartData[k] = [];
    chartData[k][0] = [];
    chartData[k][1] = [];
    chartData[k][2] = [];
    pjIndex[k] = responseText.pj_label[k].pj_id;
    var linktmp = responseText.pj_label[k].pj_link;
    pjlink[k] = (linktmp.slice(0, 4) === "http") ? linktmp : "http://" + linktmp;
    buildTime[k] = [];
    buildTime[k][0] = []; // buildno
    buildTime[k][1] = []; // start_t
    duration[k] = []; // duration
    pjLabel[k].build_id = [];
  }

  responseText.data.forEach(function(value) {
    var idx = pjIndex.indexOf(value.pj_id);

    pjLabel[idx].build_id.push(value.build_id);

    if (!value.start_t) {
      value.start_t = "0";
    }

    if (labels[idx].length < responseText.maxLabel) {
      if (value.start_t === "0") {
        labels[idx].push("Failed");
      } else {
        labels[idx].push(value.start_t.slice(5, 10));
      }
    }

    chartData[idx][0].push(value.pass);
    chartData[idx][1].push(value.fail);
    chartData[idx][2].push(value.skip);

    if (buildTime[idx][0]) {
      if (buildTime[idx][0] < value.buildno * 1) {
        buildTime[idx][0] = value.buildno;
        buildTime[idx][1] = (value.start_t === "0") ? "Build Failed" : value.start_t;
        duration[idx] = value.duration.slice(0, 2) + "h " + value.duration.slice(3, 5) + "m " + value.duration.slice(6, 8) + "s";
      }
    } else {
      buildTime[idx][0] = -1;
      buildTime[idx][1] = "1453/05/29 09:00:00";
    }
  });

  var pass = "rgba(102, 194, 255,";
  var fail = "rgba(255, 115, 115,";
  var skip = "rgba(130, 130, 130,";
  for (var h = 0; h < totalChartCount; h++) {
    innerData[h] = {
      labels: labels[h],
      datasets: [{
        label: "Fail",
        backgroundColor: fail + " 0.7)",
        borderColor: fail + " 0.7)",
        pointBorderColor: fail + " 0.7)",
        pointBackgroundColor: fail + " 0.7)",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: fail + " 1)",
        data: chartData[h][1]
      }, {
        label: "Skip",
        backgroundColor: skip + " 0.7)",
        borderColor: skip + " 0.7)",
        pointBorderColor: skip + " 0.7)",
        pointBackgroundColor: skip + " 0.7)",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: skip + " 1)",
        data: chartData[h][2]
      }, {
        label: "Pass",
        backgroundColor: pass + " 0.7)",
        borderColor: pass + " 0.7)",
        pointBorderColor: pass + " 0.7)",
        pointBackgroundColor: pass + " 0.7)",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: pass + " 1)",
        data: chartData[h][0]
      }]
    };
  }

  return {
    getInnerData: function() {
      return innerData;
    },
    getPjLabel: function() {
      return pjLabel;
    },
    getBuildTime: function() {
      return buildTime;
    },
    getDuration: function() {
      return duration;
    },
    getPjLink: function() {
      return pjlink;
    },
    getTotalChartCount: function() {
      return totalChartCount;
    },
    getInitialModalData: function() {
      return initialModalData;
    }
  };
} // processdata end

function processModalData(responseText) {
  var pieChartData = [];
  var class_pass = [];
  var class_fail = [];
  var class_skip = [];
  var class_sum = [];
  var class_passr = [];
  var class_failr = [];
  var class_skipr = [];
  var build_pass = 0;
  var build_fail = 0;
  var build_skip = 0;
  var build_sum = 0;
  var nameData = [];
  var classcount = responseText.classcount;

  responseText.data.forEach(function(value) {
    var tmpsum = value.pass + value.fail + value.skip;

    class_pass.push(value.pass);
    class_fail.push(value.fail);
    class_skip.push(value.skip);
    class_passr.push(Math.round(value.pass / tmpsum * 100).toFixed(1));
    class_failr.push(Math.round(value.fail / tmpsum * 100).toFixed(1));
    class_skipr.push(Math.round(value.skip / tmpsum * 100).toFixed(1));
    class_sum.push(tmpsum);

    build_pass += value.pass;
    build_fail += value.fail;
    build_skip += value.skip;

    nameData.push([value.package_name, value.class_name]);
  });

  build_sum = build_pass + build_fail + build_skip;

  pieChartData = {
    labels: ["Fail", "Skip", "Pass"],
    datasets: [{
      data: [
        Math.round(build_fail / build_sum * 100).toFixed(1),
        Math.round(build_skip / build_sum * 100).toFixed(1),
        Math.round(build_pass / build_sum * 100).toFixed(1)
      ],
      backgroundColor: [
        "rgba(255, 115, 115, 0.7)",
        "rgba(130, 130, 130, 0.7)",
        "rgba(102, 194, 255, 0.7)"
      ],
      hoverBackgroundColor: [
        "rgba(255, 115, 115, 1.0)",
        "rgba(130, 130, 130, 1.0)",
        "rgba(102, 194, 255, 1.0)"
      ],
      label: [
        "Fail", "Skip", "Pass"
      ]
    }]
  };

  return {
    getpieChartData: function() {
      return pieChartData;
    },
    getClassCount: function() {
      return classcount;
    },
    getProgressData: function() {
      return {
        "pass": class_pass,
        "fail": class_fail,
        "skip": class_skip,
        "sum": class_sum,
        "passrate": class_passr,
        "failrate": class_failr,
        "skiprate": class_skipr
      };
    },
    getNameData: function() {
      return nameData;
    },
    getBuildTime: function() {
      return responseText.data[0].start_t;
    }
  };
} //processModalData end
// My functions end

/* KNOB */
function init_knob() {
  if (typeof($.fn.knob) === "undefined") {
    return;
  }
  if (!document.getElementById("knobInput")) {
    return;
  }
  console.log("init_knob");

  var knobData = new XMLHttpRequest();
  var doc = document;

  doc.getElementById("labelSubmit").addEventListener("click", function() {
    doc.getElementById("newMaxLabel").value = doc.getElementById("newMaxLabel_text").innerText;
  });

  knobData.open("GET", "/admin/getKnobData/", true);
  knobData.send();
  knobData.addEventListener("load", function() {
    var result = JSON.parse(knobData.responseText);

    doc.getElementById("knobInput").value = result;
    doc.getElementById("MaxLabel_text").innerText = "현재 : " + result + "개";

    $(".knob").knob({
      "min": 1,
      "max": 20,
      "thickness": 0.2,
      "displayPrevious": true,
      "inputColor": "#34495E",
      "fgColor": "#34495E",
      change: function(value) {
        // console.log("change : " + value);
      },
      release: function(value) {
        // console.log(this.$.attr("value"));
        // console.log("release : " + value);
        doc.getElementById("newMaxLabel_text").innerText = "변경 : " + value + "개";
      },
      cancel: function() {
        console.log("cancel : ", this);
      },
      draw: function() {
        this.cursorExt = 0.3;

        // a = Arc, pa = Previous arc
        var a = this.arc(this.cv);
        var pa;
        var r = 1;

        this.g.lineWidth = this.lineWidth;

        if (this.o.displayPrevious) {
          pa = this.arc(this.v);
          this.g.beginPath();
          this.g.strokeStyle = this.pColor;
          this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, pa.s, pa.e, pa.d);
          this.g.stroke();
        }

        this.g.beginPath();
        this.g.strokeStyle = r ? this.o.fgColor : this.fgColor;
        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, a.s, a.e, a.d);
        this.g.stroke();

        this.g.lineWidth = 2;
        this.g.beginPath();
        this.g.strokeStyle = this.o.fgColor;
        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
        this.g.stroke();

        return false;
      }
    });
  }); // knobData listener end
}

/* SMART WIZARD */
function init_SmartWizard() {
  if (typeof($.fn.smartWizard) === "undefined") {
    return;
  }
  console.log("init_SmartWizard");

  $("#wizard").smartWizard();

  $("#wizard_verticle").smartWizard({
    transitionEffect: "slide"
  });

  $(".buttonNext").addClass("btn btn-success");
  $(".buttonPrevious").addClass("btn btn-primary");
  // $(".buttonFinish").addClass("btn btn-default");
}

/* SELECT2 */
function init_select2() {
  if (!document.getElementById("select2Div0")) {
    return;
  }
  console.log("init_select2");

  var result = [
    [],
    [],
    [],
    []
  ];
  var selectId = [];
  var doc = document;
  var divFrag = document.createDocumentFragment();

  // draw select2
  for (var i = 0; i < 4; i++) {
    $("#select2_multiple" + i).select2({
      maximumSelectionLength: 2,
      placeholder: "이전 항목을 선택해주세요",
      containerCssClass: ":all:",
      allowClear: true,
      dropdownParent: $("#select2Div" + i)
    });
  }

  var tmp = doc.createElement("option");
  tmp.innerText = "Project 명";
  tmp.setAttribute("display", "none");
  divFrag.appendChild(tmp);

  var customInit = new XMLHttpRequest();

  customInit.onreadystatechange = function() {
    if (customInit.status === 404) {
      window.location = "/404";
    } else if (customInit.status === 500) {
      window.location = "/500";
    }
  };

  customInit.open("GET", "/getData/getCustomData?un=pj&vi=-1", true);
  customInit.send();
  customInit.addEventListener("load", function() {
    result[0] = JSON.parse(customInit.responseText);
    result[0].forEach(function(value) {
      var optionTmp = doc.createElement("option");

      optionTmp.innerText = value.pj_name;
      divFrag.appendChild(optionTmp);
    });
    document.getElementById("select2_multiple0").appendChild(divFrag);
  });
  // Custom Page initialization complete

  // Select2 Custom Functions
  function eachSelect2GetData(idx) {
    return function() {
      var previousValue = $("#select2_multiple" + idx).val();
      var selectedIndex = $("#select2_multiple" + idx)[0].selectedIndex;
      var unitPool = ["bu", "cl", "te"]; // ["buildno", "class", "testcase"]

      if ($.isEmptyObject(previousValue) || previousValue === "Project 명") {
        for (var q = 3; q > idx; q--) {
          $("#select2_multiple" + (q)).attr("disabled", true);
        }
        selectId.splice(idx);
      } else {
        var preValId;
        if (idx === 0) {
          preValId = result[0][selectedIndex - 1].pj_id;
        } else if (idx === 1) {
          preValId = result[1][selectedIndex].build_id;
        } else if (idx === 2) {
          preValId = result[2][selectedIndex].class_id;
        } else {
          preValId = result[3][selectedIndex].method_id;
        }
        selectId[idx] = preValId;

        if (idx >= 0 && idx <= 2) {
          var selectCustomData = new XMLHttpRequest();

          selectCustomData.open("GET", "/getData/getCustomData?un=" + unitPool[idx] + "&vi=" + preValId, true);
          selectCustomData.send();
          selectCustomData.addEventListener("load", function() {
            var divFragMini = document.createDocumentFragment();

            // Delete previous select info
            result[idx + 1] = [];
            $("#select2_multiple" + (idx + 1)).empty();

            // New
            result[idx + 1] = JSON.parse(selectCustomData.responseText);
            result[idx + 1].forEach(function(value) {
              var optionTmp = doc.createElement("option");
              if (value.buildno) {
                optionTmp.innerText = "(Build No." + value.buildno + ") ";
              } else if (value.class_name) {
                optionTmp.innerText = value.package_name + " / " + value.class_name;
              } else if (value.method_name) {
                optionTmp.innerText = value.method_name;
              }
              divFragMini.append(optionTmp);
            });
            $("#select2_multiple" + (idx + 1)).append(divFragMini);
          });
          $("#select2_multiple" + (idx + 1)).removeAttr("disabled");
        } // if (idx >=0 && idx <=2) End
      } // Null check else End
    };
  }

  function customSubmitBtnListener() {
    return function() {
      if ($("#select2_multiple0").val() === "Project 명") {
        return;
      }
      var deleteData = new XMLHttpRequest();
      deleteData.open("POST", "/access/deleteData", true);
      deleteData.setRequestHeader("Content-type", "application/json");
      deleteData.onreadystatechange = function() {
        if (deleteData.status === 404) {
          window.location = "/404";
        } else if (deleteData.status === 500) {
          window.location = "/500";
        }
      };

      deleteData.send(JSON.stringify({
        "selectId": selectId
      }));
      deleteData.addEventListener("load", function() {
        alert("결과 : " + deleteData.responseText);
      });
    };
  }
  // Select2 Custom Functions End

  // Add Event Listener to each select2, submitBtn
  for (var j = 0; j < 4; j++) {
    $("#select2_multiple" + j).on("change", eachSelect2GetData(j));
  }
  document.getElementById("customSubmitBtn").addEventListener("click", customSubmitBtnListener());
}

function clear_modalDetail() {
  var noChart = document.getElementById("noChart");
  var noInfo = document.getElementById("noInfo");
  var pieChart_timeInfo = document.getElementById("pieChart_timeInfo");
  var pieChart_passInfo = document.getElementById("pieChart_passInfo");

  document.getElementById("panel_report").removeChild(document.getElementById("pieChart_mo"));
  var newChart_mo = document.createElement("canvas");
  newChart_mo.setAttribute("id", "pieChart_mo");
  document.getElementById("panel_report").appendChild(newChart_mo);
  document.getElementById("panel_detailReport").removeChild(document.getElementById("classinfo"));
  var newinfo = document.createElement("div");
  newinfo.setAttribute("id", "classinfo");
  document.getElementById("panel_detailReport").appendChild(newinfo);

  noChart.innerText = "";
  noInfo.innerText = "";
  pieChart_timeInfo.innerText = "";
  pieChart_passInfo.innerText = "";
}

function init_modal_detail(pj_id, build_id) {
  var getModalDataDetail = new XMLHttpRequest();

  getModalDataDetail.onreadystatechange = function() {
    if (getModalDataDetail.status === 404) {
      window.location = "/404";
    } else if (getModalDataDetail.status === 500) {
      window.location = "/500";
    }
  };

  getModalDataDetail.open("GET", "/getData/getModalDataDetail?pi=" + pj_id + "&bi=" + build_id, true);
  getModalDataDetail.send();
  getModalDataDetail.addEventListener("load", function() {
    var parsedResult = processModalData(JSON.parse(getModalDataDetail.responseText));
    var noChart = document.getElementById("noChart");
    var noInfo = document.getElementById("noInfo");
    var pieChart_timeInfo = document.getElementById("pieChart_timeInfo");
    var pieChart_passInfo = document.getElementById("pieChart_passInfo");

    clear_modalDetail();

    if (parsedResult.getClassCount() === 0) {
      noChart.innerText = "실패한 Build입니다";
      noInfo.innerText = "실패한 Build입니다";
    } else {
      var divFrag = document.createDocumentFragment();
      var prevPackName = "";
      var packCnt = -1;
      var tmptbody;

      for (var i = 0; i < parsedResult.getClassCount(); i++) {
        if (parsedResult.getNameData()[i][0] !== prevPackName) {
          prevPackName = parsedResult.getNameData()[i][0];
          packCnt++;

          tmptbody = document.createElement("tbody");
          tmptbody.setAttribute("id", "tbody" + packCnt);

          var tmptable = document.createElement("table");
          setAttributes(tmptable, {
            "id": "detailTable" + packCnt,
            "class": "table table-hover",
            "style": "text-align:center;"
          });

          var tmpthead = document.createElement("thead");
          var tmptr = document.createElement("tr");
          var tmpth = document.createElement("th");

          tmpth.innerText = parsedResult.getNameData()[i][0];
          tmptr.appendChild(tmpth);
          tmpthead.appendChild(tmptr);

          tmptable.appendChild(tmpthead);
          tmptable.appendChild(tmptbody);
          divFrag.appendChild(tmptable);
        }

        var tmptr2 = document.createElement("tr");
        var tmpth2 = document.createElement("th");
        var tmpth3 = document.createElement("th");
        tmpth2.setAttribute("class", "col-lg-5 col-md-5 col-sm-5 col-xs-12");
        tmpth2.innerText = parsedResult.getNameData()[i][1];
        tmptr2.appendChild(tmpth2);
        tmpth3.setAttribute("class", "col-lg-7 col-md-7 col-sm-7 col-xs-12");

        var progresstmp = document.createElement("div");
        progresstmp.setAttribute("class", "progress");
        var propass = document.createElement("div");
        var profail = document.createElement("div");
        var proskip = document.createElement("div");

        setAttributes(propass, {
          "id": "propass" + i,
          "class": "progress-bar progress-bar-striped progress-pass",
          "role": "progressbar",
          "aria-valuenow": parsedResult.getProgressData().pass[i],
          "aria-valuemin": 0,
          "aria-valuemax": parsedResult.getProgressData().sum[i],
          "style": "width: " + parsedResult.getProgressData().passrate[i] + "%"
        });
        propass.innerText = parsedResult.getProgressData().pass[i];
        setAttributes(profail, {
          "id": "profail" + i,
          "class": "progress-bar progress-bar-striped progress-fail",
          "role": "progressbar",
          "aria-valuenow": parsedResult.getProgressData().fail[i],
          "aria-valuemin": 0,
          "aria-valuemax": parsedResult.getProgressData().sum[i],
          "style": "width: " + parsedResult.getProgressData().failrate[i] + "%"
        });
        profail.innerText = parsedResult.getProgressData().fail[i];
        setAttributes(proskip, {
          "id": "proskip" + i,
          "class": "progress-bar progress-bar-striped progress-skip",
          "role": "progressbar",
          "aria-valuenow": parsedResult.getProgressData().skip[i],
          "aria-valuemin": 0,
          "aria-valuemax": parsedResult.getProgressData().sum[i],
          "style": "width: " + parsedResult.getProgressData().skiprate[i] + "%"
        });
        proskip.innerText = parsedResult.getProgressData().skip[i];

        progresstmp.appendChild(propass);
        progresstmp.appendChild(profail);
        progresstmp.appendChild(proskip);
        tmpth3.appendChild(progresstmp);
        tmptr2.appendChild(tmpth3);
        tmptbody.appendChild(tmptr2);
      }
      document.getElementById("classinfo").appendChild(divFrag);

      pieChart_timeInfo.innerText = "빌드 시작시간 : " + parsedResult.getBuildTime();
      pieChart_passInfo.innerText = "성공률 : " + parsedResult.getpieChartData().datasets[0].data[2] + "%";

      var pieChart = new Chart(document.getElementById("pieChart_mo"), {
        type: "pie",
        data: parsedResult.getpieChartData(),
        options: {
          legend: false
        }
      });
    }
  });
}

function init_modal(pj_id, build_id) {
  return function() {
    if (!document.getElementById("detailPage")) {
      return;
    }

    var getInitialModalData = new XMLHttpRequest();
    getInitialModalData.onreadystatechange = function() {
      if (getInitialModalData.status === 404) {
        window.location = "/404";
      } else if (getInitialModalData.status === 500) {
        window.location = "/500";
      }
    };

    getInitialModalData.open("GET", "/getData/getInitialModalData?pi=" + pj_id, true);
    getInitialModalData.send();
    getInitialModalData.addEventListener("load", function() {
      var parsedResult = processdata(JSON.parse(getInitialModalData.responseText));
      var lineChart = new Chart(document.getElementById("lineChart_mo"), {
        type: "line",
        data: parsedResult.getInnerData()[0],
        options: chartOption
      });
      var prevBuild = -1;

      document.getElementById("detailPageLabel").innerText = "More Info - " + parsedResult.getPjLabel()[0].pj_name;
      document.getElementById("platform_mo").innerText = "환경 : " + parsedResult.getInitialModalData()[0];
      document.getElementById("team_mo").innerText = "팀 : " + parsedResult.getInitialModalData()[1];
      document.getElementById("author_mo").innerText = "사용자 : " + parsedResult.getInitialModalData()[2];

      document.getElementById("lineChart_mo").addEventListener("click", function(evt) {
        var pointData = lineChart.getElementsAtEventForMode(evt, "index", {
          intersect: false
        });

        if (pointData.length != 0) {
          var buildtmp = parsedResult.getPjLabel()[0].build_id[pointData[0]._index];

          if (prevBuild != buildtmp) {
            prevBuild = buildtmp;
            init_modal_detail(parsedResult.getPjLabel()[0].pj_id, buildtmp);
          }
        }
      });
    });
    init_modal_detail(pj_id, build_id);
  };
}

function urlByBrowser() {
  var agent = navigator.userAgent.toLowerCase();

  // IE Case
  if (agent.indexOf("msie") > -1 || agent.indexOf("trident" > -1)) {
    return document.URL;
  } else {
    return document.documentURI;
  }
}

function init_charts() {
  if (!document.getElementById("chartDiv")) {
    return;
  }
  if (typeof(Chart) === "undefined") {
    return;
  }

  console.log("init_charts");

  Chart.defaults.global.legend = false;
  $("#detailPage").on("hidden.bs.modal", function() {
    var newChart = doc.createElement("canvas");

    setAttributes(newChart, {
      "id": "lineChart_mo",
      "height": "50%"
    });
    doc.getElementById("panel_mo").removeChild(doc.getElementById("lineChart_mo"));
    doc.getElementById("panel_mo").appendChild(newChart);
    doc.getElementById("detailPageLabel").innerText = "More Info - ";
    doc.getElementById("platform_mo").innerText = "환경 : ";
    doc.getElementById("team_mo").innerText = "팀 : ";
    doc.getElementById("author_mo").innerText = "사용자 : ";
    clear_modalDetail();
  });

  var doc = document;
  var url = urlByBrowser();
  url = url.substring(url.indexOf(":") + 3);
  var getChartData = new XMLHttpRequest();

  getChartData.onreadystatechange = function() {
    if (getChartData.status === 404) {
      window.location = "/404";
    } else if (getChartData.status === 500) {
      window.location = "/500";
    }
  };

  getChartData.open("GET", "/getData/getChartData" + url.substring(url.indexOf("/")), true);
  getChartData.send();
  getChartData.addEventListener("load", function() {
    var parsedResult = processdata(JSON.parse(getChartData.responseText));
    var chartloop = parsedResult.getTotalChartCount();

    function lineEventListener(lineChart, idx) {
      document.getElementById("lineChart" + idx).addEventListener("click", function(evt) {
        var pointData = lineChart.getElementsAtEventForMode(evt, "index", {
          intersect: false
        });
        var idtmp = parsedResult.getPjLabel()[idx];

        if (pointData.length != 0) {
          $("#detailPage").modal("show");
          init_modal(idtmp.pj_id, idtmp.build_id[pointData[0]._index])();
        }
      });
    }

    for (var i = 0; i < chartloop; i++) {
      doc.getElementById("title" + i).innerText = parsedResult.getPjLabel()[i].pj_name;
      doc.getElementById("build" + i).innerText = "Last Build : " + parsedResult.getBuildTime()[i][1];
      doc.getElementById("duration" + i).innerText = "Duration : " + parsedResult.getDuration()[i];

      if (parsedResult.getPjLink()[i] !== "http://-") {
        doc.getElementById("link" + i).setAttribute("href", parsedResult.getPjLink()[i]);
        doc.getElementById("link" + i).innerText = "Report Link";
      }

      var lineChartTarget = document.getElementById("lineChart" + i);
      var lineChart = new Chart(lineChartTarget, {
        type: "line",
        data: parsedResult.getInnerData()[i],
        options: chartOption
      });

      lineEventListener(lineChart, i);
    }
  }); // EventListener end
}

/* COMPOSE */
function init_compose() {
  if (typeof($.fn.slideToggle) === "undefined") {
    return;
  }
  console.log("init_compose");

  $("#compose, .compose-close").click(function() {
    $(".compose").slideToggle();
  });
}

$(document).ready(function() {
  init_knob();
  init_SmartWizard();
  init_charts();
  init_select2();
  init_compose();
});

$(window).on("load", function() {
  NProgress.done();
});
