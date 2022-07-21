function plot(element, data) {
    this.element = element;
    this.selector = `${this.element.tagName}#${this.element.id}`;
    this.data = data

    this.element.setAttribute("class", "grid-graph");
    $(this.selector).css("width", $("div.graph").width())

    this.element.innerHTML = `
    
    <div class="plotTitle"><p></p></div>
    <div class="plotTip"><i></i></div>
    <div class="plotMain">
    <div class="tootip"></div>
    </div>
    <div class="plotFooter"><p></p></div>
    `;

    this.plotTitle = this.element.querySelector("div.plotTitle > p");
    this.plotTip = this.element.querySelector("div.plotTip > i");
    /* this.plotTip.innerHTML = "鼠标移入查看具体信息" */
    this.plotMain = this.element.querySelector("div.plotMain");
    this.plotFooter = this.element.querySelector("div.plotFooter>p");
    this.tootip = this.element.querySelector("div.plotMain > div.tootip");

    this.height = this.plotMain.offsetHeight - plotMargin["bottom"];
    this.width = this.plotMain.offsetWidth - plotMargin["left"] - plotMargin["right"];

    this.svg = d3.select(`${this.selector} > div.plotMain`)
        .append("svg")
        .attr("width", this.plotMain.offsetWidth)
        .attr("height", this.plotMain.offsetHeight)
        .append("g")
        .attr("transform", `translate(${plotMargin["left"]}, ${plotMargin["top"]})`);

    this.plotXaxis = this.svg.append("g").classed("x-axis", true)
        .attr("transform", `translate(0, ${this.height})`)
        ;
    this.plotYaxis = this.svg.append("g").classed("y-axis", true);

    this.yScale = d3.scaleLinear().range([this.height, 0]);
    this.yAxis = d3.axisLeft().tickSizeOuter(0).scale(this.yScale);
    this.plotYaxis.transition().duration(500).call(this.yAxis);

    this.xScale = d3.scaleLinear().range([0, this.width]);
    this.xAxis = d3.axisBottom().tickSizeOuter(0).scale(this.xScale);
    this.plotXaxis.transition().duration(500).call(this.xAxis);

}

