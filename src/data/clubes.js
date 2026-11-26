/* =====================================================================
   CLUBES POR PAÍS
   ---------------------------------------------------------------------
   Cada país tem duas divisões:
     grandes  → 1ª divisão, maiores clubes do país   (categoria "Clube grande")
     medios   → demais clubes da 1ª divisão           (categoria "Clube médio")
     div2     → 2ª divisão                            (categoria "Clube pequeno")
   Cada clube é [nome, força] ou [nome, força, "arquivo-do-escudo"] quando o nome do arquivo
   do pacote football-logos.cc não bate com o nome do clube. A força (0–100) só é usada para simular a
   classificação da liga dentro do próprio país — ela decide quem briga
   pelo título e quem corre risco de cair. O nível de jogo usado pelo
   mercado e pelos minutos continua vindo da categoria (ver engine/clubes.js).

   rebaixa: quantos clubes caem/sobem por temporada (0 = liga fechada). Brasil (4) e Argentina (2)
   seguem o regulamento real; os demais países têm listas reduzidas (9 a 14 clubes na 1ª divisão),
   então cai/sobe 1 por ano para manter a proporção parecida com a das ligas reais.
   Um clube grande que cair vira "pequeno" enquanto estiver na 2ª divisão.
   ===================================================================== */
export const PAISES = {
  "Brasil": {
    tier: 2, liga: "Brasileirão", copa: "Copa do Brasil", rebaixa: 4,
    divisoes: ["Série A", "Série B"],
    titulos: ["Campeonato Brasileiro", "Campeonato Brasileiro Série B"],
    grandes: [["Flamengo", 84], ["Palmeiras", 83], ["São Paulo", 78], ["Corinthians", 77]],
    medios: [
      ["Botafogo", 78], ["Cruzeiro", 78], ["Atlético Mineiro", 77], ["Fluminense", 77], ["Internacional", 76],
      ["Bahia", 76], ["Grêmio", 75], ["Vasco da Gama", 74], ["Santos", 73], ["RB Bragantino", 73],
      ["Mirassol", 72], ["Athletico Paranaense", 72], ["Vitória", 69], ["Coritiba", 69], ["Chapecoense", 66],
      ["Clube do Remo", 66]
    ],
    div2: [
      ["Fortaleza", 70], ["Ceará", 68], ["Sport Recife", 67], ["Juventude", 66], ["América Mineiro", 66],
      ["Goiás", 65], ["Cuiabá", 65], ["Novorizontino", 64], ["Atlético Goianiense", 64], ["Criciúma", 64],
      ["Avaí", 63], ["Vila Nova", 63], ["CRB", 62], ["Ponte Preta", 61], ["Náutico", 61],
      ["Operário Ferroviário", 61], ["Londrina", 60], ["Botafogo-SP", 60], ["São Bernardo", 60], ["Athletic-MG", 59]
    ]
  },
  "Argentina": {
    tier: 2, liga: "Liga Profesional", copa: "Copa Argentina", rebaixa: 2,
    divisoes: ["Primera División", "Primera Nacional"],
    titulos: ["Liga Profesional Argentina", "Primera Nacional"],
    grandes: [["River Plate", 80], ["Boca Juniors", 79], ["Racing Club", 76], ["Independiente", 73], ["San Lorenzo", 72]],
    medios: [
      ["Estudiantes de La Plata", 74], ["Vélez Sarsfield", 73], ["Talleres", 73], ["Lanús", 73], ["Rosario Central", 72],
      ["Argentinos Juniors", 71], ["Huracán", 70], ["Belgrano", 70], ["Defensa y Justicia", 69], ["Newell's Old Boys", 69],
      ["Platense", 68], ["Tigre", 68], ["Unión", 68], ["Instituto", 67], ["Gimnasia La Plata", 67],
      ["Independiente Rivadavia", 67], ["Atlético Tucumán", 67], ["Barracas Central", 66], ["Banfield", 66],
      ["Central Córdoba", 66], ["Sarmiento", 65], ["Deportivo Riestra", 65], ["Gimnasia de Mendoza", 64],
      ["Aldosivi", 64], ["Estudiantes de Río Cuarto", 63]
    ],
    // Primera Nacional: ainda sem pacote de escudos (aparecem as iniciais até as imagens serem adicionadas)
    div2: [
      ["San Martín de Tucumán", 63], ["Colón", 63], ["Quilmes", 61], ["Chacarita Juniors", 60], ["Ferro Carril Oeste", 60],
      ["All Boys", 59], ["Almirante Brown", 59], ["Atlanta", 59], ["Temperley", 58], ["Deportivo Morón", 58],
      ["Agropecuario", 57], ["Gimnasia de Jujuy", 57]
    ]
  },
  "Inglaterra": {
    tier: 1, liga: "Premier League", copa: "FA Cup", rebaixa: 3,
    divisoes: ["Premier League", "Championship"], titulos: ["Premier League", "EFL Championship"],
    grandes: [["Manchester City", 88], ["Liverpool", 88], ["Arsenal", 88], ["Chelsea", 84], ["Manchester United", 82]],
    medios: [["Tottenham", 80], ["Newcastle United", 80, "newcastle"], ["Aston Villa", 80], ["Brighton", 77], ["Nottingham Forest", 77],
      ["Crystal Palace", 76], ["Brentford", 75], ["Bournemouth", 75], ["Fulham", 74], ["Everton", 74], ["Leeds United", 72],
      ["Sunderland", 71], ["Ipswich Town", 70, "ipswich"], ["Coventry City", 70], ["Hull City", 69]],
    div2: [["West Ham", 72], ["Wolverhampton", 71, "wolves"], ["Burnley", 71], ["Southampton", 70], ["Sheffield United", 69],
      ["Middlesbrough", 68], ["Norwich City", 67], ["Watford", 67], ["West Bromwich Albion", 67], ["Stoke City", 66],
      ["Swansea City", 66], ["Bristol City", 66], ["Wrexham", 65], ["Birmingham City", 65, "birmingham"], ["Millwall", 65],
      ["Blackburn Rovers", 65], ["Queens Park Rangers", 64], ["Derby County", 64], ["Preston North End", 64], ["Portsmouth", 63],
      ["Cardiff City", 63], ["Charlton Athletic", 62, "charlton"], ["Bolton Wanderers", 62, "bolton"], ["Lincoln City", 60]]
  },
  "Espanha": {
    tier: 1, liga: "La Liga", copa: "Copa del Rey", rebaixa: 3,
    divisoes: ["La Liga", "Segunda División"], titulos: ["La Liga", "Segunda División"],
    grandes: [["Real Madrid", 88], ["Barcelona", 88], ["Atlético de Madrid", 84, "atletico-madrid"]],
    medios: [["Athletic Club", 79], ["Villarreal", 79], ["Real Betis", 77], ["Real Sociedad", 77], ["Sevilla", 75], ["Valencia", 75],
      ["Celta", 74], ["Osasuna", 73], ["Rayo Vallecano", 73], ["Getafe", 72], ["Espanyol", 72], ["Deportivo Alavés", 71, "deportivo"],
      ["Elche", 70], ["Levante", 69], ["Racing Santander", 69, "racing"], ["Málaga", 69], ["Deportivo La Coruña", 69]],
    // Segunda División: ainda sem pacote de escudos
    div2: [["Girona", 71], ["Mallorca", 70], ["Real Oviedo", 67], ["Las Palmas", 67], ["Real Valladolid", 66], ["Leganés", 66],
      ["Granada", 66], ["Almería", 66], ["Cádiz CF", 65], ["Eibar", 64], ["Sporting Gijón", 64], ["Real Zaragoza", 63]]
  },
  "França": {
    tier: 1, liga: "Ligue 1", copa: "Coupe de France", rebaixa: 2,
    divisoes: ["Ligue 1", "Ligue 2"], titulos: ["Ligue 1", "Ligue 2"],
    grandes: [["Paris Saint-Germain", 88], ["Marseille", 81], ["Olympique Lyonnais", 79]],
    medios: [["AS Monaco", 80], ["Lille", 78], ["Lens", 76, "rc-lens"], ["Nice", 75], ["Rennes", 75], ["Strasbourg", 74], ["Brest", 72],
      ["Toulouse", 72], ["Paris FC", 69], ["Lorient", 70], ["Auxerre", 70], ["Angers", 68], ["Le Havre", 68]],
    div2: [["Nantes", 70], ["AS Saint-Étienne", 69], ["Montpellier", 67], ["Stade de Reims", 67], ["FC Metz", 67], ["Guingamp", 65],
      ["Dunkerque", 64], ["Clermont Foot", 64], ["Stade Lavallois", 63], ["Red Star", 63, "red-star-fc"], ["Grenoble", 63, "grenoble-foot-38"],
      ["Pau", 63], ["Annecy", 63], ["Rodez", 62, "rodez-af"], ["Dijon", 62], ["Nancy", 62], ["Sochaux", 62], ["Boulogne", 60]]
  },
  "Alemanha": {
    tier: 1, liga: "Bundesliga", copa: "DFB-Pokal", rebaixa: 1,
    divisoes: ["Bundesliga", "2. Bundesliga"], titulos: ["Bundesliga", "2. Bundesliga"],
    grandes: [["Bayern München", 88], ["Borussia Dortmund", 83], ["Bayer Leverkusen", 82]],
    medios: [["RB Leipzig", 80], ["VfB Stuttgart", 78], ["Eintracht Frankfurt", 78], ["Freiburg", 76], ["Wolfsburg", 75], ["Borussia Mönchengladbach", 74], ["Hoffenheim", 74], ["Augsburg", 72], ["Hamburger SV", 71], ["Cologne", 71]],
    div2: [["Schalke 04", 69], ["VfL Bochum", 68], ["Holstein Kiel", 67], ["Hertha BSC", 67], ["Fortuna Düsseldorf", 66], ["Hannover 96", 66], ["Kaiserslautern", 65], ["Nürnberg", 64]]
  },
  "Itália": {
    tier: 1, liga: "Serie A", copa: "Coppa Italia", rebaixa: 3,
    divisoes: ["Serie A", "Serie B"], titulos: ["Serie A", "Serie B"],
    grandes: [["Inter", 86], ["Napoli", 85], ["Juventus", 84], ["Milan", 83]],
    medios: [["Atalanta", 81], ["Roma", 80], ["Como", 78, "como-1907"], ["Lazio", 77], ["Bologna", 77], ["Fiorentina", 75], ["Torino", 73],
      ["Udinese", 72], ["Genoa", 71], ["Parma", 70], ["Cagliari", 70], ["Sassuolo", 70], ["Lecce", 68], ["Monza", 68],
      ["Venezia", 67], ["Frosinone", 66]],
    // Serie B: ainda sem pacote de escudos
    div2: [["Hellas Verona", 67], ["Pisa", 66], ["Cremonese", 66], ["Empoli", 66], ["Palermo", 66], ["Sampdoria", 64],
      ["Spezia", 64], ["Bari", 63], ["Cesena", 62], ["Modena", 62]]
  },
  "Holanda": {
    tier: 2, liga: "Eredivisie", copa: "Copa da Holanda", rebaixa: 2,
    divisoes: ["Eredivisie", "Eerste Divisie"], titulos: ["Eredivisie", "Eerste Divisie"],
    grandes: [["PSV Eindhoven", 82, "psv"], ["Ajax", 81], ["Feyenoord", 81]],
    medios: [["AZ Alkmaar", 76], ["Twente", 74], ["FC Utrecht", 74], ["NEC Nijmegen", 71], ["Go Ahead Eagles", 70], ["sc Heerenveen", 70],
      ["Sparta Rotterdam", 69], ["FC Groningen", 69], ["Fortuna Sittard", 68], ["PEC Zwolle", 67], ["Excelsior", 67, "excelsior-rotterdam"],
      ["Telstar", 66], ["Willem II", 66], ["ADO Den Haag", 66], ["SC Cambuur", 65]],
    div2: [["Heracles Almelo", 66], ["NAC Breda", 66], ["RKC Waalwijk", 64], ["Almere City", 64], ["FC Volendam", 64], ["Roda JC", 63],
      ["De Graafschap", 63], ["FC Emmen", 62]]
  },
  "Portugal": {
    tier: 2, liga: "Primeira Liga", copa: "Taça de Portugal", rebaixa: 1,
    divisoes: ["Primeira Liga", "Liga 2"], titulos: ["Primeira Liga", "Liga Portugal 2"],
    grandes: [["Sporting CP", 83], ["Benfica", 83], ["FC Porto", 82]],
    medios: [["Braga", 77], ["Vitória Guimarães", 73], ["Famalicão", 71], ["Gil Vicente", 69], ["Rio Ave", 68], ["Moreirense", 68]],
    div2: [["Farense", 65], ["Portimonense", 64], ["Marítimo", 64], ["Académico de Viseu", 62], ["Leixões", 61], ["Feirense", 61]]
  },
  "Bélgica": {
    tier: 2, liga: "Pro League", copa: "Copa da Bélgica", rebaixa: 2, ajusteNivel: -1,
    divisoes: ["Pro League", "Challenger Pro League"], titulos: ["Pro League", "Challenger Pro League"],
    grandes: [["Club Brugge", 77], ["Union Saint-Gilloise", 76], ["Anderlecht", 75]],
    medios: [["Genk", 73], ["Gent", 72], ["Antwerp", 72], ["Standard Liège", 70], ["Mechelen", 69], ["Charleroi", 68], ["Westerlo", 68],
      ["Cercle Brugge", 67], ["OH Leuven", 67, "oud-heverlee-leuven"], ["Sint-Truiden", 66, "sint-truidense"], ["Zulte Waregem", 65],
      ["RAAL La Louvière", 64], ["Dender", 64]],
    div2: [["Kortrijk", 63], ["Beveren", 62], ["Lommel", 62], ["RWDM Brussels", 61], ["Patro Eisden", 60], ["Lierse", 60], ["Francs Borains", 59]]
  },
  "Turquia": {
    tier: 2, liga: "Süper Lig", copa: "Copa da Turquia", rebaixa: 3,
    divisoes: ["Süper Lig", "TFF 1. Lig"], titulos: ["Süper Lig", "TFF 1. Lig"],
    grandes: [["Galatasaray", 80], ["Fenerbahçe", 79], ["Beşiktaş", 77]],
    medios: [["Trabzonspor", 74], ["Başakşehir", 72], ["Samsunspor", 70], ["Göztepe", 70, "goztepe-izmir"], ["Eyüpspor", 68], ["Kasımpaşa", 68],
      ["Konyaspor", 68], ["Rizespor", 68], ["Alanyaspor", 68], ["Gaziantep", 67], ["Kocaelispor", 66], ["Gençlerbirliği", 66],
      ["Amed", 65], ["Çorum", 64], ["Erzurumspor", 64]],
    div2: [["Antalyaspor", 66], ["Kayserispor", 65], ["Sivasspor", 64], ["Fatih Karagümrük", 64], ["Bodrumspor", 63], ["Ankaragücü", 62],
      ["Hatayspor", 62], ["Bandırmaspor", 61]]
  },
  "Escócia": {
    tier: 2, liga: "Premiership", copa: "Scottish Cup", rebaixa: 1, ajusteNivel: -5,
    divisoes: ["Premiership", "Championship"], titulos: ["Scottish Premiership", "Scottish Championship"],
    grandes: [["Celtic", 76], ["Rangers", 75]],
    medios: [["Hearts", 68], ["Aberdeen", 67], ["Hibernian", 67], ["Dundee United", 65], ["Motherwell", 64], ["Kilmarnock", 63],
      ["St Mirren", 63], ["Dundee", 62], ["Falkirk", 62], ["St Johnstone", 61]],
    div2: [["Ross County", 60], ["Livingston", 60], ["Partick Thistle", 58], ["Raith Rovers", 57], ["Ayr United", 57], ["Dunfermline", 57],
      ["Queen's Park", 55], ["Greenock Morton", 55]]
  },
  "Romênia": {
    tier: 2, liga: "SuperLiga", copa: "Cupa României", rebaixa: 2, ajusteNivel: -6,
    divisoes: ["SuperLiga", "Liga 2"], titulos: ["SuperLiga", "Liga 2"],
    grandes: [["FCSB", 72], ["CFR Cluj", 70], ["Universitatea Craiova", 70, "u-craiova"], ["Rapid București", 68]],
    medios: [["Dinamo București", 67], ["Universitatea Cluj", 66, "u-cluj"], ["Farul Constanța", 66], ["Petrolul Ploiești", 64],
      ["Oțelul Galați", 64, "otelul"], ["Argeș Pitești", 63], ["Botoșani", 63], ["Sepsi", 63], ["UTA Arad", 63, "uta"],
      ["Corvinul Hunedoara", 62], ["Csíkszereda", 61], ["Voluntari", 61]],
    div2: [["Hermannstadt", 62], ["Gloria Buzău", 60], ["Poli Iași", 60], ["Chindia Târgoviște", 59], ["Concordia Chiajna", 58], ["CS Afumați", 57]]
  },
  "Rússia": {
    // Clubes russos estão suspensos das competições da UEFA desde 2022: não disputam a Champions League.
    tier: 2, liga: "Premier League Russa", copa: "Copa da Rússia", rebaixa: 2, ajusteNivel: -2, semUEFA: true,
    divisoes: ["Premier League Russa", "Primeira Liga (FNL)"], titulos: ["Premier League Russa", "Primeira Liga (FNL)"],
    grandes: [["Zenit", 79], ["Spartak Moscou", 75, "spartak-moskva"], ["CSKA Moscou", 75, "cska-moskva"], ["Lokomotiv Moscou", 74, "lokomotiv-moskva"]],
    medios: [["Krasnodar", 76], ["Dynamo Moscou", 72, "dynamo-moscow"], ["Rubin Kazan", 68, "rubin"], ["Rostov", 68], ["Akhmat", 66],
      ["Krylia Sovetov", 66, "krylya-sovetov"], ["Baltika", 66], ["Akron", 64], ["Dynamo Makhachkala", 64], ["Fakel", 63],
      ["Orenburg", 63], ["Rodina Moscou", 63, "rodina-moscow"]],
    div2: [["Torpedo Moscou", 62], ["Ural", 62], ["Sochi", 62], ["Chernomorets", 60], ["Shinnik", 59], ["Rotor Volgogrado", 59],
      ["SKA-Khabarovsk", 58], ["Arsenal Tula", 58]]
  },
  "México": {
    tier: 2, liga: "Liga MX", copa: "Copa MX", rebaixa: 0,   // Liga MX não tem acesso/rebaixamento
    divisoes: ["Liga MX", "Liga de Expansión"], titulos: ["Liga MX", "Liga de Expansión MX"],
    grandes: [["Club América", 80], ["Chivas Guadalajara", 77], ["Cruz Azul", 78]],
    medios: [["Tigres UANL", 78], ["Monterrey", 77], ["Toluca", 76], ["Pumas UNAM", 73], ["Pachuca", 73], ["León", 72], ["Santos Laguna", 70]],
    div2: [["Atlante", 63], ["Leones Negros", 62], ["Celaya", 61], ["Mineros de Zacatecas", 61], ["Tepatitlán", 60], ["Correcaminos", 59]]
  },
  "Estados Unidos": {
    tier: 2, liga: "MLS", copa: "U.S. Open Cup", rebaixa: 0,   // MLS é uma liga fechada (clubes dos EUA e do Canadá)
    divisoes: ["MLS", "USL Championship"], titulos: ["MLS Cup", "USL Championship"],
    grandes: [["Inter Miami", 78, "inter-miami-cf"], ["LAFC", 77, "los-angeles-fc"], ["LA Galaxy", 76]],
    medios: [["Columbus Crew", 75], ["FC Cincinnati", 74], ["Philadelphia Union", 74], ["Seattle Sounders", 73, "seattle-sounders-fc"],
      ["Vancouver Whitecaps", 73, "vancouver-whitecaps-fc"], ["San Diego FC", 72], ["Nashville SC", 72], ["Orlando City", 72],
      ["Minnesota United", 71, "minnesota-united-fc"], ["Charlotte FC", 71], ["New York City FC", 71], ["Atlanta United", 71],
      ["NY Red Bulls", 70, "new-york-red-bulls"], ["Real Salt Lake", 70], ["Portland Timbers", 70], ["Austin FC", 69, "austins-fc"],
      ["FC Dallas", 69], ["Houston Dynamo", 69], ["Chicago Fire", 69, "chicago-fire-fc"], ["Colorado Rapids", 68],
      ["New England Revolution", 68], ["Sporting Kansas City", 67], ["St. Louis City", 67, "st-louis-city-sc"], ["Toronto FC", 67],
      ["San Jose Earthquakes", 67], ["D.C. United", 66, "dc-united"], ["CF Montréal", 66]],
    div2: [["Louisville City", 62], ["Sacramento Republic", 61], ["Tampa Bay Rowdies", 61], ["New Mexico United", 60], ["Charleston Battery", 60], ["Colorado Springs Switchbacks", 59]]
  },
  "Japão": {
    tier: 2, liga: "J1 League", copa: "Copa do Imperador", rebaixa: 1,
    divisoes: ["J1 League", "J2 League"], titulos: ["J1 League", "J2 League"],
    grandes: [["Kashima Antlers", 76], ["Urawa Red Diamonds", 75], ["Yokohama F. Marinos", 75]],
    medios: [["Vissel Kobe", 76], ["Kawasaki Frontale", 74], ["Sanfrecce Hiroshima", 74], ["Gamba Osaka", 72], ["Cerezo Osaka", 71], ["FC Tokyo", 70]],
    div2: [["Hokkaido Consadole Sapporo", 66], ["Júbilo Iwata", 65], ["Sagan Tosu", 64], ["Vegalta Sendai", 63], ["Ventforet Kofu", 62], ["Oita Trinita", 62]]
  },
  "Arábia Saudita": {
    tier: 2, liga: "Saudi Pro League", copa: "Copa do Rei", rebaixa: 3, ajusteNivel: 2,
    divisoes: ["Saudi Pro League", "First Division League"], titulos: ["Saudi Pro League", "Saudi First Division League"],
    grandes: [["Al-Hilal", 82], ["Al-Nassr", 81], ["Al-Ittihad", 80], ["Al-Ahli", 79]],
    medios: [["Al-Qadsiah", 74], ["Al-Shabab", 72], ["Al-Ettifaq", 71], ["Al-Taawoun", 70], ["NEOM", 70], ["Al-Kholood", 68], ["Al-Fateh", 68],
      ["Al-Khaleej", 68], ["Al-Riyadh", 67], ["Al-Fayha", 67], ["Al-Hazem", 66], ["Al-Faisaly", 66, "al-faisaly-fc"], ["Abha", 65],
      ["Diriyah", 65, "diriyah-club"]],
    div2: [["Al-Wehda", 64], ["Damac", 63], ["Al-Raed", 63], ["Al-Orobah", 62], ["Al-Okhdood", 62], ["Al-Najma", 61], ["Al-Jabalain", 60], ["Al-Adalah", 60]]
  }
};

