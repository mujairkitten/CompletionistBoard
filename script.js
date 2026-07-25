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
  {grade:'G3',year:'Classic, Senior',month:'November',turn:'Late',name:'Keihan Hai',track:'Turf',distance:'Sprint'},
  {grade:'G3',year:'Classic, Senior',month:'December',turn:'Early',name:'Challenge Cup',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Classic, Senior',month:'December',turn:'Early',name:'Chunichi Shimbun Hai',track:'Turf',distance:'Medium'},
  {grade:'G3',year:'Classic, Senior',month:'December',turn:'Early',name:'Capella Stakes',track:'Dirt',distance:'Sprint'},
  {grade:'G3',year:'Classic, Senior',month:'December',turn:'Early',name:'Turquoise Stakes',track:'Turf',distance:'Mile'},
  {grade:'G3',year:'Senior',month:'January',turn:'Late',name:'TCK Jo-o Hai',track:'Dirt',distance:'Mile'},
  {grade:'G3',year:'Senior',month:'April',turn:'Late',name:'Tokyo Sprint',track:'Dirt',distance:'Sprint'},
  {grade:'G3',year:'Classic, Senior',month:'July',turn:'Early',name:'Sparking Lady Cup',track:'Dirt',distance:'Medium'},
  {grade:'G3',year:'Classic, Senior',month:'April',turn:'Early',name:'Marine Cup',track:'Dirt',distance:'Mile'},
  {grade:'G3',year:'Classic, Senior',month:'December',turn:'Early',name:'Queen Sho',track:'Dirt',distance:'Mile'},
  {grade:'G3',year:'Classic, Senior',month:'July',turn:'Late',name:'Mercury Cup',track:'Dirt',distance:'Medium'},
  {grade:'G3',year:'Classic, Senior',month:'August',turn:'Late',name:'Cluster Cup',track:'Dirt',distance:'Sprint'},
];
// Maps a race's Track/Distance text (as given in the spreadsheet) to the aptitude keys used above.
const TRACK_TO_APT_KEY = { Turf: "turf", Dirt: "dirt" };
const DIST_TO_APT_KEY = { Sprint: "short", Mile: "mile", Medium: "medium", Long: "long" };

// ---- Calendar (experimental) ----
// 3 in-career years, 12 months x Early/Late = 24 date slots each.
// "Out-of-Bond" has no fixed date, so it isn't part of the grid.
const CAL_YEAR_GROUPS = ["Junior", "Classic", "Senior"];
const CAL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CAL_TURNS = ["Early", "Late"];

function raceAppliesToYear(race, yearGroup) {
  return race.year.split(",").map(s => s.trim()).includes(yearGroup);
}
function calSlotKey(month, turn) { return `${month}|${turn}`; }
function racesForSlot(yearGroup, month, turn) {
  return RACES.filter(r => raceAppliesToYear(r, yearGroup) && r.month === month && r.turn === turn);
}
function trophyForRace(t, raceName) {
  return t.trophies.find(x => x.name.toLowerCase() === raceName.toLowerCase());
}
function isRaceDone(t, raceName) {
  const tr = trophyForRace(t, raceName);
  return !!(tr && tr.checked);
}
// Pending order for a slot: any saved custom order first, then remaining races in dataset order.
function pendingOrderForSlot(t, slotKey, pendingRaces) {
  if (!t.calendarOrder) t.calendarOrder = {};
  const saved = t.calendarOrder[slotKey] || [];
  const savedRaces = saved.map(n => pendingRaces.find(r => r.name === n)).filter(Boolean);
  const savedNames = new Set(savedRaces.map(r => r.name));
  const rest = pendingRaces.filter(r => !savedNames.has(r.name));
  return [...savedRaces, ...rest];
}
// Reorders a slot's pending list by moving draggedName to just before targetName
// (or to the end, if targetName is null — e.g. dropped on empty cell space).
function reorderRaceInSlot(t, slotKey, allSlotRaces, draggedName, targetName) {
  const pending = allSlotRaces.filter(r => !isRaceDone(t, r.name));
  let ordered = pendingOrderForSlot(t, slotKey, pending).map(r => r.name);
  ordered = ordered.filter(n => n !== draggedName);
  if (targetName && ordered.includes(targetName)) {
    ordered.splice(ordered.indexOf(targetName), 0, draggedName);
  } else {
    ordered.push(draggedName);
  }
  if (!t.calendarOrder) t.calendarOrder = {};
  t.calendarOrder[slotKey] = ordered;
  saveState();
}
let dragCtx = null;
function calendarToggleRace(t, race) {
  let tr = trophyForRace(t, race.name);
  if (!tr) {
    tr = { id: uid(), name: race.name, checked: true, grade: race.grade, track: race.track, distance: race.distance, year: race.year, turn: race.turn, month: race.month };
    t.trophies.push(tr);
  } else {
    tr.checked = !tr.checked;
  }
  saveState();
}


