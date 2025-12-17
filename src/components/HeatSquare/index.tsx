import React, { useState } from "react";
import "./index.css";

interface HeatSquareProps {
    selectedPointId?: string;
    name: string;
    lighting: boolean;
    showName?: boolean;
    value: number; // 唯一差值
    maxDiff?: number; // 最大值用于映射
}

const HeatSquare = ({
    selectedPointId,
    name,
    showName = false,
    lighting,
    value,
    maxDiff = 100,
}: HeatSquareProps) => {
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });

    // const ratio = Math.min(value / maxValue, 1); // 0~1

    // // 颜色从 蓝(#4B9EFF) → 红(#FF4B4B)
    // const r = Math.round(75 + ratio * (255 - 75));
    // const g = Math.round(158 - ratio * 158);
    // const b = Math.round(255 - ratio * (255 - 75));
    // const color = `rgb(${r},${g},${b})`;
    function getHeatColor(value: number, maxValue: number): string {
        // 使用绝对值计算比例
        let ratio = Math.abs(value) / maxValue;
        if (ratio > 1) ratio = 1;

        // 热力图颜色：浅蓝 → 青 → 黄 → 红
        const colors = [
            [77, 166, 255], // 浅蓝
            [0, 255, 255], // 青
            [255, 255, 0], // 黄
            [255, 0, 0], // 红
        ];

        let idx = Math.floor(ratio * (colors.length - 1));
        if (idx >= colors.length - 1) idx = colors.length - 2;

        const t = ratio * (colors.length - 1) - idx;

        const r = Math.round(
            colors[idx][0] + t * (colors[idx + 1][0] - colors[idx][0])
        );
        const g = Math.round(
            colors[idx][1] + t * (colors[idx + 1][1] - colors[idx][1])
        );
        const b = Math.round(
            colors[idx][2] + t * (colors[idx + 1][2] - colors[idx][2])
        );

        return `rgb(${r},${g},${b})`;
    }

    const color = getHeatColor(value, maxDiff);

    return (
        <>
            <div
                className={"heat-square " + (selectedPointId === name ? "selected" : "") + (lighting ? " lighting" : "")}
                style={{ backgroundColor: color }}
                onMouseEnter={() => setTooltip({ ...tooltip, visible: true })}
                onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
                onMouseMove={(e) =>
                    setTooltip({
                        visible: true,
                        x: e.clientX + 10,
                        y: e.clientY - 10,
                    })
                }
            >
                {showName && <span>{name}</span>}
            </div>

            {tooltip.visible && (
                <div
                    className="heat-tooltip"
                    style={{ top: tooltip.y, left: tooltip.x }}
                >
                    <strong>{name}</strong>
                    <div>差值：{value}</div>
                </div>
            )}
        </>
    );
};

export default HeatSquare;
