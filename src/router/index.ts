import {createRouter, createWebHistory} from 'vue-router'
import Login from '../views/Login.vue'
import Buttons from "@/views/Buttons.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [{
        path: '/',
        name: 'login',
        component: Login
    }, {
        path: '/service',
        name: 'service',
        component: Buttons
    }
    ]
})

export default router
