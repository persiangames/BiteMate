export interface CountryRecord {
  name: string;
  iso: string;
  cities: string[];
}

export const WORLD_COUNTRIES: CountryRecord[] = [
  {
    name: 'Afghanistan',
    iso: 'AF',
    cities: [
      'Kabul', 'Kandahar', 'Herat', 'Mazar-i-Sharif', 'Jalalabad', 'Kunduz', 'Ghazni', 'Balkh',
      'Bamyan', 'Farah', 'Helmand', 'Nangarhar', 'Paktia', 'Paktika', 'Badakhshan', 'Takhar',
      'Baghlan', 'Samangan', 'Faryab', 'Jowzjan', 'Sar-e Pol', 'Ghor', 'Daykundi', 'Uruzgan',
      'Zabul', 'Nimroz', 'Badghis', 'Parwan', 'Kapisa', 'Logar', 'Wardak', 'Khost', 'Nuristan', 'Panjshir', 'Laghman',
    ],
  },
  { name: 'Albania', iso: 'AL', cities: ['Tirana', 'Durres', 'Vlore', 'Shkoder', 'Elbasan', 'Fier', 'Korce', 'Berat', 'Gjirokaster', 'Lezhe', 'Diber', 'Kukes'] },
  {
    name: 'Algeria',
    iso: 'DZ',
    cities: [
      'Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Setif', 'Batna', 'Tlemcen', 'Bejaia',
      'Tizi Ouzou', 'Biskra', 'Bechar', 'Ouargla', 'Ghardaia', 'Tamanrasset', 'Adrar', 'El Oued',
      'Jijel', 'Skikda', 'Mostaganem', 'Chlef', 'Medea', 'Msila', 'Laghouat', 'El Tarf', 'Tipaza',
    ],
  },
  {
    name: 'Argentina',
    iso: 'AR',
    cities: [
      'Buenos Aires', 'Cordoba', 'Rosario', 'Mendoza', 'San Miguel de Tucuman', 'La Plata', 'Mar del Plata',
      'Salta', 'Santa Fe', 'San Juan', 'Resistencia', 'Santiago del Estero', 'Corrientes', 'Posadas',
      'Neuquen', 'Bahia Blanca', 'Parana', 'Formosa', 'San Salvador de Jujuy', 'Catamarca', 'La Rioja',
      'Rio Gallegos', 'Ushuaia', 'Rawson', 'Viedma', 'Santa Rosa',
    ],
  },
  { name: 'Armenia', iso: 'AM', cities: ['Yerevan', 'Gyumri', 'Vanadzor', 'Vagharshapat', 'Hrazdan', 'Kapan', 'Armavir', 'Gavar', 'Ijevan', 'Artashat'] },
  {
    name: 'Australia',
    iso: 'AU',
    cities: [
      'New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania',
      'Australian Capital Territory', 'Northern Territory',
      'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Hobart', 'Canberra', 'Darwin',
      'Gold Coast', 'Newcastle', 'Wollongong', 'Geelong', 'Cairns', 'Townsville', 'Alice Springs',
    ],
  },
  {
    name: 'Austria',
    iso: 'AT',
    cities: [
      'Vienna', 'Lower Austria', 'Upper Austria', 'Styria', 'Tyrol', 'Carinthia', 'Salzburg', 'Vorarlberg', 'Burgenland',
      'Graz', 'Linz', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'Sankt Polten', 'Dornbirn', 'Bregenz', 'Eisenstadt',
    ],
  },
  { name: 'Azerbaijan', iso: 'AZ', cities: ['Baku', 'Ganja', 'Sumqayit', 'Mingachevir', 'Lankaran', 'Shaki', 'Nakhchivan', 'Shirvan', 'Yevlakh', 'Khachmaz', 'Quba', 'Shamakhi'] },
  { name: 'Bahrain', iso: 'BH', cities: ['Capital', 'Muharraq', 'Northern', 'Southern', 'Manama', 'Riffa', 'Muharraq City', 'Hamad Town', 'Isa Town', 'Sitra'] },
  {
    name: 'Bangladesh',
    iso: 'BD',
    cities: [
      'Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Rangpur', 'Sylhet', 'Barisal', 'Mymensingh',
      'Comilla', 'Narayanganj', 'Gazipur', 'Bogura', 'Jessore', 'Cox\'s Bazar',
    ],
  },
  { name: 'Belarus', iso: 'BY', cities: ['Minsk', 'Brest', 'Gomel', 'Grodno', 'Mogilev', 'Vitebsk', 'Babruysk', 'Baranavichy', 'Barysaw', 'Pinsk'] },
  {
    name: 'Belgium',
    iso: 'BE',
    cities: [
      'Brussels', 'Flanders', 'Wallonia', 'Antwerp', 'East Flanders', 'West Flanders', 'Limburg',
      'Flemish Brabant', 'Hainaut', 'Liege', 'Luxembourg', 'Namur', 'Walloon Brabant',
      'Ghent', 'Bruges', 'Charleroi', 'Leuven', 'Namur City', 'Mons', 'Ostend',
    ],
  },
  { name: 'Bolivia', iso: 'BO', cities: ['La Paz', 'Santa Cruz', 'Cochabamba', 'Oruro', 'Potosi', 'Tarija', 'Chuquisaca', 'Beni', 'Pando', 'Sucre', 'El Alto'] },
  { name: 'Bosnia and Herzegovina', iso: 'BA', cities: ['Federation of Bosnia and Herzegovina', 'Republika Srpska', 'Brcko District', 'Sarajevo', 'Banja Luka', 'Tuzla', 'Zenica', 'Mostar', 'Bijeljina', 'Prijedor'] },
  {
    name: 'Brazil',
    iso: 'BR',
    cities: [
      'Acre', 'Alagoas', 'Amapa', 'Amazonas', 'Bahia', 'Ceara', 'Distrito Federal', 'Espirito Santo',
      'Goias', 'Maranhao', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Para', 'Paraiba',
      'Parana', 'Pernambuco', 'Piaui', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul',
      'Rondonia', 'Roraima', 'Santa Catarina', 'Sao Paulo', 'Sergipe', 'Tocantins',
      'Brasilia', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre', 'Belem', 'Goiania', 'Guarulhos', 'Campinas',
    ],
  },
  { name: 'Bulgaria', iso: 'BG', cities: ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Sliven', 'Dobrich', 'Shumen', 'Pernik', 'Haskovo', 'Blagoevgrad', 'Veliko Tarnovo'] },
  { name: 'Cambodia', iso: 'KH', cities: ['Phnom Penh', 'Siem Reap', 'Battambang', 'Sihanoukville', 'Kampong Cham', 'Kampot', 'Kandal', 'Takeo', 'Prey Veng', 'Banteay Meanchey'] },
  {
    name: 'Canada',
    iso: 'CA',
    cities: [
      'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia',
      'New Brunswick', 'Newfoundland and Labrador', 'Prince Edward Island', 'Northwest Territories', 'Yukon', 'Nunavut',
      'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City',
      'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Saskatoon', 'Regina',
    ],
  },
  { name: 'Chile', iso: 'CL', cities: ['Santiago', 'Valparaiso', 'Concepcion', 'La Serena', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca', 'Arica', 'Iquique', 'Puerto Montt', 'Punta Arenas', 'Valdivia', 'Coquimbo', 'Tarapaca', 'Atacama', 'Maule', 'Biobio', 'Araucania', 'Los Lagos', 'Aysen', 'Magallanes'] },
  {
    name: 'China',
    iso: 'CN',
    cities: [
      'Beijing', 'Tianjin', 'Shanghai', 'Chongqing',
      'Hebei', 'Shanxi', 'Liaoning', 'Jilin', 'Heilongjiang', 'Jiangsu', 'Zhejiang', 'Anhui',
      'Fujian', 'Jiangxi', 'Shandong', 'Henan', 'Hubei', 'Hunan', 'Guangdong', 'Hainan',
      'Sichuan', 'Guizhou', 'Yunnan', 'Shaanxi', 'Gansu', 'Qinghai',
      'Inner Mongolia', 'Guangxi', 'Tibet', 'Ningxia', 'Xinjiang',
      'Hong Kong', 'Macau',
      'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Wuhan', 'Xian', 'Nanjing', 'Suzhou', 'Qingdao', 'Dalian', 'Xiamen', 'Harbin', 'Changsha', 'Zhengzhou', 'Kunming', 'Urumqi',
    ],
  },
  {
    name: 'Colombia',
    iso: 'CO',
    cities: [
      'Amazonas', 'Antioquia', 'Arauca', 'Atlantico', 'Bolivar', 'Boyaca', 'Caldas', 'Caqueta', 'Casanare',
      'Cauca', 'Cesar', 'Choco', 'Cordoba', 'Cundinamarca', 'Guainia', 'Guaviare', 'Huila', 'La Guajira',
      'Magdalena', 'Meta', 'Narino', 'Norte de Santander', 'Putumayo', 'Quindio', 'Risaralda',
      'San Andres y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupes', 'Vichada',
      'Bogota', 'Medellin', 'Cali', 'Barranquilla', 'Cartagena', 'Cucuta', 'Bucaramanga', 'Pereira', 'Santa Marta',
    ],
  },
  { name: 'Costa Rica', iso: 'CR', cities: ['San Jose', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limon'] },
  { name: 'Croatia', iso: 'HR', cities: ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula', 'Slavonski Brod', 'Karlovac', 'Varazdin', 'Sibenik', 'Dubrovnik', 'Bjelovar', 'Sisak', 'Vukovar'] },
  { name: 'Czechia', iso: 'CZ', cities: ['Prague', 'Central Bohemia', 'South Bohemia', 'Plzen', 'Karlovy Vary', 'Usti nad Labem', 'Liberec', 'Hradec Kralove', 'Pardubice', 'Vysocina', 'South Moravia', 'Olomouc', 'Zlin', 'Moravian-Silesian', 'Brno', 'Ostrava'] },
  { name: 'Denmark', iso: 'DK', cities: ['Capital Region', 'Central Denmark', 'North Denmark', 'Zealand', 'Southern Denmark', 'Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers', 'Kolding', 'Horsens', 'Vejle', 'Roskilde'] },
  {
    name: 'Egypt',
    iso: 'EG',
    cities: [
      'Cairo', 'Giza', 'Alexandria', 'Qalyubia', 'Port Said', 'Suez', 'Dakahlia', 'Sharqia', 'Gharbia',
      'Monufia', 'Beheira', 'Kafr El Sheikh', 'Damietta', 'Ismailia', 'Faiyum', 'Beni Suef', 'Minya',
      'Asyut', 'Sohag', 'Qena', 'Luxor', 'Aswan', 'Red Sea', 'New Valley', 'Matrouh', 'North Sinai', 'South Sinai',
      'Hurghada', 'Sharm El Sheikh', 'Mansoura', 'Tanta',
    ],
  },
  { name: 'Estonia', iso: 'EE', cities: ['Harju', 'Tartu', 'Ida-Viru', 'Parnu', 'Laine-Viru', 'Viljandi', 'Rapla', 'Voru', 'Saare', 'Jogeva', 'Jarva', 'Valga', 'Polva', 'Laane', 'Hiiu', 'Tallinn'] },
  { name: 'Ethiopia', iso: 'ET', cities: ['Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa', 'Gambela', 'Harari', 'Oromia', 'Sidama', 'Somali', 'South Ethiopia', 'South West Ethiopia', 'Tigray', 'Central Ethiopia'] },
  { name: 'Finland', iso: 'FI', cities: ['Uusimaa', 'Southwest Finland', 'Satakunta', 'Kanta-Hame', 'Pirkanmaa', 'Paijat-Hame', 'Kymenlaakso', 'South Karelia', 'South Savo', 'North Savo', 'North Karelia', 'Central Finland', 'South Ostrobothnia', 'Ostrobothnia', 'Central Ostrobothnia', 'North Ostrobothnia', 'Kainuu', 'Lapland', 'Aland', 'Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku'] },
  {
    name: 'France',
    iso: 'FR',
    cities: [
      'Ile-de-France', 'Auvergne-Rhone-Alpes', 'Provence-Alpes-Cote d\'Azur', 'Occitanie', 'Nouvelle-Aquitaine',
      'Hauts-de-France', 'Grand Est', 'Pays de la Loire', 'Brittany', 'Normandy', 'Bourgogne-Franche-Comte',
      'Centre-Val de Loire', 'Corsica',
      'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg', 'Bordeaux',
      'Lille', 'Rennes', 'Reims', 'Saint-Etienne', 'Toulon', 'Le Havre', 'Grenoble', 'Dijon', 'Angers',
    ],
  },
  { name: 'Georgia', iso: 'GE', cities: ['Tbilisi', 'Adjara', 'Imereti', 'Kvemo Kartli', 'Kakheti', 'Samegrelo-Zemo Svaneti', 'Shida Kartli', 'Samtskhe-Javakheti', 'Guria', 'Mtskheta-Mtianeti', 'Racha-Lechkhumi', 'Abkhazia', 'Batumi', 'Kutaisi', 'Rustavi'] },
  {
    name: 'Germany',
    iso: 'DE',
    cities: [
      'Baden-Wurttemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse',
      'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate',
      'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia',
      'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Dusseldorf', 'Dortmund', 'Essen', 'Leipzig',
      'Dresden', 'Hannover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Munster',
    ],
  },
  { name: 'Ghana', iso: 'GH', cities: ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Northern', 'Volta', 'Upper East', 'Upper West', 'Bono', 'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti', 'Western North', 'Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast'] },
  { name: 'Greece', iso: 'GR', cities: ['Attica', 'Central Macedonia', 'Thessaly', 'Western Greece', 'Crete', 'Eastern Macedonia and Thrace', 'Epirus', 'Ionian Islands', 'North Aegean', 'Peloponnese', 'South Aegean', 'Western Macedonia', 'Central Greece', 'Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa', 'Volos', 'Rhodes', 'Ioannina'] },
  { name: 'Hungary', iso: 'HU', cities: ['Budapest', 'Pest', 'Bacs-Kiskun', 'Baranya', 'Bekes', 'Borsod-Abauj-Zemplen', 'Csongrad-Csanad', 'Fejer', 'Gyor-Moson-Sopron', 'Hajdu-Bihar', 'Heves', 'Jasz-Nagykun-Szolnok', 'Komarom-Esztergom', 'Nograd', 'Somogy', 'Szabolcs-Szatmar-Bereg', 'Tolna', 'Vas', 'Veszprem', 'Zala', 'Debrecen', 'Szeged', 'Miskolc', 'Pecs', 'Gyor'] },
  { name: 'Iceland', iso: 'IS', cities: ['Capital Region', 'Southern Peninsula', 'Western Region', 'Westfjords', 'Northwestern Region', 'Northeastern Region', 'Eastern Region', 'Southern Region', 'Reykjavik', 'Kopavogur', 'Hafnarfjordur', 'Akureyri'] },
  {
    name: 'India',
    iso: 'IN',
    cities: [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
      'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
      'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Andaman and Nicobar', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
      'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
      'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur',
    ],
  },
  {
    name: 'Indonesia',
    iso: 'ID',
    cities: [
      'Aceh', 'North Sumatra', 'West Sumatra', 'Riau', 'Riau Islands', 'Jambi', 'Bengkulu', 'South Sumatra',
      'Bangka Belitung', 'Lampung', 'Banten', 'Jakarta', 'West Java', 'Central Java', 'Yogyakarta', 'East Java',
      'Bali', 'West Nusa Tenggara', 'East Nusa Tenggara', 'West Kalimantan', 'Central Kalimantan',
      'South Kalimantan', 'East Kalimantan', 'North Kalimantan', 'North Sulawesi', 'Gorontalo',
      'Central Sulawesi', 'West Sulawesi', 'South Sulawesi', 'Southeast Sulawesi', 'Maluku', 'North Maluku',
      'Papua', 'West Papua', 'Southwest Papua', 'South Papua', 'Central Papua', 'Highland Papua',
      'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Denpasar',
    ],
  },
  {
    name: 'Iran',
    iso: 'IR',
    cities: [
      'Alborz', 'Ardabil', 'Bushehr', 'Chaharmahal and Bakhtiari', 'East Azerbaijan', 'Isfahan',
      'Fars', 'Gilan', 'Golestan', 'Hamadan', 'Hormozgan', 'Ilam', 'Kerman', 'Kermanshah',
      'Khuzestan', 'Kohgiluyeh and Boyer-Ahmad', 'Kurdistan', 'Lorestan', 'Markazi', 'Mazandaran',
      'North Khorasan', 'Qazvin', 'Qom', 'Razavi Khorasan', 'Semnan', 'Sistan and Baluchestan',
      'Tehran', 'West Azerbaijan', 'Yazd', 'Zanjan', 'South Khorasan',
      'Tehran City', 'Karaj', 'Isfahan City', 'Mashhad', 'Shiraz', 'Tabriz', 'Ahvaz', 'Qom City',
      'Kermanshah City', 'Urmia', 'Rasht', 'Zahedan', 'Hamadan City', 'Kerman City', 'Yazd City',
      'Ardabil City', 'Bandar Abbas', 'Arak', 'Eslamshahr', 'Zanjan City', 'Sanandaj', 'Qazvin City',
      'Khorramabad', 'Gorgan', 'Sari', 'Shahrekord', 'Birjand', 'Bojnurd', 'Ilam City', 'Yasuj',
      'Kish', 'Qeshm', 'Chabahar', 'Bushehr City', 'Dezful', 'Abadan', 'Khorramshahr', 'Mahabad',
      'Maragheh', 'Kashan', 'Najafabad', 'Khomeini Shahr', 'Sabzevar', 'Neyshabur', 'Gonbad-e Kavus',
      'Amol', 'Babol', 'Qaemshahr', 'Lahijan', 'Anzali', 'Saveh', 'Malayer', 'Borujerd', 'Andimeshk',
      'Mahshahr', 'Sirjan', 'Rafsanjan', 'Jiroft', 'Bam', 'Iranshahr', 'Zabol', 'Varamin', 'Pakdasht',
      'Shahriar', 'Malard', 'Robat Karim', 'Qods', 'Hashtgerd', 'Nazarabad',
    ],
  },
  {
    name: 'Iraq',
    iso: 'IQ',
    cities: [
      'Baghdad', 'Basra', 'Nineveh', 'Erbil', 'Sulaymaniyah', 'Duhok', 'Kirkuk', 'Anbar', 'Najaf',
      'Karbala', 'Babil', 'Wasit', 'Dhi Qar', 'Maysan', 'Muthanna', 'Qadisiyyah', 'Diyala', 'Saladin', 'Halabja',
      'Mosul', 'Nasiriyah', 'Amarah', 'Kut', 'Ramadi', 'Fallujah', 'Samawah', 'Diwaniyah', 'Baqubah', 'Tikrit',
    ],
  },
  { name: 'Ireland', iso: 'IE', cities: ['Leinster', 'Munster', 'Connacht', 'Ulster', 'Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Kilkenny', 'Wexford', 'Kerry', 'Clare', 'Mayo', 'Sligo', 'Donegal', 'Meath', 'Kildare', 'Wicklow'] },
  { name: 'Israel', iso: 'IL', cities: ['Central', 'Haifa', 'Jerusalem', 'Northern', 'Southern', 'Tel Aviv', 'Judea and Samaria', 'Tel Aviv-Yafo', 'Haifa City', 'Beersheba', 'Ashdod', 'Rishon LeZion', 'Petah Tikva', 'Netanya', 'Holon', 'Bnei Brak', 'Eilat'] },
  {
    name: 'Italy',
    iso: 'IT',
    cities: [
      'Abruzzo', 'Aosta Valley', 'Apulia', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
      'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardy', 'Marche', 'Molise', 'Piedmont',
      'Sardinia', 'Sicily', 'Trentino-Alto Adige', 'Tuscany', 'Umbria', 'Veneto',
      'Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania',
      'Venice', 'Verona', 'Messina', 'Padua', 'Trieste', 'Brescia', 'Parma', 'Modena', 'Prato', 'Perugia',
    ],
  },
  {
    name: 'Japan',
    iso: 'JP',
    cities: [
      'Hokkaido', 'Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima', 'Ibaraki', 'Tochigi',
      'Gunma', 'Saitama', 'Chiba', 'Tokyo', 'Kanagawa', 'Niigata', 'Toyama', 'Ishikawa', 'Fukui',
      'Yamanashi', 'Nagano', 'Gifu', 'Shizuoka', 'Aichi', 'Mie', 'Shiga', 'Kyoto', 'Osaka', 'Hyogo',
      'Nara', 'Wakayama', 'Tottori', 'Shimane', 'Okayama', 'Hiroshima', 'Yamaguchi', 'Tokushima',
      'Kagawa', 'Ehime', 'Kochi', 'Fukuoka', 'Saga', 'Nagasaki', 'Kumamoto', 'Oita', 'Miyazaki', 'Kagoshima', 'Okinawa',
      'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka City', 'Kobe', 'Kawasaki', 'Saitama City', 'Hiroshima City', 'Sendai',
    ],
  },
  { name: 'Jordan', iso: 'JO', cities: ['Amman', 'Irbid', 'Zarqa', 'Balqa', 'Mafraq', 'Jerash', 'Ajloun', 'Madaba', 'Karak', 'Tafilah', 'Maan', 'Aqaba'] },
  { name: 'Kazakhstan', iso: 'KZ', cities: ['Astana', 'Almaty', 'Shymkent', 'Akmola', 'Aktobe', 'Almaty Region', 'Atyrau', 'East Kazakhstan', 'Jambyl', 'Karaganda', 'Kostanay', 'Kyzylorda', 'Mangystau', 'North Kazakhstan', 'Pavlodar', 'Turkistan', 'West Kazakhstan', 'Ulytau', 'Abai', 'Jetisu'] },
  { name: 'Kenya', iso: 'KE', cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu', 'Kiambu', 'Machakos', 'Kajiado', 'Kilifi', 'Kwale', 'Garissa', 'Meru', 'Nyeri', 'Kakamega', 'Kisii', 'Kericho', 'Bungoma', 'Turkana', 'Eldoret'] },
  { name: 'Kuwait', iso: 'KW', cities: ['Al Asimah', 'Hawalli', 'Farwaniya', 'Ahmadi', 'Jahra', 'Mubarak Al-Kabeer', 'Kuwait City', 'Salmiya', 'Fahaheel'] },
  { name: 'Lebanon', iso: 'LB', cities: ['Beirut', 'Mount Lebanon', 'North', 'Akkar', 'South', 'Nabatieh', 'Beqaa', 'Baalbek-Hermel', 'Tripoli', 'Sidon', 'Tyre', 'Jounieh', 'Zahle', 'Byblos'] },
  { name: 'Malaysia', iso: 'MY', cities: ['Johor', 'Kedah', 'Kelantan', 'Malacca', 'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya', 'George Town', 'Johor Bahru', 'Ipoh', 'Kuching', 'Kota Kinabalu', 'Shah Alam'] },
  {
    name: 'Mexico',
    iso: 'MX',
    cities: [
      'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua',
      'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Mexico State',
      'Michoacan', 'Morelos', 'Nayarit', 'Nuevo Leon', 'Oaxaca', 'Puebla', 'Queretaro', 'Quintana Roo',
      'San Luis Potosi', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatan', 'Zacatecas',
      'Mexico City', 'Guadalajara', 'Monterrey', 'Puebla City', 'Tijuana', 'Leon', 'Juarez', 'Cancun', 'Merida', 'Queretaro City',
    ],
  },
  { name: 'Morocco', iso: 'MA', cities: ['Tanger-Tetouan-Al Hoceima', 'Oriental', 'Fes-Meknes', 'Rabat-Sale-Kenitra', 'Beni Mellal-Khenifra', 'Casablanca-Settat', 'Marrakesh-Safi', 'Draa-Tafilalet', 'Souss-Massa', 'Guelmim-Oued Noun', 'Laayoune-Sakia El Hamra', 'Dakhla-Oued Ed-Dahab', 'Casablanca', 'Rabat', 'Fes', 'Marrakesh', 'Tangier', 'Agadir', 'Meknes', 'Oujda'] },
  { name: 'Netherlands', iso: 'NL', cities: ['Drenthe', 'Flevoland', 'Friesland', 'Gelderland', 'Groningen', 'Limburg', 'North Brabant', 'North Holland', 'Overijssel', 'South Holland', 'Utrecht', 'Zeeland', 'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht City', 'Eindhoven', 'Groningen City', 'Tilburg', 'Almere', 'Breda', 'Nijmegen', 'Haarlem', 'Arnhem', 'Maastricht'] },
  { name: 'New Zealand', iso: 'NZ', cities: ['Northland', 'Auckland', 'Waikato', 'Bay of Plenty', 'Gisborne', 'Hawke\'s Bay', 'Taranaki', 'Manawatu-Whanganui', 'Wellington', 'Tasman', 'Nelson', 'Marlborough', 'West Coast', 'Canterbury', 'Otago', 'Southland', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin', 'Queenstown'] },
  {
    name: 'Nigeria',
    iso: 'NG',
    cities: [
      'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River',
      'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
      'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
      'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'Federal Capital Territory',
      'Abuja', 'Ibadan', 'Port Harcourt', 'Benin City', 'Maiduguri', 'Zaria', 'Aba', 'Jos', 'Ilorin', 'Enugu City',
    ],
  },
  { name: 'Norway', iso: 'NO', cities: ['Oslo', 'Viken', 'Innlandet', 'Vestfold og Telemark', 'Agder', 'Rogaland', 'Vestland', 'More og Romsdal', 'Trondelag', 'Nordland', 'Troms og Finnmark', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen', 'Fredrikstad', 'Kristiansand', 'Tromso'] },
  { name: 'Oman', iso: 'OM', cities: ['Muscat', 'Dhofar', 'Musandam', 'Al Batinah North', 'Al Batinah South', 'Al Buraimi', 'Ad Dakhiliyah', 'Ash Sharqiyah North', 'Ash Sharqiyah South', 'Ad Dhahirah', 'Al Wusta', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Ibri'] },
  {
    name: 'Pakistan',
    iso: 'PK',
    cities: [
      'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory', 'Gilgit-Baltistan', 'Azad Kashmir',
      'Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Gujranwala', 'Sialkot', 'Bahawalpur',
    ],
  },
  { name: 'Peru', iso: 'PE', cities: ['Amazonas', 'Ancash', 'Apurimac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huanuco', 'Ica', 'Junin', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martin', 'Tacna', 'Tumbes', 'Ucayali'] },
  {
    name: 'Philippines',
    iso: 'PH',
    cities: [
      'Ilocos', 'Cagayan Valley', 'Central Luzon', 'Calabarzon', 'Mimaropa', 'Bicol', 'Western Visayas',
      'Central Visayas', 'Eastern Visayas', 'Zamboanga Peninsula', 'Northern Mindanao', 'Davao Region',
      'Soccsksargen', 'Caraga', 'Bangsamoro', 'Cordillera', 'Metro Manila',
      'Manila', 'Quezon City', 'Cebu', 'Davao', 'Caloocan', 'Zamboanga', 'Cagayan de Oro', 'Iloilo', 'Baguio',
    ],
  },
  {
    name: 'Poland',
    iso: 'PL',
    cities: [
      'Greater Poland', 'Kuyavia-Pomerania', 'Lesser Poland', 'Lodz', 'Lower Silesia', 'Lublin', 'Lubusz',
      'Masovia', 'Opole', 'Podlaskie', 'Pomerania', 'Silesia', 'Subcarpathia', 'Holy Cross', 'Warmia-Masuria', 'West Pomerania',
      'Warsaw', 'Krakow', 'Wroclaw', 'Lodz City', 'Poznan', 'Gdansk', 'Szczecin', 'Bydgoszcz', 'Lublin City', 'Katowice', 'Bialystok',
    ],
  },
  { name: 'Portugal', iso: 'PT', cities: ['Lisbon', 'Porto', 'Aveiro', 'Beja', 'Braga', 'Braganca', 'Castelo Branco', 'Coimbra', 'Evora', 'Faro', 'Guarda', 'Leiria', 'Portalegre', 'Santarem', 'Setubal', 'Viana do Castelo', 'Vila Real', 'Viseu', 'Azores', 'Madeira'] },
  { name: 'Qatar', iso: 'QA', cities: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Umm Salal', 'Al Daayen', 'Al Shamal', 'Al Shahaniya', 'Lusail'] },
  { name: 'Romania', iso: 'RO', cities: ['Bucharest', 'Alba', 'Arad', 'Arges', 'Bacau', 'Bihor', 'Bistrita-Nasaud', 'Botosani', 'Braila', 'Brasov', 'Buzau', 'Calarasi', 'Caras-Severin', 'Cluj', 'Constanta', 'Covasna', 'Dambovita', 'Dolj', 'Galati', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara', 'Ialomita', 'Iasi', 'Ilfov', 'Maramures', 'Mehedinti', 'Mures', 'Neamt', 'Olt', 'Prahova', 'Salaj', 'Satu Mare', 'Sibiu', 'Suceava', 'Teleorman', 'Timis', 'Tulcea', 'Valcea', 'Vaslui', 'Vrancea', 'Cluj-Napoca', 'Timisoara', 'Iasi City', 'Constanta City', 'Craiova'] },
  {
    name: 'Russia',
    iso: 'RU',
    cities: [
      'Moscow', 'Saint Petersburg', 'Moscow Oblast', 'Krasnodar Krai', 'Sverdlovsk', 'Rostov', 'Bashkortostan',
      'Tatarstan', 'Chelyabinsk', 'Nizhny Novgorod', 'Samara', 'Novosibirsk', 'Krasnoyarsk', 'Perm',
      'Voronezh', 'Volgograd', 'Saratov', 'Tyumen', 'Irkutsk', 'Kemerovo', 'Omsk', 'Orenburg',
      'Primorsky', 'Khabarovsk', 'Sakha', 'Dagestan', 'Stavropol', 'Kaliningrad', 'Crimea',
      'Kazan', 'Yekaterinburg', 'Nizhny Novgorod City', 'Chelyabinsk City', 'Samara City', 'Rostov-on-Don', 'Ufa', 'Krasnoyarsk City', 'Voronezh City', 'Perm City', 'Volgograd City', 'Krasnodar', 'Sochi', 'Vladivostok',
    ],
  },
  {
    name: 'Saudi Arabia',
    iso: 'SA',
    cities: [
      'Riyadh', 'Makkah', 'Madinah', 'Eastern Province', 'Asir', 'Jazan', 'Tabuk', 'Hail', 'Al-Qassim',
      'Najran', 'Al-Bahah', 'Al-Jawf', 'Northern Borders',
      'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Dhahran', 'Taif', 'Abha', 'Khamis Mushait', 'Yanbu', 'Jubail', 'Buraidah', 'Tabuk City',
    ],
  },
  { name: 'Serbia', iso: 'RS', cities: ['Belgrade', 'Vojvodina', 'Sumadija', 'Southern and Eastern Serbia', 'Western Serbia', 'Novi Sad', 'Nis', 'Kragujevac', 'Subotica', 'Zrenjanin', 'Pancevo', 'Cacak', 'Kraljevo', 'Novi Pazar'] },
  { name: 'Singapore', iso: 'SG', cities: ['Central', 'East', 'North', 'North-East', 'West', 'Singapore'] },
  { name: 'Slovakia', iso: 'SK', cities: ['Bratislava', 'Trnava', 'Trencin', 'Nitra', 'Zilina', 'Banska Bystrica', 'Presov', 'Kosice'] },
  {
    name: 'South Africa',
    iso: 'ZA',
    cities: [
      'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape',
      'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Polokwane', 'Nelspruit', 'Kimberley',
    ],
  },
  {
    name: 'South Korea',
    iso: 'KR',
    cities: [
      'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan', 'Sejong',
      'Gyeonggi', 'Gangwon', 'North Chungcheong', 'South Chungcheong', 'North Jeolla', 'South Jeolla',
      'North Gyeongsang', 'South Gyeongsang', 'Jeju',
      'Suwon', 'Changwon', 'Goyang', 'Yongin', 'Seongnam', 'Bucheon', 'Cheongju', 'Jeonju', 'Cheonan',
    ],
  },
  {
    name: 'Spain',
    iso: 'ES',
    cities: [
      'Andalusia', 'Aragon', 'Asturias', 'Balearic Islands', 'Basque Country', 'Canary Islands', 'Cantabria',
      'Castile and Leon', 'Castile-La Mancha', 'Catalonia', 'Extremadura', 'Galicia', 'La Rioja',
      'Community of Madrid', 'Region of Murcia', 'Navarre', 'Valencian Community', 'Ceuta', 'Melilla',
      'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Malaga', 'Murcia', 'Palma', 'Bilbao',
      'Alicante', 'Cordoba', 'Valladolid', 'Vigo', 'Gijon', 'Granada', 'A Coruna', 'Vitoria-Gasteiz', 'Santa Cruz de Tenerife', 'Las Palmas',
    ],
  },
  { name: 'Sri Lanka', iso: 'LK', cities: ['Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa', 'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Trincomalee', 'Batticaloa', 'Anuradhapura'] },
  { name: 'Sweden', iso: 'SE', cities: ['Stockholm', 'Vastra Gotaland', 'Skane', 'Uppsala', 'Ostergotland', 'Jonkoping', 'Halland', 'Orebro', 'Sodermanland', 'Dalarna', 'Gavleborg', 'Varmland', 'Vasterbotten', 'Norrbotten', 'Vasternorrland', 'Kalmar', 'Kronoberg', 'Blekinge', 'Gotland', 'Jamtland', 'Gothenburg', 'Malmo', 'Uppsala City', 'Vasteras', 'Orebro City', 'Linkoping', 'Helsingborg'] },
  { name: 'Switzerland', iso: 'CH', cities: ['Aargau', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'Basel-Landschaft', 'Basel-Stadt', 'Bern', 'Fribourg', 'Geneva', 'Glarus', 'Graubunden', 'Jura', 'Lucerne', 'Neuchatel', 'Nidwalden', 'Obwalden', 'Schaffhausen', 'Schwyz', 'Solothurn', 'St. Gallen', 'Thurgau', 'Ticino', 'Uri', 'Valais', 'Vaud', 'Zug', 'Zurich', 'Basel', 'Lausanne', 'Winterthur', 'Lucerne City', 'St. Gallen City', 'Lugano', 'Biel'] },
  { name: 'Syria', iso: 'SY', cities: ['Damascus', 'Rif Dimashq', 'Aleppo', 'Homs', 'Hama', 'Latakia', 'Tartus', 'Idlib', 'Deir ez-Zor', 'Raqqa', 'Hasakah', 'Daraa', 'As-Suwayda', 'Quneitra'] },
  { name: 'Taiwan', iso: 'TW', cities: ['Taipei', 'New Taipei', 'Taoyuan', 'Taichung', 'Tainan', 'Kaohsiung', 'Keelung', 'Hsinchu', 'Chiayi', 'Yilan', 'Hualien', 'Taitung', 'Nantou', 'Changhua', 'Yunlin', 'Pingtung', 'Penghu', 'Kinmen', 'Lienchiang'] },
  {
    name: 'Thailand',
    iso: 'TH',
    cities: [
      'Bangkok', 'Chiang Mai', 'Chiang Rai', 'Phuket', 'Pattaya', 'Chonburi', 'Nonthaburi', 'Pathum Thani',
      'Samut Prakan', 'Nakhon Ratchasima', 'Khon Kaen', 'Udon Thani', 'Nakhon Si Thammarat', 'Surat Thani',
      'Songkhla', 'Hat Yai', 'Ayutthaya', 'Hua Hin', 'Krabi', 'Pattani', 'Yala', 'Narathiwat', 'Ubon Ratchathani',
      'Rayong', 'Kanchanaburi', 'Lampang', 'Phitsanulok',
    ],
  },
  { name: 'Tunisia', iso: 'TN', cities: ['Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte', 'Beja', 'Jendouba', 'Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabes', 'Medenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'] },
  {
    name: 'Turkey',
    iso: 'TR',
    cities: [
      'Adana', 'Adiyaman', 'Afyonkarahisar', 'Agri', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan',
      'Artvin', 'Aydin', 'Balikesir', 'Bartin', 'Batman', 'Bayburt', 'Bilecik', 'Bingol', 'Bitlis',
      'Bolu', 'Burdur', 'Bursa', 'Canakkale', 'Cankiri', 'Corum', 'Denizli', 'Diyarbakir', 'Duzce',
      'Edirne', 'Elazig', 'Erzincan', 'Erzurum', 'Eskisehir', 'Gaziantep', 'Giresun', 'Gumushane',
      'Hakkari', 'Hatay', 'Igdir', 'Isparta', 'Istanbul', 'Izmir', 'Kahramanmaras', 'Karabuk',
      'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis', 'Kirikkale', 'Kirklareli', 'Kirsehir',
      'Kocaeli', 'Konya', 'Kutahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Mugla', 'Mus',
      'Nevsehir', 'Nigde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Sanliurfa', 'Siirt',
      'Sinop', 'Sirnak', 'Sivas', 'Tekirdag', 'Tokat', 'Trabzon', 'Tunceli', 'Usak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
    ],
  },
  { name: 'Ukraine', iso: 'UA', cities: ['Kyiv', 'Kyiv Oblast', 'Lviv', 'Odesa', 'Kharkiv', 'Dnipropetrovsk', 'Donetsk', 'Zaporizhzhia', 'Vinnytsia', 'Poltava', 'Ivano-Frankivsk', 'Chernihiv', 'Cherkasy', 'Sumy', 'Zhytomyr', 'Khmelnytskyi', 'Rivne', 'Volyn', 'Ternopil', 'Chernivtsi', 'Zakarpattia', 'Mykolaiv', 'Kherson', 'Kirovohrad', 'Luhansk', 'Crimea'] },
  { name: 'United Arab Emirates', iso: 'AE', cities: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah', 'Al Ain'] },
  {
    name: 'United Kingdom',
    iso: 'GB',
    cities: [
      'England', 'Scotland', 'Wales', 'Northern Ireland',
      'Greater London', 'West Midlands', 'Greater Manchester', 'West Yorkshire', 'Merseyside',
      'South Yorkshire', 'Tyne and Wear', 'Hampshire', 'Essex', 'Kent', 'Lancashire', 'Surrey',
      'Hertfordshire', 'Devon', 'Cornwall', 'Norfolk', 'Suffolk', 'Oxfordshire', 'Cambridgeshire',
      'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Edinburgh', 'Bristol',
      'Sheffield', 'Newcastle', 'Nottingham', 'Leicester', 'Cardiff', 'Belfast', 'Brighton', 'Oxford', 'Cambridge', 'Bath', 'York', 'Aberdeen', 'Inverness',
    ],
  },
  {
    name: 'United States',
    iso: 'US',
    cities: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
      'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
      'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
      'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
      'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
      'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
      'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia',
      'New York City', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
      'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
      'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC', 'Boston',
      'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis',
      'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento',
      'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh', 'Miami',
      'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Tampa', 'New Orleans', 'Cleveland',
      'Honolulu', 'Orlando', 'St. Louis', 'Pittsburgh', 'Cincinnati', 'Salt Lake City',
    ],
  },
  { name: 'Uzbekistan', iso: 'UZ', cities: ['Tashkent', 'Andijan', 'Bukhara', 'Fergana', 'Jizzakh', 'Namangan', 'Navoiy', 'Qashqadaryo', 'Karakalpakstan', 'Samarqand', 'Sirdaryo', 'Surxondaryo', 'Tashkent Region', 'Xorazm', 'Samarkand', 'Nukus'] },
  { name: 'Venezuela', iso: 'VE', cities: ['Amazonas', 'Anzoategui', 'Apure', 'Aragua', 'Barinas', 'Bolivar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Falcon', 'Guarico', 'Lara', 'Merida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Tachira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia', 'Capital District', 'Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto'] },
  {
    name: 'Vietnam',
    iso: 'VN',
    cities: [
      'Hanoi', 'Ho Chi Minh City', 'Hai Phong', 'Da Nang', 'Can Tho',
      'An Giang', 'Ba Ria-Vung Tau', 'Bac Giang', 'Bac Kan', 'Bac Lieu', 'Bac Ninh', 'Ben Tre',
      'Binh Dinh', 'Binh Duong', 'Binh Phuoc', 'Binh Thuan', 'Ca Mau', 'Cao Bang', 'Dak Lak',
      'Dak Nong', 'Dien Bien', 'Dong Nai', 'Dong Thap', 'Gia Lai', 'Ha Giang', 'Ha Nam', 'Ha Tinh',
      'Hai Duong', 'Hau Giang', 'Hoa Binh', 'Hung Yen', 'Khanh Hoa', 'Kien Giang', 'Kon Tum',
      'Lai Chau', 'Lam Dong', 'Lang Son', 'Lao Cai', 'Long An', 'Nam Dinh', 'Nghe An', 'Ninh Binh',
      'Ninh Thuan', 'Phu Tho', 'Phu Yen', 'Quang Binh', 'Quang Nam', 'Quang Ngai', 'Quang Ninh',
      'Quang Tri', 'Soc Trang', 'Son La', 'Tay Ninh', 'Thai Binh', 'Thai Nguyen', 'Thanh Hoa',
      'Thua Thien Hue', 'Tien Giang', 'Tra Vinh', 'Tuyen Quang', 'Vinh Long', 'Vinh Phuc', 'Yen Bai',
      'Nha Trang', 'Hue', 'Vung Tau', 'Ha Long', 'Da Lat',
    ],
  },
];

const EXTRA_COUNTRIES: Array<[string, string, string[]]> = [
  ['Andorra', 'AD', ['Andorra la Vella', 'Canillo', 'Encamp', 'Escaldes-Engordany', 'La Massana', 'Ordino', 'Sant Julia de Loria']],
  ['Angola', 'AO', ['Bengo', 'Benguela', 'Bie', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huila', 'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uige', 'Zaire', 'Lobito', 'Lubango']],
  ['Bahamas', 'BS', ['New Providence', 'Grand Bahama', 'Abaco', 'Andros', 'Eleuthera', 'Exuma', 'Nassau', 'Freeport']],
  ['Barbados', 'BB', ['Bridgetown', 'Christ Church', 'Saint Michael', 'Saint James', 'Saint Peter', 'Saint Philip']],
  ['Belize', 'BZ', ['Belize District', 'Cayo', 'Corozal', 'Orange Walk', 'Stann Creek', 'Toledo', 'Belmopan', 'Belize City']],
  ['Benin', 'BJ', ['Alibori', 'Atakora', 'Atlantique', 'Borgou', 'Collines', 'Donga', 'Kouffo', 'Littoral', 'Mono', 'Oueme', 'Plateau', 'Zou', 'Porto-Novo', 'Cotonou', 'Parakou']],
  ['Bhutan', 'BT', ['Thimphu', 'Paro', 'Punakha', 'Wangdue Phodrang', 'Bumthang', 'Trashigang', 'Phuentsholing']],
  ['Botswana', 'BW', ['Central', 'Ghanzi', 'Kgalagadi', 'Kgatleng', 'Kweneng', 'North-East', 'North-West', 'South-East', 'Southern', 'Gaborone', 'Francistown', 'Maun']],
  ['Brunei', 'BN', ['Brunei-Muara', 'Belait', 'Tutong', 'Temburong', 'Bandar Seri Begawan']],
  ['Burkina Faso', 'BF', ['Boucle du Mouhoun', 'Cascades', 'Centre', 'Centre-Est', 'Centre-Nord', 'Centre-Ouest', 'Centre-Sud', 'Est', 'Hauts-Bassins', 'Nord', 'Plateau-Central', 'Sahel', 'Sud-Ouest', 'Ouagadougou', 'Bobo-Dioulasso']],
  ['Burundi', 'BI', ['Bubanza', 'Bujumbura Mairie', 'Bujumbura Rural', 'Bururi', 'Cankuzo', 'Cibitoke', 'Gitega', 'Karuzi', 'Kayanza', 'Kirundo', 'Makamba', 'Muramvya', 'Muyinga', 'Mwaro', 'Ngozi', 'Rumonge', 'Rutana', 'Ruyigi']],
  ['Cameroon', 'CM', ['Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West', 'Yaounde', 'Douala', 'Garoua', 'Bamenda', 'Bafoussam']],
  ['Cape Verde', 'CV', ['Santiago', 'Sao Vicente', 'Sal', 'Boa Vista', 'Fogo', 'Santo Antao', 'Maio', 'Brava', 'Praia', 'Mindelo']],
  ['Chad', 'TD', ['Batha', 'Chari-Baguirmi', 'Hadjer-Lamis', 'Wadi Fira', 'Bahr el Gazel', 'Borkou', 'Ennedi-Est', 'Ennedi-Ouest', 'Guera', 'Kanem', 'Lac', 'Logone Occidental', 'Logone Oriental', 'Mandoul', 'Mayo-Kebbi Est', 'Mayo-Kebbi Ouest', 'Moyen-Chari', 'Ouaddai', 'Salamat', 'Sila', 'Tandjile', 'Tibesti', 'NDjamena']],
  ['Congo', 'CG', ['Brazzaville', 'Pointe-Noire', 'Bouenza', 'Cuvette', 'Cuvette-Ouest', 'Kouilou', 'Lekoumou', 'Likouala', 'Niari', 'Plateaux', 'Pool', 'Sangha']],
  ['Cuba', 'CU', ['Pinar del Rio', 'Artemisa', 'Havana', 'Mayabeque', 'Matanzas', 'Cienfuegos', 'Villa Clara', 'Sancti Spiritus', 'Ciego de Avila', 'Camaguey', 'Las Tunas', 'Holguin', 'Granma', 'Santiago de Cuba', 'Guantanamo', 'Isla de la Juventud']],
  ['Cyprus', 'CY', ['Nicosia', 'Limassol', 'Larnaca', 'Paphos', 'Famagusta', 'Kyrenia']],
  ['Dominican Republic', 'DO', ['Distrito Nacional', 'Santo Domingo', 'Santiago', 'La Vega', 'Puerto Plata', 'San Cristobal', 'San Pedro de Macoris', 'La Romana', 'Duarte', 'Espaillat', 'Azua', 'Barahona', 'Punta Cana']],
  ['Ecuador', 'EC', ['Azuay', 'Bolivar', 'Canar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 'Esmeraldas', 'Galapagos', 'Guayas', 'Imbabura', 'Loja', 'Los Rios', 'Manabi', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsachilas', 'Sucumbios', 'Tungurahua', 'Zamora Chinchipe', 'Quito', 'Guayaquil', 'Cuenca']],
  ['El Salvador', 'SV', ['Ahuachapan', 'Cabanas', 'Chalatenango', 'Cuscatlan', 'La Libertad', 'La Paz', 'La Union', 'Morazan', 'San Miguel', 'San Salvador', 'San Vicente', 'Santa Ana', 'Sonsonate', 'Usulutan']],
  ['Fiji', 'FJ', ['Central', 'Eastern', 'Northern', 'Western', 'Rotuma', 'Suva', 'Nadi', 'Lautoka']],
  ['Gabon', 'GA', ['Estuaire', 'Haut-Ogooue', 'Moyen-Ogooue', 'Ngounie', 'Nyanga', 'Ogooue-Ivindo', 'Ogooue-Lolo', 'Ogooue-Maritime', 'Woleu-Ntem', 'Libreville', 'Port-Gentil']],
  ['Guatemala', 'GT', ['Guatemala', 'Alta Verapaz', 'Baja Verapaz', 'Chimaltenango', 'Chiquimula', 'El Progreso', 'Escuintla', 'Huehuetenango', 'Izabal', 'Jalapa', 'Jutiapa', 'Peten', 'Quetzaltenango', 'Quiche', 'Retalhuleu', 'Sacatepequez', 'San Marcos', 'Santa Rosa', 'Solola', 'Suchitepequez', 'Totonicapan', 'Zacapa', 'Guatemala City', 'Antigua']],
  ['Haiti', 'HT', ['Artibonite', 'Centre', 'Grand\'Anse', 'Nippes', 'Nord', 'Nord-Est', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Est', 'Port-au-Prince', 'Cap-Haitien']],
  ['Honduras', 'HN', ['Atlantida', 'Choluteca', 'Colon', 'Comayagua', 'Copan', 'Cortes', 'El Paraiso', 'Francisco Morazan', 'Gracias a Dios', 'Intibuca', 'Islas de la Bahia', 'La Paz', 'Lempira', 'Ocotepeque', 'Olancho', 'Santa Barbara', 'Valle', 'Yoro', 'Tegucigalpa', 'San Pedro Sula']],
  ['Jamaica', 'JM', ['Kingston', 'Saint Andrew', 'Saint Catherine', 'Clarendon', 'Manchester', 'Saint Elizabeth', 'Westmoreland', 'Hanover', 'Saint James', 'Trelawny', 'Saint Ann', 'Saint Mary', 'Portland', 'Saint Thomas', 'Montego Bay', 'Spanish Town', 'Ocho Rios', 'Negril']],
  ['Latvia', 'LV', ['Riga', 'Kurzeme', 'Zemgale', 'Vidzeme', 'Latgale', 'Daugavpils', 'Liepaja', 'Jelgava', 'Jurmala', 'Ventspils']],
  ['Lithuania', 'LT', ['Vilnius', 'Kaunas', 'Klaipeda', 'Siauliai', 'Panevezys', 'Alytus', 'Marijampole', 'Taurage', 'Telsiai', 'Utena']],
  ['Luxembourg', 'LU', ['Luxembourg', 'Diekirch', 'Grevenmacher', 'Esch-sur-Alzette', 'Differdange', 'Dudelange']],
  ['Madagascar', 'MG', ['Analamanga', 'Atsinanana', 'Diana', 'Sava', 'Sofia', 'Boeny', 'Betsiboka', 'Melaky', 'Bongolava', 'Itasy', 'Vakinankaratra', 'Alaotra-Mangoro', 'Analanjirofo', 'Amoron\'i Mania', 'Haute Matsiatra', 'Vatovavy', 'Fitovinany', 'Atsimo-Atsinanana', 'Ihorombe', 'Anosy', 'Androy', 'Atsimo-Andrefana', 'Menabe', 'Antananarivo', 'Toamasina', 'Antsiranana']],
  ['Maldives', 'MV', ['Male', 'Addu', 'Faafu', 'Gaafu Alif', 'Gaafu Dhaalu', 'Gnaviyani', 'Haa Alif', 'Haa Dhaalu', 'Kaafu', 'Laamu', 'Lhaviyani', 'Meemu', 'Noonu', 'Raa', 'Seenu', 'Shaviyani', 'Thaa', 'Vaavu']],
  ['Malta', 'MT', ['Valletta', 'Birkirkara', 'Qormi', 'Mosta', 'Sliema', 'St. Julian\'s', 'Gozo', 'Mdina', 'Birgu']],
  ['Monaco', 'MC', ['Monaco', 'Monte Carlo', 'La Condamine', 'Fontvieille']],
  ['Mongolia', 'MN', ['Ulaanbaatar', 'Arkhangai', 'Bayan-Olgii', 'Bayankhongor', 'Bulgan', 'Darkhan-Uul', 'Dornod', 'Dornogovi', 'Dundgovi', 'Govi-Altai', 'Govisumber', 'Khentii', 'Khovd', 'Khovsgol', 'Omnogovi', 'Orkhon', 'Ovorkhangai', 'Selenge', 'Sukhbaatar', 'Tov', 'Uvs', 'Zavkhan']],
  ['Montenegro', 'ME', ['Podgorica', 'Niksic', 'Pljevlja', 'Bijelo Polje', 'Cetinje', 'Bar', 'Herceg Novi', 'Budva', 'Kotor', 'Ulcinj', 'Berane', 'Tivat']],
  ['Mozambique', 'MZ', ['Cabo Delgado', 'Gaza', 'Inhambane', 'Manica', 'Maputo', 'Maputo City', 'Nampula', 'Niassa', 'Sofala', 'Tete', 'Zambezia', 'Beira', 'Nacala', 'Pemba']],
  ['Myanmar', 'MM', ['Ayeyarwady', 'Bago', 'Chin', 'Kachin', 'Kayah', 'Kayin', 'Magway', 'Mandalay', 'Mon', 'Naypyidaw', 'Rakhine', 'Sagaing', 'Shan', 'Tanintharyi', 'Yangon', 'Mawlamyine']],
  ['Nepal', 'NP', ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim', 'Kathmandu', 'Pokhara', 'Lalitpur', 'Bharatpur', 'Biratnagar', 'Birgunj']],
  ['Nicaragua', 'NI', ['Boaco', 'Carazo', 'Chinandega', 'Chontales', 'Esteli', 'Granada', 'Jinotega', 'Leon', 'Madriz', 'Managua', 'Masaya', 'Matagalpa', 'Nueva Segovia', 'Rio San Juan', 'Rivas', 'North Caribbean Coast', 'South Caribbean Coast']],
  ['North Macedonia', 'MK', ['Skopje', 'Bitola', 'Kumanovo', 'Prilep', 'Tetovo', 'Veles', 'Ohrid', 'Gostivar', 'Stip', 'Strumica']],
  ['Panama', 'PA', ['Bocas del Toro', 'Chiriqui', 'Cocle', 'Colon', 'Darien', 'Herrera', 'Los Santos', 'Panama', 'Veraguas', 'West Panama', 'Embera', 'Guna Yala', 'Ngabe-Bugle', 'Panama City', 'David', 'Colon City']],
  ['Paraguay', 'PY', ['Asuncion', 'Concepcion', 'San Pedro', 'Cordillera', 'Guaira', 'Caaguazu', 'Caazapa', 'Itapua', 'Misiones', 'Paraguari', 'Alto Parana', 'Central', 'Neembucu', 'Amambay', 'Canindeyu', 'Presidente Hayes', 'Alto Paraguay', 'Boqueron', 'Ciudad del Este', 'Encarnacion']],
  ['Rwanda', 'RW', ['Kigali', 'Eastern', 'Northern', 'Southern', 'Western', 'Butare', 'Gisenyi', 'Musanze', 'Rwamagana']],
  ['Senegal', 'SN', ['Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack', 'Kedougou', 'Kolda', 'Louga', 'Matam', 'Saint-Louis', 'Sedhiou', 'Tambacounda', 'Thies', 'Ziguinchor']],
  ['Slovenia', 'SI', ['Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Koper', 'Novo Mesto', 'Velenje', 'Nova Gorica', 'Ptuj']],
  ['Sudan', 'SD', ['Khartoum', 'Gezira', 'Red Sea', 'Kassala', 'Gedaref', 'Sennar', 'White Nile', 'Blue Nile', 'North', 'River Nile', 'Northern', 'West Kordofan', 'South Kordofan', 'North Kordofan', 'North Darfur', 'South Darfur', 'East Darfur', 'West Darfur', 'Central Darfur', 'Omdurman', 'Port Sudan']],
  ['Tanzania', 'TZ', ['Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera', 'Katavi', 'Kigoma', 'Kilimanjaro', 'Lindi', 'Manyara', 'Mara', 'Mbeya', 'Morogoro', 'Mtwara', 'Mwanza', 'Njombe', 'Pemba North', 'Pemba South', 'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga', 'Simiyu', 'Singida', 'Songwe', 'Tabora', 'Tanga', 'Zanzibar North', 'Zanzibar South', 'Zanzibar Urban/West', 'Zanzibar']],
  ['Uganda', 'UG', ['Central', 'Eastern', 'Northern', 'Western', 'Kampala', 'Wakiso', 'Mukono', 'Jinja', 'Mbale', 'Gulu', 'Lira', 'Mbarara', 'Fort Portal', 'Entebbe']],
  ['Uruguay', 'UY', ['Montevideo', 'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno', 'Flores', 'Florida', 'Lavalleja', 'Maldonado', 'Paysandu', 'Rio Negro', 'Rivera', 'Rocha', 'Salto', 'San Jose', 'Soriano', 'Tacuarembo', 'Treinta y Tres', 'Punta del Este']],
  ['Yemen', 'YE', ['Sanaa', 'Aden', 'Taiz', 'Al Hudaydah', 'Ibb', 'Dhamar', 'Hadhramaut', 'Abyan', 'Lahij', 'Shabwah', 'Al Mahrah', 'Al Bayda', 'Amran', 'Hajjah', 'Saada', 'Marib', 'Al Jawf', 'Raymah', 'Socotra']],
  ['Zambia', 'ZM', ['Central', 'Copperbelt', 'Eastern', 'Luapula', 'Lusaka', 'Muchinga', 'Northern', 'North-Western', 'Southern', 'Western', 'Ndola', 'Kitwe', 'Livingstone']],
  ['Zimbabwe', 'ZW', ['Bulawayo', 'Harare', 'Manicaland', 'Mashonaland Central', 'Mashonaland East', 'Mashonaland West', 'Masvingo', 'Matabeleland North', 'Matabeleland South', 'Midlands']],
  ['Palestine', 'PS', ['West Bank', 'Gaza', 'Ramallah', 'Nablus', 'Hebron', 'Bethlehem', 'Jenin', 'Tulkarm', 'Qalqilya', 'Jericho', 'Gaza City', 'Khan Yunis', 'Rafah']],
];

for (const [name, iso, cities] of EXTRA_COUNTRIES) {
  WORLD_COUNTRIES.push({ name, iso, cities });
}

WORLD_COUNTRIES.sort((a, b) => a.name.localeCompare(b.name));

export function filterCountries(query: string): CountryRecord[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 1) return WORLD_COUNTRIES;
  return WORLD_COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(needle) || country.iso.toLowerCase().startsWith(needle),
  );
}

export function citiesForCountry(countryName: string): string[] {
  return WORLD_COUNTRIES.find((country) => country.name === countryName)?.cities ?? [];
}

export function countryFromIso(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  const code = iso.trim().toUpperCase();
  return WORLD_COUNTRIES.find((country) => country.iso === code)?.name;
}

export function filterCities(countryName: string, query: string): string[] {
  const cities = citiesForCountry(countryName);
  const needle = query.trim().toLowerCase();
  if (needle.length < 1) return cities;
  return cities.filter((city) => city.toLowerCase().includes(needle));
}

export function searchWorldCities(
  query: string,
  limit = 120,
): Array<{ country: string; city: string }> {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return [];
  }

  const hits: Array<{ country: string; city: string }> = [];
  for (const record of WORLD_COUNTRIES) {
    for (const city of record.cities) {
      if (
        city.toLowerCase().includes(needle) ||
        record.name.toLowerCase().includes(needle)
      ) {
        hits.push({ country: record.name, city });
        if (hits.length >= limit) {
          return hits;
        }
      }
    }
  }
  return hits;
}
