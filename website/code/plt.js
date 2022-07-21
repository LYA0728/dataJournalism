/* const width = plotSize["width"] - plotMargin["left"] - plotMargin["right"];
const height = plotSize["height"] - plotMargin["top"] - plotMargin["bottom"]; */


/* 使用面向对象封装绘图函数 */

function plt(element, dataInfo = null, x = null, y = null, xType = null, yType = null, layout = null, plotType = null) {
    /* this指向选中的网页元素 */
    this.dataInfo = dataInfo;
    this.element = element;

    this.plotType = plotType;
    this.svgSelector = `${this.element.nodeName}#${this.element.id}>div.plotMain > svg`;
    this.element.setAttribute("style", `height:${plotSize["height"]}px; z-index:-1`);
    this.layout = layout;
    this.element && this[`render`]();
    this.plotType && this[`${plotType}`]();
    // console.log(this.plotType)
    //tooltip && this.tooltip();
    // console.log(this.width, this.height)

};

plt.prototype = {
    "render": function () {

        /* 生成html元素，然后插入this */
        /* const _this = this; */
        this.plotTitle = document.createElement("div");
        this.plotTitle.setAttribute("class", "plotTitle");
        // this.plotTitle.appendChild(document.createElement("select"))
        if (this.layout) this.plotTitle.innerHTML = `<p>${this.layout["poltTitle"]}</p>`;
        this.element.appendChild(this.plotTitle);

        this.dropdown = document.createElement("select");
        this.dropdown.setAttribute("class", "plotDropdown");
        if (this.layout && this.layout["dropdown"]) this.element.appendChild(this.dropdown);
        this.dropdownSelector = d3.select(`${this.element.nodeName}#${this.element.id} select`);


        this.plotMain = document.createElement("div");
        this.plotMain.setAttribute("class", "plotMain");
        this.element.appendChild(this.plotMain);
        if (this.layout) { this.plotMain.appendChild(document.createElement("select")); }

        this.plotFooter = document.createElement("div");
        this.plotFooter.setAttribute("class", "plotFooter");
        this.element.appendChild(this.plotFooter);

        this.plotMain.innerHTML = `<svg width=${this.plotMain.offsetWidth} height=${this.plotMain.offsetHeight}></svg>`;
        this.height = this.plotMain.offsetHeight - plotMargin["top"] - plotMargin["bottom"];
        this.width = this.plotMain.offsetWidth - plotMargin["left"] - plotMargin["right"];
        /* console.log(this.svgSelector) */
        this.svg = d3.select(this.svgSelector)
            .append("g")
            .attr("transform", `translate(${plotMargin["left"]}, ${plotMargin["top"]})`);

        this.plotXaxis = this.svg.append("g").classed("x-axis", true).attr("transform", `translate(0, ${this.height})`);
        this.plotYaxis = this.svg.append("g").classed("y-axis", true);

        this.tooltip = document.createElement("div")
        this.tooltip.setAttribute("class", "tootip")
        this.plotMain.insertBefore(this.tooltip, this.plotMain.firstChild)
        // console.log(this.plotMain.firstChild)

        // x 轴
        if (xType == "time") {
            this.xScale = d3.scaleTime().range([0, this.width]);
            this.xAxis = d3.axisBottom(this.xScale).tickSizeOuter(0)
                .ticks(25)
                .tickFormat(axisTimeFormat.format('%-m/%-d'))
                .scale(this.xScale);
        } else if (xType == "category") {
            // console.log('band')
            this.xScale = d3.scaleBand().range([0, this.width]).padding(1);
            this.xAxis = d3.axisBottom(this.xScale).tickSizeOuter(0)
                .scale(this.xScale);
        }

        /* console.log(this.layout) */
        if (this.layout && this.layout["axis"]) this.plotXaxis.transition().duration(500).call(this.xAxis);



        // y 轴
        if (yType == "int") {
            this.yScale = d3.scaleLinear().range([this.height, 0]);
        }

        /* console.log(this.layout) */
        this.yAxis = d3.axisLeft().tickSizeOuter(0).scale(this.yScale);
        if (this.layout && this.layout["axis"]) this.plotYaxis.transition().duration(500).call(this.yAxis);
    },

    "stackBar": function () {
        let _this = this
        d3[this.dataInfo["url"].split(".").pop()](dataInfo["url"]).then(function (rowdata) {
            _this.plotMain.rowdata = rowdata
            d3.select(`select.${_this.dropdown.className}`)
                .on("change", toggle)
                .selectAll("option")
                .data(Object.keys(rowdata).reverse())
                .join("option")
                .attr("value", (d) => { return d })
                .text((d) => { return areaMap[d] })

            function toggle() {
                $("div#stackBarWithLine g.plot").remove();
                _this.plotMain.selectedArea = $(`select.${_this.dropdown.className}`).find("option:selected").attr("value");
                // console.log(_this.plotMain.selectedArea)
                _this.plotMain.seldata = _this.plotMain.rowdata[_this.plotMain.selectedArea].map((d) => { return JSON.parse(d) });
                _this.plotMain.subgroups = Object.keys(_this.plotMain.seldata[0]).slice(1);
                _this.plotMain.stackData = d3.stack().keys(_this.plotMain.subgroups)(_this.plotMain.seldata);
                _this.xDomain = d3.extent(_this.plotMain.seldata, (d) => { return d3.timeParse("%Y-%m-%d")(d[`${x}`]) });

                _this.xScale.domain(_this.xDomain);
                _this.yScale.domain([0, 1.10 * d3.max(_this.plotMain.stackData[_this.plotMain.subgroups.length - 1].map((d) => { return d[1] }))]);

                // console.log(_this.plotMain.stackData)
                _this.plotXaxis.transition().duration(500).call(_this.xAxis);
                _this.plotYaxis.transition().duration(500).call(_this.yAxis);
                _this.svg.append("g").classed("plot", true)
                    .selectAll("g")
                    .data(_this.plotMain.stackData)
                    .join("g")
                    .attr("fill", (d) => { return colorMap[d["key"]] })
                    .attr("class", (d) => { return classMap[d["key"]] })
                    .selectAll('rect')
                    .data((d) => { return d })
                    .join("rect")
                    .attr("ry", 3)

                    .attr("x", (d) => { return _this.xScale(d3.timeParse("%Y-%m-%d")(d["data"][`${x}`])) })
                    .attr("y", (d) => { return _this.yScale(0) })
                    .attr("height", 0)
                    .attr("width", _this.width / _this.plotMain.stackData[0].length)
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)

                _this.svg.selectAll("rect").transition().duration(1550)
                    .attr("y", (d) => { return _this.yScale(d[1]) })
                    .attr("height", (d) => { return (_this.yScale(d[0]) - _this.yScale(d[1])) })
                    .delay(function (d, i) { return (i * 10) });
            };
            // d3.select(`select.${_this.dropdown.className}`).property("value");

            toggle(_this.plotMain.selectedArea)
            function mouseover(event, d) {
                // console.log(d)
                /* console.log(event.layerX, event.layerY) */

                _this.tooltip.setAttribute("style", `opacity:1`)
            };
            function mousemove(event, d) {

                _this.tooltip.setAttribute("style", `opacity:1;transform: translate(${event.layerX + _this.width / 80}px,${event.layerY}px);`);
                _this.tooltip.innerHTML = `日期:${d["data"]["date"]}<br>
                                                求助类型:${d3.select(this.parentNode).datum().key}<br>
                                                求助数量:${d["data"][d3.select(this.parentNode).datum().key]}
                                                `
                _this.svg.selectAll("g.plot > g").style("opacity", 0.25)
                _this.svg.select(`g.${classMap[d3.select(this.parentNode).datum().key]}`).style("opacity", 1)
            }

            function mouseleave(event, d) {
                _this.tooltip.setAttribute("style", `opacity:0;transform: translate(${event.layerX + _this.width / 80}px,${event.layerY}px);`)
                _this.svg.selectAll("g.plot > g").style("opacity", 1)
            }
        })
    },

    "scatterHeatMap": function () {
        let _this = this;
        d3[this.dataInfo["url"].split(".").pop()](dataInfo["url"]).then(function (rowdata) {

            _this.selValues = Array.from(new Set([...rowdata.map((d) => { return d["type"] })]));
            _this.dropdownSelector
                .on('change', dataToggle)
                .selectAll("option")
                .data(_this.selValues)
                .join("option")
                .attr("value", (d) => { return d })
                .text((d) => { return selmap[d] });

            function dataToggle() {
                if ($(`div#scatterHeatMap g.plot`).length > 0) { $("div#scatterHeatMap g.plot").remove() }


                _this.plotMain.selectedValue = $(`${_this.element.nodeName}#${_this.element.id} select`).find("option:selected").attr("value");
                _this.plotMain.seldata = rowdata.filter((d) => { return d["type"] == _this.plotMain.selectedValue });
                _this.xDomain = Array.from(new Set([...rowdata.map((d) => { return d[x] })]))
                _this.xScale.domain(_this.xDomain);

                _this.plotXaxis.transition().duration(500).call(_this.xAxis);
                _this.sizeDomain = [_this.width / _this.xDomain.length / 6, _this.width / _this.xDomain.length / 2]
                //console.log(_this.sizeDomain)
                _this.sizeScale = d3.scaleLinear().domain(d3.extent(Array.from(new Set([..._this.plotMain.seldata.map((d) => { return d['Frequency'] })])), (d) => { return Number(d) })).range(_this.sizeDomain);

                _this.yScale.domain([0, d3.extent(Array.from(new Set([...rowdata.map((d) => { return Number(d[y]) })])), (d) => { return d })[1]]);
                _this.plotYaxis.transition().duration(500).call(_this.yAxis);

                _this.svg.append("g").classed("plot", true)
                    .selectAll("circle")
                    .data(_this.plotMain.seldata)
                    .join("circle")
                    .attr("cx", (d) => { return _this.xScale(d[x]) })
                    .attr("cy", (d) => { return _this.yScale(d[y]) })
                    .attr("r", 0)
                    .attr("opacity", 0)
                    .attr("fill", "#2BAA5D")
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)

                _this.svg.selectAll("circle").transition().duration(1600)
                    .attr("r", (d) => { return _this.sizeScale(d['Frequency']) })
                    .attr("opacity", (d) => { return scatterOpacityMap[d["helpLevel"]] });
            }

            function mouseover(event, d) {
                _this.tooltip.setAttribute("style", `opacity:1`)
            };

            function mousemove(event, d) {

                _this.tooltip.setAttribute("style", `opacity:1;transform: translate(${event.layerX + _this.width / 80}px,${event.layerY}px);`);
                //console.log(d)

                _this.tooltip.innerHTML = `日期:${d[x]}<br>
                                            时间:${d[y]}h<br>
                                            求助数量:${d['Frequency']}<br>
                                            紧急程度:${textmap[d["helpLevel"]]}
                                            `
            };

            function mouseleave(event, d) {
                _this.tooltip.setAttribute("style", `opacity:0;transform: translate(${event.layerX + _this.width / 80}px,${event.layerY}px);`)
            };
            dataToggle()
        })
    },

    "scatterLine": function (data, mapping, markerColor, lineColor, ylimit = false, markerSize) {
        this.xScale.domain(data[mapping["x"]]);
        this.plotXaxis.transition().duration(500).call(this.xAxis);

        if (!ylimit) this.yScale.domain([0, Math.floor(1.25 * d3.max(data[mapping["x"]]))])
        ylimit && this.yScale.domain(ylimit)
        this.plotYaxis.transition().duration(500).call(this.yAxis);
        console.log(data)
        this.svg.append("g").classed("plot", true)

        this.lineGenerator = d3.line().curve(d3.curveCardinal);
        this.dataXY = [];
        for (let i = 0; i < data[mapping["x"]].length; i++) {
            let point = [this.xScale(data[mapping["x"]][i]) + this.xScale.bandwidth() / 2, this.yScale(data[mapping["y"]][i])];
            this.dataXY.push(point)
        };

        this.linePath = this.lineGenerator(this.dataXY);
        this.svg.select("g.plot").append("path")
            .attr("d", this.linePath)
            .style("fill", "none")
            .attr("stroke", lineColor)
            .style("opacity", 1)
            .style("stroke-width", "2.5");

        for (let i = 0; i < data[mapping["x"]].length; i++) {
            this.svg.select("g.plot").append("circle")
                .attr("fill", markerColor)
                .attr("r", markerSize)
                .attr("cx", this.xScale(data[mapping["x"]][i]) + this.xScale.bandwidth() / 2)
                .attr("cy", this.yScale(data[mapping["y"]][i]));

            this.svg.select("g.plot").append("text")
                .attr("x", this.xScale(data[mapping["x"]][i]) + this.xScale.bandwidth() / 2)
                .attr("y", this.yScale(data[mapping["y"]][i]))
                .attr("dy", -6)
                .attr("fill", '#fff')
        };
    }

}



