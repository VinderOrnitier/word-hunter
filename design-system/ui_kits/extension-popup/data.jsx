// Mock data for the popup UI kit.

const ANIMALS = [
  "cat", "elephant", "fox", "wolf", "eagle", "bear", "giraffe", "tiger",
  "dolphin", "hedgehog", "zebra", "kangaroo", "lion", "penguin", "owl",
  "crocodile", "flamingo", "peacock",
];

const POKEMON = [
  "Pikachu", "Bulbasaur", "Charmander", "Squirtle", "Jigglypuff", "Mewtwo",
  "Eevee", "Snorlax", "Gengar", "Psyduck", "Machop", "Alakazam", "Magikarp",
  "Gyarados", "Lapras", "Vaporeon", "Flareon", "Dragonite",
];

const WORD_LISTS = { animals: ANIMALS, pokemon: POKEMON };

const NOW = Date.now();
const MOCK_RECORDS = [
  { word: "flamingo",  list: "animals", foundAt: NOW - 1000 * 60 * 2,            searchDurationSeconds: 14,  hintUsed: false, pageUrl: "https://en.wikipedia.org/wiki/Flamingo",       pageTitle: "en.wikipedia.org" },
  { word: "Pikachu",   list: "pokemon", foundAt: NOW - 1000 * 60 * 60 * 4,       searchDurationSeconds: 123, hintUsed: true,  pageUrl: "https://substack.com",                          pageTitle: "substack.com" },
  { word: "otter",     list: "custom",  foundAt: NOW - 1000 * 60 * 60 * 24,      searchDurationSeconds: 42,  hintUsed: false, pageUrl: "https://www.nytimes.com/section/science",       pageTitle: "nytimes.com" },
  { word: "wolf",      list: "animals", foundAt: NOW - 1000 * 60 * 60 * 24 * 3,  searchDurationSeconds: 8,   hintUsed: false, pageUrl: "https://arxiv.org",                              pageTitle: "arxiv.org" },
  { word: "Eevee",     list: "pokemon", foundAt: NOW - 1000 * 60 * 60 * 24 * 5,  searchDurationSeconds: 67,  hintUsed: false, pageUrl: "https://news.ycombinator.com",                  pageTitle: "news.ycombinator.com" },
  { word: "hedgehog",  list: "animals", foundAt: NOW - 1000 * 60 * 60 * 24 * 7,  searchDurationSeconds: 31,  hintUsed: true,  pageUrl: "https://www.theguardian.com",                   pageTitle: "theguardian.com" },
];

function formatDuration(s) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r === 0 ? `${m}m` : `${m}m ${String(r).padStart(2,"0")}s`;
}

function formatRelative(ts) {
  const dt = Date.now() - ts;
  const m = Math.floor(dt / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "yesterday";
  return `${d} days ago`;
}

const LIST_DOT = {
  animals: "var(--wh-list-animals)",
  pokemon: "var(--wh-list-pokemon)",
  custom:  "var(--wh-fg-3)",
};

const LIST_LABEL = {
  animals: "Animals",
  pokemon: "Pokémon",
  custom:  "Custom",
};

Object.assign(window, { ANIMALS, POKEMON, WORD_LISTS, MOCK_RECORDS, formatDuration, formatRelative, LIST_DOT, LIST_LABEL });
