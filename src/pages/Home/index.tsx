import React, { useMemo, useRef, useEffect, useState } from "react";
// import HeatSquare from "../../components/HeatSquare";
import HeatmapGrid from "../../components/HeatmapGrid";
import TimeSelectButton from "../../components/TimeSelectButton";
import LineChart from "../../components/LineChart";
import generateCameraData from "../../utils/generateCameraData";
import "./index.css";

type StartCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type Orientation = "horizontal" | "vertical";

interface cameraItem {
    id: number;
    name: string;
    active: boolean;
}

const fakeList = [
    { id: 1, name: "项目01", active: true },
    { id: 2, name: "项目02", active: false },
];

const fakeCameraList = [
    { id: 1, name: "摄像头01", active: true },
    { id: 2, name: "摄像头02", active: false },
    { id: 3, name: "摄像头03", active: false },
];

export default function Home() {
    const { cameraNames, xData, yData } = generateCameraData();
    console.log('cameraNames', cameraNames);
    console.log('xData', xData);
    console.log('yData', yData);

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

    const [startYear, setStartYear] = useState(2025);
    const [startMonth, setStartMonth] = useState(11);
    const [startDay, setStartDay] = useState(1);
    const [endYear, setEndYear] = useState(2025);
    const [endMonth, setEndMonth] = useState(11);
    const [endDay, setEndDay] = useState(5);
    const [timeFilter, setTimeFilter] = useState("all");
    const [showStartTimeSetting, setShowStartTimeSetting] = useState(false);
    const [showEndTimeSetting, setShowEndTimeSetting] = useState(false);

    const [showCameraOptions, setShowCameraOptions] = useState(false);
    const [cameraList, setCameraList] = useState(fakeCameraList);
    const selectedCameraCount = cameraList.filter((item) => item.active).length;

    const ClickItem = (id: number) => {
        setList((list) =>
            list.map((item) => ({
                ...item,
                active: item.id === id,
            }))
        );
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

    const startTimeCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowStartTimeSetting(false);
    };
    const startTimeConfirm = (
        year: number,
        month: number,
        day: number,
        e: React.MouseEvent
    ) => {
        e.stopPropagation();
        setStartYear(year);
        setStartMonth(month);
        setStartDay(day);
        setShowStartTimeSetting(false);
    };

    const endTimeCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowEndTimeSetting(false);
    };
    const endTimeConfirm = (
        year: number,
        month: number,
        day: number,
        e: React.MouseEvent
    ) => {
        e.stopPropagation();
        setEndYear(year);
        setEndMonth(month);
        setEndDay(day);
        setShowEndTimeSetting(false);
    };

    const selectCamera = (id: number) => {
        setCameraList((list) =>
            list.map((item) => ({
                ...item,
                active: item.id === id ? !item.active : item.active,
            }))
        );
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
                                    onClick={() => {
                                        setSettingOpening(!settingOpening);
                                    }}
                                >
                                    光纤设置
                                    {settingOpening && (
                                        <div
                                            className="setting-panel"
                                            onClick={(e) => e.stopPropagation()}
                                        >
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
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
                        <div className="gx-chart">
                            <LineChart
                                title="光纤状态"
                                xName="时间"
                                yName={["状态"]}
                                xData={xData}
                                yData={yData}
                            />
                        </div>
                    </div>
                    <div className="right-camera">
                        <div className="camera-options">
                            <div className="option-timefilter">
                                <div
                                    className={`timefilter-all ${
                                        timeFilter === "all"
                                            ? "timefilter-active"
                                            : ""
                                    }`}
                                    onClick={() => setTimeFilter("all")}
                                >
                                    实时总数据
                                </div>
                                <div
                                    className={`timefilter-filter ${
                                        timeFilter === "filter"
                                            ? "timefilter-active"
                                            : ""
                                    }`}
                                    onClick={() => setTimeFilter("filter")}
                                >
                                    选择时间点
                                </div>
                            </div>
                            <div
                                className="option-selectCamera"
                                onClick={() =>
                                    setShowCameraOptions(!showCameraOptions)
                                }
                            >
                                {selectedCameraCount !== 0
                                    ? `当前已选${selectedCameraCount}个摄像头`
                                    : "选择摄像头"}
                                {showCameraOptions && (
                                    <div
                                        className="selectCamera-panel"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {cameraList.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`camera-item ${
                                                    item.active
                                                        ? "camera-active"
                                                        : ""
                                                }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    selectCamera(item.id);
                                                }}
                                            >
                                                {item.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="option-time">
                                所示数据时间
                                <div
                                    className="time-value"
                                    onClick={() => {
                                        setShowStartTimeSetting(true);
                                    }}
                                >
                                    {`${startYear}年${startMonth}月${startDay}日`}
                                    {showStartTimeSetting && (
                                        <TimeSelectButton
                                            year={startYear}
                                            month={startMonth}
                                            day={startDay}
                                            onCancel={startTimeCancel}
                                            onConfirm={startTimeConfirm}
                                        />
                                    )}
                                </div>
                                至
                                <div
                                    className="time-value"
                                    onClick={() => {
                                        setShowEndTimeSetting(true);
                                    }}
                                >
                                    {`${endYear}年${endMonth}月${endDay}日`}
                                    {showEndTimeSetting && (
                                        <TimeSelectButton
                                            year={endYear}
                                            month={endMonth}
                                            day={endDay}
                                            onCancel={endTimeCancel}
                                            onConfirm={endTimeConfirm}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="camera-chart">
                            <LineChart
                                title="摄像头数据"
                                xName="时间"
                                yName={cameraNames}
                                xData={xData}
                                yData={yData}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
