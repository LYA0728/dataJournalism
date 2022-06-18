const asymptomatic_data_url = 'https://raw.githubusercontents.com/LYA0728/dataJournalism/4e7927bca610909c39b04dc760c64141136d2086/data/asymptomatic.csv';
const url = 'https://raw.githubusercontents.com/LYA0728/dataJournalism/main/data/localCOVID.csv'
const plotConfig = {
    "top": 20,
    "right": 30,
    "bottom": 60,
    "left": 30
}

var axisTimeFormat = d3.timeFormatLocale({
    dateTime: "%a %b %e %X %Y",
    date: "%Y/%-m/%-d",
    time: "%H:%M:%S",
    periods: ["上午", "下午"],
    days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    shortDays: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    shortMonths: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
});

let areaMap = {
    'Jiading': "嘉定区",
    'Fengxian': "奉贤区",
    'Chongming': "崇明区",
    'Xuhui': "徐汇区",
    'Putuo': "普陀区",
    'Yangpu': "杨浦区",
    'Songjiang': "松江区",
    'Pudong': "浦东新区",
    'Hongkou': "虹口区",
    'Jinshan': "金山区",
    'Changning': "长宁区",
    'Minhang': "闵行区",
    'Qingpu': "青浦区",
    'Jingan': "静安区",
    'Huangpu': "黄浦区"
};

const width = $(".container").width() - plotConfig["left"] - plotConfig["right"];
const height = $(".container").width() / 16 * 9 - plotConfig["top"] - plotConfig["bottom"];


// plotStreamgraph(asymptomatic_data_url)
$("#graph > div.toggle").tab()

// 使用本地data
// console.log(asymptomatic_data)

asymptomatic_data = asymptomatic_data.map((d) => {
    // console.log(JSON.parse(d))
    return JSON.parse(d)
})

