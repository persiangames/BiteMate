/**
 * Marketing / landing i18n — merged into catalogs.ts
 * Column order: en, fa, ar, zh, fr, de, hi, it, ja, ru, es, tr
 */
type Row = readonly [
  string, string, string, string, string, string,
  string, string, string, string, string, string,
];

function L(
  en: string,
  fa: string,
  ar?: string,
  zh?: string,
  fr?: string,
  de?: string,
  hi?: string,
  it?: string,
  ja?: string,
  ru?: string,
  es?: string,
  tr?: string,
): Row {
  return [en, fa, ar ?? en, zh ?? en, fr ?? en, de ?? en, hi ?? en, it ?? en, ja ?? en, ru ?? en, es ?? en, tr ?? en];
}

export const MARKETING_RAW: Record<string, Row> = {
  'nav.login': L('Log in', 'ورود', 'تسجيل الدخول', '登录', 'Connexion', 'Anmelden', 'लॉग इन', 'Accedi', 'ログイン', 'Войти', 'Entrar', 'Giriş yap'),
  'nav.signup': L('Sign up', 'ثبت‌نام', 'إنشاء حساب', '注册', 'S’inscrire', 'Registrieren', 'साइन अप', 'Registrati', '新規登録', 'Регистрация', 'Regístrate', 'Kaydol'),
  'nav.faq': L('FAQ', 'سوالات پرتکرار', 'الأسئلة الشائعة', '常见问题', 'FAQ', 'FAQ', 'FAQ', 'FAQ', 'よくある質問', 'FAQ', 'FAQ', 'SSS'),
  'nav.about': L('About us', 'درباره ما', 'من نحن', '关于我们', 'À propos', 'Über uns', 'हमारे बारे में', 'Chi siamo', '私たちについて', 'О нас', 'Sobre nosotros', 'Hakkımızda'),
  'nav.openApp': L('Open app', 'ورود به برنامه', 'فتح التطبيق', '打开应用', 'Ouvrir l’app', 'App öffnen', 'ऐप खोलें', 'Apri app', 'アプリを開く', 'Открыть приложение', 'Abrir app', 'Uygulamayı aç'),

  'landing.hero.badge': L('Meet · Eat · Enjoy Together', 'ملاقات · غذا · لذت با هم', 'التقِ · كل · استمتع معًا', '见面 · 用餐 · 一起享受', 'Rencontrez · Mangez · Profitez', 'Treffen · Essen · Genießen', 'मिलें · खाएँ · मज़े करें', 'Incontra · Mangia · Divertiti', '出会う · 食べる · 楽しむ', 'Встречайтесь · Ешьте · Наслаждайтесь', 'Conoce · Come · Disfruta', 'Tanış · Ye · Birlikte eğlen'),
  'landing.hero.title': L('Find your table. Find your people.', 'میزت را پیدا کن. آدم‌هات را پیدا کن.', 'اعثر على مائدتك وأصدقائك.', '找到你的餐桌，找到你的伙伴。', 'Trouvez votre table et vos proches.', 'Finde deinen Tisch und deine Leute.', 'अपनी मेज़ और अपने लोग ढूँढें।', 'Trova il tuo tavolo e le tue persone.', 'テーブルと仲間を見つけよう。', 'Найдите свой стол и своих людей.', 'Encuentra tu mesa y tu gente.', 'Masanı ve insanlarını bul.'),
  'landing.hero.subtitle': L(
    'BiteMate connects food lovers for real meetups — from coffee and brunch to dinner dates, sports, and shared experiences near you.',
    'بایت‌میت عاشقان غذا را برای دیدار واقعی وصل می‌کند — از قهوه و برانچ تا شام، ورزش و تجربه‌های مشترک نزدیک تو.',
  ),
  'landing.hero.cta.primary': L('Get started free', 'رایگان شروع کن', 'ابدأ مجانًا', '免费开始', 'Commencer gratuitement', 'Kostenlos starten', 'मुफ़्त शुरू करें', 'Inizia gratis', '無料で始める', 'Начать бесплатно', 'Empezar gratis', 'Ücretsiz başla'),
  'landing.hero.cta.secondary': L('Learn more', 'بیشتر بدان', 'اعرف المزيد', '了解更多', 'En savoir plus', 'Mehr erfahren', 'और जानें', 'Scopri di più', '詳しく見る', 'Узнать больше', 'Saber más', 'Daha fazla'),

  'landing.stats.users': L('Members worldwide', 'اعضا در سراسر جهان', 'أعضاء حول العالم', '全球会员', 'Membres dans le monde', 'Mitglieder weltweit', 'विश्व भर में सदस्य', 'Membri nel mondo', '世界中のメンバー', 'Участники по миру', 'Miembros en el mundo', 'Dünya çapında üyeler'),
  'landing.stats.cities': L('Cities & cultures', 'شهرها و فرهنگ‌ها', 'مدن وثقافات', '城市与文化', 'Villes & cultures', 'Städte & Kulturen', 'शहर और संस्कृतियाँ', 'Città e culture', '都市と文化', 'Города и культуры', 'Ciudades y culturas', 'Şehirler ve kültürler'),
  'landing.stats.meetups': L('Meetups every day', 'دیدار هر روز', 'لقاءات يومية', '每日聚会', 'Rencontres chaque jour', 'Treffen jeden Tag', 'हर दिन मिलन', 'Incontri ogni giorno', '毎日のミートアップ', 'Встречи каждый день', 'Encuentros cada día', 'Her gün buluşma'),

  'landing.features.title': L('Everything you need to meet over food', 'همه چیز برای دیدار دور غذا', 'كل ما تحتاجه للقاء حول الطعام', '聚餐所需的一切', 'Tout pour se retrouver autour de la table', 'Alles für Treffen beim Essen', 'खाने पर मिलने की हर सुविधा', 'Tutto per incontrarsi a tavola', '食事で出会うためのすべて', 'Всё для встреч за едой', 'Todo para quedar a comer', 'Yemek üzerine buluşmak için her şey'),
  'landing.features.discover.title': L('Discover nearby', 'کشف نزدیک تو', 'اكتشف من حولك', '发现附近的人', 'Découvrir à proximité', 'In der Nähe entdecken', 'पास में खोजें', 'Scopri nelle vicinanze', '近くを発見', 'Найти рядом', 'Descubre cerca', 'Yakınında keşfet'),
  'landing.features.discover.desc': L('See who wants breakfast, lunch, or dinner now — filtered by food taste and vibe.', 'ببین چه کسی الان صبحانه، ناهار یا شام می‌خواهد — با فیلتر سلیقه غذایی.',),
  'landing.features.match.title': L('Match by taste', 'هم‌سلیقه پیدا کن', 'طابق ذوقك', '按口味匹配', 'Match par goût', 'Nach Geschmack matchen', 'स्वाद से मैच', 'Match per gusto', '好みでマッチ', 'Матч по вкусу', 'Match por gusto', 'Damak zevkine göre eşleş'),
  'landing.features.match.desc': L('Profiles show cuisine preferences, dietary needs, and what kind of company you enjoy.', 'پروفایل‌ها سلیقه غذایی، رژیم و نوع معاشرت را نشان می‌دهند.',),
  'landing.features.meetups.title': L('Plan meetups', 'برنامه‌ریزی دیدار', 'خطط للقاءات', '规划聚会', 'Planifier des rencontres', 'Treffen planen', 'मिलन की योजना', 'Organizza incontri', 'ミートアップを計画', 'Планируйте встречи', 'Planifica encuentros', 'Buluşma planla'),
  'landing.features.meetups.desc': L('Create or join table events — couples, groups, sports fans, or new friends.', 'ایونت میز بساز یا بپیوند — زوج، گروه، ورزش‌دوستان یا دوستان جدید.',),
  'landing.features.chat.title': L('Chat & connect', 'چت و ارتباط', 'دردشة وتواصل', '聊天与联系', 'Discuter & connecter', 'Chatten & verbinden', 'चैट और जुड़ें', 'Chat e connessione', 'チャットでつながる', 'Чат и общение', 'Chatea y conecta', 'Sohbet et ve bağlan'),
  'landing.features.chat.desc': L('Message before you meet. Share plans, locations, and restaurant picks safely in-app.', 'قبل از دیدار پیام بده. برنامه، مکان و رستوران را امن داخل اپ به اشتراک بگذار.',),
  'landing.features.market.title': L('Restaurants & home chefs', 'رستوران و سرآشپز خانگی', 'مطاعم وطهاة منزل', '餐厅与私厨', 'Restaurants & chefs à domicile', 'Restaurants & Home-Chefs', 'रेस्तरां और होम शेफ', 'Ristoranti e chef a casa', 'レストランとホームシェフ', 'Рестораны и домашние повара', 'Restaurantes y chefs caseros', 'Restoranlar ve ev aşçıları'),
  'landing.features.market.desc': L('Book tables, order from home chefs, and explore local food scenes.', 'میز رزرو کن، از سرآشپز خانگی سفارش بده و غذاهای محلی را کشف کن.',),
  'landing.features.wallet.title': L('Wallet & premium', 'کیف پول و پریمیوم', 'محفظة وبريميوم', '钱包与会员', 'Portefeuille & premium', 'Wallet & Premium', 'वॉलेट और प्रीमियम', 'Wallet e premium', 'ウォレットとプレミアム', 'Кошелёк и премиум', 'Monedero y premium', 'Cüzdan ve premium'),
  'landing.features.wallet.desc': L('Secure payments, tips, premium visibility, and rewards for active hosts.', 'پرداخت امن، انعام، دیده‌شدن بیشتر و پاداش برای میزبان‌های فعال.',),

  'landing.how.title': L('How BiteMate works', 'بایت‌میت چطور کار می‌کند', 'كيف يعمل BiteMate', 'BiteMate 如何运作', 'Comment ça marche', 'So funktioniert’s', 'BiteMate कैसे काम करता है', 'Come funziona', '使い方', 'Как это работает', 'Cómo funciona', 'Nasıl çalışır'),
  'landing.how.step1.title': L('Create your profile', 'پروفایل بساز', 'أنشئ ملفك', '创建资料', 'Créez votre profil', 'Profil erstellen', 'प्रोफ़ाइल बनाएँ', 'Crea il profilo', 'プロフィール作成', 'Создайте профиль', 'Crea tu perfil', 'Profil oluştur'),
  'landing.how.step1.desc': L('Tell us your food style, languages, and whether you seek friends, dates, or groups.', 'سبک غذایی، زبان‌ها و اینکه دنبال دوست، قرار یا گروه هستی را بگو.',),
  'landing.how.step2.title': L('Discover & invite', 'کشف کن و دعوت کن', 'اكتشف وادعُ', '发现与邀请', 'Découvrez & invitez', 'Entdecken & einladen', 'खोजें और आमंत्रित करें', 'Scopri e invita', '見つけて招待', 'Найдите и пригласите', 'Descubre e invita', 'Keşfet ve davet et'),
  'landing.how.step2.desc': L('Browse nearby people, join meetups, or send a table invite in one tap.', 'آدم‌های نزدیک را ببین، به ایونت بپیوند یا با یک لمس دعوت به میز بفرست.',),
  'landing.how.step3.title': L('Meet & enjoy', 'ملاقات کن و لذت ببر', 'التقِ واستمتع', '见面并享受', 'Rencontrez & profitez', 'Treffen & genießen', 'मिलें और मज़े करें', 'Incontra e divertiti', '会って楽しもう', 'Встретьтесь и насладитесь', 'Queda y disfruta', 'Buluş ve keyfini çıkar'),
  'landing.how.step3.desc': L('Show up, eat together, rate the experience, and build your food social circle.', 'حاضر شو، با هم غذا بخور، تجربه را امتیاز بده و حلقه اجتماعی غذایی‌ات را بساز.',),

  'landing.cta.title': L('Ready to find your next meal mate?', 'آماده‌ای هم‌غذای بعدیت را پیدا کنی؟', 'مستعد لإيجاد شريك وجبتك القادمة؟', '准备好找下一个饭友了吗？', 'Prêt à trouver votre prochain convive ?', 'Bereit für deinen nächsten Essenspartner?', 'अगला मील मेट ढूँढने के लिए तैयार?', 'Pronto a trovare il prossimo compagno di pasto?', '次の食事仲間を見つける準備は？', 'Готовы найти следующего попутчика за столом?', '¿Listo para tu próximo compañero de mesa?', 'Bir sonraki yemek arkadaşını bulmaya hazır mısın?'),
  'landing.cta.subtitle': L('Join free in minutes. Available on web today — mobile apps coming soon.', 'در چند دقیقه رایگان عضو شو. الان روی وب — اپ موبایل به‌زودی.',),

  'landing.footer.tagline': L('Meet. Eat. Enjoy Together.', 'ملاقات کن. غذا بخور. با هم لذت ببر.',),
  'landing.footer.rights': L('© {year} BiteMate. All rights reserved.', '© {year} بایت‌میت. تمامی حقوق محفوظ است.',),

  'about.title': L('About BiteMate', 'درباره بایت‌میت', 'عن BiteMate', '关于 BiteMate', 'À propos de BiteMate', 'Über BiteMate', 'BiteMate के बारे में', 'Informazioni su BiteMate', 'BiteMateについて', 'О BiteMate', 'Sobre BiteMate', 'BiteMate Hakkında'),
  'about.intro': L(
    'BiteMate is a social dining platform that helps people meet in real life over food — not endless swiping. We combine discovery, messaging, meetups, marketplace listings, and wallet tools in one experience built for modern city life.',
    'بایت‌میت یک پلتفرم اجتماعی غذا است که به مردم کمک می‌کند در دنیای واقعی دور غذا همدیگر را پیدا کنند — نه اسکرول بی‌پایان. کشف، پیام، دیدار، بازار غذا و کیف پول در یک تجربه برای زندگی شهری مدرن.',
  ),
  'about.who.title': L('Who can join?', 'چه کسانی می‌توانند عضو شوند؟', 'من يمكنه الانضمام؟', '谁可以加入？', 'Qui peut rejoindre ?', 'Wer kann beitreten?', 'कौन शामिल हो सकता है?', 'Chi può iscriversi?', '誰が参加できる？', 'Кто может присоединиться?', '¿Quién puede unirse?', 'Kimler katılabilir?'),
  'about.who.body': L(
    'Adults who want to share meals, explore restaurants, join group tables, host home-chef experiences, or meet for coffee, sports, movies, and social outings. Singles, couples looking for couple friends, travelers, expats, and food enthusiasts are all welcome when they follow community guidelines.',
    'بزرگسالانی که می‌خواهند غذا بخورند، رستوران کشف کنند، به میز گروهی بپیوندند، تجربه سرآشپز خانگی بدهند یا برای قهوه، ورزش، فیلم و بیرون‌رفتن ملاقات کنند. مجردها، زوج‌ها، مسافران، مهاجران و عاشقان غذا — با رعایت قوانین جامعه.',
  ),
  'about.why.title': L('Why BiteMate?', 'چرا بایت‌میت؟', 'لماذا BiteMate؟', '为什么选择 BiteMate？', 'Pourquoi BiteMate ?', 'Warum BiteMate?', 'BiteMate क्यों?', 'Perché BiteMate?', 'なぜ BiteMate？', 'Зачем BiteMate?', '¿Por qué BiteMate?', 'Neden BiteMate?'),
  'about.why.body': L(
    'Dating apps focus on profiles. Delivery apps focus on food. BiteMate focuses on the moment people sit together — the conversation, the cuisine, the chemistry. We help you go from “I’m hungry” to “I’m meeting someone great” in minutes.',
    'اپ‌های دیت فقط پروفایل دارند. اپ‌های پDelivery فقط غذا. بایت‌میت روی لحظه نشستن کنار هم تمرکز دارد — گفتگو، غذا، ارتباط. از «گرسنه‌ام» تا «دارم با آدم خوبی ملاقات می‌کنم» در چند دقیقه.',
  ),
  'about.modules.title': L('What’s inside the app', 'بخش‌های نرم‌افزار', 'ماذا يتضمن التطبيق', '应用包含什么', 'Contenu de l’app', 'App-Funktionen', 'ऐप में क्या है', 'Cosa include l’app', 'アプリの機能', 'Что внутри приложения', 'Qué incluye la app', 'Uygulamada neler var'),
  'about.modules.feed': L('Feed & posts — share food moments and see what your circle is eating.', 'فید و پست — لحظات غذایی را به اشتراک بگذار.',),
  'about.modules.discover': L('Discover — find people by location, cuisine, meal time, and intent.', 'کشف — پیدا کردن بر اساس مکان، غذا، وعده و هدف.',),
  'about.modules.meetups': L('Meetups — create or join table events with capacity and invites.', 'دیدار — ساخت یا پیوستن به ایونت میز با ظرفیت و دعوت.',),
  'about.modules.chat': L('Chats — secure messaging before and after you meet.', 'چت — پیام امن قبل و بعد از دیدار.',),
  'about.modules.marketplace': L('Marketplace — restaurants, home chefs, bookings.', 'بازار — رستوران، سرآشپز خانگی، رزرو.',),
  'about.modules.wallet': L('Wallet — payments, tips, premium, and host earnings.', 'کیف پول — پرداخت، انعام، پریمیوم و درآمد میزبان.',),

  'about.revenue.title': L('How BiteMate earns sustainably', 'مدل درآمد بایت‌میت', 'كيف يحقق BiteMate إيرادات', 'BiteMate 如何盈利', 'Modèle économique', 'Einnahmemodell', 'राजस्व मॉडल', 'Modello di ricavi', '収益モデル', 'Модель дохода', 'Modelo de ingresos', 'Gelir modeli'),
  'about.revenue.body': L(
    'Premium subscriptions for boosted visibility and advanced filters; booking and marketplace commissions; promoted restaurant and home-chef listings; optional in-app tips and wallet fees. Core meetup and messaging features stay accessible so everyone can join the table.',
    'اشتراک پریمیوم برای دیده‌شدن بیشتر و فیلتر پیشرفته؛ کمیسیون رزرو و بازار؛ تبلیغ رستوران و سرآشپز؛ انعام و کارمزد کیف پول. امکانات اصلی دیدار و پیام برای همه در دسترس می‌ماند.',
  ),
  'about.safety.title': L('Safety & trust', 'امنیت و اعتماد', 'الأمان والثقة', '安全与信任', 'Sécurité & confiance', 'Sicherheit & Vertrauen', 'सुरक्षा और विश्वास', 'Sicurezza e fiducia', '安全と信頼', 'Безопасность и доверие', 'Seguridad y confianza', 'Güvenlik ve güven'),
  'about.safety.body': L(
    'Verified contact channels, OTP signup, reporting tools, and community standards help keep experiences respectful. Always meet in public places first and use in-app chat to confirm plans.',
    'تأیید تماس، OTP ثبت‌نام، گزارش تخلف و قوانین جامعه تجربه را محترمانه نگه می‌دارد. اول در مکان عمومی ملاقات کن و برنامه را در اپ تأیید کن.',
  ),

  'faq.title': L('Frequently asked questions', 'سوالات پرتکرار', 'الأسئلة الشائعة', '常见问题', 'Questions fréquentes', 'Häufige Fragen', 'अक्सर पूछे जाने वाले प्रश्न', 'Domande frequenti', 'よくある質問', 'Частые вопросы', 'Preguntas frecuentes', 'Sık sorulan sorular'),
  'faq.subtitle': L('Quick answers about joining, meeting, and using BiteMate.', 'پاسخ سریع درباره عضویت، دیدار و استفاده از بایت‌میت.',),

  'faq.q1': L('What is BiteMate?', 'بایت‌میت چیست؟', 'ما هو BiteMate؟', 'BiteMate 是什么？', 'Qu’est-ce que BiteMate ?', 'Was ist BiteMate?', 'BiteMate क्या है?', 'Cos’è BiteMate?', 'BiteMateとは？', 'Что такое BiteMate?', '¿Qué es BiteMate?', 'BiteMate nedir?'),
  'faq.a1': L('A social app to discover people and plan real-world meals, coffee, group tables, and shared activities near you.', 'اپی برای پیدا کردن آدم‌ها و برنامه‌ریزی غذا، قهوه، میز گروهی و فعالیت مشترک در دنیای واقعی.',),

  'faq.q2': L('Is BiteMate free?', 'بایت‌میت رایگان است؟', 'هل BiteMate مجاني؟', 'BiteMate 免费吗？', 'BiteMate est-il gratuit ?', 'Ist BiteMate kostenlos?', 'क्या BiteMate मुफ़्त है?', 'BiteMate è gratis?', '無料ですか？', 'BiteMate бесплатен?', '¿BiteMate es gratis?', 'BiteMate ücretsiz mi?'),
  'faq.a2': L('Yes — you can sign up, discover, chat, and join many meetups for free. Premium adds extras like boosts and advanced filters.', 'بله — ثبت‌نام، کشف، چت و پیوستن به بسیاری از دیدارها رایگان است. پریمیوم امکانات اضافه مثل بوست دارد.',),

  'faq.q3': L('How is this different from dating apps?', 'فرقش با اپ‌های دیت چیست؟', 'ما الفرق عن تطبيقات المواعدة؟', '与约会应用有何不同？', 'Différence avec les apps de rencontre ?', 'Unterschied zu Dating-Apps?', 'डेटिंग ऐप से अंतर?', 'Differenza dalle app di dating?', '出会い系アプリとの違いは？', 'Чем отличается от dating-приложений?', '¿Diferencia con apps de citas?', 'Flört uygulamalarından farkı?'),
  'faq.a3': L('BiteMate centers on shared meals and social plans — friendship, groups, and dating are all supported, but food is the natural icebreaker.', 'بایت‌میت حول غذا و برنامه اجتماعی است — دوستی، گروه و رomance پشتیبانی می‌شود، اما غذا یخ‌شکن طبیعی است.',),

  'faq.q4': L('How do meetups work?', 'دیدارها چطور کار می‌کنند؟', 'كيف تعمل اللقاءات؟', '聚会如何运作？', 'Comment fonctionnent les rencontres ?', 'Wie funktionieren Meetups?', 'मिलन कैसे काम करते हैं?', 'Come funzionano gli incontri?', 'ミートアップの仕組みは？', 'Как работают встречи?', '¿Cómo funcionan los encuentros?', 'Buluşmalar nasıl ç работır?'),
  'faq.a4': L('Create an event with time, place, and seats — or join open tables nearby. Invite someone directly from Discover or chat first.', 'ایونت با زمان، مکان و ظرفیت بساز — یا به میزهای باز نزدیک بپیوند. از کشف دعوت کن یا اول چت کن.',),
  'faq.q5': L('Can I use BiteMate as a restaurant or home chef?', 'رستوران یا سرآشپز خانگی می‌توانم باشم؟'),
  'faq.a5': L('Yes. List your venue or home kitchen, accept bookings, and reach diners already looking for their next meal experience.', 'بله. مکان یا آشپزخانه خانگی را ثبت کن، رزرو بگیر و به کسانی که دنبال تجربه غذایی هستند برس.',),

  'faq.q6': L('How do you verify accounts?', 'حساب‌ها چطور تأیید می‌شوند؟', 'كيف تُتحقق الحسابات؟', '如何验证账户？', 'Comment vérifiez-vous les comptes ?', 'Wie verifiziert ihr Konten?', 'खाते कैसे सत्यापित होते हैं?', 'Come verificate gli account?', 'アカウント確認は？', 'Как проверяются аккаунты?', '¿Cómo verificáis las cuentas?', 'Hesaplar nasıl doğrulanır?'),
  'faq.a6': L('We use email or SMS one-time codes at signup and for sensitive actions like password reset.', 'در ثبت‌نام و کارهای حساس مثل بازیابی رمز از کد یک‌بار مصرف ایمیل یا پیامک استفاده می‌کنیم.',),

  'faq.q7': L('Is my data safe?', 'اطلاعاتم امن است؟', 'هل بياناتي آمنة؟', '我的数据安全吗？', 'Mes données sont-elles sûres ?', 'Sind meine Daten sicher?', 'क्या मेरा डेटा सुरक्षित है?', 'I miei dati sono al sicuro?', 'データは安全？', 'Мои данные в безопасности?', '¿Mis datos están seguros?', 'Verilerim güvende mi?'),
  'faq.a7': L('We use industry-standard encryption, secure authentication, and never share your contact details publicly on your profile.', 'رمزنگاری استاندارد، احراز هویت امن — جزئیات تماس عمومی روی پروفایل نمایش داده نمی‌شود.',),

  'faq.q8': L('Which languages are supported?', 'چه زبان‌هایی پشتیبانی می‌شود؟', 'ما اللغات المدعومة؟', '支持哪些语言？', 'Quelles langues ?', 'Welche Sprachen?', 'कौन सी भाषाएँ?', 'Quali lingue?', '対応言語は？', 'Какие языки?', '¿Qué idiomas?', 'Hangi diller?'),
  'faq.a8': L('The app supports 12 languages including English, Persian, Arabic, Chinese, French, German, and more — switch anytime from the language menu.', '۱۲ زبان از جمله انگلیسی، فارسی، عربی، چینی، فرانسوی، آلمانی و بیشتر — هر زمان از منوی زبان عوض کن.',),
};
