# 🍳 Recipe Scaler

A simple, responsive web application that helps you adjust ingredient quantities to match the number of servings you need. Enter a recipe's original serving size and ingredient amounts, choose your target servings, and instantly calculate the scaled quantities.

## ✨ Features

- **Recipe scaling:** Calculates ingredient quantities for a new serving size.
- **Three ingredient entries:** Enter each ingredient's name, amount, and optional measurement unit.
- **Quick serving controls:** Scale to half, double, or triple the original recipe, or adjust the target by one person.
- **Sample recipe:** Load a sample pancake recipe to try the app quickly.
- **Kitchen-friendly fractions:** Displays approximate common fractions when a calculated amount is close to one.
- **Input validation:** Shows helpful messages for missing or invalid serving numbers and ingredient amounts.
- **Automatic local saving:** Stores form data in browser `localStorage` and restores a valid calculation after a reload.
- **Copy results:** Copy the scaled recipe to the clipboard.
- **Print results:** Print the scaled recipe.
- **Reset:** Clear the form and saved recipe data.
- **Responsive interface:** Uses a clean culinary-inspired design that adapts to different screen sizes.

## 🧮 Calculation Formula

The app uses this formula for each ingredient:

```text
New Amount = (Original Amount × Servings Wanted) ÷ Original Recipe Servings
```

**Example:** If a recipe uses 200 grams of flour for 4 servings and you want 10 servings:

```text
New Amount = (200 × 10) ÷ 4
           = 500 grams
```

The scaling factor is:

```text
Scaling Factor = Servings Wanted ÷ Original Recipe Servings
```

## 🛠️ Technologies Used

- **HTML5** — page structure and form elements
- **CSS3** — styling, responsive layout, and visual effects
- **Vanilla JavaScript (ES6+)** — calculations, validation, UI updates, clipboard and print actions
- **Browser `localStorage`** — saves recipe form data locally

No framework, package installation, backend, or database is required for the current client-side version.

## 📁 Project Structure

Keep the three files in the same folder:

```text
recipe-scaler/
├── index.html
├── style.css
├── script.js
└── README.md
```

> If your downloaded files have different names, rename them to `index.html`, `style.css`, and `script.js`, or update the stylesheet and script paths in `index.html` to match your filenames.

## 🚀 Getting Started

### Option 1: Open in a browser

1. Download or clone this repository.
2. Make sure `index.html`, `style.css`, and `script.js` are in the same directory.
3. Open `index.html` in a modern web browser.
4. Enter the recipe details and click **Calculate Scaled Recipe**.

### Option 2: Run with VS Code

1. Open the project folder in Visual Studio Code.
2. Open `index.html` in your browser, or use the **Live Server** extension.
3. Edit the HTML, CSS, or JavaScript files as needed.

There are no build commands or dependencies to install.

## 📖 How to Use

1. Enter the **dish name**.
2. Enter the **original servings** and the **servings wanted**. Both must be greater than zero.
3. Fill in the names and amounts for all three ingredient entries. Measurement units are optional; ingredient amounts must be zero or greater.
4. Click **Calculate Scaled Recipe**.
5. Review the new ingredient quantities, scaling factor, and calculation details.
6. Use **Copy** to copy the recipe, **Print** to print it, or **Reset All** to clear the form and saved data.

You can also choose **Load Sample** to populate a sample pancake recipe and see the calculator in action.

## 💾 Data and Privacy

Recipe information is saved in the browser's `localStorage` on the device and browser where the app is used. The current application does not require an account or send recipe data to a server.

Clearing the browser's site data may remove saved recipes. Use **Reset All** to clear the app's saved recipe state.

## ⚠️ Notes and Limitations

- The app currently provides **three ingredient entries** per recipe.
- Ingredient amounts are scaled mathematically; the app does not automatically convert between measurement units (for example, cups to grams).
- Fraction suggestions are approximate and intended as a kitchen-friendly guide.
- Scaling ingredients does not automatically adjust cooking time, oven temperature, or pan size.
- Browser clipboard permissions and printing behavior may vary by browser.

## 🤝 Contributing

Suggestions and improvements are welcome.

1. Fork the repository.
2. Create a branch for your change.
3. Make and test your changes.
4. Submit a pull request describing the improvement.

## 📄 License

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Aditya Mishra

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

---

Made for easier recipe planning and cooking.