new plt(document.querySelector("div#stackBarWithLine"),
    dataInfo = {
        url: demanData_url
    },
    x = "date",
    y = "",
    xType = "time",
    yType = "int",
    layout = { 'poltTitle': "4月7日~5月15日每日求助类型及其数量", 'dropdown': true, "axis": true },
    plotType = "stackBar",
    tooltip = true
);

new plt(document.querySelector("div#scatterHeatMap"),
    dataInfo = {
        url: 'https://raw.githubusercontents.com/LYA0728/dataJournalism/main/data/scatter_df_long.csv',
        x: "date",
        y: "hour"
    },
    x = "date",
    y = "hour",
    xType = "category",
    yType = "int",
    layout = { 'poltTitle': "4月7日~5月15日每日求助类型及其数量(按小时划分)", 'dropdown': true, "axis": true },

    plotType = "scatterHeatMap"
);


/* (() => {
    let categories = ['医院治疗（急诊）', '阳性隔离收治', '车辆配送', '化疗放疗', '血液透析', '核酸检测'];
    let yValue = [233, 203, 153, 74, 33, 30],

    fileName = ["hospital", "cure", "carTransform", "chemotherapy", "blood", "hesuan"];
    if (mediaQuery.matches) {
        fileName = fileName.map((d) => { return `mobile-${d}` })
    }
    

    let divs = `<div class="bars"></div><div class="xaxis"></div>`
    $('div#simpleBarChart').html(divs)

    let height = $('div#simpleBarChart').height()*0.85;
    let width = $('.bars').width();

    const x = d3.scaleBand().domain(categories).range([0, width]).padding(0.25);
    const y = d3.scaleLinear().domain([0, 250]).range([0, height]);

    divs = `<div class="barItem"></div>`;
    $(".bars").html(divs.repeat(yValue.length));

    divs = `<div class="xlabel"></div>`;
    $(".xaxis").html(divs.repeat(yValue.length));

    for (let i = 0; i < yValue.length; i++) {
        $("div.barItem").eq(i).css({
            "height": y(yValue[i]),
            "width": x.bandwidth(),
        })

        $("div.barItem").eq(i).attr({
            'data-toggle': "tooltip",
            'data-placement': "top",
            "title": `${categories[i]}:${yValue[i]}`
        })



        $('.xlabel').eq(i).html(categories[i])

        let barWidth = $(".barItem").eq(i).width(), barHeight = $(".barItem").eq(i).height();
        
        img = `<img class="img-responsive" style="width:${Math.floor(barWidth / 4)}px;height:${Math.floor(barWidth / 4)}px" src='./img/${fileName[i]}.svg'>`;
        let Num = Math.floor(barHeight / (Math.floor(barWidth / 4)));
        $(".barItem").eq(i).html(img.repeat(4 * Num));



        let bgStyle = {
            'background-repeat': 'no-repeat',
            'background-position': 'center',
            'background-size': 'cover',
            "background": `url('./img/${fileName[i]}.svg')`
        }

        $(".barItem").eq(i).find("div.circle").css(bgStyle)
    };

    // 交互效果
    $("div.barItem").on("mouseover", function () {

        $("div.barItem").css({ "opacity": 0.5 })
        $(this).css({ "opacity": 1 })
    }).on("mouseleave", () => {
        $("div.barItem").css({ "opacity": 1 })
    });
})(); */


