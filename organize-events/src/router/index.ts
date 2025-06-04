import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { ModalItem, ButtonItem } from "../views";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: ModalItem,
  },
  {
    path: "/about",
    name: "about",
    component: ButtonItem,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
