import { createRouter, createWebHashHistory } from "vue-router";
import ModalItem from "../views/ModalItem.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: ModalItem,
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/ButtonItem.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
