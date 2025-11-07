import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface LineChartData {
    title: string;
    xName: string;
    yName: string[];
    xData: (string | number)[];
    yData: number[][];
}

const LineChart = ({ title, xName, yName, xData, yData }: LineChartData) => {
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
            },
            grid: {
                left: 40,
                right: 40,
                bottom: 20,
                containLabel: true, // 确保坐标轴标签不会被裁剪
            },
            tooltip: {
                trigger: "axis",
                textStyle: { color: "#fff" },
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                borderColor: "#555",
                borderWidth: 1,
            },
            legend: {
                data: yName,
                top: "10%",
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
                nameLocation: "middle",
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
                nameLocation: "middle",
                nameGap: 40,
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
    }, []);

    return <div ref={chartRef} style={{ width: "100%", height: "100%" }} />;
};

export default LineChart;
