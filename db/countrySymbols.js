const mongoose = require("mongoose");
const moment = require("moment");

const SymbolsSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  country: {
    type: String,
    required: true,
    unique: true,
  },

  id: {
    type: Number,
    required: true,
    unique: true,
  },
});

const Symbols =
  mongoose.model.Symbols || mongoose.model("Symbols", SymbolsSchema);

async function getSymbols() {
  console.log("Accessing symbols");
  let y = 1;
  const mySymbols = await fetch("https://api.exchangerate.host/symbols");

  const response = await mySymbols.json();
  for (const [key, value] of Object.entries(response.symbols)) {
    const symbols = new Symbols({
      code: key,
      country: value.description,
      id: y,
    });

    await symbols.save();
    y++;
  }
}

// getSymbols();
module.exports = Symbols;
