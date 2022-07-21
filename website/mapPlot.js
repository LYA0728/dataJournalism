
var map = window.map = new AMap.Map('mapPlot', {
    zoom: 11.7,
    center: [121.48, 31.22],
    pitch: 40,
    showLabel: true,

    /* mapStyle: 'amap://styles/54446375c5849c97dc525db6aa990b9f', */
    /* viewMode: '3D', */
    /* mapStyle: 'amap://styles/grey', */
    /* viewMode: '3D', */
});

var loca = window.loca = new Loca.Container({
    map,
});

// 蓝色普通点
var geo = new Loca.GeoJSONSource({
    url: 'https://fastly.jsdelivr.net/gh/LYA0728/csv/locationJson2.json',
});

// console.log(geo)
var scatter = new Loca.ScatterLayer({
    zIndex: 111,
    opacity: 1,
    visible: true,
    zooms: [2, 22],
});
scatter.setSource(geo);
scatter.setStyle({
    color: '#2BAA5D',
    unit: 'meter',
    size: [250, 250],
    borderWidth: 0,
});
loca.add(scatter);
// 启动渲染动画
loca.animate.start();

/* var dat = new Loca.Dat(); */
/* dat.addLayer(scatter, ' 贴地'); */
/*  dat.addLayer(breathRed, '红色');
 dat.addLayer(breathYellow, '黄色'); */

