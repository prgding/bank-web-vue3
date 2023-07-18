import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("Local-Token")
        if (token) {
            config.headers.Token = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const app = createApp(App)
app.provide('$backend', import.meta.env.VITE_BACKEND);
app.use(ElementPlus)
app.use(router)

app.mount('#app')
