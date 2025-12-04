import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface LineChartData {
    title: string;
    xName: string;
    yName: string[];
    xData: string[];
    yData: number[][];
    showPic?: boolean;
    shiftImgMap?: { [key: number]: string };
    openPicturePanel?: (pictureUrl: string, seriesName: string, pictureTime: string) => void;
}

const LineChart = ({ title, xName, yName, xData, yData, showPic, shiftImgMap, openPicturePanel }: LineChartData) => {
    const chartRef = useRef(null); // 引用 DOM 节点

    // 判断是否存在以 -Y 结尾的线（需要右轴）
    const hasYLine = yName.some((name) => name.endsWith("-Y"));
    // 构造 yAxis（始终是数组，至少包含左轴）
    const yAxis = [
        {
            // name: yName.find((n) => n.endsWith("-X"))?.replace(/-X$/, "") || "左轴",
            type: "value",
            nameTextStyle: { color: "#fff" },
            axisLine: { lineStyle: { color: "#fff" } },
            axisLabel: { color: "#fff" },
            splitLine: { lineStyle: { color: "rgba(255,255,255,0.2)" } },
            nameRotate: 0,
        },
    ];

    // 如果有 -Y，则添加右轴
    if (hasYLine) {
        yAxis.push({
            // name: yName.find((n) => n.endsWith("-Y"))?.replace(/-Y$/, "") || "右轴",
            type: "value",
            nameTextStyle: { color: "#fff" },
            axisLine: { lineStyle: { color: "#fff" } },
            axisLabel: { color: "#fff" },
            splitLine: { show: false }, // 右轴通常不显示网格线
        });
    }

    // 仅有左轴时，设置上下限
    if (!hasYLine) {
        yAxis[0].min = 1500;
        yAxis[0].max = 1600;
        // yAxis[0].name = '0.1mm 位移';
    } else {
        yAxis[0].name = '0.01mm 位移';
        yAxis[1].name = '0.01mm 位移';
    }

    // 构造 series，注意 yAxisIndex：以 -Y 结尾的走右轴（1），否则走左轴（0）
    const series = yName.map((name, index) => {
        const isY = name.endsWith("-Y");
        const isX = name.endsWith("-X");

        return {
            name,
            type: "line",
            data: yData[index],
            smooth: true,
            yAxisIndex: isY ? 1 : 0, // 如果是 -Y => 1；否则默认 0
            lineStyle: {
                width: 3,
                type: isX ? "solid" : isY ? "dashed" : "solid",
            },
            symbol: "circle",
            symbolSize: 8,
            areaStyle: { opacity: 0 },
            // 可选颜色区分
            // itemStyle: { color: isY ? '#F56C6C' : '#409EFF' },
        };
    });

    useEffect(() => {
        // 初始化 echarts 实例
        const chart = echarts.init(chartRef.current);

        // 配置项（图表的样式和数据）
        const option = {
            backgroundColor: "transparent", // 背景透明
            title: {
                text: title,
                left: "center",
                textStyle: {
                    color: "#fff", // 标题文字颜色
                },
                padding: 0,
            },
            grid: {
                top: 40,
                left: 40,
                right: 40,
                bottom: hasYLine ? 0 : 20,
                containLabel: true, // 确保坐标轴标签不会被裁剪
            },
            // tooltip: {
            //     trigger: "axis",
            //     textStyle: { color: "#fff" },
            //     backgroundColor: "rgba(0, 0, 0, 0.6)",
            //     borderColor: "#555",
            //     borderWidth: 1,
            // },
            // tooltip: showPic
            //     ? {
            //         trigger: "axis",
            //         backgroundColor: "transparent", // 让背景透明
            //         borderWidth: 0,
            //         extraCssText: "box-shadow: none;", // 去掉阴影
            //         formatter: function (params: any[]) {
            //             // params 是一个10个子元素的数组，每个子元素是相同的，代表当前点的系列数据

            //             const item = params[0];
            //             const shiftId = item.data.shiftId;
            //             const pictureTime = item.axisValue;
            //             const pictureUrl = pictureMap ? pictureMap[shiftId] : "";
            //             console.log('shiftId', shiftId);

            //             return `
            //             <div style="
            //                 background: rgba(0, 0, 0, 0.29);
            //                 border: 1px solid rgba(0, 0, 0, 0.68);
            //                 border-radius: 8px;
            //                 padding: 8px 12px;
            //                 color: #fff;
            //                 font-size: 14px;
            //                 display: flex;
            //                 flex-direction: column;
            //                 align-items: center;
            //                 ">
            //                 <div>${pictureTime} 现场图片</div>
            //                 <img src="${pictureUrl}"
            //                     alt="靶点拍摄图片"
            //                     style="width: 200px; height: 200px; margin: 0 6px;"
            //                 />
            //             </div>
            //             `;
            //         },
            //     }
            //     : {
            //         trigger: "axis",
            //         textStyle: { color: "#fff" },
            //         backgroundColor: "rgba(0, 0, 0, 0.6)",
            //         borderColor: "#555",
            //         borderWidth: 1,
            //     },
            legend: {
                data: yName,
                top: "4%",
                right: "10%",
                textStyle: {
                    color: "#fff", // 图例文字颜色
                },
            },
            xAxis: {
                name: xName,
                type: "category",
                data: xData.map(x => `${x.split('-')[1]}-${x.split('-')[2]}`), // 不显示年份，节省空间
                axisLine: {
                    lineStyle: { color: "#fff" }, // 坐标轴线颜色
                },
                axisLabel: {
                    color: "#fff", // x轴刻度文字颜色
                    interval: hasYLine ? 0 : "auto", // 显示所有标签
                    rotate: xData.length > 8 ? -15 : 0,  // x轴数据过多时斜着显示
                },
                axisTick: {
                    lineStyle: { color: "#fff" },
                },
                nameLocation: "end",
                nameGap: 5, // 调整名称与坐标轴的距离，数值越小越靠上
                nameTextStyle: { color: "#fff" },
            },
            yAxis,
            series,
        };

        // 设置配置项
        chart.setOption(option);

        // 先解绑旧的 click，防止重复绑定
        chart.off("click");

        chart.on("click", (params) => {
            if (!params) return;
            const pictureUrl = shiftImgMap ? shiftImgMap[params.data?.shiftId] : undefined;
            const pictureTime = params.name;
            const seriesName = params.seriesName;
            openPicturePanel && openPicturePanel(pictureUrl, seriesName, pictureTime);
        })

        // ✅ 窗口大小变化时自适应
        const resizeObserver = new ResizeObserver(() => chart.resize());
        resizeObserver.observe(chartRef.current);

        // 组件卸载时清理
        return () => {
            resizeObserver.disconnect();
            chart.dispose();
        };
    }, [title, xName, yName, xData, yData, showPic, shiftImgMap]);

    return <div ref={chartRef} style={{ width: "100%", height: "100%" }} />;
};

export default LineChart;
