import React, { useState } from "react";
import "./index.css";
interface HeatSquareProps {
    name: string;
    showName?: boolean;
    value1: number;
    value2: number;
    maxDiff?: number; // 最大差异值，用于颜色映射
}

const HeatSquare = ({
    name,
    showName = false,
    value1,
    value2,
    maxDiff = 100,
}: HeatSquareProps) => {
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });

    const diff = Math.abs(value1 - value2);
    const ratio = Math.min(diff / maxDiff, 1); // 差异比例 0~1

    // 颜色映射：从蓝(#4B9EFF) → 红(#FF4B4B)
    const r = Math.round(75 + ratio * (255 - 75));
    const g = Math.round(158 - ratio * 158);
    const b = Math.round(255 - ratio * (255 - 75));
    const color = `rgb(${r},${g},${b})`;

    const handleMouseEnter = () => setTooltip({ ...tooltip, visible: true });
    const handleMouseLeave = () => setTooltip({ ...tooltip, visible: false });
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) =>
        setTooltip({ visible: true, x: e.clientX + 10, y: e.clientY - 10 });

    return (
        <>
            <div
                className="heat-square"
                style={{ backgroundColor: color }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
            >
                {showName && <span>{name}</span>}
            </div>

            {tooltip.visible && (
                <div
                    className="heat-tooltip"
                    style={{ top: tooltip.y, left: tooltip.x }}
                >
                    <strong>{name}</strong>
                    <div>值1：{value1}</div>
                    <div>值2：{value2}</div>
                    <div>差异：{diff.toFixed(2)}</div>
                </div>
            )}
        </>
    );
};

export default HeatSquare;
