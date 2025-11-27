import React, { useMemo, useRef, useEffect, useState } from "react";
// import HeatSquare from "../../components/HeatSquare";
import HeatmapGrid from "../../components/HeatmapGrid";
import NewHeatmapGrid from "../../components/newHeatmapGrid";
import TimeSelectButton from "../../components/TimeSelectButton";
import LineChart from "../../components/LineChart";
import generateCameraData from "../../utils/generateCameraData";
import { getProjectList, getFiberData, getFiberPoint, getSensorList } from "@/api/project";
import "./index.css";

type StartCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type Orientation = "horizontal" | "vertical";

interface Project {
    projectId: number;
    projectName: string;
    createdTime: string;
    active: boolean;
}

interface CameraItem {
    sensorId: number;
    sensorName: string;
    records: Record[];
}

export interface Record {
    timestamp: string;
    "x-value": number;
    "y-value": number;
}

interface RawPoint {
    pointId: string;
    value: number;
    row: number;
    column: number;
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
    const [settingOpening, setSettingOpening] = useState(false);
    const [showLeftTimeSetting, setShowLeftTimeSetting] = useState(false);
    const [showRightTimeSetting, setShowRightTimeSetting] = useState(false);
    const [showSquareName, setShowSquareName] = useState(false);
    const [showGridLine, setShowGridLine] = useState(true);
    const [direction, setDirection] = useState<Orientation>("horizontal");
    const [start, setStart] = useState<StartCorner>("top-left");
    const [leftYear, setLeftYear] = useState(2025);
    const [leftMonth, setLeftMonth] = useState(9);
    const [leftDay, setLeftDay] = useState(17);
    const [rightYear, setRightYear] = useState(2025);
    const [rightMonth, setRightMonth] = useState(11);
    const [rightDay, setRightDay] = useState(17);

    const [startYear, setStartYear] = useState(2025);
    const [startMonth, setStartMonth] = useState(11);
    const [startDay, setStartDay] = useState(16);
    const [endYear, setEndYear] = useState(2025);
    const [endMonth, setEndMonth] = useState(11);
    const [endDay, setEndDay] = useState(18);
    const [timeFilter, setTimeFilter] = useState("all");
    const [showStartTimeSetting, setShowStartTimeSetting] = useState(false);
    const [showEndTimeSetting, setShowEndTimeSetting] = useState(false);

    const [showCameraOptions, setShowCameraOptions] = useState(false);
    const [cameraList, setCameraList] = useState<CameraItem[]>([]);

    const [projectList, setProjectList] = useState<Project[]>([]);
    const [cameraNames, setCameraNames] = useState<string[]>([]);
    const [xData, setXData] = useState<string[]>([]);
    const [yData, setYData] = useState<number[][]>([]);
    const [pointXData, setPointXData] = useState<string[]>([]);
    const [pointYData, setPointYData] = useState<number[][]>([]);
    const [pointId, setPointId] = useState<string>("");
    const [gridData, setGridData] = useState<RawPoint[]>([]);

