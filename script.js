const GRADES = ["S", "A", "B", "C", "D", "E", "F", "G"];
const GRADE_INFO = {
  S: { pct: "+5%", tip: "Peak. Only reachable via sparks — base aptitude caps at A.", tier: "s" },
  A: { pct: "100%", tip: "Baseline. No penalty, safe to race here.", tier: "a" },
  B: { pct: "−10%", tip: "Minor drag. One matching spark usually bumps this to A.", tier: "b" },
  C: { pct: "−20%", tip: "Noticeable penalty. Worth 4-6 sparks before racing seriously.", tier: "c" },
  D: { pct: "−40%", tip: "Steep drop. Push through only if the trophy is required. Needs 7-9 sparks.", tier: "d" },
  E: { pct: "−60%", tip: "Severe — accel takes a hit too on distance. Avoid unless mandatory. Needs atleast 10 sparks.", tier: "e" },
  F: { pct: "−80%", tip: "Near-crippling. Even max sparks (12) only gives you to C. Hope that Inspiration sessions gives you more.", tier: "f" },
  G: { pct: "−90%", tip: "Worst case. Only for a must-have trophy. Even max sparks (12) only gives you to C. Hope that Inspiration sessions gives you more.", tier: "g" },
};
const CATS = [
  { key: "turf", label: "Turf", group: "surface", stat: "Power / Acceleration" },
  { key: "dirt", label: "Dirt", group: "surface", stat: "Power / Acceleration" },
  { key: "short", label: "Short", group: "distance", stat: "Speed" },
  { key: "mile", label: "Mile", group: "distance", stat: "Speed" },
  { key: "medium", label: "Medium", group: "distance", stat: "Speed" },
  { key: "long", label: "Long", group: "distance", stat: "Speed" },
];
const SURFACE_KEYS = ["turf", "dirt"];
const DISTANCE_KEYS = ["short", "mile", "medium", "long"];

