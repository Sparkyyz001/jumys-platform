"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Lang = "kk" | "ru" | "en";
type I18nKey =
    | "findJob"
    | "postJob"
    | "verify"
    | "settings"
    | "login"
    | "register"
    | "dashboard"
    | "heroTitle"
    | "heroTitleAccent"
    | "heroDescription"
    | "heroBadge"
    | "heroEmployerCta"
    | "heroSocialProof"
    | "heroMockupRole"
    | "heroMockupToast"
    | "heroMockupDays"
    | "heroMockupAvgHire"
    | "heroMockupVs"
    | "heroCinematicTitle"
    | "heroJobSearchPlaceholder"
    | "heroJobSearchTooShort"
    | "heroJobSearchNoResults"
    | "heroJobSearchError"
    | "heroJobSearchSubmitAria"
    | "heroJobSearchLoading"
    | "heroJobSearchFound"
    | "heroJobDistrictPrefix"
    | "ctaStart"
    | "ctaBrowseJobs"
    | "freshJobs"
    | "freshJobsSubtitle"
    | "allJobs"
    | "statsActive"
    | "statsSeekers"
    | "statsApplications"
    | "youthTitle"
    | "youthText"
    | "verifyTitle"
    | "verifyText"
    | "ctaReady"
    | "ctaReadyDesc"
    | "createAccount"
    | "howItWorks"
    | "navOverview"
    | "navMyJobs"
    | "navApplications"
    | "navMatches"
    | "navMyApps"
    | "navSupport"
    | "logout"
    | "employer"
    | "seeker"
    | "user"
    | "mapView"
    | "listView"
    | "pricing"
    | "boostJob"
    | "privacy"
    | "terms"
    | "navForEmployers"
    | "employersBadge"
    | "employersTitle"
    | "employersSub"
    | "employersCta"
    | "employersAvgHire"
    | "employersVs"
    | "employersWhy"
    | "employersFeatureAiTitle"
    | "employersFeatureAiText"
    | "employersFeatureVerifyTitle"
    | "employersFeatureVerifyText"
    | "employersFeatureBoostTitle"
    | "employersFeatureBoostText"
    | "employersCompareTitle"
    | "employersTableFeature"
    | "employersTableJumys"
    | "employersTableHH"
    | "employersTableOlx"
    | "employersRowDistricts"
    | "employersRowAi"
    | "employersRowTelegram"
    | "employersRowVerified"
    | "employersRowPrice"
    | "employersPartial"
    | "employersCtaTitle"
    | "employersCtaPrimary"
    | "employersCtaSecondary"
    | "caseStudyHeading"
    | "caseStudyCompany"
    | "caseStudyRole"
    | "caseStudyQuote"
    | "caseStudyTime"
    | "caseStudyLink"
    | "landingBadge"
    | "landingHeroTitle"
    | "landingHeroSub"
    | "landingFeaturesHeading"
    | "landingFeatureAiTitle"
    | "landingFeatureAiText"
    | "landingFeatureLocalTitle"
    | "landingFeatureLocalText"
    | "landingFeatureVerifyTitle"
    | "landingFeatureVerifyText"
    | "landingPricingHeading"
    | "landingPricingSub"
    | "landingPopular"
    | "landingPlanFreeName"
    | "landingPlanFreePrice"
    | "landingPlanFreePoint1"
    | "landingPlanFreePoint2"
    | "landingPlanFreePoint3"
    | "landingPlanBoostName"
    | "landingPlanBoostPrice"
    | "landingPlanBoostPoint1"
    | "landingPlanBoostPoint2"
    | "landingPlanBoostPoint3"
    | "landingPlanProName"
    | "landingPlanProPrice"
    | "landingPlanProPoint1"
    | "landingPlanProPoint2"
    | "landingPlanProPoint3"
    | "landingChoosePlan"
    | "landingTestimonialsHeading"
    | "landingTestimonial1Quote"
    | "landingTestimonial1Name"
    | "landingTestimonial1Role"
    | "landingTestimonial2Quote"
    | "landingTestimonial2Name"
    | "landingTestimonial2Role"
    | "landingTestimonial3Quote"
    | "landingTestimonial3Name"
    | "landingTestimonial3Role"
    | "landingFaqHeading"
    | "landingFaq1Q"
    | "landingFaq1A"
    | "landingFaq2Q"
    | "landingFaq2A"
    | "landingFaq3Q"
    | "landingFaq3A"
    | "landingFaq4Q"
    | "landingFaq4A"
    | "landingLearnMore"
    | "footerPlatform"
    | "footerDocs"
    | "footerSupport"
    | "footerAbout"
    | "footerBackToTop";

