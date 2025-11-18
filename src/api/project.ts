import request from "./index";

// 获取项目列表
export function getProjectList() {
    return request.get("/project/list");
}

// 根据项目 id + 日期获取光纤数据
export function getFiberData(projectId: number, startDate: string, endDate: string) {
    return request.get("/fiber/data", {
        params: { projectId, startDate, endDate },
    });
}

// 根据点位 id 获取该网格 15 天数据
export function getFiberPoint(pointId: number) {
    return request.get("/fiber/point", {
        params: { pointId },
    });
}

// 获取传感器列表
export function getSensorList(projectId: number, startTime: string, endTime: string) {
    return request.get("/sensor/data", {
        params: { projectId, startTime, endTime },
    });
}
