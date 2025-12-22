export type TranslationKey = keyof typeof translations.en;

export const translations = {
  en: {
    // Meta
    'meta.title': 'Free WCAG 2.2 Quick Scan | VexnexaScan',
    'meta.description': 'Get a free automated WCAG 2.2 accessibility scan. Objective, fast, and actionable report delivered to your inbox.',

    // Landing page
    'landing.h1': 'Free WCAG 2.2 quick scan',
    'landing.subtitle': 'Automatic report delivered to your inbox. No obligation, no sales calls.',
    'landing.bullet1': 'Fast - Results within 24 hours',
    'landing.bullet2': 'Objective - Automated WCAG 2.2 Level AA checks',
    'landing.bullet3': 'Actionable - Clear prioritized recommendations',

    // Form
    'form.url.label': 'Website URL',
    'form.url.placeholder': 'https://example.com',
    'form.email.label': 'Email address',
    'form.email.placeholder': 'your@email.com',
    'form.consent.label': 'I agree to receive the scan report by email',
    'form.submit': 'Start free scan',
    'form.submitting': 'Submitting...',

    // Form validation
    'form.error.url.required': 'Please enter a website URL',
    'form.error.url.invalid': 'Please enter a valid URL',
    'form.error.email.required': 'Please enter your email address',
    'form.error.email.invalid': 'Please enter a valid email address',
    'form.error.consent.required': 'Please agree to receive the report',
    'form.error.generic': 'Something went wrong. Please try again.',
    'form.error.rate_limit': 'Too many requests. Please try again later.',

    // Success panel
    'success.title': 'Scan request received!',
    'success.ref': 'Reference ID',
    'success.next.title': 'What happens next?',
    'success.next.step1': 'We\'ll scan your website within the next 24 hours',
    'success.next.step2': 'You\'ll receive a detailed WCAG 2.2 report by email',
    'success.next.step3': 'The report includes prioritized recommendations',

    // Trust elements
    'trust.scan_time': 'Report within 24 hours',
    'trust.no_obligation': 'No obligation',
    'trust.objective': 'Objective analysis',

    // Privacy page
    'privacy.title': 'Privacy Policy',
    'privacy.intro': 'We respect your privacy and are committed to protecting your personal data.',
    'privacy.section1.title': 'What data we collect',
    'privacy.section1.content': 'When you request a scan, we collect your email address and the website URL you want us to scan. We also log the IP address of the request for security purposes.',
    'privacy.section2.title': 'How we use your data',
    'privacy.section2.content': 'We use your email address solely to send you the scan report. We use the website URL to perform the accessibility scan. We do not share your data with third parties or use it for marketing purposes.',
    'privacy.section3.title': 'Data retention',
    'privacy.section3.content': 'We retain your email and scan results for 90 days, after which they are automatically deleted from our systems.',
    'privacy.section4.title': 'Your rights',
    'privacy.section4.content': 'You have the right to request deletion of your data at any time. Contact us with your reference ID to exercise this right.',

    // Contact page
    'contact.title': 'Contact',
    'contact.intro': 'Have questions about our WCAG scan service? Get in touch.',
    'contact.email.label': 'Email',
    'contact.email.value': 'support@vexnexa.com',
    'contact.support.title': 'Support inquiries',
    'contact.support.content': 'For questions about your scan report or technical issues, please include your reference ID in your message.',
    'contact.privacy.title': 'Privacy requests',
    'contact.privacy.content': 'To request deletion of your data, please send your reference ID to the email address above.',

    // Navigation
    'nav.home': 'Home',
    'nav.privacy': 'Privacy',
    'nav.contact': 'Contact',

    // Footer
    'footer.rights': '© 2024 VexnexaScan. All rights reserved.',
  },
  nl: {
    // Meta
    'meta.title': 'Gratis WCAG 2.2 Snelle Scan | VexnexaScan',
    'meta.description': 'Ontvang een gratis geautomatiseerde WCAG 2.2 toegankelijkheidsscan. Objectief, snel en een bruikbaar rapport in uw inbox.',

    // Landing page
    'landing.h1': 'Gratis WCAG 2.2 snelle scan',
    'landing.subtitle': 'Automatisch rapport in uw inbox. Geen verplichtingen, geen verkoopgesprekken.',
    'landing.bullet1': 'Snel - Resultaten binnen 24 uur',
    'landing.bullet2': 'Objectief - Geautomatiseerde WCAG 2.2 Level AA controles',
    'landing.bullet3': 'Bruikbaar - Duidelijke geprioriteerde aanbevelingen',

    // Form
    'form.url.label': 'Website URL',
    'form.url.placeholder': 'https://voorbeeld.nl',
    'form.email.label': 'E-mailadres',
    'form.email.placeholder': 'uw@email.nl',
    'form.consent.label': 'Ik ga ermee akkoord het scanrapport per e-mail te ontvangen',
    'form.submit': 'Start gratis scan',
    'form.submitting': 'Verzenden...',

    // Form validation
    'form.error.url.required': 'Voer een website URL in',
    'form.error.url.invalid': 'Voer een geldige URL in',
    'form.error.email.required': 'Voer uw e-mailadres in',
    'form.error.email.invalid': 'Voer een geldig e-mailadres in',
    'form.error.consent.required': 'Ga akkoord met het ontvangen van het rapport',
    'form.error.generic': 'Er is iets misgegaan. Probeer het opnieuw.',
    'form.error.rate_limit': 'Te veel verzoeken. Probeer het later opnieuw.',

    // Success panel
    'success.title': 'Scanverzoek ontvangen!',
    'success.ref': 'Referentie-ID',
    'success.next.title': 'Wat gebeurt er nu?',
    'success.next.step1': 'We scannen uw website binnen 24 uur',
    'success.next.step2': 'U ontvangt een gedetailleerd WCAG 2.2 rapport per e-mail',
    'success.next.step3': 'Het rapport bevat geprioriteerde aanbevelingen',

    // Trust elements
    'trust.scan_time': 'Rapport binnen 24 uur',
    'trust.no_obligation': 'Geen verplichtingen',
    'trust.objective': 'Objectieve analyse',

    // Privacy page
    'privacy.title': 'Privacybeleid',
    'privacy.intro': 'We respecteren uw privacy en zetten ons in voor de bescherming van uw persoonlijke gegevens.',
    'privacy.section1.title': 'Welke gegevens we verzamelen',
    'privacy.section1.content': 'Wanneer u een scan aanvraagt, verzamelen we uw e-mailadres en de website URL die u wilt laten scannen. We loggen ook het IP-adres van het verzoek voor beveiligingsdoeleinden.',
    'privacy.section2.title': 'Hoe we uw gegevens gebruiken',
    'privacy.section2.content': 'We gebruiken uw e-mailadres uitsluitend om u het scanrapport te sturen. We gebruiken de website URL om de toegankelijkheidsscan uit te voeren. We delen uw gegevens niet met derden en gebruiken ze niet voor marketingdoeleinden.',
    'privacy.section3.title': 'Gegevensbewaring',
    'privacy.section3.content': 'We bewaren uw e-mail en scanresultaten gedurende 90 dagen, waarna ze automatisch uit onze systemen worden verwijderd.',
    'privacy.section4.title': 'Uw rechten',
    'privacy.section4.content': 'U heeft het recht om op elk moment verwijdering van uw gegevens aan te vragen. Neem contact met ons op met uw referentie-ID om dit recht uit te oefenen.',

    // Contact page
    'contact.title': 'Contact',
    'contact.intro': 'Heeft u vragen over onze WCAG scan service? Neem contact op.',
    'contact.email.label': 'E-mail',
    'contact.email.value': 'support@vexnexa.com',
    'contact.support.title': 'Ondersteuningsvragen',
    'contact.support.content': 'Voor vragen over uw scanrapport of technische problemen, vermeld uw referentie-ID in uw bericht.',
    'contact.privacy.title': 'Privacyverzoeken',
    'contact.privacy.content': 'Om verwijdering van uw gegevens aan te vragen, stuur uw referentie-ID naar het bovenstaande e-mailadres.',

    // Navigation
    'nav.home': 'Home',
    'nav.privacy': 'Privacy',
    'nav.contact': 'Contact',

    // Footer
    'footer.rights': '© 2024 VexnexaScan. Alle rechten voorbehouden.',
  },
  de: {
    // Meta
    'meta.title': 'Kostenloser WCAG 2.2 Schnellscan | VexnexaScan',
    'meta.description': 'Erhalten Sie einen kostenlosen automatisierten WCAG 2.2 Barrierefreiheitsscan. Objektiv, schnell und ein umsetzbarer Bericht in Ihrem Posteingang.',

    // Landing page
    'landing.h1': 'Kostenloser WCAG 2.2 Schnellscan',
    'landing.subtitle': 'Automatischer Bericht in Ihrem Posteingang. Keine Verpflichtung, keine Verkaufsgespräche.',
    'landing.bullet1': 'Schnell - Ergebnisse innerhalb von 24 Stunden',
    'landing.bullet2': 'Objektiv - Automatisierte WCAG 2.2 Level AA Prüfungen',
    'landing.bullet3': 'Umsetzbar - Klare priorisierte Empfehlungen',

    // Form
    'form.url.label': 'Website URL',
    'form.url.placeholder': 'https://beispiel.de',
    'form.email.label': 'E-Mail-Adresse',
    'form.email.placeholder': 'ihre@email.de',
    'form.consent.label': 'Ich bin damit einverstanden, den Scanbericht per E-Mail zu erhalten',
    'form.submit': 'Kostenlosen Scan starten',
    'form.submitting': 'Wird gesendet...',

    // Form validation
    'form.error.url.required': 'Bitte geben Sie eine Website-URL ein',
    'form.error.url.invalid': 'Bitte geben Sie eine gültige URL ein',
    'form.error.email.required': 'Bitte geben Sie Ihre E-Mail-Adresse ein',
    'form.error.email.invalid': 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
    'form.error.consent.required': 'Bitte stimmen Sie dem Erhalt des Berichts zu',
    'form.error.generic': 'Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.',
    'form.error.rate_limit': 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.',

    // Success panel
    'success.title': 'Scananfrage erhalten!',
    'success.ref': 'Referenz-ID',
    'success.next.title': 'Was passiert als Nächstes?',
    'success.next.step1': 'Wir scannen Ihre Website innerhalb der nächsten 24 Stunden',
    'success.next.step2': 'Sie erhalten einen detaillierten WCAG 2.2 Bericht per E-Mail',
    'success.next.step3': 'Der Bericht enthält priorisierte Empfehlungen',

    // Trust elements
    'trust.scan_time': 'Bericht innerhalb von 24 Stunden',
    'trust.no_obligation': 'Keine Verpflichtung',
    'trust.objective': 'Objektive Analyse',

    // Privacy page
    'privacy.title': 'Datenschutzerklärung',
    'privacy.intro': 'Wir respektieren Ihre Privatsphäre und setzen uns für den Schutz Ihrer persönlichen Daten ein.',
    'privacy.section1.title': 'Welche Daten wir sammeln',
    'privacy.section1.content': 'Wenn Sie einen Scan anfordern, erfassen wir Ihre E-Mail-Adresse und die Website-URL, die Sie scannen lassen möchten. Wir protokollieren auch die IP-Adresse der Anfrage zu Sicherheitszwecken.',
    'privacy.section2.title': 'Wie wir Ihre Daten verwenden',
    'privacy.section2.content': 'Wir verwenden Ihre E-Mail-Adresse ausschließlich, um Ihnen den Scanbericht zu senden. Wir verwenden die Website-URL, um den Barrierefreiheitsscan durchzuführen. Wir geben Ihre Daten nicht an Dritte weiter und verwenden sie nicht für Marketingzwecke.',
    'privacy.section3.title': 'Datenspeicherung',
    'privacy.section3.content': 'Wir speichern Ihre E-Mail und Scanergebnisse für 90 Tage, danach werden sie automatisch aus unseren Systemen gelöscht.',
    'privacy.section4.title': 'Ihre Rechte',
    'privacy.section4.content': 'Sie haben das Recht, jederzeit die Löschung Ihrer Daten anzufordern. Kontaktieren Sie uns mit Ihrer Referenz-ID, um dieses Recht auszuüben.',

    // Contact page
    'contact.title': 'Kontakt',
    'contact.intro': 'Haben Sie Fragen zu unserem WCAG-Scan-Service? Kontaktieren Sie uns.',
    'contact.email.label': 'E-Mail',
    'contact.email.value': 'support@vexnexa.com',
    'contact.support.title': 'Support-Anfragen',
    'contact.support.content': 'Bei Fragen zu Ihrem Scanbericht oder technischen Problemen geben Sie bitte Ihre Referenz-ID in Ihrer Nachricht an.',
    'contact.privacy.title': 'Datenschutzanfragen',
    'contact.privacy.content': 'Um die Löschung Ihrer Daten anzufordern, senden Sie bitte Ihre Referenz-ID an die oben genannte E-Mail-Adresse.',

    // Navigation
    'nav.home': 'Startseite',
    'nav.privacy': 'Datenschutz',
    'nav.contact': 'Kontakt',

    // Footer
    'footer.rights': '© 2024 VexnexaScan. Alle Rechte vorbehalten.',
  },
  fr: {
    // Meta
    'meta.title': 'Scan WCAG 2.2 Rapide Gratuit | VexnexaScan',
    'meta.description': 'Obtenez un scan d\'accessibilité WCAG 2.2 automatisé gratuit. Rapport objectif, rapide et exploitable livré dans votre boîte de réception.',

    // Landing page
    'landing.h1': 'Scan WCAG 2.2 rapide gratuit',
    'landing.subtitle': 'Rapport automatique livré dans votre boîte de réception. Sans engagement, sans appels commerciaux.',
    'landing.bullet1': 'Rapide - Résultats sous 24 heures',
    'landing.bullet2': 'Objectif - Vérifications automatisées WCAG 2.2 Level AA',
    'landing.bullet3': 'Exploitable - Recommandations claires et priorisées',

    // Form
    'form.url.label': 'URL du site web',
    'form.url.placeholder': 'https://exemple.fr',
    'form.email.label': 'Adresse e-mail',
    'form.email.placeholder': 'votre@email.fr',
    'form.consent.label': 'J\'accepte de recevoir le rapport de scan par e-mail',
    'form.submit': 'Démarrer le scan gratuit',
    'form.submitting': 'Envoi en cours...',

    // Form validation
    'form.error.url.required': 'Veuillez entrer une URL de site web',
    'form.error.url.invalid': 'Veuillez entrer une URL valide',
    'form.error.email.required': 'Veuillez entrer votre adresse e-mail',
    'form.error.email.invalid': 'Veuillez entrer une adresse e-mail valide',
    'form.error.consent.required': 'Veuillez accepter de recevoir le rapport',
    'form.error.generic': 'Une erreur s\'est produite. Veuillez réessayer.',
    'form.error.rate_limit': 'Trop de requêtes. Veuillez réessayer plus tard.',

    // Success panel
    'success.title': 'Demande de scan reçue !',
    'success.ref': 'ID de référence',
    'success.next.title': 'Que se passe-t-il ensuite ?',
    'success.next.step1': 'Nous scannerons votre site web dans les prochaines 24 heures',
    'success.next.step2': 'Vous recevrez un rapport WCAG 2.2 détaillé par e-mail',
    'success.next.step3': 'Le rapport inclut des recommandations priorisées',

    // Trust elements
    'trust.scan_time': 'Rapport sous 24 heures',
    'trust.no_obligation': 'Sans engagement',
    'trust.objective': 'Analyse objective',

    // Privacy page
    'privacy.title': 'Politique de confidentialité',
    'privacy.intro': 'Nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles.',
    'privacy.section1.title': 'Quelles données nous collectons',
    'privacy.section1.content': 'Lorsque vous demandez un scan, nous collectons votre adresse e-mail et l\'URL du site web que vous souhaitez scanner. Nous enregistrons également l\'adresse IP de la requête à des fins de sécurité.',
    'privacy.section2.title': 'Comment nous utilisons vos données',
    'privacy.section2.content': 'Nous utilisons votre adresse e-mail uniquement pour vous envoyer le rapport de scan. Nous utilisons l\'URL du site web pour effectuer le scan d\'accessibilité. Nous ne partageons pas vos données avec des tiers et ne les utilisons pas à des fins marketing.',
    'privacy.section3.title': 'Conservation des données',
    'privacy.section3.content': 'Nous conservons votre e-mail et les résultats du scan pendant 90 jours, après quoi ils sont automatiquement supprimés de nos systèmes.',
    'privacy.section4.title': 'Vos droits',
    'privacy.section4.content': 'Vous avez le droit de demander la suppression de vos données à tout moment. Contactez-nous avec votre ID de référence pour exercer ce droit.',

    // Contact page
    'contact.title': 'Contact',
    'contact.intro': 'Vous avez des questions sur notre service de scan WCAG ? Contactez-nous.',
    'contact.email.label': 'E-mail',
    'contact.email.value': 'support@vexnexa.com',
    'contact.support.title': 'Demandes de support',
    'contact.support.content': 'Pour des questions sur votre rapport de scan ou des problèmes techniques, veuillez inclure votre ID de référence dans votre message.',
    'contact.privacy.title': 'Demandes de confidentialité',
    'contact.privacy.content': 'Pour demander la suppression de vos données, veuillez envoyer votre ID de référence à l\'adresse e-mail ci-dessus.',

    // Navigation
    'nav.home': 'Accueil',
    'nav.privacy': 'Confidentialité',
    'nav.contact': 'Contact',

    // Footer
    'footer.rights': '© 2024 VexnexaScan. Tous droits réservés.',
  },
  es: {
    // Meta
    'meta.title': 'Escaneo WCAG 2.2 Rápido Gratuito | VexnexaScan',
    'meta.description': 'Obtenga un escaneo de accesibilidad WCAG 2.2 automatizado gratuito. Informe objetivo, rápido y práctico entregado en su bandeja de entrada.',

    // Landing page
    'landing.h1': 'Escaneo WCAG 2.2 rápido gratuito',
    'landing.subtitle': 'Informe automático entregado en su bandeja de entrada. Sin compromiso, sin llamadas de ventas.',
    'landing.bullet1': 'Rápido - Resultados en 24 horas',
    'landing.bullet2': 'Objetivo - Verificaciones automatizadas WCAG 2.2 Level AA',
    'landing.bullet3': 'Práctico - Recomendaciones claras y priorizadas',

    // Form
    'form.url.label': 'URL del sitio web',
    'form.url.placeholder': 'https://ejemplo.es',
    'form.email.label': 'Dirección de correo electrónico',
    'form.email.placeholder': 'su@email.es',
    'form.consent.label': 'Acepto recibir el informe de escaneo por correo electrónico',
    'form.submit': 'Iniciar escaneo gratuito',
    'form.submitting': 'Enviando...',

    // Form validation
    'form.error.url.required': 'Por favor ingrese una URL de sitio web',
    'form.error.url.invalid': 'Por favor ingrese una URL válida',
    'form.error.email.required': 'Por favor ingrese su dirección de correo electrónico',
    'form.error.email.invalid': 'Por favor ingrese una dirección de correo electrónico válida',
    'form.error.consent.required': 'Por favor acepte recibir el informe',
    'form.error.generic': 'Algo salió mal. Por favor intente nuevamente.',
    'form.error.rate_limit': 'Demasiadas solicitudes. Por favor intente más tarde.',

    // Success panel
    'success.title': '¡Solicitud de escaneo recibida!',
    'success.ref': 'ID de referencia',
    'success.next.title': '¿Qué sucede ahora?',
    'success.next.step1': 'Escanearemos su sitio web en las próximas 24 horas',
    'success.next.step2': 'Recibirá un informe detallado WCAG 2.2 por correo electrónico',
    'success.next.step3': 'El informe incluye recomendaciones priorizadas',

    // Trust elements
    'trust.scan_time': 'Informe en 24 horas',
    'trust.no_obligation': 'Sin compromiso',
    'trust.objective': 'Análisis objetivo',

    // Privacy page
    'privacy.title': 'Política de privacidad',
    'privacy.intro': 'Respetamos su privacidad y nos comprometemos a proteger sus datos personales.',
    'privacy.section1.title': 'Qué datos recopilamos',
    'privacy.section1.content': 'Cuando solicita un escaneo, recopilamos su dirección de correo electrónico y la URL del sitio web que desea escanear. También registramos la dirección IP de la solicitud con fines de seguridad.',
    'privacy.section2.title': 'Cómo usamos sus datos',
    'privacy.section2.content': 'Usamos su dirección de correo electrónico únicamente para enviarle el informe de escaneo. Usamos la URL del sitio web para realizar el escaneo de accesibilidad. No compartimos sus datos con terceros ni los usamos con fines de marketing.',
    'privacy.section3.title': 'Retención de datos',
    'privacy.section3.content': 'Conservamos su correo electrónico y resultados de escaneo durante 90 días, después de los cuales se eliminan automáticamente de nuestros sistemas.',
    'privacy.section4.title': 'Sus derechos',
    'privacy.section4.content': 'Tiene derecho a solicitar la eliminación de sus datos en cualquier momento. Contáctenos con su ID de referencia para ejercer este derecho.',

    // Contact page
    'contact.title': 'Contacto',
    'contact.intro': '¿Tiene preguntas sobre nuestro servicio de escaneo WCAG? Póngase en contacto.',
    'contact.email.label': 'Correo electrónico',
    'contact.email.value': 'support@vexnexa.com',
    'contact.support.title': 'Consultas de soporte',
    'contact.support.content': 'Para preguntas sobre su informe de escaneo o problemas técnicos, incluya su ID de referencia en su mensaje.',
    'contact.privacy.title': 'Solicitudes de privacidad',
    'contact.privacy.content': 'Para solicitar la eliminación de sus datos, envíe su ID de referencia a la dirección de correo electrónico anterior.',

    // Navigation
    'nav.home': 'Inicio',
    'nav.privacy': 'Privacidad',
    'nav.contact': 'Contacto',

    // Footer
    'footer.rights': '© 2024 VexnexaScan. Todos los derechos reservados.',
  },
} as const;
