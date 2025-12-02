import request from "./index";

// 获取项目列表
export function getProjectList() {
    return request.get("/project/list");
}

// 根据项目 id + 日期获取光纤数据
export function getFiberData(projectId: number, startTime: string, endTime: string) {
    return request.get("/fiber/list", {
        params: { projectId, startTime, endTime },
    });
}

// 根据点位 id 获取该网格 15 天数据
export function getFiberPoint(pointId: number) {
    return request.get("/fiber/point", {
        params: { pointId },
    });
}

// 获取传感器列表 TODO: timeGap number
export function getSensorList(projectId: number, startTime: string, endTime: string) {
    return request.get("/sensor/data", {
        params: { projectId, startTime, endTime },
    });
}

// 返回项目中的光纤导入时间
export function getFiberImportTime(projectId: number) {
    return request.get("/fiber/timedata", {
        params: { projectId },
    });
}