// console.log(localCOVID)
localCOVID_data = localCOVID.map((d) => {
    return JSON.parse(d)
})
// console.log(localCOVID_data)
// 使用js变量绘图
function streamgraphPlt(figContainer, data) {

    const areaMap = {
        'Jiading': "嘉定区",
        'Fengxian': "奉贤区",
        'Chongming': "崇明区",
        'Xuhui': "徐汇区",
        'Putuo': "普陀区",
        'Yangpu': "杨浦区",
        'Songjiang': "松江区",
        'Pudong': "浦东新区",
        'Hongkou': "虹口区",
        'Jinshan': "金山区",
        'Changning': "长宁区",
        'Minhang': "闵行区",
        'Qingpu': "青浦区",
        'Jingan': "静安区",
        'Huangpu': "黄浦区"
    };

    const areas = []
    for (i in areaMap) {
        areas.push(i)
    }

    const color = d3.scaleOrdinal().domain(areas).range(d3.schemeCategory20);
    // create svg element
    if ($(`${figContainer} > svg`).length) { $(`${figContainer} > svg`).remove(); }
    /* console.log($(`${figContainer} > svg`).length) */
    var svg = d3.select(figContainer)
        .append("svg")
        .attr("class", "flexContainer")
        .attr("width", $(figContainer).width())
        .attr("height", $(figContainer).width() / 16 * 9)
        .append("g")
        .attr("class", "gContainer")
        .attr("transform", `translate(${plotConfig['left']}, ${plotConfig['top']})`);

    const height = $(figContainer).height() - plotConfig["top"] - plotConfig["bottom"];
    const width = $(figContainer).width() - plotConfig["left"] - plotConfig["right"];
    // console.log($(figContainer).height())
    // Initialize the X axis
    var x = d3.scaleTime()
        .range([0, width])
    // .domain(d3.extent(Date_X, (d) => { return d }))

    var xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`)

    // Initialize the Y axis
    var y = d3.scaleLinear()
        .range([height, 0]);
    var yAxis = svg.append("g")
        .attr("class", "myYaxis");


    var Date_X = data.map(function (d) {
        // console.log(d3.timeParse("%Y/%m/%d")(d["Date"]))
        return d3.timeParse("%Y/%m/%d")(d["Date"])
    });
    // console.log(Date_X)
    //console.log(Date_X)
    x.domain(d3.extent(Date_X, (d) => { return d }))
    xAxis.transition().duration(100)
        .call(d3.axisBottom(x).tickFormat(axisTimeFormat.format("%Y/%-m/%-d")))
        .selectAll("text")
        .attr("class", 'xAxisLable')
    /* .style('transform', 'rotate(-45deg)')
    .style('text-anchor', "end")
    .style("font-size", "12px")
    .style("font-weight", "bold") */



    var stackedData = d3.stack().offset(d3.stackOffsetSilhouette)
        .keys(areas)(data)

    MAX = []
    stackedData[stackedData.length - 1].forEach((d) => {
        // console.log(d["1"])
        MAX.push(d["1"])
    })
    // console.log(d3.max(MAX))

    y.domain([-d3.max(MAX) * 1.25, d3.max(MAX) * 1.25])
    var u = svg.selectAll("mylayers")
        .data(stackedData)


    var Tooltip = svg.append("text")
        .attr("x", 0)
        .attr("y", 25)
        .style("opacity", 0)
        .style("font-size", 22)
        .style("font-weight", "bold");

    var mouseover = function (d) {
        //console.log(this)
        Tooltip.style("opacity", 1)
        d3.selectAll(".myArea").style("opacity", .2)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    };
    var mousemove = function (d, i) {
        grp = areaMap[areas[i]]
        Tooltip.attr("fill", color(areas[i])).text(grp)
    };
    var mouseleave = function (d) {
        Tooltip.style("opacity", 0)
        d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
    };

    u.enter()
        .append("path")
        .attr("class", "streamgraph")
        .merge(u)
        .transition()
        .duration(1000)
        .style("fill", function (d) { return color(d.key); })
        .attr("d", d3.area()
            .x(function (d, i) { return x(d3.timeParse("%Y/%m/%d")(d.data.Date)); })
            .y0(function (d) { return y(d[0]); })
            .y1(function (d) { return y(d[1]); })
        )
        .attr("class", "myArea")
        .style('cursor', "pointer")


    d3.selectAll("path.streamgraph")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
}

streamgraphPlt(figContainer = "#streamgraph", data = asymptomatic_data)

// 较急	urgent
// 紧急	acute
// 极紧急	critical

var scatterOpacityMap = {
    "urgent" : "0.3",
    "acute" : "0.6",
    "critical" : "1"
}
var scatter_df_url = 'https://raw.staticdn.net/LYA0728/dataJournalism/main/data/scatter_df.csv';
var scatter_df_url2 = 'https://fastly.jsdelivr.net/gh/LYA0728/dataJournalism/data/scatter_df.csv';


d3.csv(scatter_df_url2, (data) => {
    // console.log(data)

    let Date_x = data.map((d) => {
        return d["date"]
    });
    Date_x = new Set([...Date_x]);

    // console.log(Array.from(Date_x))

    let hour = data.map((d) => {
        return Number(d["hour"])
    });
    hour = new Set([...hour]);
    // console.log(hour)

    let helpLevel = data.map((d) => {
        return d["helpLevel"]
    });

    helpLevel = new Set([...helpLevel]);
    // console.log(helpLevel)

    let Frequency = data.map((d) => {
        return Number(d["Frequency"])
    });
    // console.log(d3.extent(Frequency))

    var scatter = d3.select("#scatter").append("svg")
        .attr('width', $("#scatter").width())
        .attr('height', $("#scatter").width() / 16 * 9)
        .append("g")
        .attr('transform', `translate(${plotConfig["left"]}, ${plotConfig["top"]})`)

    let x = d3.scaleBand()
        .range([0, width])
        .domain(Array.from(Date_x))
        .padding(0.1)

    scatter.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSize(0))

        .selectAll('text')
        .attr("class", "xAxisLable");
    // .select(".domain").remove()           // 移除 x 轴线

    yDomian = Array.from(hour).sort((a, b) => { return a - b })
    const y = d3.scaleBand()
        .range([height, 0])
        .domain(yDomian)
        .padding(0.1);
    scatter.append("g")
        .style("transform", "translate(-10px, -10px)")
        .call(d3.axisLeft(y).tickSize(0))
        .selectAll('text')
        .style("text-anchor", "end")

    let sizeScale = d3.scaleLinear().range([2.5, 12.5]).domain([0, 130]);


    scatter.selectAll("circle")
        .append("g")
        .data(data)
        .enter()
        .append("circle")
        .style("cursor", "pointer")
        .attr("opacity", (d)=>{
            // console.log(scatterOpacityMap[d["helpLevel"]])
            return scatterOpacityMap[d["helpLevel"]]
            // return scatterColorMap[d["helpLevel"]]
            // scatterOpacityMap
        })
        .attr("fill", "#E4AEAE")
        .attr("cx", (d) => { 
            // console.log(scatterColorMap[d["helpLevel"]])
            return x(d["date"]) })
        .attr("cy", function (d) { return y(Number(d["hour"])) })
        .attr("r", (d) => { return sizeScale(Number(d["Frequency"])) });
});

/* let arr1 = [1,2,3,3];
let s1 = new Set([...arr1])
console.log(s1) */


// select lineChart

var selectedCOVID_tend_url = "https://fastly.jsdelivr.net/gh/LYA0728/dataJournalism/data/selectedCOVID_tend.csv";
var demanData_url = "https://fastly.jsdelivr.net/gh/LYA0728/dataJournalism/data/demandData.json"
d3.csv(selectedCOVID_tend_url, (data) => {
    let Areas = data.map((d) => {
        return d["area"];
    })

    // console.log(Areas.keys())

    Areas = new Set([...Areas]);
    // console.log(Array.from(Areas))

    d3.select("#selectButton")
        .selectAll('option')
        .data(Array.from(Areas))
        .enter()
        .append('option')
        .text(function (d) { return `${areaMap[d]}`; })
        .attr("value", function (d) { return d; });
});


d3.json(demanData_url, (data) => {
    /* for(i in data){
        // console.log(data[i][0])
        data[i] = [JSON.parse(data[i])]
    } */

    //console.log(data)
    var opts = document.querySelectorAll("#selectButton > option");
    const areas = [];
    opts.forEach((d) => {
        areas.push(d.getAttribute('value'))
        // console.log()
    });

    let selectData = []
    //console.log(areas)
    data[areas[0]].forEach((d) => {
        selectData.push(JSON.parse(d))
    })

    //console.log(data[areas[0]]);

    // console.log(selectData)

    helpType = []
    for (i in selectData[0]) {
        if (i != "date") {
            helpType.push(i)
        }
    };
    // console.log(helpType)
    var Date_x = selectData.map((d) => {
        return d3.timeParse("%Y-%m-%d")(d["date"])
    });
    // console.log(Date_x)
    const stackBarPlotSvg = d3.select("#stackbarplot").attr("class", "flexContainer")
        .append('svg')
        .attr("width", $("#stackbarplot").width())
        .attr("height", $("#stackbarplot").width() / 16 * 9)
        /* .style("background", 'red') */
        .attr("class", "flexContainer")
        .append("g")
        .attr("transform", `translate(${plotConfig["left"]}, ${plotConfig["top"] - 10})`);

    const x1 = d3.scaleTime().domain(d3.extent(Date_x, (d) => { return d })).range([0, $("#stackbarplot > svg").width() * 0.95]);

    stackBarPlotSvg.append("g")
        .attr("transform", `translate(0,${height - 10})`)
        // tickSizeOuter —— 设置坐标轴两端刻度的长度
        .call(d3.axisBottom(x1).ticks(39).tickFormat(axisTimeFormat.format("%Y/%-m/%-d")))
        .selectAll("text")
        //.style('transform', '')
        .style('text-anchor', "start")
        .attr("class", "test")
        //.style("vertical-align","top")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style('transform', 'rotate(90deg)')
        .attr("alignment-baseline", "middle");

    var stackedData = d3.stack()
        .keys(helpType)
        (selectData)

    yDomian = stackedData[stackedData.length - 1].map((d) => {
        // console.log(d[1])
        return d[1]
    });

    var y = d3.scaleLinear()
        .domain([0, d3.max(yDomian) + 10])
        .range([height - 10, 0]);
    stackBarPlotSvg.append("g").attr("id", "stackY")
        .call(d3.axisLeft(y));

    const color = d3.scaleOrdinal().domain(helpType).range(d3.schemeCategory20);

    var u = stackBarPlotSvg.append("g")
        .attr('class',"stackbar")
        .attr("id", 'existSatckbar')
        .selectAll("bar")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        
        u.enter()
        .append("g")
        
        .merge(u)
        .attr("fill", function (d) {
            // console.log(d);
            return color(d.key);
        })// key为subgroups
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        // 第二次数据绑定，将每个groups的分组数据循环绑定到rect（矩形）中
        .data(function (d) {
            //console.log(d);
            return d
        })
        .enter()
        .append("rect")
        .attr("class", "testBar")
        .attr("x", function (d) {
            // 这里循环的是每一个group,但需循环3次，将所有subgroups循环一次
            // console.log(d.data);
            return x1(d3.timeParse("%Y-%m-%d")(d.data.date));
        })
        .attr("y", function (d) {
            //console.log(d,d[1]);
            return y(d[1]);
        })
        .attr("height", function (d) { return y(d[0]) - y(d[1]); })
        // 每一个高度由当前累计占比减去上一次累计占比
        .attr("width", 27);

    $("#selectButton").on('change', function () {
        let selectedArea = $(this).find("option:selected").attr("value");

        console.log(1)
        selectData = [];
        //console.log(areas)
        data[selectedArea].forEach((d) => {
            selectData.push(JSON.parse(d))
        });
        // console.log(selectData)
        var stackedData = d3.stack()
            .keys(helpType)
            (selectData)

        yDomian = stackedData[stackedData.length - 1].map((d) => {
            // console.log(d[1])
            return d[1]
        });

        y = d3.scaleLinear().domain([0, d3.max(yDomian) + 10])
            .range([height - 10, 0]);

        d3.select("g#stackY")
            .transition().duration(500)
            .call(d3.axisLeft(y));

            $("g#existSatckbar").remove();
            var u = stackBarPlotSvg.append("g")
            .attr('class',"stackbar")
            .attr("id", 'existSatckbar')
            .selectAll("bar")
            // Enter in the stack data = loop key per key = group per group
            .data(stackedData)
            
            u.enter()
            .append("g")
            
            .merge(u)
            .attr("fill", function (d) {
                // console.log(d);
                return color(d.key);
            })// key为subgroups
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            // 第二次数据绑定，将每个groups的分组数据循环绑定到rect（矩形）中
            .data(function (d) {
                //console.log(d);
                return d
            })
            .enter()
            .append("rect")
            .attr("class", "testBar")
            .attr("x", function (d) {
                // 这里循环的是每一个group,但需循环3次，将所有subgroups循环一次
                // console.log(d.data);
                return x1(d3.timeParse("%Y-%m-%d")(d.data.date));
            })
            .attr("y", function (d) {
                //console.log(d,d[1]);
                return y(d[1]);
            })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            // 每一个高度由当前累计占比减去上一次累计占比
            .attr("width", 27);
    })
});


d3.csv(selectedCOVID_tend_url, (error, data) => {
    if (error) throw error;
    // console.log(data)
    let Areas = data.map((d) => {
        return d["area"];
    })

    // console.log(Areas.keys())

    Areas = new Set([...Areas]);
    // console.log(Array.from(Areas))

    /* d3.select("#selectButton")
        .selectAll('option')
        .data(Array.from(Areas))
        .enter()
        .append('option')
        .text(function (d) { return `${areaMap[d]}`; })
        .attr("value", function (d) { return d; }); */

    const color = d3.scaleOrdinal().domain(Array.from(Areas)).range(d3.schemeCategory20);

    let Date_x = data.map((d) => {
        // console.log(d)
        return d["Date"]
    });
    // console.log(Date_x)
    Date_x = new Set([...Date_x]);

    // d3.timeParse("%Y/%m/%d")(d["Date"])
    // console.log(Date_x)
    let x = d3.scaleTime().domain(d3.extent(Array.from(Date_x), (d) => { return d3.timeParse("%Y/%m/%d")(d) })).range([0, $("#stackbarplot > svg").width() * 0.95]);

    let yVulue = data.map((d) => {
        return Number(d["n"])
    });
    // console.log(d3.extent(yVulue))

    let y = d3.scaleLinear().range([height - 10, 0]);
    var svg = d3.select("#stackbarplot > svg > g")


    var lineGenerator = d3.line().curve(d3.curveCardinal);

    //console.log(data)
    let selected_data = data.filter((d) => {
        // console.log(d["type"] == "asymptomatic")
        // console.log(d["area"] == Array.from(Areas)[0] & 1)
        return (d["type"] == "asymptomatic" & d["area"] == Array.from(Areas)[0])
    });
    let selected_data2 = data.filter((d) => {
        // console.log(d["type"] == "asymptomatic")
        // console.log(d["area"] == Array.from(Areas)[0] & 1)
        return (d["type"] == "localCOVID" & d["area"] == Array.from(Areas)[0])
    });


    var Ymax = d3.max(d3.extent([...selected_data2, ...selected_data], (d) => { return Number(d["n"]) }));
    y.domain([0, Ymax]);
    svg.append("g")
        .attr("transform", `translate(${width - 0},0)`)
        .attr("id", "changeYaxis")
        .call(d3.axisLeft(y));

    let xy = selected_data.map((d) => {
        // console.log()
        return [x(d3.timeParse("%Y/%m/%d")(d["Date"])), y(Number(d["n"]))]
    });


    let xy2 = selected_data2.map((d) => {
        // console.log()
        return [x(d3.timeParse("%Y/%m/%d")(d["Date"])), y(Number(d["n"]))]
    });

    let pathData = lineGenerator(xy);
    let pathData2 = lineGenerator(xy2);

    var pathLine = svg.append("g").attr("id", "asymptomaticLine").append('path')
        .attr("d", pathData)
        .style("fill", "none")
        .attr("stroke", "#999")
        .attr("id", "PA")
        .style("stroke-width", "2.5");

    var pathLine2 = svg.append("g")
        .attr("id", "localCOVIDLine")
        .append('path')
        .attr("d", pathData2)
        .style("fill", "none")
        .attr("stroke", "red")
        .attr("id", "PA2")
        .style("stroke-width", "2.5");

    function upData(selectedArea) {
        let selected_data = data.filter((d) => {
            // console.log(d["type"] == "asymptomatic")
            // console.log(d["area"] == Array.from(Areas)[0] & 1)
            return (d["type"] == "asymptomatic" & d["area"] == selectedArea)
        });

        selected_data2 = data.filter((d) => {
            // console.log(d["type"] == "asymptomatic")
            // console.log(d["area"] == Array.from(Areas)[0] & 1)
            return (d["type"] == "localCOVID" & d["area"] == selectedArea)
        });

        Ymax = d3.max(d3.extent([...selected_data2, ...selected_data], (d) => { return Number(d["n"]) }));

        y.domain([0, Ymax]);
        d3.select("g#changeYaxis")
            .transition().duration(500)
            .call(d3.axisLeft(y));

        xy = selected_data.map((d) => {
            // console.log()
            return [x(d3.timeParse("%Y/%m/%d")(d["Date"])), y(Number(d["n"]))]
        });

        xy2 = selected_data2.map((d) => {
            // console.log()
            return [x(d3.timeParse("%Y/%m/%d")(d["Date"])), y(Number(d["n"]))]
        });

        let pathData = lineGenerator(xy);
        let pathData2 = lineGenerator(xy2);

        pathLine.transition().duration(1000).attr("d", pathData)
            .style("fill", "none")
            .attr("stroke", "#999")
            .attr("id", "PA")
            .style("stroke-width", "2.5");

        pathLine2.transition().duration(1000).attr("d", pathData2)
            .style("fill", "none")
            .attr("stroke", "red")
            .attr("id", "PA")
            .style("stroke-width", "2.5");
            
        /* $("#stackbarplot > svg > g").append('<use xlink:href="#asymptomaticLine"/>')
        $("#stackbarplot > svg > g").append('<use xlink:href="#localCOVIDLine"/>') */
    };

    d3.select("#selectButton").on("change", function () {
        console.log(2)
        var selectedArea = d3.select(this).property("value")
        // console.log(selectedArea)
        upData(selectedArea)

        $("g#localCOVIDLine").appendTo($("#stackbarplot > svg > g"))
        $("g#asymptomaticLine").appendTo($("#stackbarplot > svg > g"))
    });
});
