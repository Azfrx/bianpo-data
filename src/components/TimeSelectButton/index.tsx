import React, { useMemo, useRef, useEffect, useState } from "react";
import "./index.css";

interface TimeSelectButtonProps {
    year: number;
    month: number;
    day: number;
    onCancel: (e: React.MouseEvent) => void;
    onConfirm: (year: number, month: number, day: number, e: React.MouseEvent) => void;
}

const TimeSelectButton: React.FC<TimeSelectButtonProps> = ({ year, month, day, onCancel, onConfirm }) => {
    // 年份范围（比如 2000 ~ 当前年 + 5）
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
    // 月份和日期
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    // 选中值
    const [selectedYear, setSelectedYear] = useState(year);
    const [selectedMonth, setSelectedMonth] = useState(month);
    const [selectedDay, setSelectedDay] = useState(day);

    return (
        <div className="timeSetting-panel">
            <div className="timeSetting-item">
                年:
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                    {years.map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>
            </div>
            <div className="timeSetting-item">
                月:
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                    {months.map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                    ))}
                </select>
            </div>
            <div className="timeSetting-item">
                日:
                <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(Number(e.target.value))}
                >
                    {days.map((d) => (
                        <option key={d} value={d}>
                            {d}
                        </option>
                    ))}
                </select>
            </div>
            <div className="timeSetting-close">
                <div
                    className="timeSetting-close-cancel"
                    onClick={onCancel}
                >
                    取消
                </div>
                <div
                    className="timeSetting-close-confirm"
                    onClick={(e) => onConfirm(selectedYear, selectedMonth, selectedDay, e)}
                >
                    确定
                </div>
            </div>
        </div>
    );
};

export default TimeSelectButton;