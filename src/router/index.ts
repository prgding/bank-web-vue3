import {createRouter, createWebHistory} from 'vue-router'
import Login from '../views/Login.vue'
import UsersButtons from "@/views/UsersButtons.vue";
import AdminButtons from "@/views/AdminButtons.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [{
        path: '/',
        name: 'login',
        component: Login
    }, {
        path: '/service',
        name: 'service',
        component: UsersButtons
    }, {
        path: '/admin',
        name: 'admin',
        component: AdminButtons
    }
    ]
})

export default router
