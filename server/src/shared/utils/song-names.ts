const SONG_NAMES = [
  "Morning Sunshine", "Midnight Rain", "Golden Hour", "Silver Dusk", "Hollow Echoes",
  "Quiet Flame", "Velvet Storm", "Coastal Drift", "Desert Bloom", "Mountain Air",
  "Burning Pages", "Faded Memory", "Glass City", "Neon Shadows", "Soft Landing",
  "Ocean Floor", "Amber Skies", "Paper Wings", "Frozen Light", "Wandering Soul",
  "Crimson Tide", "Ivory Dreams", "Starless Night", "Copper Rain", "Emerald Haze",
  "Lavender Fields", "Broken Compass", "Rust and Gold", "Pale Fire", "Blue Horizon",
  "Silent Thunder", "Warm Static", "Distant Shore", "Last Ember", "Open Road",
  "Tangled Roots", "Fading Signal", "Pink Noise", "Slow Burn", "Hollow Wind",
  "City Lights", "Sunken Hours", "Woven Shadows", "Still Waters", "Tall Grass",
  "Painted Skies", "Cedar Smoke", "Paper Boats", "Falling Stars", "Soft Thunder",
  "Twilight Drive", "Honey Dusk", "Salt and Stone", "River Bend", "Grey Sparrow",
  "Liquid Sunset", "Northern Lights", "Velvet Underground", "Smoke Signal", "Tide Pool",
  "Wandering Light", "Autumn Haze", "Deep Current", "Shallow Waters", "Bright Decay",
  "Phantom Bloom", "Electric Fog", "Marble Sky", "Loose Ends", "Slow Tide",
  "Ember Glow", "White Noise", "Drift Away", "Strange Familiar", "Ghost Season",
  "Wax and Wane", "Canyon Echo", "Torn Atlas", "Silk Road", "Long Shadow",
  "Broken Radio", "Soft Collision", "Midnight Bloom", "Desert Glass", "Stardust Lane",
  "Old Frequency", "Velvet Dark", "Frozen Shore", "Copper Sky", "Pale Signal",
  "Quiet Riot", "Iron Bloom", "Silver Rain", "Lost Frequency",
  "Crescent Moon", "Amber Wave", "Violet Hour", "Stone Garden", "Shallow Echo",
  "Burning Low", "Wild Honey", "Slow Current", "Neon Bloom", "Grey Horizon",
  "Sunken Light", "Rising Tide", "Paper Moon", "Echo Chamber", "Distant Thunder",
  "Soft Static", "Falling Tide", "Open Window", "Ember Days", "Coastal Fog",
  "Shallow Grave", "Bright Static", "Slow Wave", "Copper Dust", "Jade River",
  "Phantom Road", "Silver Lining", "Burnt Orange", "Deep Blue", "Pale Gold",
  "Hollow Ground", "Warm Current", "Fading Light", "Salt Air", "Rising Smoke",
];

export function pickSongTitle(): string {
  return SONG_NAMES[Math.floor(Math.random() * SONG_NAMES.length)];
}
