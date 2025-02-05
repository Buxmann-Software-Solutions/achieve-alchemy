/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as HabitsImport } from './routes/habits'
import { Route as IndexImport } from './routes/index'

// Create/Update Routes

const HabitsRoute = HabitsImport.update({
  id: '/habits',
  path: '/habits',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/habits': {
      id: '/habits'
      path: '/habits'
      fullPath: '/habits'
      preLoaderRoute: typeof HabitsImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/habits': typeof HabitsRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/habits': typeof HabitsRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/habits': typeof HabitsRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/habits'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/habits'
  id: '__root__' | '/' | '/habits'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  HabitsRoute: typeof HabitsRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  HabitsRoute: HabitsRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/habits"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/habits": {
      "filePath": "habits.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