// One entry per character, consolidated across all Global costumes.
// Where costumes disagree, the value is {base, alt, note}.
const DATABASE = [
  { name: "Special Week", apt: { turf: "A", dirt: "G", short: "F", mile: "C", medium: "A", long: "A" } },
  { name: "Silence Suzuka", apt: { turf: "A", dirt: "G", short: "D", mile: "A", medium: "A", long: "E" } },
  { name: "Tokai Teio", apt: { turf: "A", dirt: "G", short: "F", mile: "E", medium: "A", long: "B" } },
  { name: "Maruzensky", apt: { turf: "A", dirt: "D", short: "B", mile: "A", medium: "B", long: "C" } },
  { name: "Oguri Cap", apt: { turf: "A", dirt: "B", short: "E", mile: "A", medium: "A", long: "B" } },
  { name: "Gold Ship", apt: { turf: "A", dirt: "G", short: "G", mile: "C", medium: "A", long: "A" } },
  { name: "Vodka", apt: { turf: "A", dirt: "G", short: "F", mile: "A", medium: "A", long: "F" } },
  { name: "Daiwa Scarlet", apt: { turf: "A", dirt: "G", short: "F", mile: "A", medium: "A", long: "B" } },
  { name: "Taiki Shuttle", apt: { turf: "A", dirt: "B", short: "A", mile: "A", medium: "E", long: "G" } },
  { name: "Grass Wonder", apt: { turf: "A", dirt: "G", short: "G", mile: "A", medium: "B", long: "A" } },
  { name: "Mejiro McQueen", apt: { turf: "A", dirt: "E", short: "G", mile: "F", medium: "A", long: "A" } },
  { name: "El Condor Pasa", apt: { turf: "A", dirt: "B", short: "F", mile: "A", medium: "A", long: "B" } },
  { name: "T.M. Opera O", apt: { turf: "A", dirt: "E", short: "G", mile: "E", medium: "A", long: "A" } },
  { name: "Symboli Rudolf", apt: { turf: "A", dirt: "G", short: "E", mile: "C", medium: "A", long: "A" } },
  { name: "Air Groove", apt: { turf: "A", dirt: "G", short: "C", mile: "B", medium: "A", long: "E" } },
  { name: "Mayano Top Gun", apt: { turf: "A", dirt: "E", short: "D", mile: "D", medium: "A", long: "A" } },
  { name: "Mejiro Ryan", apt: { turf: "A", dirt: "G", short: "E", mile: "C", medium: "A", long: "B" } },
  { name: "Rice Shower", apt: { turf: "A", dirt: "G", short: "E", mile: "C", medium: "A", long: "A" } },
  { name: "Agnes Tachyon", apt: { turf: "A", dirt: "G", short: "G", mile: "D", medium: "A", long: "B" } },
  { name: "Winning Ticket", apt: { turf: "A", dirt: "G", short: "G", mile: "F", medium: "A", long: "B" } },
  { name: "Sakura Bakushin O", apt: { turf: "A", dirt: "G", short: "A", mile: "B", medium: "G", long: "G" } },
  { name: "Super Creek", apt: { turf: "A", dirt: "G", short: "G", mile: "G", medium: "A", long: "A" } },
  {
    name: "Haru Urara", apt: {
      turf: "G", dirt: "A", short: "A",
      mile: { base: "B", alt: "A", note: "B on base costume — her \"New Year ♪ New Urara!\" costume raises this to A." },
      medium: "G", long: "G"
    }
  },
  { name: "Matikanefukukitaru", apt: { turf: "A", dirt: "F", short: "F", mile: "C", medium: "A", long: "A" } },
  { name: "Nice Nature", apt: { turf: "A", dirt: "G", short: "G", mile: "C", medium: "A", long: "A" } },
  { name: "King Halo", apt: { turf: "A", dirt: "G", short: "A", mile: "B", medium: "B", long: "C" } },
  { name: "Mihono Bourbon", apt: { turf: "A", dirt: "G", short: "C", mile: "B", medium: "A", long: "B" } },
  { name: "Biwa Hayahide", apt: { turf: "A", dirt: "F", short: "F", mile: "C", medium: "A", long: "A" } },
  { name: "Curren Chan", apt: { turf: "A", dirt: "F", short: "A", mile: "D", medium: "G", long: "G" } },
  { name: "Narita Taishin", apt: { turf: "A", dirt: "G", short: "F", mile: "D", medium: "A", long: "A" } },
  { name: "Smart Falcon", apt: { turf: "E", dirt: "A", short: "B", mile: "A", medium: "A", long: "E" } },
  { name: "Narita Brian", apt: { turf: "A", dirt: "G", short: "F", mile: "B", medium: "A", long: "A" } },
  { name: "Seiun Sky", apt: { turf: "A", dirt: "G", short: "G", mile: "C", medium: "A", long: "A" } },
  { name: "Hishi Amazon", apt: { turf: "A", dirt: "E", short: "D", mile: "A", medium: "A", long: "B" } },
  { name: "Fuji Kiseki", apt: { turf: "A", dirt: "F", short: "B", mile: "A", medium: "B", long: "E" } },
  { name: "Gold City", apt: { turf: "A", dirt: "D", short: "F", mile: "A", medium: "B", long: "B" } },
  { name: "Meisho Doto", apt: { turf: "A", dirt: "E", short: "G", mile: "F", medium: "A", long: "A" } },
  { name: "Eishin Flash", apt: { turf: "A", dirt: "G", short: "G", mile: "F", medium: "A", long: "A" } },
  { name: "Hishi Akebono", apt: { turf: "A", dirt: "F", short: "A", mile: "B", medium: "F", long: "G" } },
  { name: "Agnes Digital", apt: { turf: "A", dirt: "A", short: "F", mile: "A", medium: "A", long: "G" } },
  { name: "Kawakami Princess", apt: { turf: "A", dirt: "G", short: "D", mile: "B", medium: "A", long: "F" } },
  { name: "Manhattan Cafe", apt: { turf: "A", dirt: "G", short: "G", mile: "F", medium: "B", long: "A" } },
  { name: "Tosen Jordan", apt: { turf: "A", dirt: "G", short: "G", mile: "F", medium: "A", long: "B" } },
  { name: "Mejiro Dober", apt: { turf: "A", dirt: "G", short: "E", mile: "A", medium: "A", long: "F" } },
  { name: "Fine Motion", apt: { turf: "A", dirt: "G", short: "F", mile: "A", medium: "A", long: "C" } },
  { name: "Tamamo Cross", apt: { turf: "A", dirt: "F", short: "G", mile: "E", medium: "A", long: "A" } },
  { name: "Sakura Chiyono O", apt: { turf: "A", dirt: "G", short: "E", mile: "A", medium: "A", long: "E" } },
  { name: "Mejiro Ardan", apt: { turf: "A", dirt: "F", short: "E", mile: "B", medium: "A", long: "D" } },
  { name: "Admire Vega", apt: { turf: "A", dirt: "G", short: "F", mile: "C", medium: "A", long: "C" } },
  { name: "Matikanetannhauser", apt: { turf: "A", dirt: "G", short: "G", mile: "D", medium: "A", long: "A" } },
  { name: "Kitasan Black", apt: { turf: "A", dirt: "G", short: "E", mile: "C", medium: "A", long: "A" } },
  { name: "Satono Diamond", apt: { turf: "A", dirt: "G", short: "G", mile: "C", medium: "A", long: "A" } },
  { name: "Mejiro Bright", apt: { turf: "A", dirt: "G", short: "F", mile: "C", medium: "A", long: "A" } },
  { name: "Nishino Flower", apt: { turf: "A", dirt: "F", short: "A", mile: "A", medium: "E", long: "G" } },
  { name: "Yaeno Muteki", apt: { turf: "A", dirt: "E", short: "G", mile: "B", medium: "A", long: "E" } },
  { name: "Ines Fujin", apt: { turf: "A", dirt: "G", short: "G", mile: "A", medium: "A", long: "C" } },
  { name: "Mejiro Palmer", apt: { turf: "A", dirt: "G", short: "G", mile: "F", medium: "A", long: "A" } },
  { name: "Inari One", apt: { turf: "A", dirt: "A", short: "F", mile: "B", medium: "A", long: "A" } },
  { name: "Sweep Tosho", apt: { turf: "A", dirt: "G", short: "E", mile: "A", medium: "A", long: "D" } },
  { name: "Air Shakur", apt: { turf: "A", dirt: "G", short: "G", mile: "E", medium: "A", long: "A" } },
  { name: "Bamboo Memory", apt: { turf: "A", dirt: "D", short: "A", mile: "A", medium: "C", long: "G" } },
  { name: "Copano Rickey", apt: { turf: "F", dirt: "A", short: "C", mile: "A", medium: "A", long: "G" } },
];