/* (function () {
    var center = [0.5 * $("div#forceCircle").width(), 0.5 * $("div#forceCircle").height()];
    
    let goodType = ['其它', '导尿管、吸痰管', '造口袋', '氧气瓶/袋', '物理支架', '拉拉裤', '注射器', '检测试剂', '温度计', '冲洗器', '护理液', '未知', '眼镜', '针头'];
    let Num = [14, 24, 14, 6, 11, 68, 3, 1, 1, 1, 1, 3, 1, 1,];
    let fileName = ["other.svg", "pipeline.svg", "bag2.svg",
        "oxygenCylinder.svg", "crutch.svg", "diaper.svg", "syringe.svg", "testkit.svg", "thermometer.svg", "wash.svg",
        'Nursing liquid.svg', 'unknown.svg', "glass.svg", "needle.svg"
    ]

    let radiusRange = !mediaQuery.matches ? [35, 180] : [20, 90];

    let radiusScale = d3.scaleLinear().domain([0, 80]).range(radiusRange)
    let nodes = [];
    for (let i = 0; i < Num.length; i++) {
        Num[i] > 10 ? label = goodType[i] : label = "";
        nodes.push({ 'radius': radiusScale(Num[i]), 'category': 1, 'label': label, "fileName": fileName[i] })
    };

    var ticked = function () {

        d3.select("div#forceCircle > svg")
            .selectAll('circle')
            .data(nodes)
            .join('circle')
            .attr("class", "circle")
            .attr('r', (d) => { return d.radius })
            .style('fill', "rgba(43,170,93,0.5)")
            .style('stroke', "#2BAA5D")
            .style('stroke-width', "3.5px")
            .attr('cx', (d) => { return d.x })
            .attr('cy', (d) => { return d.y });

        d3.select("div#forceCircle > svg")
            .selectAll('image')
            .data(nodes)
            .join('image')
            .attr('width', (d) => { return d.radius * 1.5 })
            .attr('height', (d) => { return d.radius * 1.5 })
            .attr('x', (d) => { return d.x - d.radius / 1.3 })
            .attr('y', (d) => { return d.y - d.radius / 1.3 })
            .attr("xlink:href", (d) => { return `img/${d["fileName"]}` })
            .attr("preserveAspectRatio", "none meet")
            .attr("cursor", "pointer")

        d3.select("div#forceCircle > svg")
            .selectAll('text')
            .data(nodes)
            .join('text')
            .style('font-weight','bold')
            .style('font-family', 'NotoSansCJK-Bold')
            .attr("x", (d) => {
                result = d['label'].length > 3 ? d.x - d.radius / 1.05 : d.x - d.radius / 1.65
                return result
            })
            .attr("fill","#000")
            .attr('y', (d) => { return d.y })
            .attr('dy', 6)
            .attr('font-size', (d) => {
                let fontSize = mediaQuery.matches ? 8 : 20;
                return fontSize
            })
            .attr('textLength', (d) => {
                result = d['label'].length > 3 ? d.radius * 1.95 : d.radius * 1.25
                return result
            })
            .text((d) => { return d['label'] })

    }

    var simulation = d3.forceSimulation(nodes)
        .force("change", d3.forceManyBody().strength(12))
        .force('center', d3.forceCenter(center[0], center[1]))
        .force("collision", d3.forceCollide().radius((d) => { return d["radius"] }))
        .on('tick', ticked);
})(); */



