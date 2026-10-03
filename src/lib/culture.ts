// Une note culturelle par semaine (15 semaines couvrent les 100 jours)
export const CULTURE: [title: string, text: string][] = [
  ["Trois langues officielles", "Le luxembourgeois est la langue nationale depuis la loi de 1984. Le français et l'allemand sont aussi langues officielles : on passe souvent de l'une à l'autre dans la même conversation."],
  ["Moien toute la journée", "« Moien » se dit du matin au soir, au travail comme entre amis. Pour partir, on dit « Äddi ». Entre proches, on se fait souvent trois bises."],
  ["La Schueberfouer", "Fin août et début septembre, la grande foire de Luxembourg-ville s'installe au Glacis. Elle existe depuis 1340, quand Jean l'Aveugle a créé un marché à cet endroit."],
  ["Judd mat Gaardebounen", "Le plat national : du collier de porc fumé servi avec des fèves des marais et des pommes de terre. Vous connaissez déjà « Gromper » !"],
  ["La fête nationale", "Le 23 juin, on célèbre l'anniversaire officiel du Grand-Duc. La veille au soir : retraite aux flambeaux et feu d'artifice au-dessus de la vallée de la Pétrusse."],
  ["Ons Heemecht", "« Notre patrie » est l'hymne national. Le texte est de Michel Lentz, la musique de Jean-Antoine Zinnen."],
  ["Mir wëlle bleiwe wat mir sinn", "« Nous voulons rester ce que nous sommes » : la devise nationale. Vous reconnaissez « mir », « wëllen », « bleiwen » et « sinn » !"],
  ["Les transports gratuits", "Depuis le 29 février 2020, bus, trains et trams sont gratuits dans tout le pays (hors première classe). « Den Zuch » et « de Bus » ne coûtent rien."],
  ["Gromperekichelcher", "Ces galettes de pommes de terre frites se mangent sur les marchés de Noël et à la Schueberfouer, souvent avec de la compote de pommes."],
  ["L'Éimaischen", "Le lundi de Pâques, à Luxembourg-ville et à Nospelt, un marché vend les « Péckvillercher », de petits sifflets en terre cuite en forme d'oiseau."],
  ["Le Buergbrennen", "Le premier dimanche du Carême, les villages allument un grand feu pour chasser l'hiver. « De Wanter » s'en va !"],
  ["Liichtmëssdag", "Le 2 février, les enfants vont de porte en porte avec une lanterne en chantant « Léiwer Härgottsblieschen » et reçoivent des bonbons."],
  ["La règle du n", "Le « n » final tombe devant la plupart des consonnes : « ech hunn en Auto » mais « ech hu fënnef Euro ». Il reste devant une voyelle et devant d, t, z, n, h."],
  ["La Moselle et le crémant", "Le long de la Moselle, de Schengen à Wasserbillig, poussent les vignes du riesling et du crémant de Luxembourg. « Prost ! »"],
  ["Bravo, Dir hutt et gepackt !", "« Vous avez réussi ! » Continuez à écouter la radio, à lire et à dire « Moien » partout : chaque jour compte."]
];

export function cultureForDay(day: number) {
  const i = Math.min(CULTURE.length - 1, Math.floor((Math.min(day, 100) - 1) / 7));
  return { week: i + 1, title: CULTURE[i][0], text: CULTURE[i][1] };
}