plot.prototype = {

    "scatterLine": function (mapping, ylim = false,
        markerColor = '#487A7B',
        markerSize = radiusRange[1] * 0.75,
        lineColor = '#487A7B') {
        this.svg.append("g").classed("plot", true);


        this.xScale = d3.scaleBand()
            .range([0, this.width])
            .padding(0.25)
            .domain(this.data[mapping["x"]]);

        this.xAxis = d3.axisBottom().tickSizeOuter(0).scale(this.xScale);
        this.plotXaxis.transition().duration(500).call(this.xAxis);

        this.svg.select('g.x-axis').selectAll('text')
            .style('transform', 'rotate(0deg)')
            .style('text-anchor', 'middle');

        ylim && this.yScale.domain(ylim)
        !ylim && this.yScale.domain([0, 1.25 * d3.max(this.data[mapping["y"]])])
        this.plotYaxis.transition().duration(500).call(this.yAxis);

        this.lineGenerator = d3.line().curve(d3.curveCardinal);
        this.dataXY = [];
        for (let i = 0; i < this.data[mapping["x"]].length; i++) {
            let point = [this.xScale(this.data[mapping["x"]][i]) + this.xScale.bandwidth() / 2, this.yScale(this.data[mapping["y"]][i])];
            this.dataXY.push(point)
        };

        this.linePath = this.lineGenerator(this.dataXY);
        this.svg.select("g.plot").append("path")
            .attr("d", this.linePath)
            .style("fill", "none")
            .attr("stroke", lineColor)
            .style("opacity", 1)
            .style("stroke-width", "2.5");

        for (let i = 0; i < this.data[mapping["x"]].length; i++) {
            this.svg.select("g.plot").append("circle")
                .attr("fill", markerColor)
                .attr("r", markerSize)
                .attr("cx", this.xScale(this.data[mapping["x"]][i]) + this.xScale.bandwidth() / 2)
                .attr("cy", this.yScale(this.data[mapping["y"]][i]));

            this.svg.select("g.plot").append("text")
                .attr("x", this.xScale(this.data[mapping["x"]][i]) + this.xScale.bandwidth() / 2)
                .attr("y", this.yScale(this.data[mapping["y"]][i]))
                .attr("dy", -15)
                .attr("dx", -20)
                .attr("fill", '#000')
                
                .text(`${this.data[mapping["y"]][i]}岁`)
        };
        return this
    },

    "stackBar": function (data, subgroups,
        mapping, ylim = false) {
        let _this = this;

        this.stackBardata = data;

        this.xScale = d3.scaleBand()
            .range([0, this.width])
            .padding(0.25)
            .domain(this.data[mapping["x"]]);

        this.xAxis = d3.axisBottom().tickSizeOuter(0).scale(this.xScale);
        this.plotXaxis.transition().duration(500).call(this.xAxis);

        if (this.yScale) {
            this.plotYaxis2 = this.svg.append("g").classed("y-axis2", true).attr("transform", `translate(${this.width},0)`)
            this.yScale2 = d3.scaleLinear().range([this.height, 0]);
            this.yAxis2 = d3.axisRight().tickSizeOuter(0).scale(this.yScale2);
            this.plotYaxis2.transition().duration(500).call(this.yAxis2);
        };


        this.stackedData = d3.stack()
            .keys(subgroups)
            (this.stackBardata)

        this.yScale2.domain([0, 1.15 * d3.max(this.stackedData[this.stackedData.length - 1].map((d) => { return d[1] }))]);
        this.plotYaxis2.transition().duration(500)
            .call(this.yAxis2.tickFormat((d) => {
                return (`${d * 0.001}k`)
            }));

        function mouseover(event, d) {
            //console.log(_this.tootip)
            _this.tootip.setAttribute("style", "opacity:1")
            _this.svg.selectAll("g.bargroup").style("opacity", 0.5)
        };

        function mousemove(event, d) {

            _this.svg.select(`g.${d3.select(this.parentNode).datum().key}`).style("opacity", 1);
            _this.tootip.innerHTML = `
                                    年份:${d["data"][mapping["x"]]}<br>
                                    ${textmap[d3.select(this.parentNode).datum().key]}:${d["data"][d3.select(this.parentNode).datum().key]}
                                    `;
            if (event.layerX > _this.plotMain.offsetWidth * 0.8) {
                _this.tootip.setAttribute("style", `opacity:1;transform: translate(${event.layerX - _this.tootip.offsetWidth - _this.width / 80}px,${event.layerY}px);`);
            } else {
                _this.tootip.setAttribute("style", `opacity:1;transform: translate(${event.layerX + _this.width / 40}px,${event.layerY}px);`);
            }

        };

        function mouseleave(event, d) {
            //_this.tootip.setAttribute("style", "opacity:0")
            _this.tootip.setAttribute("style", `transition: all 0s ease;opacity:0;transform: translate(${event.layerX - _this.width / 80}px,${event.layerY}px);`);
            _this.svg.selectAll("g.bargroup").style("opacity", 1)
        };
        this.svg.append("g").classed("plot", true).attr("id", "stackBarPlot")
            .selectAll("g")
            .data(this.stackedData)
            .join("g")
            .attr("class", (d) => { return d['key'] })
            .classed("bargroup", true)
            .attr("fill", (d) => { return colorMap[d['key']] })
            .selectAll("rect")
            .data((d) => { return d })
            .join("rect")
            .attr("ry", 4)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .attr("width", this.xScale.bandwidth())
            .attr("x", (d) => { return this.xScale(d["data"][mapping["x"]]) })
            .attr("y", (d) => { return this.yScale2(d[1]) })
            .attr("height", (d) => { return (this.yScale2(d[0]) - this.yScale2(d[1])) }
            );

        return this
    },

    "theme": function (title, sourceText, TipText = "鼠标移入查看具体信息") {
        this.plotTitle.innerHTML = title;
        this.plotFooter.innerHTML = sourceText;
        this.plotTip.innerHTML = TipText;

    },

    "waffle": function (color) {
        this.plotMain.setAttribute("style", `width:100%;height:${this.plotMain.offsetHeight}px;background-color:#fff`);

        this.plotMain.innerHTML = "<div class='legend'></div><div></div>"

        this.waffle.width = this.width / 20, rowNum = this.plotMain.querySelector("div:nth-child(2)").offsetHeight / this.waffle.width;

        
        let demandType = ["其它类型", "基础性疾病药物求助", '血液透析', "化疗放疗"],
            value = [3673, 694, 33, 47];


        var total = d3.sum(value), countNum = 0,
            legendDiv = [],
            divArr = [];

        var divQuantity = 20 * Math.floor(rowNum);
        for (var i = 0; i < value.length; i++) {
            var waffleDiv = `<div class='waffleDiv' title='${demandType[i]}:${value[i]}' style="width:${this.waffle.width}px;height:${this.waffle.width}px;background-color:${color[i]}"></div>`;
            let Num = Math.floor(value[i] / total * divQuantity);
            divArr.push(waffleDiv.repeat(Num));
            legendDiv.push(`<div><div style='background-color:${color[i]};width:${0.5 * this.waffle.width}px;height:${0.5 * this.waffle.width}px'></div><p>${demandType[i]}</p></div>`)
            countNum += Num
        };


        if ((divQuantity - countNum) > 0) {
            divArr.push(waffleDiv.repeat(1 * (divQuantity - countNum)))
        };

        this.plotMain.querySelector("div:nth-child(2)").innerHTML = divArr.join("");
        this.plotMain.querySelector("div.legend").innerHTML = legendDiv.join("");

        $("div.waffleDiv").attr({
            'data-toggle': "tooltip",
            'data-placement': "top"
        });

        $("div.waffleDiv").on("mouseover", function () {
            let sel = $(this).attr("title");

            $("div.waffleDiv").css({
                'opacity': 0.5,
            })
            // console.log($(this).attr("title"))
            $(`div[title="${sel}"]`).css({
                'opacity': 1,
            })
        });

        $("div.waffleDiv").on("mouseleave", function () {
            $("div.waffleDiv").css({
                'opacity': 1,
            })
        });
        return this
    },

    "meetingPlot": function () {

        this.plotMain.innerHTML = `<div class="tootip"></div>`;
        this.tootip = this.element.querySelector("div.plotMain > div.tootip");
        this.tootip.setAttribute("style", `opacity:1;width:${this.plotMain.offsetWidth / 3}px;height:${this.plotMain.offsetWidth / 8}px;`)

        $(`${this.selector}> div.plotMain > div.tootip`).css('transform', `translate(${.5 * (this.plotMain.offsetWidth - this.tootip.offsetWidth)}px,${-this.plotMain.offsetWidth / 8 + this.plotMain.offsetHeight * 0.8}px)`)

        var _this = this;
        this.svg = d3.select(`${this.selector} > div.plotMain`)
            .append("svg")
            .attr("width", this.plotMain.offsetWidth)
            .attr("height", this.plotMain.offsetHeight)
            .append("g")
            .attr("class", "chart")
            .attr("transform", `translate(${this.plotMain.offsetWidth / 2},${this.plotMain.offsetHeight * 0.8})`);


        var index = 1, gap = 5;
        data = { "category": ['急性疾病', '心理疾病', '其它', '基础性疾病'].reverse(), "value": [138, 294, 465, 686].reverse() }

        let accumulationArr = [], arr = [];
        for (let j = 0; j < data["value"].length; j++) {
            arr.push(data["value"][j])
            accumulationArr.push(d3.sum(arr) / d3.sum(data["value"]))
        }
        /* console.log(accumulationArr) */

        for (let i = 0, startAngle = 0; i <= 180; i += gap) {
            // 一环37个  1+180/gap

            //console.log(startAngle)
            let totalCircleNum = (1 + 180 / gap) * Math.ceil((this.plotMain.offsetWidth / 2 - 5 - this.plotMain.offsetWidth / 4) / (this.plotMain.offsetWidth / 45));
            // console.log(circleNum)
            let angel = i;
            for (let radius = this.plotMain.offsetWidth / 4; radius <= this.plotMain.offsetWidth / 2 - 5; radius += this.plotMain.offsetWidth / 45) {
                x1 = Math.cos(angel * Math.PI / 180) * radius;
                y1 = Math.sin(angel * Math.PI / 180) * radius;
                if (index <= accumulationArr[0] * totalCircleNum) {
                    var color = '#5C91C5', type = "type1";
                } else if (index > accumulationArr[0] * totalCircleNum && index < accumulationArr[1] * totalCircleNum) {
                    var color = '#91BED1', type = "type2";
                } else if (index > accumulationArr[1] * totalCircleNum && index < accumulationArr[2] * totalCircleNum) {
                    var color = '#CA6867', type = "type3";
                } else {
                    var color = '#F3D2CD', type = "type4";
                };
                index += 1;

                _this.legendMap = {
                    "type1": '<p style="color:#5C91C5">基础性疾病</p><p style="color:#5C91C5">686</p>',
                    "type2": '<p style="color:#91BED1">其它</p><p style="color:#91BED1">465</p>',
                    "type3": '<p style="color:#CA6867">心理疾病</p><p style="color:#CA6867">294</p>',
                    "type4": '<p style="color:#F3D2CD">急性疾病</p><p style="color:#F3D2CD">138</p>',
                };

                this.svg.append("circle")
                    .attr("cx", -x1)
                    .attr("cy", -y1)
                    .attr("r", radiusRange[1] * 0.65)
                    .attr("fill", color)
                    .attr("stroke", "none")
                    .style("cursor", "pointer")
                    .style('transition', 'all 0.5s ease')
                    .attr("class", type)
                    .classed("meetingCircle", true)
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)

                function mouseover() {
                    d3.selectAll(`circle.meetingCircle`).style("opacity", "0.5");


                };
                function mousemove() {
                    _this.tootip.innerHTML = _this.legendMap[$(this).attr("class").split(" ")[0]]
                    d3.selectAll(`circle.${$(this).attr("class").split(" ")[0]}`).style("opacity", "1");
                };
                function mouseleave() {
                    _this.tootip.innerHTML = "";
                    d3.selectAll(`circle.meetingCircle`).style("opacity", "1");
                }
            };

        };
        return this
    },

    "meetingplot": function (category, values, color) {

        this.plotMain.innerHTML = "<div class='legend'></div><div></div>";
        let legendDiv = [];
        this.legendMap = {};
        for (let i = 0; i < category.length; i++) {
            legendDiv.push(`<div><div style='background-color:${color[i]}'></div><p>${category[i]}</p></div>`);
            this.legendMap[`'${color[i]}'`] = `<p style="color:${color[i]}">${category[i]}</p><p style="color:${color[i]}">${values[i]}</p>`
        }
        this.plotMain.querySelector("div.legend").innerHTML = legendDiv.join("")
        // console.log(this.legendMap)
        /* _this.legendMap = {
            "type1": '',
            "type2": '<p style="color:#91BED1">其它</p><p style="color:#91BED1">465</p>',
            "type3": '<p style="color:#CA6867">心理疾病</p><p style="color:#CA6867">294</p>',
            "type4": '<p style="color:#F3D2CD">急性疾病</p><p style="color:#F3D2CD">138</p>',
        }; */

        this.plotMain.width = this.plotMain.querySelector("div.legend+div").offsetWidth;
        this.plotMain.height = this.plotMain.querySelector("div.legend+div").offsetHeight;

        this.plotMain.querySelector("div.legend+div").innerHTML = `<div class="tootip"></div>`;
        this.tootip = this.plotMain.querySelector("div.tootip")
        this.tootip.setAttribute("style", `opacity:1;width:${this.plotMain.width / 3}px;height:${this.plotMain.height / 6}px;`)
        $(`${this.selector} div.tootip`).css('transform', `translate(${.5 * (this.plotMain.width - this.tootip.offsetWidth)}px,${-this.plotMain.offsetWidth / 8 + this.plotMain.height * 0.8}px)`)

        // console.log(this.plotMain.width, this.plotMain.height)
        this.plotMain.svg = d3.select(`${this.selector} div.plotMain > div:nth-child(2)`).append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .append("g")
            .attr("transform", `translate(${0.5 * this.plotMain.width},${0.75 * this.plotMain.height})`);

        this.plotMain.radius = this.plotMain.width / 90             // 单个圆的半径
        this.plotMain.outerRadius = this.plotMain.width * 0.45      // 外环的半径

        for (let Num = 0; Num <= 14; Num++) {
            this.plotMain.ringRadius = this.plotMain.outerRadius - Num * 1.25 * this.plotMain.radius;
            this.plotMain.perimeter = 2 * this.plotMain.ringRadius * Math.PI;

            if (Num < 4) {
                myNum = 80
                this.plotMain.gap = this.plotMain.perimeter / (this.plotMain.radius * 2.0) / myNum * 1.0;
                this.plotMain.gap = 0.95 * Math.ceil(this.plotMain.gap)
            } else if (Num >= 4 && Num <= 7) {
                myNum = 60
                this.plotMain.gap = this.plotMain.perimeter / (this.plotMain.radius * 2.0) / myNum * 1.0;
                this.plotMain.gap = 1.05 * Math.ceil(this.plotMain.gap)
            } else if (Num > 7 && Num <= 9) {
                myNum = 50
                this.plotMain.gap = this.plotMain.perimeter / (this.plotMain.radius * 2.0) / myNum * 1.0;
                this.plotMain.gap = 1.15 * Math.ceil(this.plotMain.gap)
            } else if (Num > 9 && Num <= 10) {
                myNum = 50
                this.plotMain.gap = this.plotMain.perimeter / (this.plotMain.radius * 2.0) / myNum * 1.0;
                this.plotMain.gap = 1.35 * Math.ceil(this.plotMain.gap)
            }
            else if (Num >= 11 && Num < 13) {
                myNum = 40
                this.plotMain.gap = this.plotMain.perimeter / (this.plotMain.radius * 2.0) / myNum * 1.0;
                this.plotMain.gap = 0.9 * Math.ceil(this.plotMain.gap)
            }
            else {
                myNum = 27
                this.plotMain.gap = this.plotMain.perimeter / (this.plotMain.radius * 2.0) / myNum * 1.0;
                this.plotMain.gap = 1.0 * Math.ceil(this.plotMain.gap)
            }
            /* myNum = Num > 4 && Num <7 ?65:55 */

            angelRange = [
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
                [-20, 200],
            ]
            for (let angel = angelRange[Num][0]; angel <= angelRange[Num][1]; angel += this.plotMain.gap) {
                x1 = Math.cos(angel * Math.PI / 180) * this.plotMain.ringRadius;
                y1 = Math.sin(angel * Math.PI / 180) * this.plotMain.ringRadius;

                if (angel < 0.43 * (angelRange[Num][1] - angelRange[Num][0])) {
                    fill = color[0]

                } else if (angel < 0.7271 * (angelRange[Num][1] - angelRange[Num][0])) {
                    fill = color[1]
                } else if (angel < 0.8142 * (angelRange[Num][1] - angelRange[Num][0])) {
                    fill = color[2]
                } else {
                    fill = color[3]
                }

                let _this = this;
                this.plotMain.svg.append("circle")
                    .attr("cx", -x1)
                    .attr("cy", -y1)
                    .attr("r", this.plotMain.radius * 0.55)

                    .attr("fill", "transparent")
                    .attr("fill", fill)
                    .attr("stroke", "none")
                    .attr("stroke-width", "0px")

                    .style('transition', 'all 0.5s ease')
                    .classed("meetingCircle", true)
                    .style("cursor", "pointer")

                    .on("mouseover", () => { d3.selectAll(`circle.meetingCircle`).style("opacity", "0.5"); })
                    .on("mousemove", mousemove)
                    .on("mouseleave", () => { _this.tootip.innerHTML = ""; d3.selectAll(`circle.meetingCircle`).style("opacity", "1"); })

                function mousemove() {
                    d3.selectAll(`circle[fill = "${d3.select(this).attr('fill')}"]`).style("opacity", "1")
                    _this.tootip.innerHTML = _this.legendMap[`'${d3.select(this).attr('fill')}'`];

                    /* _this.tootip.innerHTML = _this.legendMap[$(this).attr("class").split(" ")[0]]
                    d3.selectAll(`circle.${$(this).attr("class").split(" ")[0]}`).style("opacity", "1"); */
                };
                /* function mouseover() {
                    d3.selectAll(`circle.meetingCircle`).style("opacity", "0.5");


                };
                
                function mouseleave() {
                    _this.tootip.innerHTML = "";
                    d3.selectAll(`circle.meetingCircle`).style("opacity", "1");
                }  */
            }
        }
        return this
    },

    "hLollipop": function (data, mapping, ylim) {
        this.width = this.plotMain.offsetWidth - 1.5 * plotMargin["left"] - plotMargin["right"];
        d3.select(`${this.selector} > div.plotMain > svg >g`)
            .attr("transform", `translate(${1.5 * plotMargin["left"]}, ${plotMargin["top"]})`);
        this.yScale = d3.scaleBand().range([this.height, 0]).domain(data[mapping["y"]]).padding(1);
        this.yAxis = d3.axisLeft().tickSizeOuter(0).scale(this.yScale);
        this.plotYaxis.transition().duration(500).call(this.yAxis);

        this.xScale = d3.scaleLinear().range([0, this.width]).domain(ylim);
        this.xAxis = d3.axisBottom().tickSizeOuter(0).scale(this.xScale);
        this.plotXaxis.transition().duration(500).call(this.xAxis.tickFormat((d) => {
            return (`${d * 0.001}k`)
        }));

        plotData = [];
        for (let i = 0; i < data[mapping["x"]].length; i++) {
            let row = { "y": data[mapping["y"]][i], "x": data[mapping["x"]][i] }
            plotData.push(row)
        }
        //console.log(plotData)
        this.svg.append("g").classed("hLollipopLine", true)
            .selectAll("line")
            .data(plotData)
            .join("line")
            .attr("x1", 0)
            .attr("x2", "0")
            .attr("y1", (d) => {
                /* console.log(d["y"]) */
                return this.yScale(d["y"])
            })
            .attr("y2", (d) => { return this.yScale(d["y"]) })
            .attr("stroke", "#2BAA5D")
            .attr("stroke-width", "8px")

        let _this =this;
        function mousemove(){
            d3.select(this).style("opacity", "1").attr("r", radiusRange[1]);
            
            // console.log($("g.hLollipopCircle > circle").index($(this)))
            d3.selectAll('g.hLollipopLine > line').attr("stroke-width", "6px").style("opacity", "0.5");
            $('g.hLollipopLine > line').eq($("g.hLollipopCircle > circle").index($(this))).attr("stroke-width", "12px").css("opacity", "1")
            $('g.label text.label').eq($("g.hLollipopCircle > circle").index($(this))).css({
                "opacity":"1",
                "font-weight": 'bold'
                // font-weight: lighter;
            })
        }

        this.svg.append("g").classed("hLollipopCircle", true)
            .selectAll("circle")
            .data(plotData)
            .join("circle")
            .attr("cx", "0")
            .attr("cy", (d) => { return this.yScale(d["y"]) })
            .attr("stroke", "#5C91C5")
            .attr("r", radiusRange[1] * 0.85)
            .style("fill", "#2BAA5D")
            .style("opacity", "0.85")
            .attr("stroke", "#2BAA5D")
            .style("cursor", "pointer")
            .on("mouseover", ()=>{d3.selectAll('g.hLollipopCircle > circle').style("opacity", "0.5");d3.selectAll('g.label text.label').style("opacity", "0.25");})
            .on("mousemove",mousemove)
            .on("mouseleave", ()=>{d3.selectAll('g.hLollipopCircle > circle').style("opacity", "1").attr("r", radiusRange[1] * 0.85);d3.selectAll('g.hLollipopLine > line')
                .attr("stroke-width", "8px")
                .style("opacity", "1");

                d3.selectAll('g.label text.label').style("opacity", "1").style("font-weight",'lighter');
            })

        this.svg.append("g").classed("label", true)
            .selectAll("text")
            .data(plotData)
            .join("text")
            .classed("label", true)
            .attr("x", (d) => { return this.xScale(d["x"]) })
            .attr("y", (d) => { return this.yScale(d["y"]) })
            .style("fill", "#000")
            .attr("stroke", "none")
            .attr("dy", "6")
            .attr("dx", "15")
            .style("opacity", "0")
            .text((d) => { return d["x"] })


        /*  load animation  */
        this.svg.selectAll("circle")
            .transition()
            .duration(1500)
            .attr("cx", (d) => { return this.xScale(d["x"]) });

        this.svg.selectAll("line")
            .transition()
            .duration(1200)
            .attr("x1", (d) => { return this.xScale(d["x"]) });

        this.svg.selectAll("text")
            .transition()
            .duration(3500)
            .style("opacity", "1");
        return this
    },


    "arcPie": function (data, label) {

        this.plotMain.innerHTML = ""
        this.svg = d3.select(`${this.selector} > div.plotMain`)
            .append("svg")
            .attr("width", this.plotMain.offsetWidth)
            .attr("height", this.plotMain.offsetHeight)
            .append("g")
            .attr("transform", `translate(${this.plotMain.offsetWidth / 2}, ${this.plotMain.offsetHeight / 2})`);

        this.plotMain.arcGenerator = d3.arc().padRadius(500).cornerRadius(20);
        // .padAngle(0.5);
        this.plotMain.outerRadius = !mediaQuery.matches ? this.plotMain.offsetWidth / 3 : this.plotMain.offsetWidth / 2;

        let r = !mediaQuery.matches ? 25 : 15;
        let x = !mediaQuery.matches ? -90 : -50
        let dy = !mediaQuery.matches ? 19 : 12;
        let fontSize = !mediaQuery.matches ? '18px' : '9px';

        function mouseover() {
            d3.selectAll("path.Ace").style("opacity", 0.5);
            d3.selectAll("text.aceLabel").style("opacity", 0.5);
        };

        function mousemove() {
            $(this).css("opacity", 1);
            $("text.aceLabel").eq($('path.Ace').index($(this))).css({
                "opacity":1,
                'font-weight': 'bold',
            });
        };

        function mouseleave() {
            d3.selectAll("path.Ace").style("opacity", 1);
            d3.selectAll("text.aceLabel").style("opacity", 1).style('font-weight',"normal")
        };
        for (let i = 0; i < data.length; i++) {
            this.plotMain.bgpathData = this.plotMain.arcGenerator({
                startAngle: 0,
                endAngle: Math.PI * 2,
                outerRadius: this.plotMain.outerRadius - i * r,
                innerRadius: this.plotMain.outerRadius - (1 + i) * r
            });

            this.plotMain.pathData = this.plotMain.arcGenerator({
                startAngle: 0,
                endAngle: (data[i] + 0.15) * Math.PI * 2,
                outerRadius: this.plotMain.outerRadius - i * r,
                innerRadius: this.plotMain.outerRadius - (1 + i) * r
            });

            this.svg.append('path')
                .attr('fill', 'rgba(225,225,225,0.95)')
                .attr('stroke', '#fff')
                .attr('stroke-width', '1.5px')
                .attr('d', this.plotMain.bgpathData);

            this.svg
                .append('path')
                .classed("Ace", true)
                .attr('fill', '#2BAA5D')
                .attr('stroke', 'transparent')
                .attr('stroke-width', '1.5px')
                .on("mouseover", mouseover)
                .on('mousemove', mousemove)
                .on("mouseleave", mouseleave)
                .style('cursor', 'pointer')
                .attr('d', this.plotMain.pathData);

            this.svg.append('text')
                .classed("aceLabel", true)
                .style("font-size", fontSize)
                .attr('fill', '#000')
                /* .attr('stroke', '#999') */
                .attr("x", x)
                .attr("y", -this.plotMain.outerRadius + i * r)
                .attr("dy", dy)
                .text(label[i])
        }
        return this
    },

    "polarPie": function (data, labelOpa = 0) {
        this.plotMain.innerHTML = ""
        this.svg = d3.select(`${this.selector} > div.plotMain`)
            .append("svg")
            .attr("width", this.plotMain.offsetWidth)
            .attr("height", this.plotMain.offsetHeight)
            .append("g")
            .attr("transform", `translate(${this.plotMain.offsetWidth / 2}, ${this.plotMain.offsetHeight / 2})`);
       
        this.plotMain.innerRadius =  data.length>3?this.plotMain.offsetWidth / 25:this.plotMain.offsetWidth / 15;
        this.plotMain.outerRadius = this.plotMain.offsetWidth / 6;
        let _this = this;
        this.plotMain.arcGenerator = d3.arc().padAngle(.02)
            .padRadius(300)
            .cornerRadius(8.5);

        data.forEach(function (d, index) {
            d["innerRadius"] = _this.plotMain.innerRadius
            d["outerRadius"] = _this.plotMain.outerRadius + index * _this.plotMain.innerRadius / 2
        })

        this.svg.append('g')
            .selectAll('path')
            .data(data)
            .join('path')
            .attr("class", "acePath")
            .attr("fill", "#2BAA5D")
            .attr("stroke", "#2BAA5D")
            .attr("stroke-width", "0.5px")

            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .attr('d', this.plotMain.arcGenerator);

        function mouseover() {
            d3.selectAll("path.acePath").attr("stroke-width", "0px").attr("opacity", 0.5);

        };
        
        function mousemove() {
            d3.select(this).attr("stroke-width", "7px").attr("opacity", 1);
            $(`${_this.selector} text.labelText`).css("opacity", "0")
            $(`${_this.selector} text.labelText`).eq($(`${_this.selector} path.acePath`).index(this)).css("opacity", "1")
        };

        function mouseleave() {
            d3.selectAll("path.acePath").attr("stroke-width", "2.5px").attr("opacity", 1);
            $("text.labelText").css("opacity", labelOpa)
        }

        this.svg.append('g')
            .selectAll('text')
            .data(data)
            .join('text')
            .style("opacity", labelOpa)
            .classed("labelText", true)
            .each(function (d) {
                var centroid = _this.plotMain.arcGenerator.centroid(d);
                d3.select(this)
                    .attr('x', centroid[0])
                    .attr('y', centroid[1])
                    .attr('dx', '-2.33em')
                    .attr("alignment-baseline", "middle")
                    /* .attr("transform",(d)=>{
                        return `rotate(${d["startAngle"]/2/Math.PI*180})`
                        }) */
                    .text(d["label"]);
            });

        return this
    },

    "mapPlot": function () {
        this.plotMain.innerHTML = "";
        this.plotMain.setAttribute("id", 'mapPlot')
        return this
    },

    "iconBar": function (x, y, fileName) {
        this.plotMain.innerHTML = `<div class="bars"></div><div class="xaxis"></div>`;

        this.x = d3.scaleBand().domain(x).range([0, this.width]).padding(0.05);
        this.y = d3.scaleLinear().domain([0, 240]).range([0, this.height*0.95]);

        this.plotMain.querySelector(".bars").innerHTML = `<div class="barItem"></div>`.repeat(x.length)
        this.plotMain.querySelector(".xaxis").innerHTML = `<div class="xlabel"></div>`.repeat(x.length)
        //this.plotMain.querySelector(".xlabel").innerHTML = `<div class="barItem"></div>`.repeat(x.length)
        if (mediaQuery.matches) {
            fileName = fileName.map((d) => { return `mobile-${d}` })
        };

        for (let i = 0; i < y.length; i++) {
            $("div.barItem").eq(i).css({
                "height": this.y(y[i]),
                "width": this.x.bandwidth()
                /* "border": "1px solid #000" */
            })

            $("div.barItem").eq(i).attr({
                'data-toggle': "tooltip",
                'data-placement': "top",
                "title": `${x[i]}:${y[i]}`
            })

            $('.xlabel').eq(i).html(x[i])

            let barWidth = $(".barItem").eq(i).width(), barHeight = $(".barItem").eq(i).height();
            /* divs = `<div class="circle" style="width:${Math.floor(barWidth / 4)}px;height:${Math.floor(barWidth / 4)}px"></div>`; */
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

        $("div.barItem").on("mouseover", function () {

            $("div.barItem").css({ "opacity": 0.5 })
            $(this).css({ "opacity": 1 })
        }).on("mouseleave", () => {
            $("div.barItem").css({ "opacity": 1 })
        });

        return this
    },

    "forceCircle": function (category, Size, fileName) {
        /* this.element.innerHTML = `
        <div class="plotTitle"><p></p></div>
        <div class="plotTip"><i></i></div>
        <div class="plotMain"></div>
        <div class="plotFooter"><p></p></div>
        `; */

        
        this.plotMain.innerHTML = '<div class="tootip"></div>';
        this.tooltip = this.element.querySelector("div.plotMain > div.tootip");

        this.svg = d3.select(`${this.selector} > div.plotMain`)
            .append("svg")
            .attr("width", '100%')
            .attr("height", '100%')


        this.plotMain.forceCenter = [this.plotMain.offsetWidth / 2, this.plotMain.offsetHeight / 2];
        // console.log(category, Size, fileName)
        this.plotMain.radiusRange = [this.width / 40, this.width / 4];

        this.plotMain.radiusScale = d3.scaleLinear().domain([0, 80]).range(this.plotMain.radiusRange);

        let nodes = [];
        for (let i = 0; i < Size.length; i++) {
            Size[i] > 10 ? label = category[i] : label = "";
            nodes.push({ 'radius': this.plotMain.radiusScale(Size[i]), 'category': 1, 'label': label, "fileName": fileName[i], "type": category[i],"value":Size[i]})
        };

        // console.log(nodes)

        let _this = this;
        var ticked = function () {
            //console.log(_this)


            _this.svg.selectAll('image')
                .data(nodes)
                .join('image')
                .attr('width', (d) => { return d.radius * 1.5 })
                .attr('height', (d) => { return d.radius * 1.5 })
                .attr('x', (d) => { return d.x - d.radius / 1.3 })
                .attr('y', (d) => { return d.y - d.radius / 1.3 })
                .attr("xlink:href", (d) => { return `img/${d["fileName"]}` })
                .attr("preserveAspectRatio", "none meet");


            _this.svg.selectAll('circle')
                .data(nodes)
                .join('circle')
                .attr("class", "forceCircle")
                .attr('r', (d) => { return d.radius })
                .style('fill', "rgba(43,170,93,0.6)")
                .style('stroke', "#2BAA5D")
                .style('stroke-width', "2.5px")
                .attr('cx', (d) => { return d.x })
                .attr('cy', (d) => { return d.y })
                .on('mouseover', ()=>{_this.tooltip.setAttribute("style", `opacity:1;`)})
                .on('mousemove', mousemove)
                .on("mouseleave",mouseleave)
                .attr("cursor", "pointer");


            _this.svg.selectAll('text')
                .data(nodes)
                .join('text')
                .style('font-weight', 'bold')
                .style('font-family', 'NotoSansCJK-Bold')
                .attr("x", (d) => {
                    result = d['label'].length > 3 ? d.x - d.radius / 1.05 : d.x - d.radius / 1.65
                    return result
                })
                .attr("fill", "#000")
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
            .force('center', d3.forceCenter(this.plotMain.forceCenter[0], this.plotMain.forceCenter[1]))
            .force("collision", d3.forceCollide().radius((d) => { return d["radius"] }))
            .on('tick', ticked);

            function mouseleave(event, d){
                d3.selectAll("circle.forceCircle").style("opacity","1")
                _this.tooltip.setAttribute("style", `transition: all 0s ease;opacity:0;transform: translate(${event.layerX + d['radius']/8 }px,${event.layerY-_this.tooltip.offsetHeight/2.75}px);`)
            }
    
        function mousemove(event, d) {
            _this.tooltip.setAttribute("style", `opacity:1;transform: translate(${event.layerX + d['radius']/10 }px,${event.layerY-_this.tooltip.offsetHeight/2.75}px);`);
            //console.log(d)
            d3.selectAll("circle.forceCircle").style("opacity","0.5")
            d3.select(this).style("opacity","1")
            _this.tooltip.innerHTML = `物品:${d["type"]}<br>
                                        求助数量:${d['value']}<br>
                                        `
        };
        return this
    },

    "simpleCircularBar": function (data, x, y) {
        this.plotMain.innerHTML = ``;
        this.plotMain.innerRadius = Math.min(this.plotMain.offsetWidth, this.plotMain.offsetHeight) / 10,
            this.plotMain.outerRadius = Math.min(this.plotMain.offsetWidth, this.plotMain.offsetHeight) / 2;

        this.svg = d3.select(`${this.selector} > div.plotMain`)
            .append("svg")
            .attr("width", this.plotMain.offsetWidth)
            .attr("height", this.plotMain.offsetHeight)
            .append("g")
            .attr("transform", `translate(${this.plotMain.offsetWidth * 0.4}, ${this.plotMain.offsetHeight * 0.65})`);


        this.xScale = d3.scaleBand().range([0, 2 * Math.PI]).padding(0.25);
        this.xScale.domain(data.map((d) => { return d[x] }));

        this.yScale = d3.scaleRadial().range([this.plotMain.innerRadius, this.plotMain.outerRadius]);
        // this.yScale.domain(d3.extent(data, (d)=>{return d[y]}));
        this.yScale.domain([0, 40]);

        this.svg.append("g").classed("circularBar", true)
            .selectAll("path").data(data)
            .join("path")
            .attr("fill", "#2BAA5D")
            .attr("stroke", "#2BAA5D")
            .style("opacity", 1)
            .style("stroke-width", "1.5px")
            .style('cursor', "pointer")
            .attr("d",
                d3.arc().innerRadius(this.plotMain.innerRadius)
                    .outerRadius((d) => { return this.yScale(d[y]) })
                    .startAngle((d) => { return this.xScale(d[x]) })
                    .endAngle((d) => { return this.xScale(d[x]) + this.xScale.bandwidth() })
                    .padAngle(0.01)
                    .padRadius(this.plotMain.innerRadius)
                    .cornerRadius(10.5)
            ).on("mouseover", mouseover)
            // .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
        let _this = this;
        this.fontSize = mediaQuery.matches?"8px":"14px";
        this.ANfontSize = mediaQuery.matches?"12px":"18px";
        function mouseover() {
            d3.selectAll("g.circularBar path").style("opacity", "0.5").style("stroke-width", "0.5px")
            d3.selectAll("g.simpleCircularBarLabel text").style("fill", "#999")
            d3.select(this).style("opacity", "1").style("stroke-width", "3.5px")
            $('g.simpleCircularBarLabel').eq($(this).index('g.circularBar path')).find('text').css({
                "fill": "#000",
                'font-weight': 'bold',
                "font-size": _this.ANfontSize
            })
            // .eq($(this).index('g.circularBar path')).find('text').css("opacity", "1")

        };

        function mouseleave() {
            d3.selectAll("g.circularBar path").style("opacity", "1").style("stroke-width", "1.5px")
            d3.selectAll("g.simpleCircularBarLabel text").style("fill", "#000").style('font-weight', 'normal').style("font-size", this.fontSize)
        }
        
        this.svg.append("g")
            .selectAll("g")
            .data(data)
            .join("g")
            .attr("class", "simpleCircularBarLabel")
            .attr("text-anchor", function (d) { return (_this.xScale(d[x]) + _this.xScale.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
            .attr("transform", function (d) { return "rotate(" + ((_this.xScale(d[x]) + _this.xScale.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (_this.yScale(d[y]) + 10) + ",0)"; })
            .append("text")
            .text(function (d) { return `${d[x]}(${d[y]})` })

            .attr("transform", function (d) { return (_this.xScale(d[x]) + _this.xScale.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
            
            .attr("alignment-baseline", "middle")
            .attr("fill", "#000")
        return this
    },
    "circularStackBar":function(data,color,labelName){
        this.plotMain.innerHTML = "<div class='legend'></div><div><div class='tootip'></div></div>";
        this.tootip = this.plotMain.querySelector("div.tootip");
        this.labelColorMap = {}

        this.labelDiv = [];
        for(let i= 0;i<color.length;i++){
            this.labelDiv.push(`<div><div style='background-color:${color[i]}'></div><p>${labelName[i]}</p></div>`);
            
        }

        this.plotMain.querySelector("div.legend").innerHTML = this.labelDiv.join("");
        
        this.plotMain.innerRadius = Math.min(this.plotMain.offsetWidth, this.plotMain.offsetHeight) / 10,
        this.plotMain.outerRadius = Math.min(this.plotMain.offsetWidth, this.plotMain.offsetHeight) / 2;

        this.svg = d3.select(`${this.selector} > div.plotMain > div:nth-child(2)`)
            .append("svg")
            .attr("width", this.plotMain.offsetWidth)
            .attr("height", this.plotMain.offsetHeight)
            .append("g")
            .attr("transform", `translate(${this.plotMain.offsetWidth * 0.5}, ${this.plotMain.offsetHeight * 0.5})`);
        
            data = data.map((d)=>{return {"type":d["type"], "solveed":d['solveed'],"Following":d['Following'],"unfollow":d['unfollow']}})
        this.stackData = d3.stack().keys(["solveed","Following","unfollow"])(data);

        this.xScale = d3.scaleBand().range([0, 2 * Math.PI]).padding(0.01);
        this.xScale.domain(data.map((d) => { return d["type"] }));
        let _this =this;
        function mousemove(event,d){
            _this.tootip.innerHTML = `"求助类型":${d['data']['type']}<br> 
                                        状态: ${textmap[d3.select(this.parentNode).datum().key]}<br>
                                        "数量": ${d["data"][d3.select(this.parentNode).datum().key]}<br>       
                                    `
           /* $(this).siblings().css("opacity",0.5) */
           $(`g.${d3.select(this.parentNode).datum().key} path`).css("opacity",1);
           _this.tootip.setAttribute("style",`opacity:1;transform:translate(${event.layerX + _this.width / 40}px,${event.layerY}px)`);
           $(this).css("opacity",1)
           d3.selectAll('g.barLabel text').style("opacity",0)
           // _this.tootip
            
        }

        function mouseleave(event,d){
            d3.selectAll('g.barLabel text').style("opacity",1)
            d3.selectAll("g.barGroup path").style('opacity',1)
            _this.tootip.setAttribute("style",`transition: opacity 0s ease;opacity:0;transform:translate(${event.layerX + _this.plotMain.innerRadius/5}px,${event.layerY+_this.plotMain.innerRadius/1}px)`);
         }

        this.yScale = d3.scaleRadial().range([this.plotMain.innerRadius, this.plotMain.outerRadius]);
        this.yScale.domain(d3.extent(this.stackData[this.stackData.length-1], (d)=>{return 1.25*d[1]}));
        this.svg.selectAll("g").data(this.stackData)
        .join("g")
        .attr("class", (d)=>{return d["key"]})
        .classed("barGroup", true)
        .attr("fill", (d,i)=>{return color[i]})
        .selectAll("path")
        .data((d)=>{return d})
        .join("path")
        .on('mouseover',()=>{d3.selectAll("g.barGroup path").style('opacity',0.5);})
        .on('mousemove',mousemove)
        .on('mouseleave',mouseleave)
        .attr("d",
        d3.arc().innerRadius((d) => { return this.yScale(d[0]) })
        .outerRadius((d) => { return this.yScale(d[1]) })
        .startAngle((d) => { return this.xScale(d["data"]["type"]) })
        .endAngle((d) => { return this.xScale(d["data"]["type"]) + this.xScale.bandwidth() })
        .padAngle(0.01)
        .padRadius(this.plotMain.innerRadius)
        );

        
        this.svg.append("g").classed("barLabel", true)
        .selectAll("g")
        .data(this.stackData[2])
        .join("g")
        .attr("text-anchor", function (d) { return (_this.xScale(d["data"]["type"]) + _this.xScale.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
        .attr("transform", function (d) { return "rotate(" + ((_this.xScale(d["data"]["type"]) + _this.xScale.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (_this.yScale(d[1]) + 0) + ",0)"; })
        .append("text")
        .text(function (d) {return d["data"]["type"].split("-")[1];})
        
        .attr("transform", function (d) { return (_this.xScale(d["data"]["type"]) + _this.xScale.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
        // .style("font-size", "12px")
        .attr("alignment-baseline", "middle")
        .attr("fill", "#000")
        
        let test_d = `M 0 ${-this.plotMain.innerRadius*0.8} Q ${0+(this.plotMain.innerRadius/4*2.5*0.8)} ${-0.8*(-this.plotMain.innerRadius/15.95+this.plotMain.innerRadius)} ${this.plotMain.innerRadius/4*3.5*0.8} ${-this.plotMain.innerRadius/2.5*0.8}`
        this.svg.append("g").append("path").attr("d",test_d).attr('stroke',"none").attr("stroke-width","2.5").attr("fill","none").attr("id","textPath")

        this.svg.append("text")
            .attr("x", this.plotMain.innerRadius)
            .attr("textLength",()=>{return this.plotMain.innerRadius})
            .attr("y",0+(this.plotMain.innerRadius/4*2.5))
            .append("textPath").text('物资及其它')
            .attr('xlink:href',"#textPath")
            .attr('lengthAdjust',"spacing")
            .attr("startOffset","-107.5%");

        this.svg.append("text")
            .attr("rotate","180")
            .attr("transform", 'rotate(90)')
            .attr("textLength",()=>{return this.plotMain.innerRadius})
            .attr("x", this.plotMain.innerRadius)
            .attr("y",0+(this.plotMain.innerRadius/4*2.25))
            .append("textPath").text('求需物药')
            .attr('xlink:href',"#textPath")
            .attr('lengthAdjust',"spacing")
            .attr("startOffset","-160.5%");

        this.svg.append("text")
            .attr("rotate","180")
            .attr("transform", 'rotate(180)')
            .attr("textLength",()=>{return this.plotMain.innerRadius*0.9})
            .attr("x", this.plotMain.innerRadius)
            .attr("y",0+(this.plotMain.innerRadius/4*2.25))
            .append("textPath").text('求需医就')
            .attr('xlink:href',"#textPath")
            
            //.attr('lengthAdjust',"spacing")
            .attr("startOffset","-110%");

        this.svg.append("text")
            .attr("rotate","0")
            .attr("transform", 'rotate(270)')
            .attr("textLength",()=>{return this.plotMain.innerRadius})
            .attr("x", this.plotMain.innerRadius)
            .attr("y",0+(this.plotMain.innerRadius/4*2.25))
            .append("textPath").text('家用医疗器械')
            .attr('xlink:href',"#textPath")
            
            .attr('lengthAdjust',"spacing")
            .attr("startOffset","-100%");
            
        return this
    }

}


let year = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
    newlyIncreased = [72682, 70961, 73936, 63968, 61790, 75831, 90166, 124858, 134640, 143513],
    existing = [234632, 248016, 283581, 339748, 385055, 447435, 524467, 579381, 632653, 692736];

stackBardata = [];
for (let i = 0; i < year.length; i++) {
    row = {
        "year": year[i],
        /* "averageAge": averageAge[i], */

        "existing": existing[i],
        "newlyIncreased": newlyIncreased[i],
    };
    stackBardata.push(row)
};
new plot(document.querySelector("div#stackBarWithLine2"),
    data = {
        'year': [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
        'averageAge': [53.1, 52.4, 54.7, 54.9, 55.7, 56.1, 56.3, 55.9, 56.4, 56.9],
    },
).stackBar(data = stackBardata,
    subgroups = ["existing", "newlyIncreased"],
    mapping = { "x": "year" }
).scatterLine(
    mapping = { "x": "year", "y": "averageAge" },
    ylim = [50, 60]
).theme(
    title = "2011~2020年中国大陆透析患者平均年龄及数量",
    sourceText = "数据源:第七届中国非公立医疗机构协会肾脏病透析专业委员会年会"
)



new plot(document.querySelector("div#waffle")).waffle(color=['#009F4D','#70AD47',"#487A7B","#9AA987"]).theme(
    title = "网站基础性疾病求助情况",
    sourceText = "数据源:稻侯er网站（https://daohouer.com/），呈现结果为小组编码后"
)

/* new plot(document.querySelector("div#meetingPlot"))["meetingPlot"]()["theme"](title = "药物求助需求情况",
    sourceText = "数据源:daohouer.com(人工编码后)"
); */

new plot(document.querySelector("div#horizontalLollipop"))["hLollipop"](
    data = {
        "area": ['浦东新区', "崇明区", "闵行区", "金山区", "嘉定区", "长宁区", "宝山区", "徐汇区", "虹口区", "普陀区"].reverse(),
        "value": [306781, 242568, 169777, 64283, 62673, 30126, 29112, 26325, 23987, 22219].reverse()
    }, mapping = { "y": "area", "x": "value" },
    ylim = [100, 330000]
)["theme"](title = "上海各区志愿服务Top10总时长排行榜(小时)",
    sourceText = "数据源:上海市共青团数据可视化平台(截至2022.6.22)"
);




new plot(document.querySelector("div#arcPie"))["arcPie"](
    data2 = [0.35, 0.195471698, 0.165283019, 0.157735849, 0.142641509, 0.14264151, 0.13509434, 0.121, 0.12],
    label = ["核酸检测(55%)", "防疫宣传(12%)", "秩序引导(8%)", "排查登记(7%)", "测温验码(5%)", "清洁消毒(5%)", "物资配送(4%)", "疫苗接种(2%)", "心理疏导(2%)"]
)["theme"](title = "上海市防疫志愿活动项目分布情况",
    sourceText = "数据源:上海市志愿者网(2022.2.7~2022.6.22)"
);


new plot(document.querySelector("div#polarPie"))["polarPie"](
    data = [
        { startAngle: 0, endAngle: 0.33 * 2 * Math.PI, label: "提供药品(42)" },
        { startAngle: 0.33 * 2 * Math.PI, endAngle: 0.49 * 2 * Math.PI, label: "提供交通工具(21)" },
        { startAngle: 0.49 * 2 * Math.PI, endAngle: 0.65 * 2 * Math.PI, label: "提供心理咨询(20)" },
        { startAngle: 0.65 * 2 * Math.PI, endAngle: 0.77 * 2 * Math.PI, label: "其它(16)" },
        { startAngle: 0.77 * 2 * Math.PI, endAngle: 0.85 * 2 * Math.PI, label: "提供物资(10)" },
        { startAngle: 0.85 * 2 * Math.PI, endAngle: 0.90 * 2 * Math.PI, label: "当志愿者(7)" },
        { startAngle: 0.90 * 2 * Math.PI, endAngle: 0.95 * 2 * Math.PI, label: "提供医学咨询(6)" },
        { startAngle: 0.95 * 2 * Math.PI, endAngle: 0.99 * 2 * Math.PI, label: "提供药物渠道(5)" },
        { startAngle: 0.99 * 2 * Math.PI, endAngle: 1 * 2 * Math.PI, label: "提供医疗信息(2)" }

        /* {startAngle: 0.2, endAngle: 0.6,innerRadius: 50,outerRadius: 120},
        {startAngle: 0.6, endAngle: 1.4,innerRadius: 50,outerRadius: 130},
        {startAngle: 1.4, endAngle: 3,innerRadius: 50,outerRadius: 140},
        {startAngle: 3, endAngle: 2* Math.PI,innerRadius: 50,outerRadius: 150} */
    ].reverse()
)["theme"](title = "互助网站自愿提供帮助情况",
    sourceText = "数据源:daohouer.com(人工编码后)"
);

new plot(document.querySelector("div#mapPlotContainer"))["mapPlot"]()["theme"](title = "网站求助的地域分布",
    sourceText = "数据源:daohouer.com", TipText = "鼠标可滑动放大查看求助者的具体地域分布情况"
);


new plot(document.querySelector("div#iconBar"))["iconBar"](
    x = ['急诊治疗', '阳性隔离收治', '车辆配送', '化疗放疗', '血液透析', '核酸检测'],
    y = [233, 203, 153, 74, 33, 30],
    fileName = ["hospital", "cure", "carTransform", "chemotherapy", "blood", "hesuan"]
)["theme"](title = "网站就医求助情况",
    sourceText = "数据源:稻侯er网站（https://daohouer.com/），呈现结果为小组编码后"
);

new plot(document.querySelector('div#AcePlot'))["polarPie"](
    data = [
        { startAngle: 0, endAngle: 0.799319728 * 2 * Math.PI, label: "焦虑抑郁药物(235)" },
        { startAngle: 0.799319728 * 2 * Math.PI, endAngle: 0.969387755 * 2 * Math.PI, label: "精神分裂药物(50)" },
        { startAngle: 0.969387755 * 2 * Math.PI, endAngle: 1 * 2 * Math.PI, label: "隔离期间心理问题(5)" }
    ].reverse(),
    labelOpa = 1,
)["theme"](title = "心理类问题求助分类",
    sourceText = "数据源：稻侯er网站（https://daohouer.com/），呈现结果为小组编码后。"
);


new plot(document.querySelector("div#forceCircle2"))["forceCircle"](
    category = ['其它', '导尿管、吸痰管', '造口袋', '氧气瓶/袋', '物理支架', '拉拉裤', '注射器', '检测试剂', '温度计', '冲洗器', '护理液', '未知', '眼镜', '针头'],
    Size = [14, 24, 14, 6, 11, 68, 3, 1, 1, 1, 1, 3, 1, 1,],
    fileName = ["other.svg", "pipeline.svg", "bag2.svg",
        "oxygenCylinder.svg", "crutch.svg", "diaper.svg", "syringe.svg", "testkit.svg", "thermometer.svg", "wash.svg",
        'Nursing liquid.svg', 'unknown.svg', "glass.svg", "needle.svg"
    ]
)["theme"](title = "家用医疗物品需求",
    sourceText = "数据源：稻侯er网站（https://daohouer.com/），呈现结果为小组编码后。"
);

//
new plot(document.querySelector("div#meetingplot"))['meetingplot'](
    category = ['基础性疾病', '其它', '精神疾病', '急性疾病'], values = [686, 465, 294, 138], color = ['#009F4D','#70AD47',"#487A7B","#9AA987"]
)["theme"](title = "药物求助需求情况",
    sourceText = "数据源:daohouer.com(人工编码后)"
);

let localData = [{ 'medicine': '草酸艾司西酞普兰片', 'quantity': 36 },
{ 'medicine': '富马酸喹硫平片', 'quantity': 27 },
{ 'medicine': '氯硝西泮片', 'quantity': 25 },
{ 'medicine': '右佐匹克隆片', 'quantity': 23 },
{ 'medicine': '奥氮平片', 'quantity': 22 },
{ 'medicine': '阿普唑仑片', 'quantity': 21 },
{ 'medicine': '盐酸舍曲林片', 'quantity': 18 },
{ 'medicine': '盐酸文拉法辛缓释片', 'quantity': 16 },
{ 'medicine': '酒石酸唑吡坦片', 'quantity': 16 },
{ 'medicine': '劳拉西泮片', 'quantity': 16 },
{ 'medicine': '盐酸文拉法辛缓释胶囊', 'quantity': 14 },
{ 'medicine': '艾司唑仑片', 'quantity': 14 },
{ 'medicine': '盐酸氟西汀胶囊', 'quantity': 13 },
{ 'medicine': '盐酸曲唑酮片', 'quantity': 11 },
{ 'medicine': '盐酸帕罗西汀片', 'quantity': 11 },
{ 'medicine': '阿戈美拉汀片', 'quantity': 10 },
/* {'medicine': '阿戈美拉汀片', 'quantity': 10}, */
{ 'medicine': '盐酸度洛西汀肠溶片', 'quantity': 9 },
{ 'medicine': '米氮平片', 'quantity': 7 },
{ 'medicine': '氢溴酸西酞普兰片', 'quantity': 5 },
{ 'medicine': '马来酸氟伏沙明片', 'quantity': 5 },
{ 'medicine': '拉莫三嗪片', 'quantity': 5 },
{ 'medicine': '氯氮平片', 'quantity': 4 },
{ 'medicine': '丙戊酸钠缓释片', 'quantity': 4 },
/* {'medicine': '阿立哌唑口崩片', 'quantity': 3}, */
{ 'medicine': '利培酮片', 'quantity': 3 },
{ 'medicine': '枸橼酸坦度螺酮片', 'quantity': 3 },
{ 'medicine': '阿立哌唑口崩片', 'quantity': 3 },
{ 'medicine': '阿立哌唑片', 'quantity': 2 },
{ 'medicine': '盐酸米那普仑片', 'quantity': 2 },
{ 'medicine': '盐酸米安色林片', 'quantity': 2 },
{ 'medicine': '盐酸安非他酮缓释片', 'quantity': 2 },
{ 'medicine': '碳酸锂缓释片', 'quantity': 2 },
{ 'medicine': '舒肝解郁胶囊', 'quantity': 2 },
{ 'medicine': '氢溴酸伏硫西汀片', 'quantity': 2 },
{ 'medicine': '富马酸喹硫平缓释片', 'quantity': 2 },
{ 'medicine': '氟哌噻吨美利曲辛片', 'quantity': 2 },
{ 'medicine': '奥沙西泮片', 'quantity': 2 },
{ 'medicine': '安非他酮缓释片', 'quantity': 2 },
/* {'medicine': '阿立哌唑片', 'quantity': 2}, */
{ 'medicine': '佐匹克隆胶囊', 'quantity': 1 },
{ 'medicine': '盐酸舍曲林分散片', 'quantity': 1 },
{ 'medicine': '盐酸帕罗西汀肠溶缓释片', 'quantity': 1 },
{ 'medicine': '盐酸丁螺环酮片', 'quantity': 1 },
{ 'medicine': '盐酸苯海索片', 'quantity': 1 },
{ 'medicine': '睡眠舒缓胶囊', 'quantity': 1 },
{ 'medicine': '舒乐安定片', 'quantity': 1 },
{ 'medicine': '舒必利片', 'quantity': 1 },
{ 'medicine': '马来酸左旋氨氯地平片', 'quantity': 1 },
{ 'medicine': '利培酮口崩片', 'quantity': 1 },
{ 'medicine': '枸橼酸坦度螺酮胶囊', 'quantity': 1 },
{ 'medicine': '布南色林片', 'quantity': 1 },
{ 'medicine': '巴戟天寡糖胶囊', 'quantity': 1 }];

new plot(document.querySelector("div#simpleCircularBar"))["simpleCircularBar"](
    data = localData, x = "medicine", y = "quantity"
)["theme"](title = "精神疾病药物求助情况",
    sourceText = "数据源:daohouer.com(人工编码后)"
);

localData2 = [{'type': '物资及其它需求-食品',
'solveed': 530,
'unfollow': 3,
'total': 752,
'Following': 219,
'show': 'true'},
{'type': '物资及其它需求-母婴用品（奶粉、纸尿裤）',
'solveed': 92,
'unfollow': 0,
'total': 157,
'Following': 65,
'show': 'true'},
{'type': '物资及其它需求-其他',
'solveed': 142,
'unfollow': 10,
'total': 154,
'Following': 2,
'show': 'true'},
{'type': '物资及其它需求-卫生用品（卫生巾等）',
'solveed': 82,
'unfollow': 0,
'total': 152,
'Following': 70,
'show': 'true'},
{'type': '物资及其它需求-离开上海/回家',
'solveed': 74,
'unfollow': 9,
'total': 129,
'Following': 46,
'show': 'true'},
{'type': '物资及其它需求-配送服务（药物、物资等）',
'solveed': 59,
'unfollow': 5,
'total': 104,
'Following': 40,
'show': 'true'},
{'type': '物资及其它需求-酒精、口罩等',
'solveed': 41,
'unfollow': 1,
'total': 62,
'Following': 20,
'show': 'true'},
{'type': '物资及其它需求-寻求住所',
'solveed': 28,
'unfollow': 0,
'total': 47,
'Following': 19,
'show': 'true'},
{'type': '物资及其它需求1',
'solveed': 0,
'unfollow': 0,
'total': 0,
'Following': 0,
'show': 'true'},
{'type': '物资及其它需求2',
'solveed': 0,
'unfollow': 0,
'total': 0,
'Following': 0,
'show': 'true'},
{'type': '药物-焦虑、抑郁',
'solveed': 206,
'unfollow': 2,
'total': 303,
'Following': 95,
'show': 'true'},
{'type': '药物-糖尿病',
'solveed': 146,
'unfollow': 2,
'total': 209,
'Following': 61,
'show': 'true'},
{'type': '药物-癌症肿瘤',
'solveed': 107,
'unfollow': 0,
'total': 156,
'Following': 49,
'show': 'true'},
{'type': '药物-高血压',
'solveed': 125,
'unfollow': 0,
'total': 148,
'Following': 23,
'show': 'true'},
{'type': '药物-心血管疾病',
'solveed': 70,
'unfollow': 0,
'total': 99,
'Following': 29,
'show': 'true'},
{'type': '药物-急性疾病（突发、急诊）',
'solveed': 69,
'unfollow': 0,
'total': 91,
'Following': 22,
'show': 'true'},
{'type': '药物-肝肾病（肾衰竭等）',
'solveed': 43,
'unfollow': 0,
'total': 56,
'Following': 13,
'show': 'true'},
{'type': '药物-精神分裂、双相情感障碍',
'solveed': 32,
'unfollow': 1,
'total': 54,
'Following': 21,
'show': 'true'},
{'type': '药物-阿尔茨海默症、帕金森',
'solveed': 23,
'unfollow': 0,
'total': 26,
'Following': 3,
'show': 'true'},
{'type': '药物-其它',
'solveed': 10,
'unfollow': 0,
'total': 17,
'Following': 7,
'show': 'true'},
{'type': '药物-隔离期间心理问题',
'solveed': 8,
'unfollow': 0,
'total': 10,
'Following': 2,
'show': 'true'},
{'type': '药物1',
'solveed': 0,
'unfollow': 0,
'total': 0,
'Following': 0,
'show': 'true'},
{'type': '药物2',
'solveed': 0,
'unfollow': 0,
'total': 0,
'Following': 0,
'show': 'true'},
{'type': '就医需求-医院治疗（常规急诊）',
'solveed': 175,
'unfollow': 5,
'total': 299,
'Following': 119,
'show': 'true'},
{'type': '就医需求-阳性隔离收治',
'solveed': 102,
'unfollow': 12,
'total': 190,
'Following': 76,
'show': 'true'},
{'type': '就医需求-车辆配送',
'solveed': 65,
'unfollow': 1,
'total': 102,
'Following': 36,
'show': 'true'},
{'type': '就医需求-核酸检测',
'solveed': 33,
'unfollow': 2,
'total': 48,
'Following': 13,
'show': 'true'},
{'type': '就医需求-化疗放疗',
'solveed': 17,
'unfollow': 0,
'total': 47,
'Following': 30,
'show': 'true'},
{'type': '就医需求-血液透析',
'solveed': 17,
'unfollow': 1,
'total': 33,
'Following': 15,
'show': 'true'},
{'type': '就医需求-打疫苗',
'solveed': 4,
'unfollow': 1,
'total': 7,
'Following': 2,
'show': 'true'},
{'type': '就医需求-其它',
'solveed': 4,
'unfollow': 0,
'total': 5,
'Following': 1,
'show': 'true'},
{'type': '就医需求-产检+生产',
'solveed': 1,
'unfollow': 0,
'total': 4,
'Following': 3,
'show': 'true'},
{'type': '就医需求1',
'solveed': 0,
'unfollow': 0,
'total': 0,
'Following': 0,
'show': 'true'},
{'type': '就医需求2',
'solveed': 0,
'unfollow': 0,
'total': 0,
'Following': 0,
'show': 'true'},
{'type': '家用医疗器械-拉拉裤（成人纸尿裤）',
'solveed': 33,
'unfollow': 0,
'total': 47,
'Following': 14,
'show': 'true'},
{'type': '家用医疗器械-导尿管、吸痰管',
'solveed': 14,
'unfollow': 0,
'total': 24,
'Following': 10,
'show': 'true'},
{'type': '家用医疗器械-其它',
'solveed': 15,
'unfollow': 0,
'total': 18,
'Following': 3,
'show': 'true'},
{'type': '家用医疗器械-造口袋',
'solveed': 13,
'unfollow': 0,
'total': 14,
'Following': 1,
'show': 'true'},
{'type': '家用医疗器械-物理支架（拐杖、关节支架等）',
'solveed': 6,
'unfollow': 0,
'total': 10,
'Following': 4,
'show': 'true'},
{'type': '家用医疗器械-氧气瓶/袋',
'solveed': 5,
'unfollow': 0,
'total': 5,
'Following': 0,
'show': 'true'},
{'type': '家用医疗器械-注射器',
'solveed': 2,
'unfollow': 0,
'total': 3,
'Following': 1,
'show': 'true'},
{'type': '家用医疗器械-温度计',
'solveed': 1,
'unfollow': 0,
'total': 1,
'Following': 0,
'show': 'true'},
{'type': '家用医疗器械-检测试剂',
'solveed': 1,
'unfollow': 0,
'total': 1,
'Following': 0,
'show': 'true'},
{'type': '家用医疗器械2',
'solveed': 0,
'unfollow': 0,
'total': 0,
'Following': 0,
'show': 'true'},
{'type': '家用医疗器械1',
'solveed': 0,
'unfollow': 0,
'total': 0,
'Following': 0,
'show': 'true'}];

new plot(document.querySelector("div#circularStackBar"))["circularStackBar"](
    data=localData2,
    color=['#009F4D','#70AD47',"#487A7B"],
    labelName=["已解决","跟进中","待跟进"],
    
)["theme"](title = "精神疾病药物求助情况",
sourceText = "数据源:daohouer.com(人工编码后)"
);