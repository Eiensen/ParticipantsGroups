import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import App from "../App.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: App,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
