# Gamerbot 4.0

# Setup

1. First you need to clone [Gamerbot rest API](https://github.com/stamdiscord/Gamerbot-REST-API) (There is instruction to set this up in that projects README). If you want to use the real API (not currently available) just make sure to set `const API_DEBUG_LOCAL = true` to `false` in `index.ts`
2. After that you need the Gamerbot module. Its not published yet so you need to clone that. [Module](https://github.com/stamdiscord/Gamerbot-module). Make sure to run `npm install` and than `npm run link`. This will make the project available on your computer.
3. After that you can clone this project.
4. First run `npm run init` and than `npm link gamerbot-module`
5. You will now have a .env that you need to fill.
6. To run the project `npm run dev`