    const [openLeft, setOpenLeft] = useState(true);
    const [openRightBottom, setOpenRightBottom] = useState(true);
    // 控制右上角全屏
    const [openRightTop, setOpenRightTop] = useState(false);

    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            const list = await initialProjectList();
            if (list.length > 0) {
                const projectId = list.find((item: Project) => item.active)?.projectId;

                const fiberStart = formatDate(leftYear, leftMonth, leftDay, "start");
                const fiberEnd = formatDate(rightYear, rightMonth, rightDay, "end");

                const sensorStart = formatDate(startYear, startMonth, startDay, "start");
                const sensorEnd = formatDate(endYear, endMonth, endDay, "end");

                await Promise.allSettled([toGetFiberData(projectId, fiberStart, fiberEnd), toGetSensorData(projectId, sensorStart, sensorEnd)]);
            }
        } catch (error) {
            console.error("获取数据失败：", error);
        }
    };

    function formatDate(y: number, m: number, d: number, type: "start" | "end") {
        const mm = String(m).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        return `${y}-${mm}-${dd} ${type === "start" ? "00:00:00" : "23:59:59"}`;
    }

    const initialProjectList = async () => {
        const projectListRes = await getProjectList();
        const list = projectListRes.data.map((item: Project, index: number) => ({
            ...item,
            active: index === 0 ? true : false,
        }));
        setProjectList(list);
        return list;
    };

    // 获取当前激活的项目ID
    const getActiveProjectId = () => {
        return projectList.find((item) => item.active)?.projectId;
    };

    // 获取光纤数据
    const toGetFiberData = async (projectId: number | undefined, startDate: string, endDate: string) => {
        if (!projectId) return;
        const fiberDataRes = await getFiberData(projectId, startDate, endDate);
        setGridData(fiberDataRes.data.fiberPoints);
    };

    // 获取传感器数据
    const toGetSensorData = async (projectId: number | undefined, startDate: string, endDate: string) => {
        if (!projectId) return;
        const sensorDataRes = await getSensorList(projectId, startDate, endDate);
        console.log("传感器数据：", sensorDataRes.data);
        const list: CameraItem[] = sensorDataRes.data;
        setCameraList(list);

        if (list.length > 0) {
            // 图例名称
            const names: string[] = [];

            // 折线数据
            const values: number[][] = [];

            // 时间轴：取第一个传感器即可
            const timestamps = list[0].records.map((record: Record) => record.timestamp).reverse();

            setXData(timestamps);

            list.forEach((item: CameraItem) => {
                // 取出两条线
                const xLine = item.records.map((record: Record) => record["x-value"]).reverse();

                const yLine = item.records.map((record: Record) => record["y-value"]).reverse();

                // 生成 legend
                names.push(`${item.sensorName}-X`);
                names.push(`${item.sensorName}-Y`);

                // 塞进 series 数据
                values.push(xLine);
                values.push(yLine);
            });

            setCameraNames(names);
            setYData(values);

            console.log("双轴折线数据处理完成：", {
                折线条数: values.length,
                图例: names,
                时间点: timestamps.length,
            });
        }
    };

    // 刷新光纤数据
    const refreshFiberData = async () => {
        const projectId = getActiveProjectId();
        const fiberStart = formatDate(leftYear, leftMonth, leftDay, "start");
        const fiberEnd = formatDate(rightYear, rightMonth, rightDay, "end");
        await toGetFiberData(projectId, fiberStart, fiberEnd);
    };

    // 刷新传感器数据
    const refreshSensorData = async () => {
        const projectId = getActiveProjectId();
        const sensorStart = formatDate(startYear, startMonth, startDay, "start");
        const sensorEnd = formatDate(endYear, endMonth, endDay, "end");
        await toGetSensorData(projectId, sensorStart, sensorEnd);
    };

    // 点击光纤点 获取点位数据
    const handleClickPoint = async (pointId: string) => {
        const pointDataRes = await getFiberPoint(Number(pointId));
        console.log("光纤点位数据：", pointDataRes.data);
        const records: { timestamp: string; value: number }[] = pointDataRes.data.records;
        const timestamps = records.map((record) => record.timestamp).reverse();
        const values = records.map((record) => record.value).reverse();
        setPointXData(timestamps);
        setPointYData([values]);
        setPointId(pointId);
    };

    const ClickItem = (id: number) => {
        setProjectList((list) =>
            list.map((item) => ({
                ...item,
                active: item.projectId === id,
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
    const leftTimeConfirm = (year: number, month: number, day: number, e: React.MouseEvent) => {
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
    const rightTimeConfirm = (year: number, month: number, day: number, e: React.MouseEvent) => {
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
    const startTimeConfirm = (year: number, month: number, day: number, e: React.MouseEvent) => {
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
    const endTimeConfirm = (year: number, month: number, day: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setEndYear(year);
        setEndMonth(month);
        setEndDay(day);
        setShowEndTimeSetting(false);
    };

    // 控制左侧伸缩
    const stretchLeft = () => {
        setOpenLeft(!openLeft);
    };

    const fullscreenGX = () => {
        if (openRightTop) {
            setOpenRightBottom(true);
            setOpenLeft(true);
        } else {
            setOpenRightBottom(false);
            setOpenLeft(false);
        }
        setOpenRightTop(!openRightTop);
    };

    return (
        <div className="home">
            <div className="home-name">边坡数据中心</div>
            <div className="home-content">
                <div className="home-content-left" style={openLeft ? {} : { width: "0px", border: "none" }}>
                    <div
                        className={`left-stretch ${openLeft ? "left-stretch-open" : "left-stretch-close"}`}
                        style={
                            openLeft
                                ? {}
                                : {
                                      transform: "translateX(0%) translateY(-100%)",
                                  }
                        }
                        onClick={stretchLeft}
                    >
                        {openLeft ? "<" : "展开项目列表>"}
                    </div>
                    <div className="left-led"></div>
                    <div className="left-list">
                        {projectList.map((item) => (
                            <div key={item.projectId} className={`list-item ${item.active ? "active" : ""}`} onClick={() => ClickItem(item.projectId)}>
                                <div
                                    className="item-led"
                                    style={{
                                        visibility: item.active ? "visible" : "hidden",
                                    }}
                                ></div>
                                {item.projectName}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="home-content-right">
                    <div className="right-gx" style={openRightBottom ? {} : { height: "calc(100% - 45px)", maxHeight: "calc(100% - 45px)" }}>
                        <div className={`fullscreenGX`} onClick={fullscreenGX}>
                            ⤢
                        </div>
                        <div className="gx-options">
                            <div className="option-left">
                                <div className="option-import">导入新数据</div>
                                <div className="gx-tips">
                                    <div className="tip-text">
                                        <span className="tip-text-blue">正常</span>
                                        <span className="tip-text-red">异常</span>
                                    </div>
                                    <div className="tip-color"></div>
                                </div>
                                {/* <div
                                    className="option-setting"
                                    onClick={() => {
                                        setSettingOpening(!settingOpening);
                                    }}
                                >
                                    光纤设置
                                    {settingOpening && (
                                        <div className="setting-panel" onClick={(e) => e.stopPropagation()}>
                                            <div className="setting-item">
                                                方向：
                                                <div className="setting-selects">
                                                    <div
                                                        className={`${direction === "horizontal" ? "item-value-active" : "item-value"}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            selectSetting("horizontal");
                                                        }}
                                                    >
                                                        横向
                                                    </div>
                                                    <div
                                                        className={`${direction === "vertical" ? "item-value-active" : "item-value"}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            selectSetting("vertical");
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
                                                        className={`${start === "top-left" ? "item-value-active" : "item-value"}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            selectSetting("top-left");
                                                        }}
                                                    >
                                                        左上
                                                    </div>
                                                    <div
                                                        className={`${start === "top-right" ? "item-value-active" : "item-value"}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            selectSetting("top-right");
                                                        }}
                                                    >
                                                        右上
                                                    </div>
                                                    <div
                                                        className={`${start === "bottom-left" ? "item-value-active" : "item-value"}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            selectSetting("bottom-left");
                                                        }}
                                                    >
                                                        左下
                                                    </div>
                                                    <div
                                                        className={`${start === "bottom-right" ? "item-value-active" : "item-value"}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            selectSetting("bottom-right");
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
                                                        className={`${showSquareName === true ? "item-value-active" : "item-value"}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowSquareName(true);
                                                        }}
                                                    >
                                                        开
                                                    </div>
                                                    <div
                                                        className={`${showSquareName === false ? "item-value-active" : "item-value"}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowSquareName(false);
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
                                                        className={`${showGridLine === true ? "item-value-active" : "item-value"}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowGridLine(true);
                                                        }}
                                                    >
                                                        开
                                                    </div>
                                                    <div
                                                        className={`${showGridLine === false ? "item-value-active" : "item-value"}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowGridLine(false);
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
                                </div> */}
                            </div>
                            <div className="option-name">应变数据</div>
                            <div className="option-time">
                                初始时间
                                <div
                                    className="time-value"
                                    onClick={() => {
                                        setShowLeftTimeSetting(true);
                                    }}
                                >
                                    {`${leftYear}年${leftMonth}月${leftDay}日`}
                                    {showLeftTimeSetting && <TimeSelectButton year={leftYear} month={leftMonth} day={leftDay} onCancel={leftTimeCancel} onConfirm={leftTimeConfirm} />}
                                </div>
                                结束时间
                                <div
                                    className="time-value"
                                    onClick={() => {
                                        setShowRightTimeSetting(true);
                                    }}
                                >
                                    {`${rightYear}年${rightMonth}月${rightDay}日`}
                                    {showRightTimeSetting && <TimeSelectButton year={rightYear} month={rightMonth} day={rightDay} onCancel={rightTimeCancel} onConfirm={rightTimeConfirm} />}
                                </div>
                                <div
                                    className="time-refresh"
                                    onClick={() => {
                                        refreshFiberData();
                                    }}
                                >
                                    获取数据
                                </div>
                            </div>
                        </div>
                        <div className="gx-grid">
                            <NewHeatmapGrid
                                data={gridData}
                                clickPoint={(pointId) => {
                                    handleClickPoint(pointId);
                                }}
                            />
                            {/* <HeatmapGrid
                                numRows={4}
                                showSquareName={showSquareName}
                                showGridLine={showGridLine}
                                maxDiff={100}
                                orientation={direction}
                                startCorner={start}
                            /> */}
                        </div>
                        <div className="gx-chart">
                            <LineChart title="" xName="时间" yName={[`${pointId}点位数据`]} xData={pointXData} yData={pointYData} />
                        </div>
                    </div>
                    <div className="right-camera" style={openRightBottom ? {} : { height: "0px", border: "none", flex: 0 }}>
                        <div className={`right-camera-stretch ${openRightBottom ? "right-camera-stretch-open" : "right-camera-stretch-close"}`} onClick={() => setOpenRightBottom(!openRightBottom)}>
                            {openRightBottom ? "∨" : "点击展开摄像头数据"}
                        </div>
                        <div className="camera-options" style={openRightBottom ? {} : { display: "none" }}>
                            <div className="option-timefilter">
                                <div className={`timefilter-all ${timeFilter === "all" ? "timefilter-active" : ""}`} onClick={() => setTimeFilter("all")}>
                                    实时总数据
                                </div>
                                <div className={`timefilter-filter ${timeFilter === "filter" ? "timefilter-active" : ""}`} onClick={() => setTimeFilter("filter")}>
                                    选择时间点
                                </div>
                            </div>
                            <div className="option-name">摄像头数据</div>
                            {/* <div
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
                                                key={item.sensorId}
                                                className={`camera-item ${item.active
                                                    ? "camera-active"
                                                    : ""
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    selectCamera(item.sensorId);
                                                }}
                                            >
                                                {item.sensorName}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div> */}
                            <div className="option-time">
                                所示数据时间
                                <div
                                    className="time-value"
                                    onClick={() => {
                                        setShowStartTimeSetting(true);
                                    }}
                                >
                                    {`${startYear}年${startMonth}月${startDay}日`}
                                    {showStartTimeSetting && <TimeSelectButton year={startYear} month={startMonth} day={startDay} onCancel={startTimeCancel} onConfirm={startTimeConfirm} />}
                                </div>
                                至
                                <div
                                    className="time-value"
                                    onClick={() => {
                                        setShowEndTimeSetting(true);
                                    }}
                                >
                                    {`${endYear}年${endMonth}月${endDay}日`}
                                    {showEndTimeSetting && <TimeSelectButton year={endYear} month={endMonth} day={endDay} onCancel={endTimeCancel} onConfirm={endTimeConfirm} />}
                                </div>
                                <div
                                    className="time-refresh"
                                    onClick={() => {
                                        refreshSensorData();
                                    }}
                                >
                                    获取数据
                                </div>
                            </div>
                        </div>
                        <div className="camera-chart" style={openRightBottom ? {} : { display: "none" }}>
                            <LineChart title="" xName="时间" yName={cameraNames} xData={xData} yData={yData} showPic={true} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
