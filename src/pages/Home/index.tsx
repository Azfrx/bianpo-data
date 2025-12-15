import React, { useMemo, useRef, useEffect, useState } from "react";
// import HeatSquare from "../../components/HeatSquare";
import HeatmapGrid from "../../components/HeatmapGrid";
import NewHeatmapGrid from "../../components/newHeatmapGrid";
import TimeSelectButton from "../../components/TimeSelectButton";
import LineChart from "../../components/LineChart";
import generateCameraData from "../../utils/generateCameraData";
import { DatePicker, Select, Spin } from 'antd';
import dayjs from 'dayjs';

import { getProjectList, getFiberData, getFiberPoint, getSensorList, getFiberImportTime, getSensorPicture, uploadFiberExcel } from "@/api/project";
import "./index.css";

import colseArrow from "../../assets/arrow-close.svg";

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
    shiftId: number;
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

export default function Home() {
    const [settingOpening, setSettingOpening] = useState(false);
    const [showLeftTimeSetting, setShowLeftTimeSetting] = useState(false);
    const [showRightTimeSetting, setShowRightTimeSetting] = useState(false);
    const [showSquareName, setShowSquareName] = useState(false);
    const [showGridLine, setShowGridLine] = useState(true);
    const [direction, setDirection] = useState<Orientation>("horizontal");
    const [start, setStart] = useState<StartCorner>("top-left");

    const [fiberImportTime, setFiberImportTime] = useState<{ timeString: string }[]>([]);
    const [fiberStartTime, setFiberStartTime] = useState<string>("2025-1-1");
    const [fiberEndTime, setFiberEndTime] = useState<string>("2025-1-1");

    const [cameraStartDate, setCameraStartDate] = useState<string>("2025-12-03");
    const [cameraEndDate, setCameraEndDate] = useState<string>("2025-12-04");

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
    const [fullScreenRightBottom, setFullScreenRightBottom] = useState(false);
    const [fullScreenRightTop, setFullScreenRightTop] = useState(false);

    const [curTimeFilter, setCurTimeFilter] = useState(1);
    const timeFilterOptions = [1, 6, 12, 24];

    const [shiftImgMap, setShiftImgMap] = useState<{ [key: number]: string }>({});
    const [showPicturePanel, setShowPicturePanel] = useState(false);
    const [showedPictureUrl, setShowedPictureUrl] = useState<string>("");
    const [showedPictureTime, setShowedPictureTime] = useState<string>("");
    const [showedPictureSeriesName, setShowedPictureSeriesName] = useState<string>("");

    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            const list = await initialProjectList();
            if (list.length > 0) {
                const projectId = list.find((item: Project) => item.active)?.projectId;

                const importTime = await getActiveProjectFiberImportTime(projectId);
                setFiberImportTime(importTime);
                const importTimeLength = importTime.length;
                if (importTimeLength < 2) {
                    console.warn("光纤导入时间数据不足，无法设置时间范围");
                    return;
                }
                const fiberStartTime = importTime[importTimeLength - 2].timeString.split(" ")[0];
                const fiberEndTime = importTime[importTimeLength - 1].timeString.split(" ")[0];
                setFiberStartTime(fiberStartTime);
                setFiberEndTime(fiberEndTime);

                const fiberStart = formatDate(Number(fiberStartTime.split("-")[0]), Number(fiberStartTime.split("-")[1]), Number(fiberStartTime.split("-")[2]), "start");
                const fiberEnd = formatDate(Number(fiberEndTime.split("-")[0]), Number(fiberEndTime.split("-")[1]), Number(fiberEndTime.split("-")[2]), "end");

                const [startYear, startMonth, startDay] = cameraStartDate.split("-");
                const [endYear, endMonth, endDay] = cameraEndDate.split("-");
                const sensorStart = formatDate(Number(startYear), Number(startMonth), Number(startDay), "start");
                const sensorEnd = formatDate(Number(endYear), Number(endMonth), Number(endDay), "end");

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

    // 获取当前项目的光纤导入时间
    const getActiveProjectFiberImportTime = async (projectId: number | undefined) => {
        if (!projectId) return;
        const importTimeRes = await getFiberImportTime(projectId);
        console.log("光纤导入时间：", importTimeRes.data);
        return importTimeRes.data;
    };

    // 获取光纤数据
    const toGetFiberData = async (projectId: number | undefined, startDate: string, endDate: string) => {
        if (!projectId) return;
        setUploading(true);
        const fiberDataRes = await getFiberData(projectId, startDate, endDate);
        setGridData(fiberDataRes.data.fiberPoints);
        setUploading(false);
    };

    // 获取传感器数据
    const toGetSensorData = async (projectId: number | undefined, startDate: string, endDate: string, timeFilter: number = 1) => {
        if (!projectId) return;
        setLoading(true);
        const sensorDataRes = await getSensorList(projectId, startDate, endDate, timeFilter);
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

            const shiftIdArrs: number[] = [];

            list.forEach((item: CameraItem) => {
                // 取出两条线
                const xLine = item.records
                    .map((r) => ({
                        value: r["x-value"],
                        shiftId: r.shiftId,
                    }))
                    .reverse();

                const yLine = item.records
                    .map((r) => ({
                        value: r["y-value"],
                        shiftId: r.shiftId,
                    }))
                    .reverse();

                item.records.forEach((r) => shiftIdArrs.push(r.shiftId));

                // 生成 legend
                names.push(`${item.sensorName}-X`);
                names.push(`${item.sensorName}-Y`);

                // 塞进 series 数据
                values.push(xLine);
                values.push(yLine);
            });

            fetchPictures(shiftIdArrs);

            setCameraNames(names);
            setYData(values);

            console.log("双轴折线数据处理完成：", {
                折线条数: values.length,
                图例: names,
                时间点: timestamps.length,
            });
        }
        setLoading(false);
    };

    const fetchPictures = async (shiftIdArrs: number[]) => {
        const promises = shiftIdArrs.map((id) => getSensorPicture(id));
        const results = await Promise.all(promises);
        const newShiftImgMap: { [key: number]: string } = {};
        shiftIdArrs.forEach((id, index) => {
            newShiftImgMap[shiftIdArrs[index]] = `http://112.126.59.66:8080${results[index].data.pictureUrl}`;
        });
        // console.log("newShiftImgMap:", newShiftImgMap);
        setShiftImgMap(newShiftImgMap);
    };

    // 刷新光纤数据
    const refreshFiberData = async () => {
        const projectId = getActiveProjectId();
        const fiberStart = formatDate(Number(fiberStartTime.split("-")[0]), Number(fiberStartTime.split("-")[1]), Number(fiberStartTime.split("-")[2]), "start");
        const fiberEnd = formatDate(Number(fiberEndTime.split("-")[0]), Number(fiberEndTime.split("-")[1]), Number(fiberEndTime.split("-")[2]), "end");
        await toGetFiberData(projectId, fiberStart, fiberEnd);
    };

    // 刷新传感器数据
    const refreshSensorData = async () => {
        const projectId = getActiveProjectId();
        const [startYear, startMonth, startDay] = cameraStartDate.split("-");
        const [endYear, endMonth, endDay] = cameraEndDate.split("-");
        const sensorStart = formatDate(Number(startYear), Number(startMonth), Number(startDay), "start");
        const sensorEnd = formatDate(Number(endYear), Number(endMonth), Number(endDay), "end");
        await toGetSensorData(projectId, sensorStart, sensorEnd, curTimeFilter);
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

    const selectFiberStartTime = (timeString: string) => {
        setFiberStartTime(timeString.split(" ")[0]);
        setShowLeftTimeSetting(false);
    };

    const selectFiberEndTime = (timeString: string) => {
        setFiberEndTime(timeString.split(" ")[0]);
        setShowRightTimeSetting(false);
    };

    const onChangeCameraStartDate = (date: any, dateString: string | string[]) => {
        // console.log("dateString", dateString);
        setCameraStartDate(dateString as string);
    };
    const onChangeCameraEndDate = (date: any, dateString: string | string[]) => {
        // console.log("dateString", dateString);
        setCameraEndDate(dateString as string);
    };

    const timeFilterChange = (value: number) => {
        console.log("选择时间间隔为:", value);
        setCurTimeFilter(value);
    };

    useEffect(() => {
        refreshSensorData();
    }, [curTimeFilter]);

    const selectSetting = (value: StartCorner | Orientation) => {
        if (value === "horizontal" || value === "vertical") {
            setDirection(value);
        } else {
            setStart(value);
        }
    };

    // const leftTimeCancel = (e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     setShowLeftTimeSetting(false);
    // };
    // const leftTimeConfirm = (year: number, month: number, day: number, e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     setLeftYear(year);
    //     setLeftMonth(month);
    //     setLeftDay(day);
    //     setShowLeftTimeSetting(false);
    // };
    // const rightTimeCancel = (e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     setShowRightTimeSetting(false);
    // };
    // const rightTimeConfirm = (year: number, month: number, day: number, e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     setRightYear(year);
    //     setRightMonth(month);
    //     setRightDay(day);
    //     setShowRightTimeSetting(false);
    // };

    // const startTimeCancel = (e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     setShowStartTimeSetting(false);
    // };
    // const startTimeConfirm = (year: number, month: number, day: number, e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     setStartYear(year);
    //     setStartMonth(month);
    //     setStartDay(day);
    //     setShowStartTimeSetting(false);
    // };

    // const endTimeCancel = (e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     setShowEndTimeSetting(false);
    // };
    // const endTimeConfirm = (year: number, month: number, day: number, e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     setEndYear(year);
    //     setEndMonth(month);
    //     setEndDay(day);
    //     setShowEndTimeSetting(false);
    // };

    const timeToCN = (time: string) => {
        const [year, month, day] = time.split("-");
        return `${year}年${month}月${day}日`;
    };

    // 控制左侧伸缩
    const stretchLeft = () => {
        setOpenLeft(!openLeft);
    };

    const fullscreenFiber = () => {
        if (fullScreenRightTop) {
            // 展开时 收缩
            setOpenLeft(true);
            setFullScreenRightBottom(false);
            setFullScreenRightTop(false);
        } else {
            // 正常时 全屏
            setOpenLeft(false);
            setFullScreenRightBottom(false);
            setFullScreenRightTop(true);
        }
    };

    const fullScreenCamera = () => {
        if (fullScreenRightBottom) {
            // 展开时 收缩
            setOpenLeft(true);
            setFullScreenRightTop(false);
            setFullScreenRightBottom(false);
        } else {
            // 正常时 全屏
            setOpenLeft(false);
            setFullScreenRightTop(false);
            setFullScreenRightBottom(true);
        }
    };

    const openPicturePanel = (pictureUrl: string, seriesName: string, pictureTime: string) => {
        console.log("Open picture panel for pictureUrl:", pictureUrl, "and pictureTime:", pictureTime);
        setShowedPictureUrl(pictureUrl);
        setShowedPictureTime(pictureTime);
        setShowedPictureSeriesName(seriesName);
        setShowPicturePanel(true);
    };

    const fileRef = useRef<HTMLInputElement | null>(null);

    const onClickDiv = () => {
        fileRef.current?.click();
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const projectId = getActiveProjectId();
        if (!projectId) {
            console.error("没有选中的项目，请先选择一个项目");
            return;
        }
        if (!file) return;

        console.log("选择的文件：", file);

        // 调用上传接口
        uploadFiberExcel(projectId, file);
    };

    const fiberStretchStyle = fullScreenRightTop
        ? { height: "100%", maxHeight: "100%", flex: 1, overflow: "hidden", transition: "all 0.8s ease" }
        : fullScreenRightBottom
        ? { height: 0, flex: 0, padding: 0, overflow: "hidden", transition: "all 0.8s ease", border: "none" }
        : { transition: "all 0.8s ease" };
    const cameraStretchStyle = fullScreenRightBottom
        ? { height: "100%", maxHeight: "100%", flex: 1, overflow: "hidden", transition: "all 0.8s ease" }
        : fullScreenRightTop
        ? { height: 0, flex: 0, padding: 0, overflow: "hidden", transition: "all 0.8s ease", border: "none" }
        : { transition: "all 0.8s ease" };

    return (
        <div className="home">
            <div className="home-name">边坡数据中心</div>
            <div className="home-content">
                <div className="home-content-left" style={openLeft ? { width: "250px" } : { width: "0px" }}>
                    <div
                        className={`left-stretch ${openLeft ? "left-stretch-open" : "left-stretch-close"}`}
                        style={openLeft ? {} : { transform: "translateX(0%) translateY(-100%)" }}
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
                <div className="home-content-right" style={fullScreenRightBottom || fullScreenRightBottom ? { gap: 0 } : {}}>
                    <div className="right-gx" style={fiberStretchStyle}>
                        {/* 加载蒙层 */}
                        {uploading && (
                            <div className="loading-mask">
                                <Spin size="large" />
                                <div className="loading-text">数据加载中，请稍候…</div>
                            </div>
                        )}
                        {/* <div className={`closeFiber`} onClick={fullscreenFiber}>
                            ⤢
                        </div> */}
                        {/* <img src={upArrow} width="20" className={`closeFiber`} onClick={closeFiber} /> */}
                        <div className={`fullscreenIcon ${fullScreenRightTop ? "fullscreenIcon-active" : ""}`} onClick={fullscreenFiber}>
                            {fullScreenRightTop ? <img src={colseArrow} width="24" /> : "⤢"}
                        </div>
                        <div className="gx-options">
                            <div className="option-left">
                                <div className="option-import" onClick={onClickDiv}>
                                    导入新数据
                                </div>
                                <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={onFileChange} />
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
                                        setShowLeftTimeSetting(!showLeftTimeSetting);
                                    }}
                                >
                                    {timeToCN(fiberStartTime)}
                                    <div className={`projectImportTime ${showLeftTimeSetting ? "open" : ""}`}>
                                        {fiberImportTime.map((item, index) => (
                                            <div
                                                className={`projectImportTime-item ${fiberStartTime === item.timeString.split(" ")[0] ? "projectImportTime-active" : ""}`}
                                                onClick={() => {
                                                    selectFiberStartTime(item.timeString);
                                                }}
                                            >
                                                {item.timeString}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                结束时间
                                <div
                                    className="time-value"
                                    onClick={() => {
                                        setShowRightTimeSetting(!showRightTimeSetting);
                                    }}
                                >
                                    {timeToCN(fiberEndTime)}
                                    <div className={`projectImportTime ${showRightTimeSetting ? "open" : ""}`}>
                                        {fiberImportTime.map((item, index) => (
                                            <div
                                                className={`projectImportTime-item ${fiberEndTime === item.timeString.split(" ")[0] ? "projectImportTime-active" : ""}`}
                                                onClick={() => {
                                                    selectFiberEndTime(item.timeString);
                                                }}
                                            >
                                                {item.timeString}
                                            </div>
                                        ))}
                                    </div>
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
                    <div className="right-camera" style={cameraStretchStyle}>
                        {/* 加载蒙层 */}
                        {loading && (
                            <div className="loading-mask">
                                <Spin size="large" />
                                <div className="loading-text">数据加载中，请稍候…</div>
                            </div>
                        )}
                        <div className={`fullscreenIcon ${fullScreenRightBottom ? "fullscreenIcon-active" : ""}`} onClick={fullScreenCamera}>{fullScreenRightBottom ? (<img src={colseArrow} width="24" />) : "⤢"}</div>
                        <div className="camera-options">
                            {/* <select value={curTimeFilter} onChange={timeFilterChange} className="camera-timeFilter">
                                {timeFilterOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select> */}
                            <Select
                                className="camera-timeFilter"
                                value={curTimeFilter}
                                onChange={timeFilterChange}
                                optionLabelProp="selectedLabel"
                                options={timeFilterOptions.map((v) => ({ value: v, label: `${v}h`, selectedLabel: `数据时间间隔:${v}h` }))}
                                dropdownClassName="camera-timeFilter-dropdown"
                            />
                            <div className="option-name">靶点数据</div>
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
                                初始时间
                                <DatePicker value={dayjs(cameraStartDate)} onChange={onChangeCameraStartDate} placeholder="选择日期" className="date-picker" />
                                结束时间
                                <DatePicker value={dayjs(cameraEndDate)} onChange={onChangeCameraEndDate} placeholder="选择日期" className="date-picker" />
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
                        <div className="camera-chart">
                            <LineChart
                                title=""
                                xName="时间"
                                yName={cameraNames}
                                xData={xData}
                                yData={yData}
                                showPic={true}
                                shiftImgMap={shiftImgMap}
                                openPicturePanel={(pictureUrl: string, seriesName: string, pictureTime: string) => {
                                    openPicturePanel(pictureUrl, seriesName, pictureTime);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {showPicturePanel && (
                <div className="cameraPic-Container">
                    <div className="cameraPic-close" onClick={() => setShowPicturePanel(false)}>
                        x
                    </div>
                    <div className="cameraPic-Title">
                        靶点 {showedPictureSeriesName} 图片获取时间: {showedPictureTime}
                    </div>
                    <img src={showedPictureUrl} className="cameraPic-Image" />
                </div>
            )}
        </div>
    );
}
