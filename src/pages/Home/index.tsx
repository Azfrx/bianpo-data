import React, { useMemo, useRef, useEffect, useState } from "react";
// import HeatSquare from "../../components/HeatSquare";
import HeatmapGrid from "../../components/HeatmapGrid";
import TimeSelectButton from "../../components/TimeSelectButton";
import "./index.css";

type StartCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type Orientation = "horizontal" | "vertical";

const fakeList = [
    { id: 1, name: "项目01", active: true },
    { id: 2, name: "项目02", active: false },
];

export default function Home() {
    const [list, setList] = useState(fakeList);
    const [settingOpening, setSettingOpening] = useState(false);
    const [showLeftTimeSetting, setShowLeftTimeSetting] = useState(false);
    const [showRightTimeSetting, setShowRightTimeSetting] = useState(false);
    const [showSquareName, setShowSquareName] = useState(false);
    const [showGridLine, setShowGridLine] = useState(true);
    const [direction, setDirection] = useState<Orientation>("horizontal");
    const [start, setStart] = useState<StartCorner>("top-left");
    const [leftYear, setLeftYear] = useState(2025);
    const [leftMonth, setLeftMonth] = useState(11);
    const [leftDay, setLeftDay] = useState(1);
    const [rightYear, setRightYear] = useState(2025);
    const [rightMonth, setRightMonth] = useState(11);
    const [rightDay, setRightDay] = useState(5);

    const ClickItem = (id: number) => {
        setList((list) =>
            list.map((item) => ({
                ...item,
                active: item.id === id,
            }))
        );
    };
    const showSetting = () => {
        setSettingOpening(true);
    };
    const selectSetting = (value: StartCorner | Orientation) => {
        if (value === "horizontal" || value === "vertical") {
            setDirection(value);
        } else {
            setStart(value);
        }
    };

    const leftTimeCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowLeftTimeSetting(false);
    };
    const leftTimeConfirm = (
        year: number,
        month: number,
        day: number,
        e: React.MouseEvent
    ) => {
        e.stopPropagation();
        setLeftYear(year);
        setLeftMonth(month);
        setLeftDay(day);
        setShowLeftTimeSetting(false);
    };
    const rightTimeCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowRightTimeSetting(false);
    };
    const rightTimeConfirm = (
        year: number,
        month: number,
        day: number,
        e: React.MouseEvent
    ) => {
        e.stopPropagation();
        setRightYear(year);
        setRightMonth(month);
        setRightDay(day);
        setShowRightTimeSetting(false);
    };

    return (
        <div className="home">
            <div className="home-name">数据中心</div>
            <div className="home-content">
                <div className="home-content-left">
                    <div className="left-led"></div>
                    <div className="left-list">
                        {list.map((item) => (
                            <div
                                key={item.id}
                                className={`list-item ${
                                    item.active ? "active" : ""
                                }`}
                                onClick={() => ClickItem(item.id)}
                            >
                                <div
                                    className="item-led"
                                    style={{
                                        visibility: item.active
                                            ? "visible"
                                            : "hidden",
                                    }}
                                ></div>
                                {item.name}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="home-content-right">
                    <div className="right-gx">
                        <div className="gx-options">
                            <div className="option-left">
                                <div className="option-import">导入新数据</div>
                                <div
                                    className="option-setting"
                                    onClick={showSetting}
                                >
                                    光纤设置
                                    {settingOpening && (
                                        <div className="setting-panel">
                                            <div className="setting-item">
                                                方向：
                                                <div className="setting-selects">
                                                    <div
                                                        className={`${
                                                            direction ===
                                                            "horizontal"
                                                                ? "item-value-active"
                                                                : "item-value"
                                                        }`}
                                                        onClick={() => {
                                                            selectSetting(
                                                                "horizontal"
                                                            );
                                                        }}
                                                    >
                                                        横向
                                                    </div>
                                                    <div
                                                        className={`${
                                                            direction ===
                                                            "vertical"
                                                                ? "item-value-active"
                                                                : "item-value"
                                                        }`}
                                                        onClick={() => {
                                                            selectSetting(
                                                                "vertical"
                                                            );
                                                        }}
                                                    >
                                                        纵向
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="setting-item">
                                                起点：
                                                <div className="setting-selects">
                                                    <div
                                                        className={`${
                                                            start === "top-left"
                                                                ? "item-value-active"
                                                                : "item-value"
                                                        }`}
                                                        onClick={() => {
                                                            selectSetting(
                                                                "top-left"
                                                            );
                                                        }}
                                                    >
                                                        左上
                                                    </div>
                                                    <div
                                                        className={`${
                                                            start ===
                                                            "top-right"
                                                                ? "item-value-active"
                                                                : "item-value"
                                                        }`}
                                                        onClick={() => {
                                                            selectSetting(
                                                                "top-right"
                                                            );
                                                        }}
                                                    >
                                                        右上
                                                    </div>
                                                    <div
                                                        className={`${
                                                            start ===
                                                            "bottom-left"
                                                                ? "item-value-active"
                                                                : "item-value"
                                                        }`}
                                                        onClick={() => {
                                                            selectSetting(
                                                                "bottom-left"
                                                            );
                                                        }}
                                                    >
                                                        左下
                                                    </div>
                                                    <div
                                                        className={`${
                                                            start ===
                                                            "bottom-right"
                                                                ? "item-value-active"
                                                                : "item-value"
                                                        }`}
                                                        onClick={() => {
                                                            selectSetting(
                                                                "bottom-right"
                                                            );
                                                        }}
                                                    >
                                                        右下
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="setting-item">
                                                光纤名称：
                                                <div className="setting-selects">
                                                    <div
                                                        className={`${
                                                            showSquareName ===
                                                            true
                                                                ? "item-value-active"
                                                                : "item-value"
                                                        }`}
                                                        onClick={() => {
                                                            setShowSquareName(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        开
                                                    </div>
                                                    <div
                                                        className={`${
                                                            showSquareName ===
                                                            false
                                                                ? "item-value-active"
                                                                : "item-value"
                                                        }`}
                                                        onClick={() => {
                                                            setShowSquareName(
                                                                false
                                                            );
                                                        }}
                                                    >
                                                        关
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="setting-item">
                                                方向指示线：
                                                <div className="setting-selects">
                                                    <div
                                                        className={`${
                                                            showGridLine ===
                                                            true
                                                                ? "item-value-active"
                                                                : "item-value"
                                                        }`}
                                                        onClick={() => {
                                                            setShowGridLine(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        开
                                                    </div>
                                                    <div
                                                        className={`${
                                                            showGridLine ===
                                                            false
                                                                ? "item-value-active"
                                                                : "item-value"
                                                        }`}
                                                        onClick={() => {
                                                            setShowGridLine(
                                                                false
                                                            );
                                                        }}
                                                    >
                                                        关
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className="setting-close"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // 阻止冒泡到父容器
                                                    setSettingOpening(false);
                                                }}
                                            >
                                                设置完成
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="option-name">光纤状态</div>
                            <div className="option-time">
                                初始时间
                                <div
                                    className="time-value"
                                    onClick={() => {
                                        setShowLeftTimeSetting(true);
                                    }}
                                >
                                    {`${leftYear}年${leftMonth}月${leftDay}日`}
                                    {showLeftTimeSetting && (
                                        <TimeSelectButton
                                            year={leftYear}
                                            month={leftMonth}
                                            day={leftDay}
                                            onCancel={leftTimeCancel}
                                            onConfirm={leftTimeConfirm}
                                        />
                                    )}
                                </div>
                                当前时间
                                <div
                                    className="time-value"
                                    onClick={() => {
                                        setShowRightTimeSetting(true);
                                    }}
                                >
                                    {`${rightYear}年${rightMonth}月${rightDay}日`}
                                    {showRightTimeSetting && (
                                        <TimeSelectButton
                                            year={rightYear}
                                            month={rightMonth}
                                            day={rightDay}
                                            onCancel={rightTimeCancel}
                                            onConfirm={rightTimeConfirm}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="gx-grid">
                            <HeatmapGrid
                                numRows={4}
                                showSquareName={showSquareName}
                                showGridLine={showGridLine}
                                maxDiff={100}
                                orientation={direction}
                                startCorner={start}
                            />
                        </div>
                        <div className="gx-chart"></div>
                    </div>
                    <div className="right-camera"></div>
                </div>
            </div>
        </div>
    );
}
