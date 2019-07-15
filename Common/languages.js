window.dji=window.dji||{};
(function(c){var f={},k={},l={},m={},n=[{culture:"af",code_639_1:"af",code_639_2:"",cultureCode:"",name:"Afrikaans"},{culture:"af-ZA",code_639_1:"af",code_639_2:"AFK",cultureCode:"0x0436",name:"Afrikaans - South Africa"},{culture:"sq-AL",code_639_1:"sq",code_639_2:"SQI",cultureCode:"0x041C",name:"Albanian - Albania"},{culture:"ar-DZ",code_639_1:"ar",code_639_2:"ARG",cultureCode:"0x1401",name:"Arabic - Algeria"},{culture:"ar-BH",code_639_1:"ar",code_639_2:"ARH",cultureCode:"0x3C01",name:"Arabic - Bahrain"},
{culture:"ar-EG",code_639_1:"ar",code_639_2:"ARE",cultureCode:"0x0C01",name:"Arabic - Egypt"},{culture:"ar-IQ",code_639_1:"ar",code_639_2:"ARI",cultureCode:"0x0801",name:"Arabic - Iraq"},{culture:"ar-JO",code_639_1:"ar",code_639_2:"ARJ",cultureCode:"0x2C01",name:"Arabic - Jordan"},{culture:"ar-KW",code_639_1:"ar",code_639_2:"ARK",cultureCode:"0x3401",name:"Arabic - Kuwait"},{culture:"ar-LB",code_639_1:"ar",code_639_2:"ARB",cultureCode:"0x3001",name:"Arabic - Lebanon"},{culture:"ar-LY",code_639_1:"ar",
code_639_2:"ARL",cultureCode:"0x1001",name:"Arabic - Libya"},{culture:"ar-MA",code_639_1:"ar",code_639_2:"ARM",cultureCode:"0x1801",name:"Arabic - Morocco"},{culture:"ar-OM",code_639_1:"ar",code_639_2:"ARO",cultureCode:"0x2001",name:"Arabic - Oman"},{culture:"ar-QA",code_639_1:"ar",code_639_2:"ARQ",cultureCode:"0x4001",name:"Arabic - Qatar"},{culture:"ar-SA",code_639_1:"ar",code_639_2:"ARA",cultureCode:"0x0401",name:"Arabic - Saudi Arabia"},{culture:"ar-SY",code_639_1:"ar",code_639_2:"ARS",cultureCode:"0x2801",
name:"Arabic - Syria"},{culture:"ar-TN",code_639_1:"ar",code_639_2:"ART",cultureCode:"0x1C01",name:"Arabic - Tunisia"},{culture:"ar-AE",code_639_1:"ar",code_639_2:"ARU",cultureCode:"0x3801",name:"Arabic - United Arab Emirates"},{culture:"ar-YE",code_639_1:"ar",code_639_2:"ARY",cultureCode:"0x2401",name:"Arabic - Yemen"},{culture:"hy-AM",code_639_1:"hy",code_639_2:"",cultureCode:"0x042B",name:"Armenian - Armenia"},{culture:"Cy-az-AZ",code_639_1:"Cy",code_639_2:"",cultureCode:"0x082C",name:"Azeri (Cyrillic) - Azerbaijan"},
{culture:"Lt-az-AZ",code_639_1:"Lt",code_639_2:"",cultureCode:"0x042C",name:"Azeri (Latin) - Azerbaijan"},{culture:"eu-ES",code_639_1:"eu",code_639_2:"EUQ",cultureCode:"0x042D",name:"Basque - Basque"},{culture:"be-BY",code_639_1:"be",code_639_2:"BEL",cultureCode:"0x0423",name:"Belarusian - Belarus"},{culture:"bg-BG",code_639_1:"bg",code_639_2:"BGR",cultureCode:"0x0402",name:"Bulgarian - Bulgaria"},{culture:"ca-ES",code_639_1:"ca",code_639_2:"CAT",cultureCode:"0x0403",name:"Catalan - Catalan"},{culture:"zh-CN",
code_639_1:"zh",code_639_2:"CHS",cultureCode:"0x0804",name:"Chinese - China"},{culture:"zh-HK",code_639_1:"zh",code_639_2:"ZHH",cultureCode:"0x0C04",name:"Chinese - Hong Kong SAR"},{culture:"zh-MO",code_639_1:"zh",code_639_2:"",cultureCode:"0x1404",name:"Chinese - Macau SAR"},{culture:"zh-SG",code_639_1:"zh",code_639_2:"ZHI",cultureCode:"0x1004",name:"Chinese - Singapore"},{culture:"zh-TW",code_639_1:"zh",code_639_2:"CHT",cultureCode:"0x0404",name:"Chinese - Taiwan"},{culture:"zh-CHS",code_639_1:"zh",
code_639_2:"",cultureCode:"0x0004",name:"Chinese (Simplified)"},{culture:"zh-CHT",code_639_1:"zh",code_639_2:"",cultureCode:"0x7C04",name:"Chinese (Traditional)"},{culture:"hr-HR",code_639_1:"hr",code_639_2:"HRV",cultureCode:"0x041A",name:"Croatian - Croatia"},{culture:"cs-CZ",code_639_1:"cs",code_639_2:"CSY",cultureCode:"0x0405",name:"Czech - Czech Republic"},{culture:"da-DK",code_639_1:"da",code_639_2:"DAN",cultureCode:"0x0406",name:"Danish - Denmark"},{culture:"div-MV",code_639_1:"div",code_639_2:"",
cultureCode:"0x0465",name:"Dhivehi - Maldives"},{culture:"nl-BE",code_639_1:"nl",code_639_2:"NLB",cultureCode:"0x0813",name:"Dutch - Belgium"},{culture:"nl-NL",code_639_1:"nl",code_639_2:"",cultureCode:"0x0413",name:"Dutch - The Netherlands"},{culture:"en-AU",code_639_1:"en",code_639_2:"ENA",cultureCode:"0x0C09",name:"English - Australia"},{culture:"en-BZ",code_639_1:"en",code_639_2:"ENL",cultureCode:"0x2809",name:"English - Belize"},{culture:"en-CA",code_639_1:"en",code_639_2:"ENC",cultureCode:"0x1009",
name:"English - Canada"},{culture:"en-CB",code_639_1:"en",code_639_2:"",cultureCode:"0x2409",name:"English - Caribbean"},{culture:"en-IE",code_639_1:"en",code_639_2:"ENI",cultureCode:"0x1809",name:"English - Ireland"},{culture:"en-JM",code_639_1:"en",code_639_2:"ENJ",cultureCode:"0x2009",name:"English - Jamaica"},{culture:"en-NZ",code_639_1:"en",code_639_2:"ENZ",cultureCode:"0x1409",name:"English - New Zealand"},{culture:"en-PH",code_639_1:"en",code_639_2:"",cultureCode:"0x3409",name:"English - Philippines"},
{culture:"en-ZA",code_639_1:"en",code_639_2:"ENS",cultureCode:"0x1C09",name:"English - South Africa"},{culture:"en-TT",code_639_1:"en",code_639_2:"ENT",cultureCode:"0x2C09",name:"English - Trinidad and Tobago"},{culture:"en-GB",code_639_1:"en",code_639_2:"ENG",cultureCode:"0x0809",name:"English - United Kingdom"},{culture:"en-US",code_639_1:"en",code_639_2:"ENU",cultureCode:"0x0409",name:"English - United States"},{culture:"en-ZW",code_639_1:"en",code_639_2:"",cultureCode:"0x3009",name:"English - Zimbabwe"},
{culture:"et-EE",code_639_1:"et",code_639_2:"ETI",cultureCode:"0x0425",name:"Estonian - Estonia"},{culture:"fo-FO",code_639_1:"fo",code_639_2:"FOS",cultureCode:"0x0438",name:"Faroese - Faroe Islands"},{culture:"fa-IR",code_639_1:"fa",code_639_2:"FAR",cultureCode:"0x0429",name:"Farsi - Iran"},{culture:"fi-FI",code_639_1:"fi",code_639_2:"FIN",cultureCode:"0x040B",name:"Finnish - Finland"},{culture:"fr-BE",code_639_1:"fr",code_639_2:"FRB",cultureCode:"0x080C",name:"French - Belgium"},{culture:"fr-CA",
code_639_1:"fr",code_639_2:"FRC",cultureCode:"0x0C0C",name:"French - Canada"},{culture:"fr-FR",code_639_1:"fr",code_639_2:"",cultureCode:"0x040C",name:"French - France"},{culture:"fr-LU",code_639_1:"fr",code_639_2:"FRL",cultureCode:"0x140C",name:"French - Luxembourg"},{culture:"fr-MC",code_639_1:"fr",code_639_2:"",cultureCode:"0x180C",name:"French - Monaco"},{culture:"fr-CH",code_639_1:"fr",code_639_2:"FRS",cultureCode:"0x100C",name:"French - Switzerland"},{culture:"gl-ES",code_639_1:"gl",code_639_2:"",
cultureCode:"0x0456",name:"Galician - Galician"},{culture:"ka-GE",code_639_1:"ka",code_639_2:"",cultureCode:"0x0437",name:"Georgian - Georgia"},{culture:"de-AT",code_639_1:"de",code_639_2:"DEA",cultureCode:"0x0C07",name:"German - Austria"},{culture:"de-DE",code_639_1:"de",code_639_2:"",cultureCode:"0x0407",name:"German - Germany"},{culture:"de-LI",code_639_1:"de",code_639_2:"DEC",cultureCode:"0x1407",name:"German - Liechtenstein"},{culture:"de-LU",code_639_1:"de",code_639_2:"DEL",cultureCode:"0x1007",
name:"German - Luxembourg"},{culture:"de-CH",code_639_1:"de",code_639_2:"DES",cultureCode:"0x0807",name:"German - Switzerland"},{culture:"el-GR",code_639_1:"el",code_639_2:"ELL",cultureCode:"0x0408",name:"Greek - Greece"},{culture:"gu-IN",code_639_1:"gu",code_639_2:"",cultureCode:"0x0447",name:"Gujarati - India"},{culture:"he-IL",code_639_1:"he",code_639_2:"HEB",cultureCode:"0x040D",name:"Hebrew - Israel"},{culture:"hi-IN",code_639_1:"hi",code_639_2:"HIN",cultureCode:"0x0439",name:"Hindi - India"},
{culture:"hu-HU",code_639_1:"hu",code_639_2:"HUN",cultureCode:"0x040E",name:"Hungarian - Hungary"},{culture:"is-IS",code_639_1:"is",code_639_2:"ISL",cultureCode:"0x040F",name:"Icelandic - Iceland"},{culture:"id-ID",code_639_1:"id",code_639_2:"",cultureCode:"0x0421",name:"Indonesian - Indonesia"},{culture:"it-IT",code_639_1:"it",code_639_2:"",cultureCode:"0x0410",name:"Italian - Italy"},{culture:"it-CH",code_639_1:"it",code_639_2:"ITS",cultureCode:"0x0810",name:"Italian - Switzerland"},{culture:"ja-JP",
code_639_1:"ja",code_639_2:"JPN",cultureCode:"0x0411",name:"Japanese - Japan"},{culture:"kn-IN",code_639_1:"kn",code_639_2:"",cultureCode:"0x044B",name:"Kannada - India"},{culture:"kk-KZ",code_639_1:"kk",code_639_2:"",cultureCode:"0x043F",name:"Kazakh - Kazakhstan"},{culture:"kok-IN",code_639_1:"kok",code_639_2:"",cultureCode:"0x0457",name:"Konkani - India"},{culture:"ko-KR",code_639_1:"ko",code_639_2:"KOR",cultureCode:"0x0412",name:"Korean - Korea"},{culture:"ky-KZ",code_639_1:"ky",code_639_2:"",
cultureCode:"0x0440",name:"Kyrgyz - Kazakhstan"},{culture:"lv-LV",code_639_1:"lv",code_639_2:"LVI",cultureCode:"0x0426",name:"Latvian - Latvia"},{culture:"lt-LT",code_639_1:"lt",code_639_2:"LTH",cultureCode:"0x0427",name:"Lithuanian - Lithuania"},{culture:"mk-MK",code_639_1:"mk",code_639_2:"MKD",cultureCode:"0x042F",name:"Macedonian (FYROM)"},{culture:"ms-BN",code_639_1:"ms",code_639_2:"",cultureCode:"0x083E",name:"Malay - Brunei"},{culture:"ms-MY",code_639_1:"ms",code_639_2:"",cultureCode:"0x043E",
name:"Malay - Malaysia"},{culture:"mr-IN",code_639_1:"mr",code_639_2:"",cultureCode:"0x044E",name:"Marathi - India"},{culture:"mn-MN",code_639_1:"mn",code_639_2:"",cultureCode:"0x0450",name:"Mongolian - Mongolia"},{culture:"nb-NO",code_639_1:"nb",code_639_2:"",cultureCode:"0x0414",name:"Norwegian (Bokm\u00e5l) - Norway"},{culture:"nn-NO",code_639_1:"nn",code_639_2:"",cultureCode:"0x0814",name:"Norwegian (Nynorsk) - Norway"},{culture:"pl-PL",code_639_1:"pl",code_639_2:"PLK",cultureCode:"0x0415",name:"Polish - Poland"},
{culture:"pt-BR",code_639_1:"pt",code_639_2:"PTB",cultureCode:"0x0416",name:"Portuguese - Brazil"},{culture:"pt-PT",code_639_1:"pt",code_639_2:"",cultureCode:"0x0816",name:"Portuguese - Portugal"},{culture:"pa-IN",code_639_1:"pa",code_639_2:"",cultureCode:"0x0446",name:"Punjabi - India"},{culture:"ro-RO",code_639_1:"ro",code_639_2:"ROM",cultureCode:"0x0418",name:"Romanian - Romania"},{culture:"ru-RU",code_639_1:"ru",code_639_2:"RUS",cultureCode:"0x0419",name:"Russian - Russia"},{culture:"sa-IN",code_639_1:"sa",
code_639_2:"",cultureCode:"0x044F",name:"Sanskrit - India"},{culture:"Cy-sr-SP",code_639_1:"Cy",code_639_2:"",cultureCode:"0x0C1A",name:"Serbian (Cyrillic) - Serbia"},{culture:"Lt-sr-SP",code_639_1:"Lt",code_639_2:"",cultureCode:"0x081A",name:"Serbian (Latin) - Serbia"},{culture:"sk-SK",code_639_1:"sk",code_639_2:"SKY",cultureCode:"0x041B",name:"Slovak - Slovakia"},{culture:"sl-SI",code_639_1:"sl",code_639_2:"SLV",cultureCode:"0x0424",name:"Slovenian - Slovenia"},{culture:"es-AR",code_639_1:"es",
code_639_2:"ESS",cultureCode:"0x2C0A",name:"Spanish - Argentina"},{culture:"es-BO",code_639_1:"es",code_639_2:"ESB",cultureCode:"0x400A",name:"Spanish - Bolivia"},{culture:"es-CL",code_639_1:"es",code_639_2:"ESL",cultureCode:"0x340A",name:"Spanish - Chile"},{culture:"es-CO",code_639_1:"es",code_639_2:"ESO",cultureCode:"0x240A",name:"Spanish - Colombia"},{culture:"es-CR",code_639_1:"es",code_639_2:"ESC",cultureCode:"0x140A",name:"Spanish - Costa Rica"},{culture:"es-DO",code_639_1:"es",code_639_2:"ESD",
cultureCode:"0x1C0A",name:"Spanish - Dominican Republic"},{culture:"es-EC",code_639_1:"es",code_639_2:"ESF",cultureCode:"0x300A",name:"Spanish - Ecuador"},{culture:"es-SV",code_639_1:"es",code_639_2:"ESE",cultureCode:"0x440A",name:"Spanish - El Salvador"},{culture:"es-GT",code_639_1:"es",code_639_2:"ESG",cultureCode:"0x100A",name:"Spanish - Guatemala"},{culture:"es-HN",code_639_1:"es",code_639_2:"ESH",cultureCode:"0x480A",name:"Spanish - Honduras"},{culture:"es-MX",code_639_1:"es",code_639_2:"ESM",
cultureCode:"0x080A",name:"Spanish - Mexico"},{culture:"es-NI",code_639_1:"es",code_639_2:"ESI",cultureCode:"0x4C0A",name:"Spanish - Nicaragua"},{culture:"es-PA",code_639_1:"es",code_639_2:"ESA",cultureCode:"0x180A",name:"Spanish - Panama"},{culture:"es-PY",code_639_1:"es",code_639_2:"ESZ",cultureCode:"0x3C0A",name:"Spanish - Paraguay"},{culture:"es-PE",code_639_1:"es",code_639_2:"ESR",cultureCode:"0x280A",name:"Spanish - Peru"},{culture:"es-PR",code_639_1:"es",code_639_2:"ES",cultureCode:"0x500A",
name:"Spanish - Puerto Rico"},{culture:"es-ES",code_639_1:"es",code_639_2:"",cultureCode:"0x0C0A",name:"Spanish - Spain"},{culture:"es-UY",code_639_1:"es",code_639_2:"ESY",cultureCode:"0x380A",name:"Spanish - Uruguay"},{culture:"es-VE",code_639_1:"es",code_639_2:"ESV",cultureCode:"0x200A",name:"Spanish - Venezuela"},{culture:"sw-KE",code_639_1:"sw",code_639_2:"",cultureCode:"0x0441",name:"Swahili - Kenya"},{culture:"sv-FI",code_639_1:"sv",code_639_2:"SVF",cultureCode:"0x081D",name:"Swedish - Finland"},
{culture:"sv-SE",code_639_1:"sv",code_639_2:"",cultureCode:"0x041D",name:"Swedish - Sweden"},{culture:"syr-SY",code_639_1:"syr",code_639_2:"",cultureCode:"0x045A",name:"Syriac - Syria"},{culture:"ta-IN",code_639_1:"ta",code_639_2:"",cultureCode:"0x0449",name:"Tamil - India"},{culture:"tt-RU",code_639_1:"tt",code_639_2:"",cultureCode:"0x0444",name:"Tatar - Russia"},{culture:"te-IN",code_639_1:"te",code_639_2:"",cultureCode:"0x044A",name:"Telugu - India"},{culture:"th-TH",code_639_1:"th",code_639_2:"THA",
cultureCode:"0x041E",name:"Thai - Thailand"},{culture:"tr-TR",code_639_1:"tr",code_639_2:"TRK",cultureCode:"0x041F",name:"Turkish - Turkey"},{culture:"uk-UA",code_639_1:"uk",code_639_2:"UKR",cultureCode:"0x0422",name:"Ukrainian - Ukraine"},{culture:"ur-PK",code_639_1:"ur",code_639_2:"URD",cultureCode:"0x0420",name:"Urdu - Pakistan"},{culture:"Cy-uz-UZ",code_639_1:"Cy",code_639_2:"",cultureCode:"0x0843",name:"Uzbek (Cyrillic) - Uzbekistan"},{culture:"Lt-uz-UZ",code_639_1:"Lt",code_639_2:"",cultureCode:"0x0443",
name:"Uzbek (Latin) - Uzbekistan"},{culture:"vi-VN",code_639_1:"vi",code_639_2:"VIT",cultureCode:"0x042A",name:"Vietnamese - Vietnam"}];c.languageInfo=function(a){return a&&(a=a.toUpperCase(),f.hasOwnProperty(a))?f[a]:null};c.languageCode_639_1=function(a){return(a=c.languageInfo(a))?a.code_639_1:null};c.languageCode_639_2=function(a){return(a=c.languageInfo(a))?a.code_639_2:null};(function(){for(var a=0;a<n.length;a++){var b=n[a],c=b.culture.toUpperCase(),d=b.code_639_1.toUpperCase(),e=b.code_639_2.toUpperCase(),
g=l[d];g||(g=l[d]=[]);var h=m[e];h||(h=m[e]=[]);k.hasOwnProperty(d)||(e={culture:b.code_639_1,code_639_1:b.code_639_1,code_639_2:"",cultureCode:"",name:b.name.split("-")[0].trim()},k[d]=e,f[d]=e);f[c]=b;g.push(b);h.push(b)}})()})(window.dji.languages=window.dji.languages||{});
