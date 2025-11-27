import React, { useMemo, useRef, useEffect, useState } from "react";
import HeatSquare from "../HeatSquare";
import "./index.css";

interface RawPoint {
    pointId: string;
    value: number;
    row: number;
    column: number;
}

interface HeatmapGridProps {
    data: RawPoint[]; // ← 改为从外部传入真实数据
    clickPoint: (point: string) => void;

    showSquareName?: boolean;
    showGridLine?: boolean;
    maxDiff?: number;
}

const HeatmapGrid: React.FC<HeatmapGridProps> = ({
    data,
    showSquareName = false,
    showGridLine = false,
    maxDiff = 15,
    clickPoint,
}) => {
    /** 计算真实行列数 */
    const numRows = useMemo(() => Math.max(...data.map((d) => d.row)), [data]);
    const numCols = useMemo(
        () => Math.max(...data.map((d) => d.column)),
        [data]
    );

    /** 构建二维数组 grid[row][column] */
    const grid = useMemo(() => {
        const g: (RawPoint | null)[][] = Array.from({ length: numRows }, () =>
            Array.from({ length: numCols }, () => null)
        );

        data.forEach((item) => {
            const r = item.row - 1; // row 从 1 开始 → 转为 0-based
            const c = item.column - 1;
            g[r][c] = item;
        });

        return g;
    }, [data, numRows, numCols]);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const [polyPoints, setPolyPoints] = useState("");

    /** 轨迹线（按 row-major 顺序即可） */
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const nodes = Array.from(
            container.querySelectorAll<HTMLElement>(".grid-cell")
        );
        const rectContainer = container.getBoundingClientRect();
        const pts: string[] = [];

        nodes.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const x = rect.left + rect.width / 2 - rectContainer.left;
            const y = rect.top + rect.height / 2 - rectContainer.top;
            pts.push(`${x},${y}`);
        });

        setPolyPoints(pts.join(" "));
    }, [grid]);

    return (
        <div className="heatmap-grid-container" ref={containerRef}>
            {polyPoints && showGridLine && (
                <svg
                    className="heatmap-track"
                    width="100%"
                    height="100%"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        pointerEvents: "none",
                    }}
                >
                    <polyline
                        points={polyPoints}
                        stroke="rgba(0, 255, 115, 0.4)"
                        strokeWidth="2"
                        fill="none"
                    />
                </svg>
            )}

            <div
                className="heatmap-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns: `auto repeat(${numCols}, 1fr)`,
                    gap: "2px",
                }}
            >
                {grid.map((row, rowIndex) => (
                    <React.Fragment key={`row-${rowIndex}`}>
                        <div className="row-label">
                            {rowIndex + 1}
                        </div>
                        {row.map((cell, colIndex) =>
                            cell ? (
                                <div className="grid-cell" key={cell.pointId} onClick={() => clickPoint(cell.pointId)}>
                                    <HeatSquare
                                        name={cell.pointId}
                                        value={cell.value}
                                        maxDiff={maxDiff}
                                        showName={showSquareName}
                                    />
                                </div>
                            ) : (
                                <div className="grid-cell" key={`empty-${rowIndex}-${colIndex}`}>
                                    <div style={{ aspectRatio: "1/1" }} />
                                </div>
                            )
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default HeatmapGrid;