/* new plt(document.querySelector("div#stackBarWithLine2"),
    dataInfo = null, x = null, y = null, 
    xType = "category",
    yType = "int",
    layout = { 'poltTitle': "2011~2022年中国大陆透析患者平均年龄及数量", 'dropdown': false, "axis": true },
    plotType = false
).scatterLine(data = {
    'year': [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
    'averageAge': [53.1, 52.4, 54.7, 54.9, 55.7, 56.1, 56.3, 55.9, 56.4, 56.9],
},
    mapping = { "x": "year", "y": "averageAge" },
    markerColor = "#91BED1",
    lineColor = "#5C91C5",
    ylimit = [50, 60],
    markerSize = radiusRange[1] * 0.75
) */


// 补充折线图
let url = "https://fastly.jsdelivr.net/gh/LYA0728/dataJournalism/data/selectedCOVID_tend_new2.csv";


d3.csv(url).then((data) => {
    let width = document.querySelector("div#stackBarWithLine div.plotMain").offsetWidth - plotMargin["left"] - plotMargin["right"],
        height = document.querySelector("div#stackBarWithLine div.plotMain").offsetHeight - plotMargin["top"] - plotMargin["bottom"];
    xDomain = Array.from(new Set(data.map((d) => { return d["Date"] })));
    var lineGenerator = d3.line().curve(d3.curveCardinal),
    yScale = d3.scaleLinear().range([height, 0]),
    xScale = d3.scaleBand().range([0, width]).padding(1).domain(xDomain);

    d3.select("div#stackBarWithLine svg > g")
            .append('g').attr("transform", `translate(${width}, ${0})`)
            .attr("class", 'y-axis2').transition().duration(500).call(d3.axisRight(yScale).tickSizeOuter(0));

    legend = d3.select("div#stackBarWithLine svg > g")
        .append('g')
        .attr("class", 'legend')
        .attr("transform", `translate(${width*0.8}, ${height*0.15})`);

    legend.append("line")
        .attr("x1", 0)
        .attr("x2", width * 0.035)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", "#CA6867")
        .attr("stroke-width", "3.5");
    legend.append("text").attr("x", width * 0.045)
        .attr("y", 5)
        .text("新增本土趋势")
        .style("fill", "#CA6867")
        .attr("text-anchor", "start");

    legend.append("line")
        .attr("x1", 0)
        .attr("x2", width * 0.035)
        .attr("y1", 25)
        .attr("y2", 25)
        .attr("stroke", "#5C91C5")
        .attr("stroke-width", "3.5");

    legend.append("text").attr("x", width * 0.045)
        .attr("y", 30)
        .style("fill", "#5C91C5")
        .text("新增无症状趋势")
        .attr("text-anchor", "start");


    let selArea = $('div#stackBarWithLine select').find("option:selected").attr("value");


    function plotToggle(selArea) {
        $('div#stackBarWithLine svg > g > g.linePlot').remove()
        svg = d3.select("div#stackBarWithLine svg > g")
            .append('g')
            .attr("class", 'linePlot')
        let plotData = data.filter((d) => { return d['area'] == selArea });
        let yMax = d3.max(plotData.map((d) => { return Number(d['n']) }));

        yScale.domain([0, 1.20 * yMax])

        let localCOVID = [], asymptomatic = [];
        plotData.forEach((d) => {
            // asymptomatic
            // localCOVID
            if (d["type"] == "localCOVID") {
                // console.log(d["Date"], d['n'])
                // console.log(xScale(d["Date"]),yScale([Number(d['n'])]))
                localCOVID.push([xScale(d["Date"]), yScale([Number(d['n'])])])
            } else {
                asymptomatic.push([xScale(d["Date"]), yScale([Number(d['n'])])])
            }
        });

        d3.select("div#stackBarWithLine svg > g > g.y-axis2").transition()
            .duration(500)
            .call(d3.axisRight(yScale).tickFormat((d)=>{
                d = Number(d)
                label = d>=1000?`${d*0.001}k`:d;
                return label}).tickSizeOuter(0));
        svg.append('path')
            .attr("d", lineGenerator(localCOVID))
            .style("fill", "none")
            .attr("stroke", "#CA6867")
            .style("opacity", "0")
            .style("stroke-width", "2.5");

        svg.append('path')
            .attr("d", lineGenerator(asymptomatic))
            .style("fill", "none")
            .attr("stroke", "#5C91C5")
            .style("opacity", "0")
            .style("stroke-width", "2.5");

        svg.selectAll("path").transition().duration(5550).style("opacity", "1")
            
    };
    plotToggle(selArea)
    $('div#stackBarWithLine select').on("change", ()=>{
        let selArea = $('div#stackBarWithLine select').find("option:selected").attr("value");
        plotToggle(selArea)
    })

})

