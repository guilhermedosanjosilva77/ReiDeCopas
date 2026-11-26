/* ===================== SELEÇÕES (c = confederação, r = força 0–100, iso = bandeira) ===================== */
export const SELECOES = {
 // UEFA
 "França":{c:"UEFA",r:90,iso:"fr"},"Espanha":{c:"UEFA",r:90,iso:"es"},"Inglaterra":{c:"UEFA",r:89,iso:"gb-eng"},
 "Alemanha":{c:"UEFA",r:87,iso:"de"},"Portugal":{c:"UEFA",r:87,iso:"pt"},"Holanda":{c:"UEFA",r:86,iso:"nl"},
 "Itália":{c:"UEFA",r:84,iso:"it"},"Bélgica":{c:"UEFA",r:82,iso:"be"},"Croácia":{c:"UEFA",r:82,iso:"hr"},
 "Dinamarca":{c:"UEFA",r:78,iso:"dk"},"Suíça":{c:"UEFA",r:77,iso:"ch"},"Áustria":{c:"UEFA",r:76,iso:"at"},
 "Turquia":{c:"UEFA",r:76,iso:"tr"},"Noruega":{c:"UEFA",r:75,iso:"no"},"Sérvia":{c:"UEFA",r:74,iso:"rs"},
 "Ucrânia":{c:"UEFA",r:74,iso:"ua"},"Polônia":{c:"UEFA",r:73,iso:"pl"},"Suécia":{c:"UEFA",r:73,iso:"se"},
 "Escócia":{c:"UEFA",r:72,iso:"gb-sct"},"República Tcheca":{c:"UEFA",r:72,iso:"cz"},"Hungria":{c:"UEFA",r:71,iso:"hu"},
 "País de Gales":{c:"UEFA",r:68,iso:"gb-wls"},"Grécia":{c:"UEFA",r:68,iso:"gr"},"Romênia":{c:"UEFA",r:67,iso:"ro"},
 "Eslováquia":{c:"UEFA",r:66,iso:"sk"},"Irlanda":{c:"UEFA",r:64,iso:"ie"},"Eslovênia":{c:"UEFA",r:64,iso:"si"},
 "Albânia":{c:"UEFA",r:62,iso:"al"},"Geórgia":{c:"UEFA",r:62,iso:"ge"},"Islândia":{c:"UEFA",r:60,iso:"is"},
 // CONMEBOL
 "Argentina":{c:"CONMEBOL",r:92,iso:"ar"},"Brasil":{c:"CONMEBOL",r:91,iso:"br"},"Uruguai":{c:"CONMEBOL",r:83,iso:"uy"},
 "Colômbia":{c:"CONMEBOL",r:82,iso:"co"},"Equador":{c:"CONMEBOL",r:76,iso:"ec"},"Paraguai":{c:"CONMEBOL",r:70,iso:"py"},
 "Chile":{c:"CONMEBOL",r:70,iso:"cl"},"Peru":{c:"CONMEBOL",r:66,iso:"pe"},"Venezuela":{c:"CONMEBOL",r:65,iso:"ve"},
 "Bolívia":{c:"CONMEBOL",r:58,iso:"bo"},
 // CAF
 "Marrocos":{c:"CAF",r:80,iso:"ma"},"Senegal":{c:"CAF",r:78,iso:"sn"},"Nigéria":{c:"CAF",r:74,iso:"ng"},
 "Costa do Marfim":{c:"CAF",r:74,iso:"ci"},"Egito":{c:"CAF",r:72,iso:"eg"},"Argélia":{c:"CAF",r:72,iso:"dz"},
 "Camarões":{c:"CAF",r:70,iso:"cm"},"Tunísia":{c:"CAF",r:70,iso:"tn"},"Gana":{c:"CAF",r:70,iso:"gh"},
 "Mali":{c:"CAF",r:68,iso:"ml"},"RD Congo":{c:"CAF",r:64,iso:"cd"},"Burkina Faso":{c:"CAF",r:64,iso:"bf"},
 "África do Sul":{c:"CAF",r:62,iso:"za"},"Cabo Verde":{c:"CAF",r:60,iso:"cv"},"Guiné":{c:"CAF",r:60,iso:"gn"},
 "Zâmbia":{c:"CAF",r:58,iso:"zm"},"Angola":{c:"CAF",r:58,iso:"ao"},"Gabão":{c:"CAF",r:58,iso:"ga"},
 "Benim":{c:"CAF",r:56,iso:"bj"},"Moçambique":{c:"CAF",r:54,iso:"mz"},"Uganda":{c:"CAF",r:54,iso:"ug"},
 "Tanzânia":{c:"CAF",r:52,iso:"tz"},"Sudão":{c:"CAF",r:52,iso:"sd"},"Zimbábue":{c:"CAF",r:52,iso:"zw"},
 "Guiné Equatorial":{c:"CAF",r:52,iso:"gq"},"Quênia":{c:"CAF",r:50,iso:"ke"},"Namíbia":{c:"CAF",r:50,iso:"na"},
 "Madagascar":{c:"CAF",r:48,iso:"mg"},"Congo":{c:"CAF",r:48,iso:"cg"},
 // AFC
 "Japão":{c:"AFC",r:80,iso:"jp"},"Coreia do Sul":{c:"AFC",r:78,iso:"kr"},"Irã":{c:"AFC",r:76,iso:"ir"},
 "Austrália":{c:"AFC",r:74,iso:"au"},"Arábia Saudita":{c:"AFC",r:70,iso:"sa"},"Catar":{c:"AFC",r:66,iso:"qa"},
 "Uzbequistão":{c:"AFC",r:64,iso:"uz"},"Iraque":{c:"AFC",r:62,iso:"iq"},"Jordânia":{c:"AFC",r:62,iso:"jo"},
 "Emirados Árabes":{c:"AFC",r:60,iso:"ae"},"China":{c:"AFC",r:58,iso:"cn"},"Omã":{c:"AFC",r:56,iso:"om"},
 "Bahrein":{c:"AFC",r:54,iso:"bh"},"Síria":{c:"AFC",r:54,iso:"sy"},"Palestina":{c:"AFC",r:52,iso:"ps"},
 "Kuwait":{c:"AFC",r:52,iso:"kw"},"Tailândia":{c:"AFC",r:52,iso:"th"},"Vietnã":{c:"AFC",r:50,iso:"vn"},
 "Indonésia":{c:"AFC",r:50,iso:"id"},"Índia":{c:"AFC",r:48,iso:"in"},"Líbano":{c:"AFC",r:48,iso:"lb"},
 "Quirguistão":{c:"AFC",r:48,iso:"kg"},"Tadjiquistão":{c:"AFC",r:48,iso:"tj"},"Coreia do Norte":{c:"AFC",r:50,iso:"kp"},
 "Hong Kong":{c:"AFC",r:42,iso:"hk"},"Bangladesh":{c:"AFC",r:40,iso:"bd"},"Singapura":{c:"AFC",r:40,iso:"sg"},
 "Malásia":{c:"AFC",r:42,iso:"my"},
 // CONCACAF
 "Estados Unidos":{c:"CONCACAF",r:77,iso:"us"},"México":{c:"CONCACAF",r:77,iso:"mx"},"Canadá":{c:"CONCACAF",r:72,iso:"ca"},
 "Panamá":{c:"CONCACAF",r:66,iso:"pa"},"Costa Rica":{c:"CONCACAF",r:64,iso:"cr"},"Jamaica":{c:"CONCACAF",r:62,iso:"jm"},
 "Honduras":{c:"CONCACAF",r:58,iso:"hn"},"Haiti":{c:"CONCACAF",r:54,iso:"ht"},"El Salvador":{c:"CONCACAF",r:54,iso:"sv"},
 "Guatemala":{c:"CONCACAF",r:52,iso:"gt"},"Curaçao":{c:"CONCACAF",r:52,iso:"cw"},"Trinidad e Tobago":{c:"CONCACAF",r:50,iso:"tt"},
 "Suriname":{c:"CONCACAF",r:50,iso:"sr"},"Nicarágua":{c:"CONCACAF",r:45,iso:"ni"},"República Dominicana":{c:"CONCACAF",r:44,iso:"do"},"Cuba":{c:"CONCACAF",r:43,iso:"cu"},
 // OFC
 "Nova Zelândia":{c:"OFC",r:55,iso:"nz"},"Fiji":{c:"OFC",r:42,iso:"fj"},"Nova Caledônia":{c:"OFC",r:40,iso:"nc"},
 "Ilhas Salomão":{c:"OFC",r:38,iso:"sb"},"Taiti":{c:"OFC",r:38,iso:"pf"},"Vanuatu":{c:"OFC",r:36,iso:"vu"},
 "Papua Nova Guiné":{c:"OFC",r:34,iso:"pg"},"Samoa":{c:"OFC",r:32,iso:"ws"}
};
export const membros = c => Object.keys(SELECOES).filter(n => SELECOES[n].c===c);
