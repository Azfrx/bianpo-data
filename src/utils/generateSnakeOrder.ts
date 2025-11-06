type StartCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type Orientation = "horizontal" | "vertical";

interface Item {
    name: string;
    value1: number;
    value2: number;
}

export function generateSnakeOrder(
    data: Item[],
    rows: number,
    orientation: Orientation = "horizontal",
    startCorner: StartCorner = "top-left"
) {
    const total = data.length;
    const cols = Math.ceil(total / rows);
    let order: Item[] = [];

    if (orientation === "horizontal") {
        // --- 按行扫描
        for (let r = 0; r < rows; r++) {
            const rowItems = data.slice(r * cols, (r + 1) * cols);
            if (r % 2 === 1) rowItems.reverse();
            order.push(...rowItems);
        }
    } else {
        // --- 按列扫描
        for (let c = 0; c < cols; c++) {
            const colItems: Item[] = [];
            for (let r = 0; r < rows; r++) {
                const idx = r * cols + c;
                if (idx < total) colItems.push(data[idx]);
            }
            if (c % 2 === 1) colItems.reverse();
            order.push(...colItems);
        }
    }

    // --- 起点翻转处理
    if (startCorner.includes("right")) {
        // 左右翻转
        const newOrder: Item[] = [];
        for (let r = 0; r < rows; r++) {
            const start = r * cols;
            const end = start + cols;
            newOrder.push(...order.slice(start, end).reverse());
        }
        order = newOrder;
    }

    if (startCorner.includes("bottom")) {
        // 上下翻转
        const newOrder: Item[] = [];
        for (let r = rows - 1; r >= 0; r--) {
            const start = r * cols;
            const end = start + cols;
            newOrder.push(...order.slice(start, end));
        }
        order = newOrder;
    }

    return order;
}