// Mercado de origem de quem não tem liga própria no jogo
export const LIGA_ORIGEM = {"Uruguai":"Argentina","Marrocos":"França","Nigéria":"Portugal","Croácia":"Itália","Coreia do Sul":"Japão","Nova Zelândia":"Estados Unidos"};

// Nomes curtos usados nos chips (compatibilidade com o código anterior)
export const LIGAS = Object.fromEntries(Object.entries(PAISES).map(([p, x]) => [p, x.liga]));
export const COPAS = Object.fromEntries(Object.entries(PAISES).map(([p, x]) => [p, x.copa]));
export const TITULOS_LIGA = Object.fromEntries(Object.entries(PAISES).map(([p, x]) => [p, x.titulos[0]]));

/* Quando o arquivo do escudo não tem o mesmo nome do clube ("São Paulo" -> "sao-paulo"),
   informe aqui o nome do arquivo (sem ".football-logos.cc.png"). */
export const LOGO_ALIAS = {
  "Argentinos Juniors": "argeninos-juniors",          // o arquivo do pacote veio com esse erro de digitação
  "Huracán": "ca-huracan",
  "Platense": "club-atletico-platanense",
  "Instituto": "instituto-cordoba",
  "San Lorenzo": "san-lorenzo-de-almagro",
  "Gimnasia de Mendoza": "gimnasia-y-esgrima",
  "Gimnasia La Plata": "gimnasia-lp",
  "Athletic-MG": "athletic"
};

