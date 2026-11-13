# O-VER-KiLL v0.30 Preview

TypeScript modules and static Vite preview for the existing O-VER-KiLL browser game. The current public version remains on the original site; this project is an isolated preview only.

## Commands

- `pnpm install` — install the pinned toolchain
- `pnpm dev` — run the Preview server at port 3000
- `pnpm test` — run domain and migration tests
- `pnpm build` — type-check and create static output in `dist/`

The code is split into `src/domain`, `src/services`, `src/data`, `src/screens`, and `src/app`. Legacy `game.js`, `v024.js`, and `v025.js` are retained in the source repository as historical comparison inputs and are not loaded by v0.30.
