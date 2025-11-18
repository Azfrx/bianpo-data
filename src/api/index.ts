import axios from "axios";

const request = axios.create({
    baseURL: '/api',
    timeout: 8000,
})

// 2. 请求拦截器（可选）
request.interceptors.request.use(
    (config) => {
        // 如果需要 token
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. 响应拦截器（错误处理）
request.interceptors.response.use(
    (response) => {
        return response.data; // 统一返回 data
    },
    (error) => {
        console.error("API 请求错误：", error);
        // 你可以在这里统一弹错误提示
        return Promise.reject(error);
    }
);

export default request;