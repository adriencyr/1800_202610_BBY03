// This Vite config file (vite.config.js) tells Rollup (production bundler) 
// to treat multiple HTML files as entry points so each becomes its own built page.

import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, "index.html"),
                bookmarks: resolve(__dirname, "pages/bookmarks.html"),
                login: resolve(__dirname, "pages/login.html"),
                newpost: resolve(__dirname, "pages/newpost.html"),
                post: resolve(__dirname, "pages/post.html"),
                postDetails: resolve(__dirname, "pages/post-details.html"),
                reply: resolve(__dirname, "pages/reply.html"),
                search: resolve(__dirname, "pages/searchPage.html"),
                settings: resolve(__dirname, "pages/settings.html"),
                footer: resolve(__dirname, "components/footer.html"),
                navbar: resolve(__dirname, "components/navbar.html")
            }
        }
    }
});
