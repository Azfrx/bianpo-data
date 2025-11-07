// 生成模拟摄像头数据
const generateCameraData = () => {
    const cameraNames = ["摄像头1", "摄像头2", "摄像头3"];
    const xData: string[] = [];
    const now = new Date();

    // 模拟最近 10 个时间点
    for (let i = 0; i < 10; i++) {
        const time = new Date(now.getTime() - (9 - i) * 60 * 1000); // 每分钟一个点
        xData.push(
            `${time.getHours().toString().padStart(2, "0")}:${time
                .getMinutes()
                .toString()
                .padStart(2, "0")}`
        );
    }

    // 随机生成三个摄像头的 y 值
    const yData = cameraNames.map(() =>
        Array.from({ length: xData.length }, () =>
            Math.floor(Math.random() * 100)
        )
    );

    return { cameraNames, xData, yData };
};
export default generateCameraData;