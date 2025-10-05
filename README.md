# Investment Calculator

A modern web application for calculating investment growth, returns, and projections. Built with React and TypeScript, this app helps users visualize how their investments can grow over time with customizable parameters.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Interactive Investment Calculator:** Input principal, rate, duration, and frequency to see projected growth.
- **Graphical Visualization:** Charts and graphs to visualize investment performance.
- **Customizable Parameters:** Supports various compounding intervals and investment types.
- **Responsive Design:** Works seamlessly on desktop and mobile devices.
- **Modern UI:** Uses Lucide icons and clean React components for a professional look.

---

## Project Structure

```
investment-calculator/
├── public/              # Static assets and index.html
├── src/                 # Source code (components, hooks, utils)
│   ├── components/      # React components (Calculator, Charts, etc.)
│   ├── assets/          # Images, SVGs, icons
│   ├── styles/          # CSS/SCSS files
│   ├── App.tsx          # Main app entry
│   └── index.tsx        # React DOM entry
├── node_modules/        # Dependencies (ignored by git)
├── .gitignore           # Git ignore rules
├── package.json         # Project metadata and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/investment-calculator.git
   cd investment-calculator
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

---

## Usage

### Running the App Locally

```sh
npm start
# or
yarn start
```

- Open [http://localhost:3000](http://localhost:3000) in your browser.
- Enter your investment details and view the results.

### Building for Production

```sh
npm run build
# or
yarn build
```

- The optimized build will be in the `build/` or `dist/` folder.

---

## Available Scripts

- `npm start` / `yarn start` — Run the app in development mode.
- `npm run build` / `yarn build` — Create a production build.
- `npm test` / `yarn test` — Run unit tests.
- `npm run lint` / `yarn lint` — Lint the codebase.

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a pull request

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgements

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Lucide Icons](https://lucide.dev/)
- [VS Code](https://code.visualstudio.com/)

---

**For any questions or support, please open an issue in this repository.**