# Vistaraz Project Rules

## Official Logo
- Always use the official Vistaraz logo image located at `assets/logo.png`, `public/logo.png`, and `src/assets/images/logo.png`.
- The official logo features the circular emblem of two reaching human figures (purple and cyan-blue gradient) with cursive "Vistaraz" and the tagline "A better way to reach out".
- **NEVER** alter, modify, crop, or edit the logo image itself. Always use the exact official image without changes.
- In React components (e.g. Header, Footer, Sidebar, VideoCallPage), import from `assets/images/logo.png` and display with an `<img>` tag:
  ```jsx
  import logoImg from '../../assets/images/logo.png';
  <img src={logoImg} alt="Vistaraz" className="vz-header__logo-img" />
  ```
- In static HTML / favicon:
  ```html
  <link rel="icon" type="image/png" href="/logo.png" />
  ```

## Automatic Git Sync (Prafful / ps branch)
- Always auto-commit, pull, push, and sync changes on the `Prafful` (`ps`) branch after completing any requested updates, features, or fixes.
- The local branches `Prafful` and `ps` track `origin/Prafful`.
- Use `node scripts/git-sync.js` (or `npm run sync`) to execute the sync cycle (pull remote, stage all files, commit descriptive message, and push to `origin/Prafful`).
