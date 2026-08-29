/** ISO 3166-1 alpha-2 codes with Unicode flag emoji sequences (CLDR / emoji-data). */
const ISO_FLAG_CODES =
  'AC AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CP CR CU CV CW CX CY CZ DE DG DJ DK DM DO DZ EA EC EE EG EH ER ES ET EU FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU IC ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TA TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM UN US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW'.split(
    ' ',
  );

const REGIONAL_INDICATOR_BASE = 0x1f1e6;

export function countryCodeToFlag(countryCode: string): string {
  return String.fromCodePoint(
    ...countryCode.split('').map((char) => REGIONAL_INDICATOR_BASE - 65 + char.charCodeAt(0)),
  );
}

export function flagEmojiToIsoCode(flag: string): string | null {
  const points: number[] = [];
  for (let index = 0; index < flag.length; ) {
    const codePoint = flag.codePointAt(index);
    if (codePoint == null) {
      return null;
    }
    points.push(codePoint);
    index += codePoint > 0xffff ? 2 : 1;
  }
  if (points.length !== 2) {
    return null;
  }
  if (
    points[0] < REGIONAL_INDICATOR_BASE ||
    points[0] > REGIONAL_INDICATOR_BASE + 25 ||
    points[1] < REGIONAL_INDICATOR_BASE ||
    points[1] > REGIONAL_INDICATOR_BASE + 25
  ) {
    return null;
  }
  return String.fromCharCode(
    points[0] - REGIONAL_INDICATOR_BASE + 65,
    points[1] - REGIONAL_INDICATOR_BASE + 65,
  );
}

export function isCountryFlagEmoji(sticker: string): boolean {
  return flagEmojiToIsoCode(sticker) != null;
}

/** PNG flag image — Windows and many desktops do not render flag emoji glyphs. */
export function countryFlagImageUrl(isoCode: string, width = 40): string {
  return `https://flagcdn.com/w${width}/${isoCode.toLowerCase()}.png`;
}

const SPECIAL_FLAGS = [
  '🏳️',
  '🏴',
  '🏁',
  '🚩',
  '🏳️‍🌈',
  '🏳️‍⚧️',
  '🏴‍☠️',
] as const;

export const COUNTRY_FLAG_STICKERS: readonly string[] = [
  ...SPECIAL_FLAGS,
  ...ISO_FLAG_CODES.map(countryCodeToFlag),
];

export const COUNTRY_FLAG_COUNT = COUNTRY_FLAG_STICKERS.length;

/** Split text into segments, separating ISO country flag emoji for image rendering. */
export function splitTextWithCountryFlags(text: string): Array<{ type: 'text'; value: string } | { type: 'flag'; iso: string; emoji: string }> {
  const segments: Array<{ type: 'text'; value: string } | { type: 'flag'; iso: string; emoji: string }> = [];
  const flagPattern = /[\u{1F1E6}-\u{1F1FF}][\u{1F1E6}-\u{1F1FF}]/gu;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = flagPattern.exec(text)) !== null) {
    const emoji = match[0];
    const iso = flagEmojiToIsoCode(emoji);
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    if (iso) {
      segments.push({ type: 'flag', iso, emoji });
    } else {
      segments.push({ type: 'text', value: emoji });
    }
    lastIndex = match.index + emoji.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: text }];
}
