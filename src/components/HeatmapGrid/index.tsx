import React, { useMemo, useRef, useEffect, useState } from "react";
import HeatSquare from "../HeatSquare";
import "./index.css";

type StartCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type Orientation = "horizontal" | "vertical";

interface HeatmapGridProps {
    /** 行数，决定蛇形排列的行数 */
    numRows?: number;
    showSquareName?: boolean;
    showGridLine?: boolean;
    maxDiff?: number;
    orientation?: Orientation;
    startCorner?: StartCorner;
}

const heatmapData = Array.from({ length: 110 }, (_, i) => ({
    id: i + 1,
    name: `GX ${i + 1}`,
    value1: Math.floor(Math.random() * 100),
    value2: Math.floor(Math.random() * 100),
}));

function buildTraversal(rows: number, cols: number, orientation: Orientation) {
    const traversal: Array<{ r: number; c: number }> = [];
    if (orientation === "horizontal") {
        // base: top-left horizontal S-shape
        for (let r = 0; r < rows; r++) {
            if (r % 2 === 0) {
                for (let c = 0; c < cols; c++) traversal.push({ r, c });
            } else {
                for (let c = cols - 1; c >= 0; c--) traversal.push({ r, c });
            }
        }
    } else {
        // base: top-left vertical S-shape
        for (let c = 0; c < cols; c++) {
            if (c % 2 === 0) {
                for (let r = 0; r < rows; r++) traversal.push({ r, c });
            } else {
                for (let r = rows - 1; r >= 0; r--) traversal.push({ r, c });
            }
        }
    }
    return traversal;
}

function transformTraversalForCorner(
    traversal: Array<{ r: number; c: number }>,
    rows: number,
    cols: number,
    startCorner: StartCorner
) {
    const transformed = traversal.map(({ r, c }) => {
        let rr = r;
        let cc = c;
        if (startCorner === "top-right" || startCorner === "bottom-right") {
            cc = cols - 1 - cc; // horizontal flip
        }
        if (startCorner === "bottom-left" || startCorner === "bottom-right") {
            rr = rows - 1 - rr; // vertical flip
        }
        return { r: rr, c: cc };
    });
    return transformed;
}

const HeatmapGrid: React.FC<HeatmapGridProps> = ({
    numRows = 4,
    showSquareName = false,
    showGridLine = true,
    maxDiff = 100,
    orientation = "horizontal",
    startCorner = "top-left",
}) => {
    const total = heatmapData.length;
    const cols = Math.ceil(total / numRows);

    // traversal: array of (r,c) in the exact order we want to "walk" the grid
    const traversal = useMemo(() => {
        const base = buildTraversal(numRows, cols, orientation);
        return transformTraversalForCorner(base, numRows, cols, startCorner);
    }, [numRows, cols, orientation, startCorner]);

    // build gridCells[r][c] filled according to traversal
    const gridCells = useMemo(() => {
        // init with nulls
        const grid: ((typeof heatmapData)[number] | null)[][] = Array.from(
            { length: numRows },
            () => Array.from({ length: cols }, () => null)
        );

        // fill in traversal order
        for (let i = 0; i < traversal.length; i++) {
            const pos = traversal[i];
            if (i < heatmapData.length) {
                grid[pos.r][pos.c] = heatmapData[i];
            } else {
                grid[pos.r][pos.c] = null; // empty slot
            }
        }
        return grid;
    }, [traversal]);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const [polyPoints, setPolyPoints] = useState<string>("");

    // 计算轨迹点（按 traversal 顺序，取每个 traversal coord 在 DOM 中对应的 grid-cell 元素）
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        // all cells in DOM are rendered in row-major order (.grid-cell)
        const nodes = Array.from(
            container.querySelectorAll<HTMLElement>(".grid-cell")
        );

        const containerRect = container.getBoundingClientRect();
        const pts: string[] = [];

        for (let i = 0; i < traversal.length; i++) {
            const { r, c } = traversal[i];
            const rowMajorIndex = r * cols + c;
            const el = nodes[rowMajorIndex];
            if (!el) continue; // 防御性检查
            const rect = el.getBoundingClientRect();
            const x = rect.left + rect.width / 2 - containerRect.left;
            const y = rect.top + rect.height / 2 - containerRect.top;
            pts.push(`${x},${y}`);
        }

        setPolyPoints(pts.join(" "));
        // 依赖 traversal、cols、heatmapData.length 以及容器尺寸变化可加监听 resize/scroll
    }, [traversal, cols, heatmapData.length]);

    // 渲染：按行主序输出网格单元（gridCells）
    const flatCells = gridCells.flat(); // length = rows*cols

    // const containerRef = useRef<HTMLDivElement>(null);
    // const [positions, setPositions] = useState<Position[]>([]);

    // const data = useMemo(() => {
    //     return generateSnakeOrder(
    //         heatmapData,
    //         numRows,
    //         orientation,
    //         startCorner
    //     );
    // }, [heatmapData, numRows, orientation, startCorner]);

    // const numCols = Math.ceil(heatmapData.length / numRows);

    // // 获取每个方块的位置中心点，用于绘制轨迹线
    // useEffect(() => {
    //     if (!containerRef.current) return;
    //     const elements = Array.from(
    //         containerRef.current.querySelectorAll(".heat-square")
    //     ) as HTMLElement[];

    //     const containerRect = containerRef.current.getBoundingClientRect();

    //     const rects = elements.map((el) => {
    //         const rect = el.getBoundingClientRect();
    //         return {
    //             x: rect.left + rect.width / 2 - containerRect.left,
    //             y: rect.top + rect.height / 2 - containerRect.top,
    //         };
    //     });

    //     // ✅ 行列配置（与布局一致）
    //     const rowCount = 4; // 每列显示多少个（比如4行，可根据你的props动态传入）
    //     const colCount = Math.ceil(rects.length / rowCount);

    //     // ✅ S形重排
    //     const sShaped: typeof rects = [];
    //     for (let row = 0; row < rowCount; row++) {
    //         const rowItems = rects.filter(
    //             (_, i) => Math.floor(i / colCount) === row
    //         );
    //         if (row % 2 === 1) {
    //             rowItems.reverse();
    //         }
    //         sShaped.push(...rowItems);
    //     }

    //     setPositions(sShaped);
    // }, [data]);

    return (
        <div className="heatmap-grid-container" ref={containerRef}>
            {/* 绘制轨迹线 */}
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

            {/* 主网格 */}
            <div
                className="heatmap-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: "2px",
                }}
            >
                {/* {data.map((item) => (
                    <HeatSquare
                        key={item.name}
                        name={item.name}
                        value1={item.value1}
                        value2={item.value2}
                        maxDiff={100}
                    />
                ))} */}
                {flatCells.map((cell, idx) => {
                    if (cell) {
                        return (
                            <div
                                className="grid-cell"
                                key={cell.name}
                                style={{ width: "100%" }}
                            >
                                <HeatSquare
                                    name={cell.name}
                                    value1={cell.value1}
                                    value2={cell.value2}
                                    maxDiff={maxDiff}
                                    showName={showSquareName}
                                />
                            </div>
                        );
                    } else {
                        return (
                            <div
                                className="grid-cell"
                                key={`empty-${idx}`}
                                aria-hidden
                                style={{ width: "100%" }}
                            >
                                {/* 可渲染空占位样式 */}
                                <div
                                    style={{
                                        width: "100%",
                                        aspectRatio: "1/1",
                                    }}
                                />
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
};

export default HeatmapGrid;