const translations: Record<Lang, Record<I18nKey, string>> = {
    kk: {
        findJob: "Жұмыс табу",
        postJob: "Вакансия жариялау",
        verify: "Тексеру",
        settings: "Баптаулар",
        login: "Кіру",
        register: "Тіркелу",
        dashboard: "Кабинет",
        heroTitle: "Jumys Platform: Ақтаудағы жастар жұмысы",
        heroTitleAccent: "AI-ұсыныспен",
        heroDescription:
            "Jumys сіздің профиліңізге сай вакансияларды таңдайды, ал жұмыс берушілерге үміткерлерді автоматты түрде ұсынады",
        heroBadge: "🇰🇿 Ақтауда жасалған · AI-матчинг",
        heroEmployerCta: "Мен жұмыс берушімін",
        heroSocialProof: "720 вакансия · 124 үміткер · 39 шағын аудан",
        heroMockupRole: "Үміткер · 1 ш/а",
        heroMockupToast: "Сізге жаңа вакансия",
        heroMockupDays: "күн",
        heroMockupAvgHire: "Jumys арқылы орташа жалдау уақыты",
        heroMockupVs: "−68% кәдімгі жалдаумен салыстырғанда",
        heroCinematicTitle: "Қызыға білгендер үшін жасалған",
        heroJobSearchPlaceholder: "Вакансия, дағды немесе шағын аудан…",
        heroJobSearchTooShort: "Іздеу үшін кемінде 2 таңба енгізіңіз",
        heroJobSearchNoResults: "Ештеңе табылмады",
        heroJobSearchError: "Іздеуді орындау мүмкін болмады",
        heroJobSearchSubmitAria: "Іздеу",
        heroJobSearchLoading: "Ізделуде…",
        heroJobSearchFound: "Табылды",
        heroJobDistrictPrefix: "ҚА",
        ctaStart: "Жұмыс іздеуді бастау",
        ctaBrowseJobs: "Вакансияларды көру",
        freshJobs: "Ақтаудағы жаңа вакансиялар",
        freshJobsSubtitle: "Нақты ұсыныстар, нақты уақытта жаңарады",
        allJobs: "Барлық вакансиялар",
        statsActive: "Белсенді вакансиялар",
        statsSeekers: "Жүйедегі үміткерлер",
        statsApplications: "Аптадағы өтінімдер",
        youthTitle: "Жастар мен студенттерге",
        youthText: "Ақтаудағы қосымша жұмыс, тағылымдама және бастапқы вакансиялар, аудан мен тәжірибе бойынша сүзгі.",
        verifyTitle: "Жеке басын растау",
        verifyText: "Баптауларда жұмыс беруші мен үміткерді IIN/BIN бойынша тексеру қойындысы бар.",
        ctaReady: "Ақтауда жұмыс табуға дайынсыз ба?",
        ctaReadyDesc: "Тіркелу тегін, профиль толтырылғаннан кейін бірден алғашқы ұсыныс пайда болады",
        createAccount: "Аккаунт құру",
        howItWorks: "Jumys қалай жұмыс істейді",
        navOverview: "Шолу",
        navMyJobs: "Менің вакансияларым",
        navApplications: "Өтінімдер",
        navMatches: "Ұсыныс",
        navMyApps: "Менің өтінімдерім",
        navSupport: "Қолдау",
        logout: "Шығу",
        employer: "Жұмыс беруші",
        seeker: "Үміткер",
        user: "Қолданушы",
        mapView: "Картада көру",
        listView: "Тізіммен",
        pricing: "Тарифтер",
        boostJob: "Топқа шығару",
        privacy: "Құпиялылық саясаты",
        terms: "Пайдалану шарттары",
        navForEmployers: "Мен жұмыс берушімін",
        employersBadge: "Ақтаудағы бизнес үшін",
        employersTitle: "Ақтауда тезірек әрі арзан жалдаңыз",
        employersSub: "AI сіздің ауданыңыздағы 124+ үміткерден лайықтыларын табады. Жазылым 4 990 ₸/ай бастап.",
        employersCta: "Вакансияны тегін жариялау",
        employersAvgHire: "Jumys арқылы орташа жалдау уақыты",
        employersVs: "−68% кәдімгі жалдаумен салыстырғанда",
        employersWhy: "Неге Jumys",
        employersFeatureAiTitle: "AI үміткерлерді ранжирлейді",
        employersFeatureAiText: "Қолмен іріктеусіз — үміткерлер вакансияңызға релеванттылығы бойынша сұрыпталады.",
        employersFeatureVerifyTitle: "Verified Business",
        employersFeatureVerifyText: "БСН/ЖСН тексерісі вакансияларыңыздың CTR-ін орташа 1.4× арттырады.",
        employersFeatureBoostTitle: "Boost вакансиялар",
        employersFeatureBoostText: "Бекітілген вакансия 7 күнде 6× көбірек өтінім алады.",
        employersCompareTitle: "Салыстыру",
        employersTableFeature: "Функция",
        employersTableJumys: "Jumys",
        employersTableHH: "hh.kz",
        employersTableOlx: "OLX",
        employersRowDistricts: "Шағын аудандар бойынша жергілікті матчинг",
        employersRowAi: "AI үміткерлерді іріктеу",
        employersRowTelegram: "Telegram хабарламалары",
        employersRowVerified: "Verified Business (БСН/ЖСН)",
        employersRowPrice: "Айына бастапқы баға",
        employersPartial: "ішінара",
        employersCtaTitle: "AI арқылы жалдауға дайынсыз ба?",
        employersCtaPrimary: "Тегін бастау",
        employersCtaSecondary: "Тарифтерді көру",
        caseStudyHeading: "Ақтау компанияларының оқиғалары",
        caseStudyCompany: "Caspian Tourism Hub",
        caseStudyRole: "HR · Ақтау",
        caseStudyQuote: "4 күнде екі кеңесші таптық. AI-іріктеу рекрутердің бір апта жұмысын үнемдеді.",
        caseStudyTime: "жалдау уақыты",
        caseStudyLink: "Кейс қосқыңыз келе ме? @jumys_support-қа жазыңыз",
        landingBadge: "shadcn/ui стиліндегі заманауи лендинг",
        landingHeroTitle: "Ақтауда жұмыс пен қызметкер іздеудің жаңа тәсілі",
        landingHeroSub: "Jumys AI көмегімен сәйкес вакансиялар мен үміткерлерді табады, ал сіз нәтижені бір экраннан басқарасыз.",
        landingFeaturesHeading: "Неліктен Jumys",
        landingFeatureAiTitle: "Ақылды AI-матчинг",
        landingFeatureAiText: "Үміткер мен вакансия релеванттылығы автоматты түрде есептеледі.",
        landingFeatureLocalTitle: "Тек Ақтау нарығы",
        landingFeatureLocalText: "39 шағын аудан бойынша локалды сүзгілер және нақты ұсыныстар.",
        landingFeatureVerifyTitle: "Сенімді компаниялар",
        landingFeatureVerifyText: "Verified Business тексерісі арқылы сапалы өтінім көбірек аласыз.",
        landingPricingHeading: "Айқын тарифтер",
        landingPricingSub: "Жеке іздеушілер мен бизнеске арналған икемді жоспарлар.",
        landingPopular: "Танымал",
        landingPlanFreeName: "Free",
        landingPlanFreePrice: "0 ₸",
        landingPlanFreePoint1: "3 белсенді вакансияға дейін",
        landingPlanFreePoint2: "Негізгі AI-ұсыныстар",
        landingPlanFreePoint3: "Telegram хабарламалары",
        landingPlanBoostName: "Boost",
        landingPlanBoostPrice: "4 990 ₸",
        landingPlanBoostPoint1: "7 күнге ТОП-қа шығару",
        landingPlanBoostPoint2: "Жоғары көріну",
        landingPlanBoostPoint3: "Көбірек өтінім",
        landingPlanProName: "Pro",
        landingPlanProPrice: "14 990 ₸",
        landingPlanProPoint1: "Шексіз вакансия",
        landingPlanProPoint2: "Verified Business",
        landingPlanProPoint3: "Кеңейтілген аналитика",
        landingChoosePlan: "Таңдау",
        landingTestimonialsHeading: "Пайдаланушылар пікірі",
        landingTestimonial1Quote: "Екі күнде лайықты кандидат таптық, процесстер әлдеқайда жылдам болды.",
        landingTestimonial1Name: "Dana K.",
        landingTestimonial1Role: "HR Manager",
        landingTestimonial2Quote: "Студенттерге арналған жартылай жұмыс орындарын табу оңай болды.",
        landingTestimonial2Name: "Aruzhan S.",
        landingTestimonial2Role: "Student",
        landingTestimonial3Quote: "ТОП-қа шыққан соң өтінім саны айтарлықтай өсті.",
        landingTestimonial3Name: "Caspian Retail",
        landingTestimonial3Role: "Employer",
        landingFaqHeading: "Жиі қойылатын сұрақтар",
        landingFaq1Q: "Jumys кімдерге арналған?",
        landingFaq1A: "Жұмыс іздеушілерге, студенттерге және Ақтаудағы жұмыс берушілерге.",
        landingFaq2Q: "AI-матчинг қалай жұмыс істейді?",
        landingFaq2A: "Профиль, дағды және тәжірибе негізінде ең релевантты жұптарды шығарады.",
        landingFaq3Q: "Telegram міндетті ме?",
        landingFaq3A: "Жоқ, бірақ Telegram арқылы хабарлама алу ыңғайлырақ.",
        landingFaq4Q: "Тарифті кейін өзгертуге бола ма?",
        landingFaq4A: "Иә, кабинеттен қалаған кезде Boost немесе Pro-ға ауыса аласыз.",
        landingLearnMore: "Толығырақ тарифтер",
        footerPlatform: "Платформа",
        footerDocs: "Құжаттар",
        footerSupport: "Қолдау",
        footerAbout: "Ақтауда AI арқылы жұмыс және кадр іздеу. Telegram хабарламалары, компания верификациясы.",
        footerBackToTop: "Жоғары",
    },
    ru: {
        findJob: "Найти работу",
        postJob: "Разместить вакансию",
        verify: "Проверка",
        settings: "Настройки",
        login: "Войти",
        register: "Регистрация",
        dashboard: "Кабинет",
        heroTitle: "Найди работу в Актау",
        heroTitleAccent: "за 24 часа",
        heroDescription:
            "Jumys подбирает вакансии под твой профиль и район. Отклик в один клик через Telegram.",
        heroBadge: "🇰🇿 Сделано в Актау · AI-матчинг",
        heroEmployerCta: "Я работодатель",
        heroSocialProof: "720 вакансий · 124 соискателя · 39 микрорайонов",
        heroMockupRole: "Соискатель · 1 мкр.",
        heroMockupToast: "Новая вакансия для тебя",
        heroMockupDays: "дня",
        heroMockupAvgHire: "среднее время найма через Jumys",
        heroMockupVs: "−68% vs обычный найм",
        heroCinematicTitle: "Создан для любопытных",
        heroJobSearchPlaceholder: "Вакансия, навык или микрорайон…",
        heroJobSearchTooShort: "Введите минимум 2 символа для поиска",
        heroJobSearchNoResults: "Ничего не найдено",
        heroJobSearchError: "Не удалось выполнить поиск",
        heroJobSearchSubmitAria: "Поиск",
        heroJobSearchLoading: "Ищем…",
        heroJobSearchFound: "Найдено",
        heroJobDistrictPrefix: "мкр.",
        ctaStart: "Начать искать работу",
        ctaBrowseJobs: "Смотреть вакансии",
        freshJobs: "Свежие вакансии в Актау",
        freshJobsSubtitle: "Реальные предложения, обновляются в реальном времени",
        allJobs: "Все вакансии",
        statsActive: "Активные вакансии",
        statsSeekers: "Соискатели в системе",
        statsApplications: "Отклики за неделю",
        youthTitle: "Для молодежи и студентов",
        youthText: "Подработка, стажировки и стартовые вакансии в Актау с фильтрами по району и опыту.",
        verifyTitle: "Проверка личности",
        verifyText: "В настройках доступна отдельная вкладка верификации работодателя и соискателя по IIN/BIN.",
        ctaReady: "Готовы найти работу в Актау?",
        ctaReadyDesc: "Регистрация бесплатна, первая подборка появится сразу после заполнения профиля",
        createAccount: "Создать аккаунт",
        howItWorks: "Как Jumys работает",
        navOverview: "Обзор",
        navMyJobs: "Мои вакансии",
        navApplications: "Отклики",
        navMatches: "Подборка",
        navMyApps: "Мои отклики",
        navSupport: "Поддержка",
        logout: "Выйти",
        employer: "Работодатель",
        seeker: "Соискатель",
        user: "Пользователь",
        mapView: "На карте",
        listView: "Списком",
        pricing: "Тарифы",
        boostJob: "Поднять в топ",
        privacy: "Политика конфиденциальности",
        terms: "Условия использования",
        navForEmployers: "Я работодатель",
        employersBadge: "Для бизнеса в Актау",
        employersTitle: "Нанимайте в Актау быстрее и дешевле",
        employersSub: "AI находит подходящих кандидатов из 124+ соискателей в твоём районе. Подписка от 4 990 ₸/мес.",
        employersCta: "Разместить вакансию бесплатно",
        employersAvgHire: "среднее время найма через Jumys",
        employersVs: "−68% vs обычный найм",
        employersWhy: "Почему Jumys",
        employersFeatureAiTitle: "AI ранжирует кандидатов",
        employersFeatureAiText: "Без ручного отбора — кандидаты упорядочены по релевантности к вашей вакансии.",
        employersFeatureVerifyTitle: "Verified Business",
        employersFeatureVerifyText: "Проверка БИН/ИИН повышает CTR ваших вакансий в 1.4×.",
        employersFeatureBoostTitle: "Boost вакансий",
        employersFeatureBoostText: "Закреплённая вакансия получает в 6× больше откликов за 7 дней.",
        employersCompareTitle: "Сравнение",
        employersTableFeature: "Функция",
        employersTableJumys: "Jumys",
        employersTableHH: "hh.kz",
        employersTableOlx: "OLX",
        employersRowDistricts: "Локальный матчинг по микрорайонам",
        employersRowAi: "AI-подбор кандидатов",
        employersRowTelegram: "Telegram-уведомления",
        employersRowVerified: "Verified Business (БИН/ИИН)",
        employersRowPrice: "Цена/месяц от",
        employersPartial: "частично",
        employersCtaTitle: "Готовы нанимать через AI?",
        employersCtaPrimary: "Начать бесплатно",
        employersCtaSecondary: "Посмотреть тарифы",
        caseStudyHeading: "Истории компаний Актау",
        caseStudyCompany: "Caspian Tourism Hub",
        caseStudyRole: "HR · Актау",
        caseStudyQuote: "Нашли двух консультантов за 4 дня. AI-подбор сэкономил неделю работы рекрутера.",
        caseStudyTime: "время найма",
        caseStudyLink: "Хотите добавить ваш кейс? Напишите в @jumys_support",
        landingBadge: "Современный лендинг в стиле shadcn/ui",
        landingHeroTitle: "Новый подход к поиску работы и сотрудников в Актау",
        landingHeroSub: "Jumys с помощью AI находит лучшие совпадения вакансий и кандидатов, а вы управляете всем в одном интерфейсе.",
        landingFeaturesHeading: "Почему Jumys",
        landingFeatureAiTitle: "Умный AI-матчинг",
        landingFeatureAiText: "Релевантность кандидата и вакансии рассчитывается автоматически.",
        landingFeatureLocalTitle: "Только рынок Актау",
        landingFeatureLocalText: "Локальные фильтры по 39 микрорайонам и реальные предложения.",
        landingFeatureVerifyTitle: "Проверенные компании",
        landingFeatureVerifyText: "С бейджем Verified Business вы получаете более качественные отклики.",
        landingPricingHeading: "Прозрачные тарифы",
        landingPricingSub: "Гибкие планы для соискателей и бизнеса.",
        landingPopular: "Популярный",
        landingPlanFreeName: "Free",
        landingPlanFreePrice: "0 ₸",
        landingPlanFreePoint1: "До 3 активных вакансий",
        landingPlanFreePoint2: "Базовые AI-рекомендации",
        landingPlanFreePoint3: "Telegram-уведомления",
        landingPlanBoostName: "Boost",
        landingPlanBoostPrice: "4 990 ₸",
        landingPlanBoostPoint1: "Выход в ТОП на 7 дней",
        landingPlanBoostPoint2: "Повышенная видимость",
        landingPlanBoostPoint3: "Больше откликов",
        landingPlanProName: "Pro",
        landingPlanProPrice: "14 990 ₸",
        landingPlanProPoint1: "Безлимит вакансий",
        landingPlanProPoint2: "Verified Business",
        landingPlanProPoint3: "Расширенная аналитика",
        landingChoosePlan: "Выбрать",
        landingTestimonialsHeading: "Отзывы пользователей",
        landingTestimonial1Quote: "Нашли подходящего кандидата за два дня, процесс стал заметно быстрее.",
        landingTestimonial1Name: "Dana K.",
        landingTestimonial1Role: "HR Manager",
        landingTestimonial2Quote: "Стало проще находить подработку и стажировки рядом с домом.",
        landingTestimonial2Name: "Aruzhan S.",
        landingTestimonial2Role: "Student",
        landingTestimonial3Quote: "После Boost количество откликов выросло уже в первую неделю.",
        landingTestimonial3Name: "Caspian Retail",
        landingTestimonial3Role: "Employer",
        landingFaqHeading: "Частые вопросы",
        landingFaq1Q: "Для кого подходит Jumys?",
        landingFaq1A: "Для соискателей, студентов и работодателей в Актау.",
        landingFaq2Q: "Как работает AI-матчинг?",
        landingFaq2A: "Система анализирует профиль, навыки и опыт и предлагает самые релевантные совпадения.",
        landingFaq3Q: "Telegram обязателен?",
        landingFaq3A: "Нет, но через Telegram удобнее получать моментальные уведомления.",
        landingFaq4Q: "Можно сменить тариф позже?",
        landingFaq4A: "Да, вы можете перейти на Boost или Pro в любой момент из кабинета.",
        landingLearnMore: "Подробнее о тарифах",
        footerPlatform: "Платформа",
        footerDocs: "Документы",
        footerSupport: "Поддержка",
        footerAbout: "AI-поиск работы и кандидатов в Актау. Уведомления в Telegram, верификация компаний.",
        footerBackToTop: "Наверх",
    },
    en: {
        findJob: "Find Job",
        postJob: "Post Job",
        verify: "Verify",
        settings: "Settings",
        login: "Sign in",
        register: "Sign up",
        dashboard: "Dashboard",
        heroTitle: "Find a job in Aktau",
        heroTitleAccent: "in 24 hours",
        heroDescription:
            "Jumys matches jobs to your profile and district. Apply in one click via Telegram.",
        heroBadge: "🇰🇿 Built in Aktau · AI matching",
        heroEmployerCta: "I am an employer",
        heroSocialProof: "720 jobs · 124 seekers · 39 microdistricts",
        heroMockupRole: "Seeker · 1st district",
        heroMockupToast: "A new vacancy for you",
        heroMockupDays: "days",
        heroMockupAvgHire: "average time-to-hire with Jumys",
        heroMockupVs: "−68% vs traditional hiring",
        heroCinematicTitle: "Built for the curious",
        heroJobSearchPlaceholder: "Job title, skill, or microdistrict…",
        heroJobSearchTooShort: "Type at least 2 characters to search",
        heroJobSearchNoResults: "No matching jobs",
        heroJobSearchError: "Something went wrong. Try again.",
        heroJobSearchSubmitAria: "Search",
        heroJobSearchLoading: "Searching…",
        heroJobSearchFound: "Found",
        heroJobDistrictPrefix: "dist.",
        ctaStart: "Start job hunt",
        ctaBrowseJobs: "Browse jobs",
        freshJobs: "Fresh jobs in Aktau",
        freshJobsSubtitle: "Real openings, updated in real time",
        allJobs: "All jobs",
        statsActive: "Active jobs",
        statsSeekers: "Seekers on board",
        statsApplications: "Applications this week",
        youthTitle: "For students & youth",
        youthText: "Part-time, internships and entry-level jobs in Aktau, filtered by district and experience.",
        verifyTitle: "Identity verification",
        verifyText: "Settings include a dedicated tab for IIN/BIN verification of employers and seekers.",
        ctaReady: "Ready to find work in Aktau?",
        ctaReadyDesc: "Registration is free, the first match appears right after you fill in your profile",
        createAccount: "Create account",
        howItWorks: "How Jumys works",
        navOverview: "Overview",
        navMyJobs: "My jobs",
        navApplications: "Applications",
        navMatches: "Matches",
        navMyApps: "My applications",
        navSupport: "Support",
        logout: "Sign out",
        employer: "Employer",
        seeker: "Seeker",
        user: "User",
        mapView: "Map view",
        listView: "List view",
        pricing: "Pricing",
        boostJob: "Boost to top",
        privacy: "Privacy policy",
        terms: "Terms of use",
        navForEmployers: "I am an employer",
        employersBadge: "For businesses in Aktau",
        employersTitle: "Hire in Aktau faster and cheaper",
        employersSub: "AI finds the right candidates from 124+ seekers in your district. Plans start at 4,990 ₸/month.",
        employersCta: "Post a vacancy for free",
        employersAvgHire: "average time-to-hire with Jumys",
        employersVs: "−68% vs traditional hiring",
        employersWhy: "Why Jumys",
        employersFeatureAiTitle: "AI ranks candidates",
        employersFeatureAiText: "No manual screening — candidates are sorted by relevance to your vacancy.",
        employersFeatureVerifyTitle: "Verified Business",
        employersFeatureVerifyText: "BIN/IIN verification increases vacancy CTR by 1.4× on average.",
        employersFeatureBoostTitle: "Vacancy boost",
        employersFeatureBoostText: "Pinned vacancies get 6× more applications in 7 days.",
        employersCompareTitle: "Comparison",
        employersTableFeature: "Feature",
        employersTableJumys: "Jumys",
        employersTableHH: "hh.kz",
        employersTableOlx: "OLX",
        employersRowDistricts: "Local matching by microdistrict",
        employersRowAi: "AI candidate matching",
        employersRowTelegram: "Telegram notifications",
        employersRowVerified: "Verified Business (BIN/IIN)",
        employersRowPrice: "Monthly price from",
        employersPartial: "partial",
        employersCtaTitle: "Ready to hire with AI?",
        employersCtaPrimary: "Start free",
        employersCtaSecondary: "View pricing",
        caseStudyHeading: "Aktau company stories",
        caseStudyCompany: "Caspian Tourism Hub",
        caseStudyRole: "HR · Aktau",
        caseStudyQuote: "We hired two consultants in 4 days. AI matching saved a week of recruiter effort.",
        caseStudyTime: "time-to-hire",
        caseStudyLink: "Want your case featured? Message @jumys_support",
        landingBadge: "Modern shadcn/ui styled landing",
        landingHeroTitle: "A better way to find jobs and talent in Aktau",
        landingHeroSub: "Jumys uses AI to match the right jobs and candidates while keeping everything in one clean interface.",
        landingFeaturesHeading: "Why Jumys",
        landingFeatureAiTitle: "Smart AI matching",
        landingFeatureAiText: "Candidate-job relevance is ranked automatically.",
        landingFeatureLocalTitle: "Aktau-first marketplace",
        landingFeatureLocalText: "Local filters across 39 microdistricts with real opportunities.",
        landingFeatureVerifyTitle: "Trusted companies",
        landingFeatureVerifyText: "Verified Business badges help attract higher-quality applications.",
        landingPricingHeading: "Simple pricing",
        landingPricingSub: "Flexible plans for job seekers and businesses.",
        landingPopular: "Popular",
        landingPlanFreeName: "Free",
        landingPlanFreePrice: "0 ₸",
        landingPlanFreePoint1: "Up to 3 active vacancies",
        landingPlanFreePoint2: "Basic AI recommendations",
        landingPlanFreePoint3: "Telegram notifications",
        landingPlanBoostName: "Boost",
        landingPlanBoostPrice: "4,990 ₸",
        landingPlanBoostPoint1: "Top placement for 7 days",
        landingPlanBoostPoint2: "Higher visibility",
        landingPlanBoostPoint3: "More applications",
        landingPlanProName: "Pro",
        landingPlanProPrice: "14,990 ₸",
        landingPlanProPoint1: "Unlimited vacancies",
        landingPlanProPoint2: "Verified Business",
        landingPlanProPoint3: "Advanced analytics",
        landingChoosePlan: "Choose plan",
        landingTestimonialsHeading: "What users say",
        landingTestimonial1Quote: "We found a strong candidate in two days, and hiring got much faster.",
        landingTestimonial1Name: "Dana K.",
        landingTestimonial1Role: "HR Manager",
        landingTestimonial2Quote: "It became easier to find part-time jobs and internships nearby.",
        landingTestimonial2Name: "Aruzhan S.",
        landingTestimonial2Role: "Student",
        landingTestimonial3Quote: "After Boost, application volume increased in the first week.",
        landingTestimonial3Name: "Caspian Retail",
        landingTestimonial3Role: "Employer",
        landingFaqHeading: "FAQ",
        landingFaq1Q: "Who is Jumys for?",
        landingFaq1A: "For job seekers, students, and employers in Aktau.",
        landingFaq2Q: "How does AI matching work?",
        landingFaq2A: "It analyzes profile, skills, and experience to rank the most relevant matches.",
        landingFaq3Q: "Is Telegram required?",
        landingFaq3A: "No, but Telegram makes instant notifications more convenient.",
        landingFaq4Q: "Can I change plans later?",
        landingFaq4A: "Yes, you can upgrade to Boost or Pro anytime from your dashboard.",
        landingLearnMore: "Learn more about pricing",
        footerPlatform: "Platform",
        footerDocs: "Documents",
        footerSupport: "Support",
        footerAbout: "AI job and talent matching in Aktau. Telegram notifications and company verification.",
        footerBackToTop: "Back to top",
    },
};

interface I18nContextValue {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: (key: I18nKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Lang>("ru");

    useEffect(() => {
        const saved = localStorage.getItem("jumys_lang") as Lang | null;
        if (saved && (saved === "kk" || saved === "ru" || saved === "en")) {
            setLangState(saved);
        }
    }, []);

    const value = useMemo<I18nContextValue>(() => ({
        lang,
        setLang: (nextLang: Lang) => {
            setLangState(nextLang);
            try {
                localStorage.setItem("jumys_lang", nextLang);
            } catch {
                // ignore storage failures (private mode etc.)
            }
        },
        t: (key: I18nKey) => translations[lang][key] ?? key,
    }), [lang]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) {
        throw new Error("useI18n must be used inside I18nProvider");
    }
    return ctx;
}
