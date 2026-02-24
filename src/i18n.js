import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        login: "Login",
        signup: "Sign Up",
        dashboard: "Dashboard",
        home: {
          title: "Welcome to Trustivo",
          description:
            "A secure and reliable platform for managing and signing your important documents digitally.",
          button: "Get Started",
        },
      },
    },
    hi: {
      translation: {
        login: "लॉगिन",
        signup: "साइन अप",
        dashboard: "डैशबोर्ड",
        home: {
          title: "Trustivo में आपका स्वागत है",
          description:
            "अपने महत्वपूर्ण दस्तावेज़ों को डिजिटल रूप से प्रबंधित और साइन करने के लिए एक सुरक्षित और विश्वसनीय प्लेटफॉर्म।",
          button: "शुरू करें",
        },
      },
    },
    mr: {
      translation: {
        login: "लॉगिन करा",
        signup: "नोंदणी करा",
        dashboard: "डॅशबोर्ड",
        home: {
          title: "Trustivo मध्ये आपले स्वागत आहे",
          description:
            "आपले महत्त्वाचे दस्तऐवज डिजिटल पद्धतीने व्यवस्थापित आणि स्वाक्षरी करण्यासाठी सुरक्षित आणि विश्वासार्ह प्लॅटफॉर्म.",
          button: "सुरू करा",
        },
      },
    },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;