// Official race calendar (G1/G2/G3), sourced from the user's Races.xlsx.
// Used to power the searchable trophy picker on each My List card.
const RACES = [
  {grade:'G1',year:'Senior',month:'February',turn:'Late',name:'February Stakes',track:'Dirt',distance:'Mile'},
  {grade:'G1',year:'Senior',month:'March',turn:'Late',name:'Takamatsunomiya Kinen',track:'Turf',distance:'Sprint'},
  {grade:'G1',year:'Senior',month:'March',turn:'Late',name:'Osaka Hai',track:'Turf',distance:'Medium'},
  {grade:'G1',year:'Classic',month:'April',turn:'Early',name:'Oka Sho',track:'Turf',distance:'Mile'},
  {grade:'G1',year:'Classic',month:'April',turn:'Early',name:'Satsuki Sho',track:'Turf',distance:'Medium'},
  {grade:'G1',year:'Senior',month:'April',turn:'Late',name:'Tenno Sho (Spring)',track:'Turf',distance:'Long'},
  {grade:'G1',year:'Classic',month:'May',turn:'Early',name:'NHK Mile Cup',track:'Turf',distance:'Mile'},
  {grade:'G1',year:'Senior',month:'May',turn:'Early',name:'Victoria Mile',track:'Turf',distance:'Mile'},
  {grade:'G1',year:'Classic',month:'May',turn:'Late',name:'Japanese Oaks',track:'Turf',distance:'Medium'},
  {grade:'G1',year:'Classic',month:'May',turn:'Late',name:'Japanese Derby',track:'Turf',distance:'Medium'},
  {grade:'G1',year:'Classic, Senior',month:'June',turn:'Early',name:'Yasuda Kinen',track:'Turf',distance:'Mile'},
  {grade:'G1',year:'Classic, Senior',month:'June',turn:'Late',name:'Takarazuka Kinen',track:'Turf',distance:'Mile'},
  {grade:'G1',year:'Classic, Senior',month:'September',turn:'Late',name:'Sprinters Stakes',track:'Turf',distance:'Sprint'},
  {grade:'G1',year:'Classic',month:'October',turn:'Late',name:'Shuka Sho',track:'Turf',distance:'Medium'},
  {grade:'G1',year:'Classic',month:'October',turn:'Late',name:'Kikuka Sho',track:'Turf',distance:'Long'},
  {grade:'G1',year:'Classic, Senior',month:'October',turn:'Late',name:'Tenno Sho (Autumn)',track:'Turf',distance:'Medium'},
  {grade:'G1',year:'Classic, Senior',month:'November',turn:'Early',name:'Queen Elizabeth II Cup',track:'Turf',distance:'Medium'},
  {grade:'G1',year:'Classic, Senior',month:'November',turn:'Late',name:'Mile Championship',track:'Turf',distance:'Mile'},
  {grade:'G1',year:'Classic, Senior',month:'November',turn:'Late',name:'Japan Cup',track:'Turf',distance:'Medium'},
  {grade:'G1',year:'Classic, Senior',month:'December',turn:'Early',name:'Champions Cup',track:'Dirt',distance:'Mile'},
  {grade:'G1',year:'Junior',month:'December',turn:'Early',name:'Hanshin Juvenile Fillies',track:'Turf',distance:'Mile'},
  {grade:'G1',year:'Junior',month:'December',turn:'Early',name:'Asahi Hai Futurity Stakes',track:'Turf',distance:'Mile'},
  {grade:'G1',year:'Classic, Senior',month:'December',turn:'Late',name:'Arima Kinen',track:'Turf',distance:'Long'},
  {grade:'G1',year:'Junior',month:'December',turn:'Late',name:'Hopeful Stakes',track:'Turf',distance:'Medium'},
  {grade:'G1',year:'Classic, Senior',month:'December',turn:'Late',name:'Tokyo Daitoshen',track:'Dirt',distance:'Medium'},
  {grade:'G1',year:'Classic, Senior',month:'November',turn:'Early',name:'JBC Classic',track:'Dirt',distance:'Medium'},
  {grade:'G1',year:'Classic, Senior',month:'November',turn:'Early',name:'JBC Sprint',track:'Dirt',distance:'Sprint'},
  {grade:'G1',year:'Classic, Senior',month:'November',turn:'Early',name:'JBC Ladies Classic',track:'Dirt',distance:'Mile'},
  {grade:'G1',year:'Classic',month:'July',turn:'Early',name:'Japan Dirt Derby',track:'Dirt',distance:'Medium'},
  {grade:'G1',year:'Senior',month:'June',turn:'Late',name:'Teio Sho',track:'Dirt',distance:'Medium'},
  {grade:'G1',year:'Senior',month:'February',turn:'Early',name:'Kawasaki Kinen',track:'Dirt',distance:'Medium'},
  {grade:'G1',year:'Junior',month:'December',turn:'Late',name:'Zen-Nippon Junior Yushun',track:'Dirt',distance:'Mile'},
  {grade:'G1',year:'Senior',month:'May',turn:'Early',name:'Kashiwa Kinen',track:'Dirt',distance:'Mile'},
  {grade:'G1',year:'Classic, Senior',month:'October',turn:'Early',name:'Mile Championship Nambu Hai',track:'Dirt',distance:'Mile'},
  {grade:'G2',year:'Senior',month:'January',turn:'Early',name:'Nikkei Shinshun Hai',track:'Turf',distance:'Medium'},
  {grade:'G2',year:'Senior',month:'January',turn:'Late',name:'Tokai Stakes',track:'Dirt',distance:'Mile'},
  {grade:'G2',year:'Senior',month:'January',turn:'Late',name:'American JCC',track:'Turf',distance:'Medium'},
  {grade:'G2',year:'Senior',month:'February',turn:'Early',name:'Kyoto Kinen',track:'Turf',distance:'Medium'},
  {grade:'G2',year:'Senior',month:'February',turn:'Late',name:'Nakayama Kinen',track:'Turf',distance:'Mile'},
  {grade:'G2',year:'Classic',month:'March',turn:'Early',name:'Tulip Sho',track:'Turf',distance:'Mile'},
  {grade:'G2',year:'Classic',month:'March',turn:'Early',name:'Yayoi Sho',track:'Turf',distance:'Medium'},
  {grade:'G2',year:'Senior',month:'March',turn:'Early',name:'Kinko Sho',track:'Turf',distance:'Medium'},
  {grade:'G2',year:'Classic',month:'March',turn:'Early',name:'Fillies\' Revue',track:'Turf',distance:'Sprint'},
  {grade:'G2',year:'Senior',month:'March',turn:'Late',name:'Hanshin Daishoten',track:'Turf',distance:'Long'},
  {grade:'G2',year:'Classic',month:'March',turn:'Late',name:'Spring Stakes',track:'Turf',distance:'Mile'},
  {grade:'G2',year:'Senior',month:'March',turn:'Late',name:'Nikkei Sho',track:'Turf',distance:'Long'},
  {grade:'G2',year:'Senior',month:'April',turn:'Early',name:'Hanshin Umamusume Stakes',track:'Turf',distance:'Mile'},
  {grade:'G2',year:'Classic',month:'April',turn:'Early',name:'New Zealand Trophy',track:'Turf',distance:'Mile'},
  {grade:'G2',year:'Senior',month:'April',turn:'Late',name:'Milers Cup',track:'Turf',distance:'Mile'},
  {grade:'G2',year:'Classic',month:'April',turn:'Late',name:'Flora Stakes',track:'Turf',distance:'Medium'},
  {grade:'G2',year:'Classic',month:'April',turn:'Late',name:'Aoba Sho',track:'Turf',distance:'Medium'},
  {grade:'G2',year:'Classic',month:'May',turn:'Early',name:'Kyoto Shimbun Hai',track:'Turf',distance:'Medium'},
  {grade:'G2',year:'Senior',month:'May',turn:'Early',name:'Keio Hai Spring Cup',track:'Turf',distance:'Sprint'},
  {grade:'G2',year:'Senior',month:'May',turn:'Late',name:'Meguro Kinen',track:'Turf',distance:'Long'},
  {grade:'G2',year:'Classic, Senior',month:'August',turn:'Late',name:'Sapporo Kinen',track:'Turf',distance:'Medium'},
  {grade:'G2',year:'Classic, Senior',month:'September',turn:'Early',name:'Centaur Stakes',track:'Turf',distance:'Sprint'},
  {grade:'G2',year:'Classic',month:'September',turn:'Early',name:'Rose Stakes',track:'Turf',distance:'Mile'},
  {grade:'G2',year:'Classic',month:'September',turn:'Late',name:'St. Lite Kinen',track:'Turf',distance:'Medium'},
  {grade:'G2',year:'Classic',month:'September',turn:'Late',name:'Kobe Shimbun Hai',track:'Turf',distance:'Medium'},
  {grade:'G2',year:'Classic, Senior',month:'September',turn:'Late',name:'All Comers',track:'Turf',distance:'Medium'},
  {grade:'G2',year:'Classic, Senior',month:'October',turn:'Early',name:'Mainichi Okan',track:'Turf',distance:'Mile'},
  {grade:'G2',year:'Classic, Senior',month:'October',turn:'Early',name:'Kyoto Daishoten',track:'Turf',distance:'Medium'},
  {grade:'G2',year:'Classic, Senior',month:'October',turn:'Early',name:'Fuchu Umamusume Stakes',track:'Turf',distance:'Mile'},
  {grade:'G2',year:'Classic, Senior',month:'October',turn:'Late',name:'Fuji Stakes',track:'Turf',distance:'Mile'},
  {grade:'G2',year:'Classic, Senior',month:'October',turn:'Late',name:'Swan Stakes',track:'Turf',distance:'Sprint'},
  {grade:'G2',year:'Junior',month:'November',turn:'Early',name:'Keio Hai Junior Stakes',track:'Turf',distance:'Sprint'},
  {grade:'G2',year:'Classic, Senior',month:'November',turn:'Early',name:'Republica Argentina',track:'Turf',distance:'Long'},
  {grade:'G2',year:'Junior',month:'November',turn:'Early',name:'Daily Hai Junior Stakes',track:'Turf',distance:'Mile'},
  {grade:'G2',year:'Classic, Senior',month:'December',turn:'Early',name:'Stayers Stakes',track:'Turf',distance:'Long'},
  {grade:'G2',year:'Classic, Senior',month:'December',turn:'Late',name:'Hanshin Cup',track:'Turf',distance:'Sprint'},
  {grade:'G2',year:'Classic, Senior',month:'October',turn:'Early',name:'Ladies\' Prelude',track:'Dirt',distance:'Mile'},
  {grade:'G2',year:'Classic, Senior',month:'October',turn:'Early',name:'Tokyo Hai',track:'Dirt',distance:'Sprint'},
  {grade:'G2',year:'Senior',month:'March',turn:'Early',name:'Empress Hai',track:'Dirt',distance:'Medium'},
  {grade:'G2',year:'Classic',month:'June',turn:'Early',name:'Kanto Oaks',track:'Dirt',distance:'Medium'},
  {grade:'G2',year:'Senior',month:'March',turn:'Late',name:'Diolite Kinen',track:'Dirt',distance:'Medium'},
  {grade:'G2',year:'Classic, Senior',month:'September',turn:'Late',name:'Sazanka TV Hai',track:'Dirt',distance:'Mile'},
  {grade:'G3',year:'Senior',month:'January',turn:'Early',name:'Kyoto Kimpai',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Senior',month:'January',turn:'Early',name:'Nakayama Kimpai',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Classic',month:'January',turn:'Early',name:'Shinzan Kinen',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Classic',month:'January',turn:'Early',name:'Fairy Stakes',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Senior',month:'January',turn:'Early',name:'Aichi Hai',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Classic',month:'January',turn:'Early',name:'Keisei Hai',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Senior',month:'January',turn:'Late',name:'Silk Road Stakes',track:'Turf',distance:'Sprint'},
  {grade:'G3',year:'Senior',month:'January',turn:'Late',name:'Negishi Stakes',track:'Dirt',distance:'Sprint'},
  {grade:'G3',year:'Classic',month:'February',turn:'Early',name:'Kisaragi Sho',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Senior',month:'February',turn:'Early',name:'Tokyo Shimbun Hai',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Classic',month:'February',turn:'Early',name:'Queen Cup',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Classic',month:'February',turn:'Early',name:'Kyodo News Hai',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Senior',month:'February',turn:'Late',name:'Kyoto Umamusume Stakes',track:'Turf',distance:'Sprint'},
  {grade:'G3',year:'Senior',month:'February',turn:'Late',name:'Diamond Stakes',track:'Turf',distance:'Long'},
  {grade:'G3',year:'Senior',month:'February',turn:'Late',name:'Kokura Daishoten',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Classic',month:'April',turn:'Early',name:'Arlington Cup',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Senior',month:'February',turn:'Late',name:'Hankyu Hai',track:'Turf',distance:'Sprint'},
  {grade:'G3',year:'Senior',month:'March',turn:'Early',name:'Ocean Stakes',track:'Turf',distance:'Sprint'},
  {grade:'G3',year:'Senior',month:'March',turn:'Early',name:'Nakayama Umamusume Stakes',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Classic',month:'March',turn:'Late',name:'Falcon Stakes',track:'Turf',distance:'Sprint'},
  {grade:'G3',year:'Classic',month:'March',turn:'Late',name:'Flower Cup',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Classic',month:'March',turn:'Late',name:'Mainichi Hai',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Senior',month:'March',turn:'Late',name:'March Stakes',track:'Dirt',distance:'Mile'},
  {grade:'G3',year:'Senior',month:'April',turn:'Early',name:'Lord Derby Challenge Trophy',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Senior',month:'April',turn:'Early',name:'Antares Stakes',track:'Dirt',distance:'Mile'},
  {grade:'G3',year:'Senior',month:'April',turn:'Late',name:'Fukushima Umamusume Stakes',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Senior',month:'May',turn:'Early',name:'Niigata Daishoten',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Senior',month:'May',turn:'Late',name:'Heian Stakes',track:'Dirt',distance:'Medium'},
  {grade:'G3',year:'Classic',month:'May',turn:'Late',name:'Aoi Stakes',track:'Turf',distance:'Sprint'},
  {grade:'G3',year:'Classic, Senior',month:'June',turn:'Early',name:'Naruo Kinen',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Classic, Senior',month:'June',turn:'Early',name:'Mermaid Stakes',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Classic, Senior',month:'June',turn:'Early',name:'Epsom Cup',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Classic',month:'June',turn:'Late',name:'Unicorn Stakes',track:'Dirt',distance:'Mile'},
  {grade:'G3',year:'Classic, Senior',month:'June',turn:'Late',name:'Hakodate Sprint Stakes',track:'Turf',distance:'Sprint'},
  {grade:'G3',year:'Classic, Senior',month:'July',turn:'Early',name:'CBC Sho',track:'Turf',distance:'Sprint'},
  {grade:'G3',year:'Classic',month:'July',turn:'Early',name:'Radio Nikkei Sho',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Classic, Senior',month:'July',turn:'Early',name:'Procyon Stakes',track:'Dirt',distance:'Sprint'},
  {grade:'G3',year:'Classic, Senior',month:'July',turn:'Early',name:'Tanabata Sho',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Classic, Senior',month:'July',turn:'Early',name:'Hakodate Kinen',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Classic, Senior',month:'July',turn:'Late',name:'Chukyo Kinen',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Junior',month:'July',turn:'Late',name:'Hakodate Junior Stakes',track:'Turf',distance:'Sprint'},
  {grade:'G3',year:'Classic, Senior',month:'July',turn:'Late',name:'Ibis Summer Dash',track:'Turf',distance:'Sprint'},
  {grade:'G3',year:'Classic, Senior',month:'July',turn:'Late',name:'Queen Stakes',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Classic, Senior',month:'August',turn:'Early',name:'Kokura Kinen',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Classic',month:'August',turn:'Early',name:'Leopard Stakes',track:'Dirt',distance:'Mile'},
  {grade:'G3',year:'Classic, Senior',month:'August',turn:'Early',name:'Sekiya Kinen',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Classic, Senior',month:'August',turn:'Early',name:'Elm Stakes',track:'Dirt',distance:'Mile'},
  {grade:'G3',year:'Classic, Senior',month:'August',turn:'Late',name:'Kitakyushu Kinen',track:'Turf',distance:'Sprint'},
  {grade:'G3',year:'Junior',month:'August',turn:'Late',name:'Niigata Junior Stakes',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Classic, Senior',month:'August',turn:'Late',name:'Keeneland Cup',track:'Turf',distance:'Sprint'},
  {grade:'G3',year:'Junior',month:'September',turn:'Early',name:'Sapporo Junior Stakes',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Junior',month:'September',turn:'Early',name:'Kokura Junior Stakes',track:'Turf',distance:'Sprint'},
  {grade:'G3',year:'Classic, Senior',month:'September',turn:'Early',name:'Niigata Kinen',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Classic',month:'September',turn:'Early',name:'Shion Stakes',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Classic, Senior',month:'September',turn:'Early',name:'Keisei Hai Autumn Handicap',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Classic, Senior',month:'September',turn:'Late',name:'Sirius Stakes',track:'Dirt',distance:'Medium'},
  {grade:'G3',year:'Junior',month:'October',turn:'Early',name:'Saudi Arabia Royal Cup',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Junior',month:'October',turn:'Late',name:'Artemis Stakes',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Junior',month:'November',turn:'Early',name:'Fantasy Stakes',track:'Turf',distance:'Sprint'},
  {grade:'G3',year:'Classic, Senior',month:'November',turn:'Early',name:'Miyako Stakes',track:'Dirt',distance:'Mile'},
  {grade:'G3',year:'Classic, Senior',month:'November',turn:'Early',name:'Musashino Stakes',track:'Dirt',distance:'Mile'},
  {grade:'G3',year:'Classic, Senior',month:'November',turn:'Early',name:'Fukushima Kinen',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Junior',month:'November',turn:'Late',name:'Tokyo Sports Hai Junior Stakes',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Junior',month:'November',turn:'Late',name:'Kyoto Junior Stakes',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Classic',month:'November',turn:'Late',name:'Keihan Hai',track:'Turf',distance:'Sprint'},
  {grade:'G3',year:'Classic, Senior',month:'December',turn:'Early',name:'Challenge Cup',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Classic, Senior',month:'December',turn:'Early',name:'Chunichi Shimbun Hai',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Classic, Senior',month:'December',turn:'Early',name:'Capella Stakes',track:'Dirt',distance:'Sprint'},
  {grade:'G3',year:'Classic, Senior',month:'December',turn:'Early',name:'Turquoise Stakes',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Senior',month:'January',turn:'Late',name:'TCK Jo-o Hai',track:'Dirt',distance:'Mile'},
  {grade:'G3',year:'Classic, Senior',month:'April',turn:'Late',name:'Tokyo Sprint',track:'Dirt',distance:'Sprint'},
  {grade:'G3',year:'Classic, Senior',month:'July',turn:'Early',name:'Sparking Lady Cup',track:'Dirt',distance:'Medium'},
  {grade:'G3',year:'Classic, Senior',month:'April',turn:'Early',name:'Marine Cup',track:'Dirt',distance:'Mile'},
  {grade:'G3',year:'Classic, Senior',month:'December',turn:'Early',name:'Queen Sho',track:'Dirt',distance:'Mile'},
  {grade:'G3',year:'Classic, Senior',month:'July',turn:'Late',name:'Mercury Cup',track:'Dirt',distance:'Medium'},
  {grade:'G3',year:'Classic, Senior',month:'August',turn:'Late',name:'Cluster Cup',track:'Dirt',distance:'Sprint'},
];
// Maps a race's Track/Distance text (as given in the spreadsheet) to the aptitude keys used above.
const TRACK_TO_APT_KEY = { Turf: "turf", Dirt: "dirt" };
const DIST_TO_APT_KEY = { Sprint: "short", Mile: "mile", Medium: "medium", Long: "long" };

let state = { myList: [], settings: { allowCustomTrainees: true, allowCustomTrophies: true } };
function uid() { return Math.random().toString(36).slice(2, 9); }

async function loadState() {
  try {
    if (window.storage && typeof window.storage.get === 'function') {
      const res = await window.storage.get('mylist', false);
      if (res && res.value) { state = JSON.parse(res.value); }
    } else {
      const val = localStorage.getItem('mylist');
      if (val) { state = JSON.parse(val); }
    }
  } catch (e) { console.error("Storage load failed", e); }
  if (!state.settings) {
    state.settings = { allowCustomTrainees: true, allowCustomTrophies: true };
  }
}

async function saveState() {
  try {
    if (window.storage && typeof window.storage.set === 'function') {
      await window.storage.set('mylist', JSON.stringify(state), false);
    } else {
      localStorage.setItem('mylist', JSON.stringify(state));
    }
  }
  catch (e) { console.error("Storage save failed", e); }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
function gradeOf(v) { return typeof v === 'string' ? v : v.base; }
function altOf(v) { return typeof v === 'string' ? null : v; }

const tooltipEl = document.getElementById('tooltip');
function showTooltip(target, catKey, aptValue) {
  const cat = CATS.find(c => c.key === catKey);
  const grade = gradeOf(aptValue);
  const alt = altOf(aptValue);
  const info = GRADE_INFO[grade];
  let html = `
    <div class="tt-head" style="color:var(--${info.tier})">${cat.label} — ${grade}${alt ? ' / ' + alt.alt : ''}</div>
    <div class="tt-stat">${cat.stat} · ${info.pct}</div>
    <div>${info.tip}</div>
  `;
  if (alt) {
    html += `<div class="tt-variant">${escapeHtml(alt.note)}</div>`;
  }
  tooltipEl.innerHTML = html;

  const rect = target.getBoundingClientRect();
  tooltipEl.style.left = Math.min(rect.left, window.innerWidth - 236) + "px";

  // Measure the box as actually rendered (varies with how many lines the tip wraps to)
  // rather than assuming a fixed height, so it always sits flush above the chip.
  const gap = 8;
  const tooltipHeight = tooltipEl.getBoundingClientRect().height;
  let top = rect.top - tooltipHeight - gap;
  if (top < gap) top = rect.bottom + gap;
  tooltipEl.style.top = top + "px";
  tooltipEl.classList.add('show');
}
function hideTooltip() { tooltipEl.classList.remove('show'); }

function chipHtml(apt, key) {
  const cat = CATS.find(c => c.key === key);
  const value = apt[key];
  const grade = gradeOf(value);
  const alt = altOf(value);
  const tier = GRADE_INFO[grade].tier;
  const label = `${cat.label} ${grade}${alt ? '/' + alt.alt : ''}`;
  let style = `background:var(--${tier});--chip-glow:color-mix(in srgb, var(--${tier}) 55%, transparent);`;
  if (alt) {
    style = `--split-a:var(--${tier});--split-b:var(--${GRADE_INFO[alt.alt].tier});--chip-glow:color-mix(in srgb, var(--${tier}) 45%, transparent);`;
  }
  return `<button class="chip${alt ? ' split' : ''}" style="${style}"
            data-cat="${key}" data-json='${JSON.stringify(value)}'
          >${label}</button>`;
}
function aptGroupsHtml(apt) {
  return `<div class="apt-groups">
    <div class="apt-group">${SURFACE_KEYS.map(k => chipHtml(apt, k)).join("")}</div>
    <div class="apt-divider"></div>
    <div class="apt-group">${DISTANCE_KEYS.map(k => chipHtml(apt, k)).join("")}</div>
  </div>`;
}
function wireChips(root) {
  root.querySelectorAll('.chip').forEach(p => {
    const value = JSON.parse(p.dataset.json);
    p.addEventListener('mouseenter', () => showTooltip(p, p.dataset.cat, value));
    p.addEventListener('mouseleave', hideTooltip);
    p.addEventListener('focus', () => showTooltip(p, p.dataset.cat, value));
    p.addEventListener('blur', hideTooltip);
  });
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function iconHtml(name, size) {
  const slug = slugify(name);
  const initial = (name.trim()[0] || '?').toUpperCase();
  return `<div class="trainee-icon" style="--icon-size:${size}px">
    <img src="icons/${slug}.png" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
    <span class="icon-fallback">${initial}</span>
  </div>`;
}
function raceDateLabel(r) {
  const yearLabel = r.year.replace(/,\s*/g, '/');
  return `${yearLabel} ${r.turn} ${r.month}`;
}

function renderDatabase() {
  const grid = document.getElementById('db-grid');
  const filter = document.getElementById('db-search').value.trim().toLowerCase();
  const list = DATABASE.filter(d => d.name.toLowerCase().includes(filter));
  document.getElementById('db-count').textContent = `${list.length} / ${DATABASE.length}`;
  document.getElementById('db-gate').textContent = DATABASE.length;

  const addedNames = new Set(state.myList.map(t => t.name.toLowerCase()));

  grid.innerHTML = list.map((d) => {
    const realIndex = DATABASE.indexOf(d);
    const already = addedNames.has(d.name.toLowerCase());
    return `
    <div class="db-card">
      <span class="db-num">${String(realIndex + 1).padStart(2, '0')}</span>
      <div class="db-card-top">
        ${iconHtml(d.name, 40)}
        <div class="db-name">${escapeHtml(d.name)}</div>
      </div>
      ${aptGroupsHtml(d.apt)}
      <button class="btn small add-btn" data-add="${realIndex}" ${already ? 'disabled' : ''}>${already ? '✓ In my list' : '+ Add to my list'}</button>
    </div>`;
  }).join("");

  wireChips(grid);
  grid.querySelectorAll('[data-add]:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = DATABASE[parseInt(btn.dataset.add, 10)];
      addToMyList(d.name, JSON.parse(JSON.stringify(d.apt)));
    });
  });
}

function weakAptitudes(apt) {
  return CATS
    .map(c => ({ ...c, grade: gradeOf(apt[c.key]) }))
    .filter(c => GRADES.indexOf(c.grade) >= GRADES.indexOf("D"))
    .sort((a, b) => GRADES.indexOf(b.grade) - GRADES.indexOf(a.grade));
}

function addToMyList(name, apt) {
  state.myList.push({ id: uid(), name, aptitudes: apt, trophies: [] });
  saveState();
  renderMyList();
  renderDatabase();
}

function renderMyList() {
  const wrap = document.getElementById('mylist');
  const emptyEl = document.getElementById('mylist-empty');
  document.getElementById('my-gate').textContent = state.myList.length;

  if (state.myList.length === 0) {
    emptyEl.style.display = "block";
    wrap.innerHTML = "";
    return;
  }
  emptyEl.style.display = "none";

  wrap.innerHTML = state.myList.map(t => myCardHtml(t)).join("");
  wireChips(wrap);

  state.myList.forEach(t => {
    const delBtn = document.getElementById(`del-${t.id}`);
    if (delBtn) delBtn.addEventListener('click', () => removeFromMyList(t.id));

    const addTBtn = document.getElementById(`addt-btn-${t.id}`);
    const addTInput = document.getElementById(`addt-input-${t.id}`);
    const suggestBox = document.getElementById(`addt-suggest-${t.id}`);

    if (addTBtn) addTBtn.addEventListener('click', () => {
      addTrophyFromInput(t.id, addTInput.value);
      addTInput.value = "";
      hideSuggestBox(suggestBox);
    });
    if (addTInput) {
      addTInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          addTrophyFromInput(t.id, addTInput.value);
          addTInput.value = "";
          hideSuggestBox(suggestBox);
        } else if (e.key === 'Escape') {
          hideSuggestBox(suggestBox);
        }
      });
      addTInput.addEventListener('input', () => {
        renderRaceSuggestions(t, addTInput.value, suggestBox, addTInput);
      });
      addTInput.addEventListener('focus', () => {
        renderRaceSuggestions(t, addTInput.value, suggestBox, addTInput);
      });
      addTInput.addEventListener('blur', () => {
        // Delay so a click on a suggestion registers before the box hides.
        setTimeout(() => hideSuggestBox(suggestBox), 150);
      });
    }

    t.trophies.forEach(tr => {
      const cb = document.getElementById(`cb-${t.id}-${tr.id}`);
      if (cb) cb.addEventListener('change', () => toggleTrophy(t.id, tr.id));
      const rm = document.getElementById(`rm-${t.id}-${tr.id}`);
      if (rm) rm.addEventListener('click', () => removeTrophy(t.id, tr.id));
    });
  });
}

function findRaceByExactName(name) {
  const q = (name || "").trim().toLowerCase();
  return RACES.find(r => r.name.toLowerCase() === q);
}

function raceMeta(race) {
  return { grade: race.grade, track: race.track, distance: race.distance, year: race.year, turn: race.turn, month: race.month };
}

function hideSuggestBox(box) {
  if (box) box.classList.remove('show');
}

function renderRaceSuggestions(trainee, query, box, inputEl) {
  if (!box) return;
  const q = (query || "").trim().toLowerCase();
  const alreadyAdded = new Set(trainee.trophies.map(tr => tr.name.toLowerCase()));

  let matches = RACES.filter(r => !alreadyAdded.has(r.name.toLowerCase()));
  if (q) matches = matches.filter(r => r.name.toLowerCase().includes(q));

  if (matches.length === 0) {
    box.innerHTML = `<div class="race-suggest-empty">${q ? "No matching race — Enter adds it as a custom trophy." : "Type to search the race calendar."}</div>`;
  } else {
    box.innerHTML = matches.map(r => {
      const trackKey = TRACK_TO_APT_KEY[r.track];
      const distKey = DIST_TO_APT_KEY[r.distance];
      const trackGrade = gradeOf(trainee.aptitudes[trackKey]);
      const distGrade = gradeOf(trainee.aptitudes[distKey]);
      const trackTier = GRADE_INFO[trackGrade].tier;
      const distTier = GRADE_INFO[distGrade].tier;
      return `
      <div class="race-suggest-item" data-race="${escapeHtml(r.name)}">
        <span class="race-grade-tag">${r.grade}</span>
        <span class="race-info">
          <span class="race-name">${escapeHtml(r.name)}</span>
          <span class="race-date">${escapeHtml(raceDateLabel(r))}</span>
        </span>
        <span class="race-meta">
          <span class="mini-tag" style="background:var(--${trackTier})">${r.track}</span>
          <span class="mini-tag" style="background:var(--${distTier})">${r.distance}</span>
        </span>
      </div>`;
    }).join("");
  }
  box.classList.add('show');

  box.querySelectorAll('.race-suggest-item').forEach(item => {
    item.addEventListener('mousedown', (e) => {
      e.preventDefault(); // keep focus so blur doesn't fire before click
      const race = findRaceByExactName(item.dataset.race);
      if (race) {
        addTrophy(trainee.id, race.name, raceMeta(race));
        inputEl.value = "";
        hideSuggestBox(box);
      }
    });
  });
}

function addTrophyFromInput(tid, rawName) {
  const name = (rawName || "").trim();
  if (!name) return;
  const race = findRaceByExactName(name);
  if (!race && !state.settings.allowCustomTrophies) return;
  addTrophy(tid, name, race ? raceMeta(race) : null);
}

function myCardHtml(t) {
  const weak = weakAptitudes(t.aptitudes);
  const focusHtml = weak.length
    ? `<div class="focus-line"><b>Needs sparks:</b> ${weak.map(w => `${w.label} (${w.grade})`).join(", ")}</div>`
    : `<div class="focus-line clear"><b>Aptitudes clear</b> — nothing below C.</div>`;

  const total = t.trophies.length;
  const done = t.trophies.filter(x => x.checked).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const trophyHtml = total
    ? t.trophies.map(tr => {
      let metaHtml = "";
      if (tr.track && tr.distance) {
        const trackKey = TRACK_TO_APT_KEY[tr.track];
        const distKey = DIST_TO_APT_KEY[tr.distance];
        const trackGrade = gradeOf(t.aptitudes[trackKey]);
        const distGrade = gradeOf(t.aptitudes[distKey]);
        const dateHtml = tr.year ? `<span class="trophy-date">${escapeHtml(raceDateLabel(tr))}</span>` : "";
        metaHtml = `
          ${dateHtml}
          <span class="mini-tag" style="background:var(--panel-2);color:var(--ink-dim)">${tr.grade || ""}</span>
          <span class="mini-tag" style="background:var(--${GRADE_INFO[trackGrade].tier})" title="${tr.track} aptitude: ${trackGrade}">${tr.track}</span>
          <span class="mini-tag" style="background:var(--${GRADE_INFO[distGrade].tier})" title="${tr.distance} aptitude: ${distGrade}">${tr.distance}</span>
        `;
      }
      return `
      <div class="trophy-item ${tr.checked ? 'checked' : ''}">
        <input type="checkbox" id="cb-${t.id}-${tr.id}" ${tr.checked ? 'checked' : ''}>
        <span>${escapeHtml(tr.name)}</span>
        ${metaHtml}
        <button class="rm" id="rm-${t.id}-${tr.id}">&times;</button>
      </div>`;
    }).join("")
    : `<div style="font-size:12px;color:var(--ink-faint);font-style:italic;">No races logged yet.</div>`;

  return `
  <div class="mycard">
    <div class="mycard-head">
      ${iconHtml(t.name, 48)}
      <div class="mycard-name">${escapeHtml(t.name)}</div>
      <button class="btn small ghost" id="del-${t.id}">Remove</button>
    </div>
    <div class="cats-row">${aptGroupsHtml(t.aptitudes)}</div>
    ${focusHtml}
    <div class="trophy-section">
      <div class="trophy-top">
        <span class="label">Completionist</span>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span class="progress-pct">${done}/${total} · ${pct}%</span>
      </div>
      <div class="trophy-list">${trophyHtml}</div>
      <div class="add-trophy">
        <input type="text" id="addt-input-${t.id}" placeholder="${state.settings.allowCustomTrophies ? 'Search races (G1–G3) or type a custom trophy' : 'Search races (G1–G3)'}" autocomplete="off">
        <button class="btn small" id="addt-btn-${t.id}">+ Add</button>
        <div class="race-suggest" id="addt-suggest-${t.id}"></div>
      </div>
    </div>
  </div>`;
}

function removeFromMyList(id) {
  state.myList = state.myList.filter(t => t.id !== id);
  saveState(); renderMyList(); renderDatabase();
}
function addTrophy(tid, name, meta) {
  name = (name || "").trim();
  if (!name) return;
  const t = state.myList.find(x => x.id === tid);
  if (!t) return;
  const trophy = { id: uid(), name, checked: false };
  if (meta) {
    trophy.grade = meta.grade; trophy.track = meta.track; trophy.distance = meta.distance;
    trophy.year = meta.year; trophy.turn = meta.turn; trophy.month = meta.month;
  }
  t.trophies.push(trophy);
  saveState(); renderMyList();
}
function toggleTrophy(tid, trid) {
  const t = state.myList.find(x => x.id === tid);
  if (!t) return;
  const tr = t.trophies.find(x => x.id === trid);
  if (!tr) return;
  tr.checked = !tr.checked;
  saveState(); renderMyList();
}
function removeTrophy(tid, trid) {
  const t = state.myList.find(x => x.id === tid);
  if (!t) return;
  t.trophies = t.trophies.filter(x => x.id !== trid);
  saveState(); renderMyList();
}
function addCustom() {
  if (!state.settings.allowCustomTrainees) return;
  const input = document.getElementById('custom-name');
  const name = input.value.trim();
  if (!name) { input.focus(); return; }
  addToMyList(name, { turf: "A", dirt: "A", short: "A", mile: "A", medium: "A", long: "A" });
  input.value = "";
}

function exportList() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = "completionist-list.json";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function importList(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || !Array.isArray(parsed.myList)) throw new Error("bad format");
      const existingIds = new Set(state.myList.map(t => t.id));
      parsed.myList.forEach(t => {
        if (!t.id || existingIds.has(t.id)) t.id = uid();
        state.myList.push(t);
      });
      saveState(); renderMyList(); renderDatabase();
    } catch (e) {
      alert("Couldn't read that file — expected a Completionist Board export.");
    }
  };
  reader.readAsText(file);
}

function applySettingsUI() {
  const trainToggle = document.getElementById('toggle-custom-trainee');
  const trophyToggle = document.getElementById('toggle-custom-trophy');
  const trainRow = document.getElementById('custom-trainee-row');

  if (trainToggle) {
    trainToggle.textContent = `Custom trainees: ${state.settings.allowCustomTrainees ? 'On' : 'Off'}`;
    trainToggle.classList.toggle('off', !state.settings.allowCustomTrainees);
  }
  if (trophyToggle) {
    trophyToggle.textContent = `Custom trophies: ${state.settings.allowCustomTrophies ? 'On' : 'Off'}`;
    trophyToggle.classList.toggle('off', !state.settings.allowCustomTrophies);
  }
  if (trainRow) {
    trainRow.style.display = state.settings.allowCustomTrainees ? '' : 'none';
  }
  document.querySelectorAll('[id^="addt-input-"]').forEach(inp => {
    inp.placeholder = state.settings.allowCustomTrophies
      ? "Search races (G1–G3) or type a custom trophy"
      : "Search races (G1–G3)";
  });
}

async function init() {
  await loadState();
  renderDatabase();
  renderMyList();
  applySettingsUI();

  document.getElementById('db-search').addEventListener('input', renderDatabase);
  document.getElementById('custom-add-btn').addEventListener('click', addCustom);
  document.getElementById('custom-name').addEventListener('keydown', e => { if (e.key === 'Enter') addCustom(); });
  document.getElementById('export-btn').addEventListener('click', exportList);
  document.getElementById('import-file').addEventListener('change', e => {
    if (e.target.files[0]) importList(e.target.files[0]);
    e.target.value = "";
  });

  const trainToggle = document.getElementById('toggle-custom-trainee');
  const trophyToggle = document.getElementById('toggle-custom-trophy');
  if (trainToggle) trainToggle.addEventListener('click', () => {
    state.settings.allowCustomTrainees = !state.settings.allowCustomTrainees;
    saveState(); applySettingsUI();
  });
  if (trophyToggle) trophyToggle.addEventListener('click', () => {
    state.settings.allowCustomTrophies = !state.settings.allowCustomTrophies;
    saveState(); applySettingsUI();
  });
}
init();