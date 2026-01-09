import { onRequestPost as __api_worker_auth_ts_onRequestPost } from "C:\\Users\\sanch\\Documents\\GitHub\\crt-stories\\functions\\api\\worker\\auth.ts"
import { onRequestPost as __api_worker_send_magic_link_ts_onRequestPost } from "C:\\Users\\sanch\\Documents\\GitHub\\crt-stories\\functions\\api\\worker\\send-magic-link.ts"
import { onRequestPost as __api_worker_verify_magic_code_ts_onRequestPost } from "C:\\Users\\sanch\\Documents\\GitHub\\crt-stories\\functions\\api\\worker\\verify-magic-code.ts"
import { onRequest as __api_public_books_ts_onRequest } from "C:\\Users\\sanch\\Documents\\GitHub\\crt-stories\\functions\\api\\public\\books.ts"
import { onRequest as __api_public_characters_ts_onRequest } from "C:\\Users\\sanch\\Documents\\GitHub\\crt-stories\\functions\\api\\public\\characters.ts"
import { onRequest as __api_public_series_ts_onRequest } from "C:\\Users\\sanch\\Documents\\GitHub\\crt-stories\\functions\\api\\public\\series.ts"
import { onRequest as __api_public_worlds_ts_onRequest } from "C:\\Users\\sanch\\Documents\\GitHub\\crt-stories\\functions\\api\\public\\worlds.ts"
import { onRequest as __api_worker_books_ts_onRequest } from "C:\\Users\\sanch\\Documents\\GitHub\\crt-stories\\functions\\api\\worker\\books.ts"
import { onRequest as __api_worker_characters_ts_onRequest } from "C:\\Users\\sanch\\Documents\\GitHub\\crt-stories\\functions\\api\\worker\\characters.ts"
import { onRequest as __api_worker_logout_ts_onRequest } from "C:\\Users\\sanch\\Documents\\GitHub\\crt-stories\\functions\\api\\worker\\logout.ts"
import { onRequest as __api_worker_series_ts_onRequest } from "C:\\Users\\sanch\\Documents\\GitHub\\crt-stories\\functions\\api\\worker\\series.ts"
import { onRequest as __api_worker_worlds_ts_onRequest } from "C:\\Users\\sanch\\Documents\\GitHub\\crt-stories\\functions\\api\\worker\\worlds.ts"

export const routes = [
    {
      routePath: "/api/worker/auth",
      mountPath: "/api/worker",
      method: "POST",
      middlewares: [],
      modules: [__api_worker_auth_ts_onRequestPost],
    },
  {
      routePath: "/api/worker/send-magic-link",
      mountPath: "/api/worker",
      method: "POST",
      middlewares: [],
      modules: [__api_worker_send_magic_link_ts_onRequestPost],
    },
  {
      routePath: "/api/worker/verify-magic-code",
      mountPath: "/api/worker",
      method: "POST",
      middlewares: [],
      modules: [__api_worker_verify_magic_code_ts_onRequestPost],
    },
  {
      routePath: "/api/public/books",
      mountPath: "/api/public",
      method: "",
      middlewares: [],
      modules: [__api_public_books_ts_onRequest],
    },
  {
      routePath: "/api/public/characters",
      mountPath: "/api/public",
      method: "",
      middlewares: [],
      modules: [__api_public_characters_ts_onRequest],
    },
  {
      routePath: "/api/public/series",
      mountPath: "/api/public",
      method: "",
      middlewares: [],
      modules: [__api_public_series_ts_onRequest],
    },
  {
      routePath: "/api/public/worlds",
      mountPath: "/api/public",
      method: "",
      middlewares: [],
      modules: [__api_public_worlds_ts_onRequest],
    },
  {
      routePath: "/api/worker/books",
      mountPath: "/api/worker",
      method: "",
      middlewares: [],
      modules: [__api_worker_books_ts_onRequest],
    },
  {
      routePath: "/api/worker/characters",
      mountPath: "/api/worker",
      method: "",
      middlewares: [],
      modules: [__api_worker_characters_ts_onRequest],
    },
  {
      routePath: "/api/worker/logout",
      mountPath: "/api/worker",
      method: "",
      middlewares: [],
      modules: [__api_worker_logout_ts_onRequest],
    },
  {
      routePath: "/api/worker/series",
      mountPath: "/api/worker",
      method: "",
      middlewares: [],
      modules: [__api_worker_series_ts_onRequest],
    },
  {
      routePath: "/api/worker/worlds",
      mountPath: "/api/worker",
      method: "",
      middlewares: [],
      modules: [__api_worker_worlds_ts_onRequest],
    },
  ]