// Cores principais (tingem linhas e cartões). Clubes preto e branco usam cinza claro.
export const CLUB_COLORS = {
 // Inglaterra
 "Manchester City":"#6CABDD","Liverpool FC":"#C8102E","Arsenal":"#EF0107","Chelsea":"#1d5fd1","Manchester United":"#DA291C",
 "Tottenham":"#5470c6","Aston Villa":"#9b2f55","Newcastle United":"#d9d9de","Brighton":"#0057B8","Crystal Palace":"#1B458F",
 "West Ham":"#7A263A","Everton":"#003399","Leicester City":"#003090","Southampton":"#D71920","Ipswich Town":"#3a64a3",
 "Sheffield United":"#EE2737","Middlesbrough":"#E11B22","Norwich City":"#00A650","Blackburn Rovers":"#2f9fe0","Birmingham City":"#2f4fe0",
 // Espanha
 "Real Madrid":"#e9c46a","Barcelona":"#a8265a","Atletico Madrid":"#CB3524","Athletic Club Bilbao":"#EE2523","Celta":"#8AC3EE",
 "Villarreal":"#FFE667","Real Sociedad":"#0067B1","Real Betis":"#0BB363","Sevilla":"#D81E05","Valencia":"#EE3524",
 "Getafe":"#2a6fb8","Espanyol":"#2a8fd6","Deportivo Alavés":"#2478c8","Las Palmas":"#FFE400","Real Valladolid":"#7a3fb8",
 "Leganés":"#2a62b0","Deportivo La Coruña":"#2a6cc0","Granada":"#b8283a","Almería":"#E2001A","Cádiz CF":"#e6c800","Eibar":"#a8222b",
 // França
 "Paris Saint-Germain":"#1f5fa8","Marseille":"#2FAEE0","Olympique Lyonnais":"#2a4faf","AS Monaco":"#E51B22","Lille":"#E01E13",
 "Lens":"#FFD400","Nice":"#D4151B","Rennes":"#E13327","Strasbourg":"#009FE3","Brest":"#E40520","Nantes":"#FBD61A",
 "Lorient FC":"#F58220","Auxerre":"#2a8fd6","AS Saint-Étienne":"#1F9B3B","Montpellier":"#F58220","Reims":"#E2001A",
 "Guingamp":"#E2001A","Troyes":"#2a62b0","Red Star":"#1f9d57",
 // Alemanha
 "Bayern München":"#DC052D","Borussia Dortmund":"#FDE100","Bayer Leverkusen":"#E32221","RB Leipzig":"#DD0741","VfB Stuttgart":"#E32219",
 "Eintracht Frankfurt":"#E1000F","Freiburg":"#E2001A","Wolfsburg":"#65B32E","Borussia Mönchengladbach":"#2a9d4f","Hoffenheim":"#2a6cc0",
 "Augsburg":"#BA3733","Hamburger SV":"#2a62b0","Cologne":"#ED1C24","Schalke 04":"#004D9D","VfL Bochum":"#005CA9",
 "Holstein Kiel":"#2a62b0","Hertha BSC":"#2a6cc0","Fortuna Düsseldorf":"#E2001A","Hannover 96":"#2a9d4f","Kaiserslautern":"#E2001A","Nürnberg":"#AA1124",
 // Itália
 "Inter":"#1d7fc4","Napoli":"#12A0D7","Juventus":"#d9d9de","Milan":"#FB090B","Atalanta":"#2a7fc8","Roma":"#e0a43a","Lazio":"#87D8F7",
 "Bologna":"#c23a4a","Fiorentina":"#7a3fb8","Torino":"#8A1E03","Udinese":"#d9d9de","Genoa":"#b82a40","Hellas Verona":"#e6c800",
 "Lecce":"#e6c800","Monza":"#D6202F","Empoli":"#2a62b0","Venezia":"#F26522","Palermo":"#F5B6CD","Sampdoria":"#2a62b0","Spezia":"#d9d9de",
 // Holanda
 "PSV Eindhoven":"#E2001A","Ajax":"#D2122E","Feyenoord":"#EE1D23","AZ Alkmaar":"#D6202F","Twente":"#E2001A","FC Utrecht":"#DA251D",
 "NEC Nijmegen":"#2a9d4f","sc Heerenveen":"#2a6cc0","Sparta Rotterdam":"#E2001A","FC Groningen":"#3E9E3E","Heracles Almelo":"#d9d9de",
 "Willem II":"#C8102E","RKC Waalwijk":"#FFD200","Almere City":"#E2001A","ADO Den Haag":"#2a9d4f","Roda JC":"#FFD200","De Graafschap":"#2a6cc0","Cambuur":"#FFD200",
 // Portugal
 "Sporting CP":"#00844C","Benfica":"#E2001A","FC Porto":"#2a62b0","Braga":"#D6202F","Vitória Guimarães":"#d9d9de","Famalicão":"#2a62b0",
 "Gil Vicente":"#C8102E","Rio Ave":"#1f9d57","Moreirense":"#1f9d57","Farense":"#d9d9de","Portimonense":"#d9d9de","Marítimo":"#1f9d57",
 "Académico de Viseu":"#e6c800","Leixões":"#C8102E","Feirense":"#2a62b0",
 // Brasil — Série A
 "Flamengo":"#C52613","Palmeiras":"#1f9d57","São Paulo":"#FE0000","Corinthians":"#d9d9de","Botafogo":"#d9d9de","Cruzeiro":"#2a62b0",
 "Atlético Mineiro":"#d9d9de","Fluminense":"#9b2748","Internacional":"#E2001A","Bahia":"#2a6cc0","Grêmio":"#0D80BF","Vasco da Gama":"#d9d9de",
 "Santos":"#d9d9de","RB Bragantino":"#E2001A","Mirassol":"#e6c800","Athletico Paranaense":"#CC0000","Vitória":"#D11A2A","Coritiba":"#1f9d57",
 "Chapecoense":"#1f9d57","Clube do Remo":"#2a62b0",
 // Brasil — Série B
 "Fortaleza":"#2a62b0","Ceará":"#d9d9de","Sport Recife":"#D7141A","Juventude":"#1f9d57","América Mineiro":"#1f9d57","Goiás":"#1f9d57",
 "Cuiabá":"#1f9d57","Novorizontino":"#e6c800","Atlético Goianiense":"#D7141A","Criciúma":"#e6c800","Avaí":"#2a6cc0","Vila Nova":"#D7141A",
 "CRB":"#D7141A","Ponte Preta":"#d9d9de","Náutico":"#D7141A","Operário Ferroviário":"#d9d9de","Londrina":"#2aa3dc","Botafogo-SP":"#D7141A",
 "São Bernardo":"#e6c800","Athletic-MG":"#d9d9de",
 // Argentina
 "River Plate":"#E2001A","Boca Juniors":"#2a5fb8","Racing Club":"#00AEEF","Independiente":"#CE1126","San Lorenzo":"#2a3f8f",
 "Estudiantes de La Plata":"#E2001A","Vélez Sarsfield":"#2a62b0","Talleres":"#2a3f8f","Lanús":"#8A1538","Rosario Central":"#2a62b0",
 "Argentinos Juniors":"#E2001A","Huracán":"#d9d9de","Belgrano":"#6CB4E4","Defensa y Justicia":"#1f9d57","Newell's Old Boys":"#D40000",
 "Platense":"#8B5A2B","Tigre":"#2a3f8f","Unión":"#E2001A","Instituto":"#E2001A","Gimnasia La Plata":"#2a3f8f",
 "Independiente Rivadavia":"#2a3f8f","Atlético Tucumán":"#6CB4E4","Barracas Central":"#E2001A","Banfield":"#1f9d57","Central Córdoba":"#d9d9de",
 "Sarmiento":"#1f9d57","Deportivo Riestra":"#d9d9de","Gimnasia de Mendoza":"#d9d9de","Aldosivi":"#1f9d57","Estudiantes de Río Cuarto":"#2a62b0",
 "San Martín de Tucumán":"#E2001A","Colón":"#E2001A","Quilmes":"#d9d9de","Chacarita Juniors":"#E2001A","Ferro Carril Oeste":"#1f9d57",
 "All Boys":"#d9d9de","Almirante Brown":"#e6c800","Atlanta":"#2a62b0","Temperley":"#6CB4E4","Deportivo Morón":"#E2001A",
 "Agropecuario":"#1f9d57","Gimnasia de Jujuy":"#2a3f8f",
 // México
 "Club América":"#FFCD00","Chivas Guadalajara":"#C8102E","Cruz Azul":"#2a62b0","Tigres UANL":"#FFB612","Monterrey":"#2a62b0",
 "Toluca":"#D7141A","Pumas UNAM":"#2a3f8f","Pachuca":"#2a62b0","León":"#1f9d57","Santos Laguna":"#00A651",
 "Atlante":"#2a3f8f","Leones Negros":"#C8102E","Celaya":"#2a62b0","Mineros de Zacatecas":"#2a62b0","Tepatitlán":"#2a62b0","Correcaminos":"#F58220",
 // Estados Unidos
 "Inter Miami":"#F5B6CD","LAFC":"#C39E6D","LA Galaxy":"#2a4fa8","Columbus Crew":"#FEDD00","FC Cincinnati":"#F05323",
 "Philadelphia Union":"#2a3f8f","Seattle Sounders":"#5D9741","Orlando City":"#7a3fb8","Atlanta United":"#a8222b","NY Red Bulls":"#ED1E36",
 "Louisville City":"#7a3fb8","Sacramento Republic":"#C8102E","Tampa Bay Rowdies":"#2a9d4f","New Mexico United":"#e6c800",
 "Charleston Battery":"#e6c800","Colorado Springs Switchbacks":"#2a3f8f",
 // Japão
 "Kashima Antlers":"#b8203f","Urawa Red Diamonds":"#E50012","Yokohama F. Marinos":"#2a5fb8","Vissel Kobe":"#a8203f",
 "Kawasaki Frontale":"#2aa3dc","Sanfrecce Hiroshima":"#6E3E99","Gamba Osaka":"#2a4faf","Cerezo Osaka":"#E4007F","FC Tokyo":"#2a4faf",
 "Hokkaido Consadole Sapporo":"#C8102E","Júbilo Iwata":"#6CB4E4","Sagan Tosu":"#6CB4E4","Vegalta Sendai":"#e6c800","Ventforet Kofu":"#2a62b0","Oita Trinita":"#2a62b0",
 // Arábia Saudita
 "Al-Hilal":"#2a6fd0","Al-Nassr":"#FFD200","Al-Ittihad":"#FFD100","Al-Ahli":"#00A651","Al-Qadsiah":"#C8102E","Al-Shabab":"#d9d9de",
 "Al-Ettifaq":"#00A651","Al-Taawoun":"#e6c800","Al-Fateh":"#00A651","Al-Wehda":"#C8102E","Al-Raed":"#C8102E","Al-Orobah":"#2a62b0",
 "Al-Faisaly":"#e6c800","Al-Jabalain":"#C8102E","Al-Adalah":"#1f9d57"
};
