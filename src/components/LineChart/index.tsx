import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface LineChartData {
    title: string;
    xName: string;
    yName: string[];
    xData: (string | number)[];
    yData: number[][];
    showPic?: boolean;
}

const LineChart = ({ title, xName, yName, xData, yData, showPic }: LineChartData) => {
    const chartRef = useRef(null); // 引用 DOM 节点

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
                bottom: 20,
                containLabel: true, // 确保坐标轴标签不会被裁剪
            },
            // tooltip: {
            //     trigger: "axis",
            //     textStyle: { color: "#fff" },
            //     backgroundColor: "rgba(0, 0, 0, 0.6)",
            //     borderColor: "#555",
            //     borderWidth: 1,
            // },
            tooltip: showPic ? {
                trigger: "axis",
                backgroundColor: "transparent", // 让背景透明
                borderWidth: 0,
                extraCssText: "box-shadow: none;", // 去掉阴影
                formatter: function (params: any[]) {
                    // params 是一个数组，每个元素代表当前点的系列数据
                    const item = params[0];
                    return `
                        <div style="
                            background: rgba(0, 0, 0, 0.29);
                            border: 1px solid rgba(0, 0, 0, 0.68);
                            border-radius: 8px;
                            padding: 8px 12px;
                            color: #fff;
                            font-size: 14px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            ">
                            <div>现场图片</div>
                            <img src="https://picsum.photos/600/600"
                                alt="摄像头图片"
                                style="width: 200px; height: 200px; margin: 0 6px;"
                            />
                        </div>
                        `;
                },
            } : {
                trigger: "axis",
                textStyle: { color: "#fff" },
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                borderColor: "#555",
                borderWidth: 1,
            },
            legend: {
                data: yName,
                top: "0%",
                right: "10%",
                textStyle: {
                    color: "#fff", // 图例文字颜色
                },
            },
            xAxis: {
                name: xName,
                type: "category",
                data: xData,
                axisLine: {
                    lineStyle: { color: "#fff" }, // 坐标轴线颜色
                },
                axisLabel: {
                    color: "#fff", // x轴刻度文字颜色
                },
                axisTick: {
                    lineStyle: { color: "#fff" },
                },
                nameLocation: "end",
                nameGap: 5, // 调整名称与坐标轴的距离，数值越小越靠上
                nameTextStyle: { color: "#fff" },
            },
            yAxis: {
                name: yName[0],
                type: "value",
                nameTextStyle: { color: "#fff" }, // y轴名称颜色
                axisLine: {
                    lineStyle: { color: "#fff" },
                },
                axisLabel: {
                    color: "#fff", // y轴刻度文字颜色
                },
                splitLine: {
                    lineStyle: {
                        color: "rgba(255,255,255,0.2)", // 网格线淡白色
                    },
                },
                // nameLocation: "middle",
                // nameGap: 40,
                nameRotate: 0,
            },
            series: yName.map((name, index) => ({
                name,
                type: "line",
                data: yData[index],
                smooth: true,
                lineStyle: {
                    width: 3,
                },
                symbol: "circle",
                symbolSize: 6,
                areaStyle: {
                    opacity: 0.1,
                },
            })),
        };

        // 设置配置项
        chart.setOption(option);

        // ✅ 窗口大小变化时自适应
        const resizeObserver = new ResizeObserver(() => chart.resize());
        resizeObserver.observe(chartRef.current);

        // 组件卸载时清理
        return () => {
            resizeObserver.disconnect();
            chart.dispose();
        };
    }, [title, xName, yName, xData, yData, showPic]);

    return <div ref={chartRef} style={{ width: "100%", height: "100%" }} />;
};

export default LineChart;