let state = {
  myList: [],
  settings: {
    allowCustomTrainees: true,
    allowCustomTrophies: true,
    calendarViewMode: false,
    inlineCalendar: false,
    lightMode: false,
    activeTraineeId: null
  }
};
// Runtime-only UI state (not persisted): which cards have their inline calendar open, and which tab each shows.
let openInlineCals = new Set();
let inlineCalTab = {};
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
  if (state.settings.calendarViewMode === undefined) state.settings.calendarViewMode = false;
  if (state.settings.inlineCalendar === undefined) state.settings.inlineCalendar = false;
  if (state.settings.lightMode === undefined) state.settings.lightMode = false;
  if (state.settings.activeTraineeId === undefined) state.settings.activeTraineeId = null;
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
  const borderMix = `color-mix(in srgb, var(--${tier}) 55%, transparent)`;
  const glowMix = `color-mix(in srgb, var(--${tier}) 80%, transparent)`;
  let bg = `color-mix(in srgb, var(--${tier}) 24%, transparent)`;
  if (alt) {
    const altTier = GRADE_INFO[alt.alt].tier;
    bg = `linear-gradient(90deg, color-mix(in srgb, var(--${tier}) 26%, transparent) 50%, color-mix(in srgb, var(--${altTier}) 26%, transparent) 50%)`;
  }
  const style = `--chip-bg:${bg};--chip-border:${borderMix};--chip-glow:${glowMix};`;
  return `<button class="chip" style="${style}"
            data-cat="${key}" data-json='${JSON.stringify(value)}'
          >${label}</button>`;
}
function aptGroupsHtml(apt) {
  return `<div class="apt-groups">
    <div class="apt-container">${SURFACE_KEYS.map(k => chipHtml(apt, k)).join("")}</div>
    <div class="apt-container">${DISTANCE_KEYS.map(k => chipHtml(apt, k)).join("")}</div>
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

function calGradeColor(grade) {
  if (grade === 'G1') return 'var(--s)';
  if (grade === 'G2') return 'var(--accent2)';
  return 'var(--accent)'; // G3
}
function calRaceRowHtml(r, opts) {
  const draggable = !!opts.draggable;
  const checked = !!opts.checked;
  return `
    <div class="cal-race-row${checked ? ' done' : ''}" ${draggable ? 'draggable="true"' : ''} data-race="${escapeHtml(r.name)}">
      ${draggable ? '<span class="drag-handle" title="Drag to reorder">⠿</span>' : ''}
      <input type="checkbox" class="cal-tick" data-race="${escapeHtml(r.name)}" ${checked ? 'checked' : ''}>
      <span class="cal-grade-tag" style="background:${calGradeColor(r.grade)}">${r.grade}</span>
      <span class="cal-race-info">
        <span class="cal-race-name">${escapeHtml(r.name)}</span>
        <span class="cal-race-sub">${r.track} · ${r.distance}</span>
      </span>
    </div>`;
}

// ---- Calendar rendering (shared by the full Calendar View and the inline per-card calendar) ----
function calCellHtml(t, yearGroup, month, turn) {
  const slotKey = calSlotKey(month, turn);
  const slotRaces = racesForSlot(yearGroup, month, turn);
  const done = slotRaces.filter(r => isRaceDone(t, r.name));
  const pending = pendingOrderForSlot(t, slotKey, slotRaces.filter(r => !isRaceDone(t, r.name)));
  const label = `<div class="cal-cell-label">${month.slice(0, 3)} · ${turn}</div>`;

  if (slotRaces.length === 0) {
    return `<div class="cal-cell cal-cell-empty" data-slot="${slotKey}" data-year="${yearGroup}">${label}</div>`;
  }

  const pendingHtml = pending.map(r => calRaceRowHtml(r, { draggable: true, checked: false })).join("");

  const doneHtml = done.length ? `<div class="cal-done-divider">${done.map(r => calRaceRowHtml(r, { draggable: false, checked: true })).join("")}</div>` : "";

  return `<div class="cal-cell" data-slot="${slotKey}" data-year="${yearGroup}">${label}${pendingHtml}${doneHtml}</div>`;
}

function calGridHtml(t, yearGroup) {
  const slots = [];
  CAL_MONTHS.forEach(month => CAL_TURNS.forEach(turn => slots.push({ month, turn })));
  const cellsHtml = slots.map(s => calCellHtml(t, yearGroup, s.month, s.turn)).join("");
  return `<div class="cal-grid-46">${cellsHtml}</div>`;
}

function calOobHtml(t) {
  const oob = t.trophies.filter(tr => !tr.track);
  if (oob.length === 0) {
    return `<div class="empty-note" style="margin-top:8px;">No custom (non-calendar) trophies logged for this trainee yet.</div>`;
  }
  return `<div class="cal-oob-list">${oob.map(tr => `
    <div class="trophy-item ${tr.checked ? 'checked' : ''}">
      <input type="checkbox" class="cal-oob-tick" data-tid="${tr.id}" ${tr.checked ? 'checked' : ''}>
      <span>${escapeHtml(tr.name)}</span>
    </div>`).join("")}</div>`;
}

function calPageHtml(t, tab) {
  if (tab === "OoB") return calOobHtml(t);
  return calGridHtml(t, tab);
}

function wireCalPage(root, t, onChange) {
  root.querySelectorAll('.cal-tick').forEach(cb => {
    cb.addEventListener('change', () => {
      const race = RACES.find(r => r.name === cb.dataset.race);
      if (race) { calendarToggleRace(t, race); onChange(); }
    });
  });

  root.querySelectorAll('.cal-race-row[draggable="true"]').forEach(row => {
    row.addEventListener('dragstart', (e) => {
      const cell = row.closest('.cal-cell');
      dragCtx = { slotKey: cell.dataset.slot, raceName: row.dataset.race };
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', row.dataset.race);
      row.classList.add('dragging');
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      root.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
      dragCtx = null;
    });
    row.addEventListener('dragover', (e) => {
      if (!dragCtx) return;
      e.preventDefault();
      row.classList.add('drag-over');
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      row.classList.remove('drag-over');
      if (!dragCtx) return;
      const cell = row.closest('.cal-cell');
      const slotKey = cell.dataset.slot;
      if (slotKey !== dragCtx.slotKey) return; // reordering only makes sense within the same date slot
      const yearGroup = cell.dataset.year;
      const [month, turn] = slotKey.split('|');
      reorderRaceInSlot(t, slotKey, racesForSlot(yearGroup, month, turn), dragCtx.raceName, row.dataset.race);
      onChange();
    });
  });

  // Dropping on empty cell space (not on a specific row) sends the race to the end of the pending list.
  root.querySelectorAll('.cal-cell').forEach(cell => {
    cell.addEventListener('dragover', (e) => { if (dragCtx) e.preventDefault(); });
    cell.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!dragCtx) return;
      const slotKey = cell.dataset.slot;
      if (slotKey !== dragCtx.slotKey) return;
      const yearGroup = cell.dataset.year;
      const [month, turn] = slotKey.split('|');
      reorderRaceInSlot(t, slotKey, racesForSlot(yearGroup, month, turn), dragCtx.raceName, null);
      onChange();
    });
  });

  root.querySelectorAll('.cal-oob-tick').forEach(cb => {
    cb.addEventListener('change', () => {
      toggleTrophy(t.id, cb.dataset.tid);
      onChange();
    });
  });
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

    if (state.settings.inlineCalendar) {
      const calBtn = document.getElementById(`calbtn-${t.id}`);
      if (calBtn) calBtn.addEventListener('click', () => {
        if (openInlineCals.has(t.id)) openInlineCals.delete(t.id); else openInlineCals.add(t.id);
        renderMyList();
      });
      const tabsBox = document.getElementById(`caltabs-${t.id}`);
      if (tabsBox) tabsBox.querySelectorAll('.cal-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          inlineCalTab[t.id] = btn.dataset.tab;
          renderMyList();
        });
      });
      const pageBox = document.getElementById(`calpage-${t.id}`);
      if (pageBox) wireCalPage(pageBox, t, renderMyList);
    }
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

  const inlineCalHtml = state.settings.inlineCalendar ? `
    <div class="inline-cal">
      <button class="inline-cal-toggle" id="calbtn-${t.id}">📅 Calendar <span class="chev">${openInlineCals.has(t.id) ? '▾' : '▸'}</span></button>
      <div class="inline-cal-body ${openInlineCals.has(t.id) ? 'open' : ''}" id="calbody-${t.id}">
        <div class="cal-tabs" id="caltabs-${t.id}">
          ${[...CAL_YEAR_GROUPS, "OoB"].map(tab => `<button class="cal-tab-btn ${((inlineCalTab[t.id] || "Junior") === tab) ? 'active' : ''}" data-tab="${tab}">${tab === "OoB" ? "Out-of-Bond" : tab}</button>`).join("")}
        </div>
        <div class="cal-page" id="calpage-${t.id}">${calPageHtml(t, inlineCalTab[t.id] || "Junior")}</div>
      </div>
    </div>` : "";

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
    ${inlineCalHtml}
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

// ---- Full Calendar View (experimental alt layout) ----
let calViewTab = "Junior";

let calTraineePanelOpen = false;
let calTraineeSearch = "";
let calTraineeSort = "default"; // default | az | za

// Fallback only — the About box normally mirrors the live #standard-view .about-text content
// (see calSidebarHtml) so edits made there automatically show up in Calendar View too.
const ABOUT_HTML_LINES = [
  "Character aptitudes consolidated from the Umamusume Wiki trainee tables across all Global costumes. Latest update: July 20, 2026 (Copano Rickey).",
  "Race calendar sourced from a 152-race G1–G3 dataset. Out-of-Bond holds custom (non-race) trophies, which have no fixed date.",
  "Calendar View and Inline calendars are experimental toggles. Your list is stored privately in this browser — use Export/Import to move it between sessions or devices.",
  "2026, Mujairkitten. Made with Claude Sonnet 5. Not affiliated with Cygames. Source code is licensed under GPL-3. Uma icons are subject to Cygames, used fairly according to <a href=\"https://umamusume.com/fan-createdguide\">Cygames' Fan Content Guide.</a>"
];

function sortTraineeRows(rows) {
  if (calTraineeSort === "az") return [...rows].sort((a, b) => a.name.localeCompare(b.name));
  if (calTraineeSort === "za") return [...rows].sort((a, b) => b.name.localeCompare(a.name));
  return rows;
}

function calTraineePanelHtml(activeTrainee) {
  const q = calTraineeSearch.trim().toLowerCase();
  const mineRows = sortTraineeRows(state.myList.filter(t => t.name.toLowerCase().includes(q)));
  const myNames = new Set(state.myList.map(t => t.name.toLowerCase()));
  const otherRows = sortTraineeRows(DATABASE.filter(d => !myNames.has(d.name.toLowerCase()) && d.name.toLowerCase().includes(q)));

  const mineHtml = mineRows.map(t => `
    <div class="cal-trainee-row ${t.id === activeTrainee.id ? 'active' : ''}" data-switch="${t.id}">
      ${iconHtml(t.name, 28)}
      <span class="cal-trainee-row-name">${escapeHtml(t.name)}</span>
      ${t.id === activeTrainee.id ? '<span class="cal-trainee-current">Current</span>' : ''}
    </div>`).join("") || `<div class="cal-trainee-empty">No matches in My List.</div>`;

  const otherHtml = otherRows.map(d => `
    <div class="cal-trainee-row" data-name="${escapeHtml(d.name)}">
      ${iconHtml(d.name, 28)}
      <span class="cal-trainee-row-name">${escapeHtml(d.name)}</span>
      <button class="btn small" data-addswitch="${escapeHtml(d.name)}">+ Add to my list</button>
    </div>`).join("") || `<div class="cal-trainee-empty">No matches.</div>`;

  return `
  <div class="cal-trainee-panel" id="cal-trainee-panel">
    <input type="text" class="search" id="cal-trainee-search" placeholder="Search trainees…" value="${escapeHtml(calTraineeSearch)}">
    <div class="cal-trainee-sort">
      <button class="sort-btn ${calTraineeSort === 'default' ? 'active' : ''}" data-sort="default">Default</button>
      <button class="sort-btn ${calTraineeSort === 'az' ? 'active' : ''}" data-sort="az">A–Z</button>
      <button class="sort-btn ${calTraineeSort === 'za' ? 'active' : ''}" data-sort="za">Z–A</button>
    </div>
    <div class="cal-trainee-group-label">In My List</div>
    <div class="cal-trainee-list">${mineHtml}</div>
    <div class="cal-trainee-group-label">All trainees</div>
    <div class="cal-trainee-list">${otherHtml}</div>
  </div>`;
}

function calSidebarHtml(activeTrainee) {
  return `
  <div class="cal-sidebar">
    <div class="cal-trainee-box">
      ${iconHtml(activeTrainee.name, 96)}
      <button class="cal-trainee-name-btn" id="cal-trainee-btn">
        <span class="cal-trainee-name">${escapeHtml(activeTrainee.name)}</span>
        <span class="cal-trainee-arrow">▾</span>
      </button>
      ${calTraineePanelOpen ? calTraineePanelHtml(activeTrainee) : ''}
    </div>
    <div class="cal-tool-box">
      <div class="cal-tool-box-title">Aptitude chips</div>
      ${aptGroupsHtml(activeTrainee.aptitudes)}
    </div>
    <div class="cal-tool-box">
      <div class="cal-tool-box-title">More tools</div>
      <div class="cal-tool-list">
        <button class="btn small" id="cal-export-btn">Export list</button>
        <label class="btn small" for="cal-import-file">Import list</label>
        <input type="file" id="cal-import-file" accept=".json">
        <button class="btn small ghost" id="cal-exit-btn">Exit Calendar View</button>
      </div>
    </div>
    <div class="cal-tool-box">
      <div class="cal-tool-box-title">About</div>
      <div class="about-text">${getAboutHtml()}</div>
    </div>
  </div>`;
}

function getAboutHtml() {
  const live = document.querySelector('#standard-view .about-text');
  if (live && live.innerHTML.trim()) return live.innerHTML;
  return ABOUT_HTML_LINES.map(l => `<p>${l}</p>`).join("");
}

function wireCalTraineePanel(host, activeTrainee) {
  const btn = document.getElementById('cal-trainee-btn');
  if (btn) btn.addEventListener('click', (e) => {
    e.stopPropagation();
    calTraineePanelOpen = !calTraineePanelOpen;
    renderCalendarView();
  });

  const panel = document.getElementById('cal-trainee-panel');
  if (!panel) return;

  panel.addEventListener('click', e => e.stopPropagation());

  const searchInput = document.getElementById('cal-trainee-search');
  if (searchInput) {
    searchInput.focus();
    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
    searchInput.addEventListener('input', () => {
      calTraineeSearch = searchInput.value;
      renderCalendarView();
    });
  }

  panel.querySelectorAll('.sort-btn').forEach(b => {
    b.addEventListener('click', () => {
      calTraineeSort = b.dataset.sort;
      renderCalendarView();
    });
  });

  panel.querySelectorAll('[data-switch]').forEach(row => {
    row.addEventListener('click', () => {
      state.settings.activeTraineeId = row.dataset.switch;
      calTraineePanelOpen = false;
      saveState();
      renderCalendarView();
    });
  });

  panel.querySelectorAll('[data-addswitch]').forEach(b => {
    b.addEventListener('click', () => {
      const d = DATABASE.find(x => x.name === b.dataset.addswitch);
      if (!d) return;
      addToMyList(d.name, JSON.parse(JSON.stringify(d.apt)));
      const added = state.myList[state.myList.length - 1];
      state.settings.activeTraineeId = added.id;
      calTraineePanelOpen = false;
      saveState();
      renderCalendarView();
    });
  });
}

function renderCalendarView() {
  const host = document.getElementById('calendar-view');
  if (!host) return;

  if (state.myList.length === 0) {
    host.innerHTML = `<div class="empty-note" style="margin:30px 0;">Add at least one trainee to My List first — Calendar View needs someone to track.</div>`;
    return;
  }

  let activeTrainee = state.myList.find(t => t.id === state.settings.activeTraineeId);
  if (!activeTrainee) {
    activeTrainee = state.myList[0];
    state.settings.activeTraineeId = activeTrainee.id;
    saveState();
  }

  host.innerHTML = `
    <div class="calendar-layout">
      ${calSidebarHtml(activeTrainee)}
      <div class="cal-main">
        <div class="cal-tabs cal-tabs-main" id="cal-main-tabs">
          ${[...CAL_YEAR_GROUPS, "OoB"].map(tab => `<button class="cal-tab-btn ${calViewTab === tab ? 'active' : ''}" data-tab="${tab}">${tab === "OoB" ? "Out-of-Bond" : tab}</button>`).join("")}
        </div>
        <div class="cal-page" id="cal-main-page">${calPageHtml(activeTrainee, calViewTab)}</div>
      </div>
    </div>`;

  wireChips(host);
  wireCalTraineePanel(host, activeTrainee);

  document.getElementById('cal-main-tabs').querySelectorAll('.cal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      calViewTab = btn.dataset.tab;
      renderCalendarView();
    });
  });

  wireCalPage(document.getElementById('cal-main-page'), activeTrainee, renderCalendarView);

  const exportBtn = document.getElementById('cal-export-btn');
  if (exportBtn) exportBtn.addEventListener('click', exportList);
  const importFile = document.getElementById('cal-import-file');
  if (importFile) importFile.addEventListener('change', e => {
    if (e.target.files[0]) importList(e.target.files[0]);
    e.target.value = "";
  });
  const exitBtn = document.getElementById('cal-exit-btn');
  if (exitBtn) exitBtn.addEventListener('click', () => {
    state.settings.calendarViewMode = false;
    saveState();
    applySettingsUI();
    renderMainView();
  });
}

// Shows either the standard Database + My List layout, or the experimental Calendar View.
function renderMainView() {
  const standard = document.getElementById('standard-view');
  const calView = document.getElementById('calendar-view');
  if (state.settings.calendarViewMode) {
    if (standard) standard.style.display = 'none';
    if (calView) calView.style.display = '';
    renderCalendarView();
  } else {
    if (standard) standard.style.display = '';
    if (calView) calView.style.display = 'none';
    renderDatabase();
    renderMyList();
  }
}

function applySettingsUI() {
  const lightToggle = document.getElementById('toggle-light-mode');
  const trainToggle = document.getElementById('toggle-custom-trainee');
  const trophyToggle = document.getElementById('toggle-custom-trophy');
  const calViewToggle = document.getElementById('toggle-calendar-view');
  const inlineCalToggle = document.getElementById('toggle-inline-calendar');
  const trainRow = document.getElementById('custom-trainee-row');

  document.body.classList.toggle('light', !!state.settings.lightMode);

  if (lightToggle) lightToggle.checked = !!state.settings.lightMode;
  if (trainToggle) trainToggle.checked = !!state.settings.allowCustomTrainees;
  if (trophyToggle) trophyToggle.checked = !!state.settings.allowCustomTrophies;
  if (calViewToggle) calViewToggle.checked = !!state.settings.calendarViewMode;
  if (inlineCalToggle) inlineCalToggle.checked = !!state.settings.inlineCalendar;

  if (trainRow) {
    trainRow.style.display = state.settings.allowCustomTrainees ? '' : 'none';
  }
  document.querySelectorAll('[id^="addt-input-"]').forEach(inp => {
    inp.placeholder = state.settings.allowCustomTrophies
      ? "Search races (G1–G3) or type a custom trophy"
      : "Search races (G1–G3)";
  });
}

function closeSettingsPanel() {
  const panel = document.getElementById('settings-panel');
  if (panel) panel.classList.remove('show');
}

async function init() {
  await loadState();
  applySettingsUI();
  renderMainView();

  document.getElementById('db-search').addEventListener('input', renderDatabase);
  document.getElementById('custom-add-btn').addEventListener('click', addCustom);
  document.getElementById('custom-name').addEventListener('keydown', e => { if (e.key === 'Enter') addCustom(); });
  document.getElementById('export-btn').addEventListener('click', exportList);
  document.getElementById('import-file').addEventListener('change', e => {
    if (e.target.files[0]) importList(e.target.files[0]);
    e.target.value = "";
  });

  const settingsBtn = document.getElementById('settings-btn');
  const settingsPanel = document.getElementById('settings-panel');
  if (settingsBtn && settingsPanel) {
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsPanel.classList.toggle('show');
    });
    settingsPanel.addEventListener('click', e => e.stopPropagation());
  }

  const lightToggle = document.getElementById('toggle-light-mode');
  const trainToggle = document.getElementById('toggle-custom-trainee');
  const trophyToggle = document.getElementById('toggle-custom-trophy');
  const calViewToggle = document.getElementById('toggle-calendar-view');
  const inlineCalToggle = document.getElementById('toggle-inline-calendar');

  if (lightToggle) lightToggle.addEventListener('change', () => {
    state.settings.lightMode = lightToggle.checked;
    saveState(); applySettingsUI();
  });
  if (trainToggle) trainToggle.addEventListener('change', () => {
    state.settings.allowCustomTrainees = trainToggle.checked;
    saveState(); applySettingsUI();
  });
  if (trophyToggle) trophyToggle.addEventListener('change', () => {
    state.settings.allowCustomTrophies = trophyToggle.checked;
    saveState(); applySettingsUI();
  });
  if (calViewToggle) calViewToggle.addEventListener('change', () => {
    state.settings.calendarViewMode = calViewToggle.checked;
    saveState(); applySettingsUI(); renderMainView();
  });
  if (inlineCalToggle) inlineCalToggle.addEventListener('change', () => {
    state.settings.inlineCalendar = inlineCalToggle.checked;
    saveState(); applySettingsUI(); renderMainView();
  });

  document.addEventListener('click', () => {
    closeSettingsPanel();
    if (calTraineePanelOpen) {
      calTraineePanelOpen = false;
      renderCalendarView();
    }
  });
}
init();