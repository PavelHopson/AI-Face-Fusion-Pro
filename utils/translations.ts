
import { Language, AssetType } from '../types';

interface Translation {
  title: string;
  subtitle: string;
  assetLabels: Record<AssetType, string>;
  systemStatus: string;
  statusIdle: string;
  statusReadyToAnalyze: string;
  statusReadyToRender: string;
  statusAnalyzing: string;
  statusAnalyzed: string;
  statusRendering: string;
  statusSuccess: string;
  errorAnalyze: string;
  errorRender: string;
  analyzeBtn: string;
  renderBtn: string;
  promptLabel: string;
  resultTitle: string;
  resultPlaceholder: string;
  download: string;
  uploader: {
    clickToChange: string;
    clickOrDrag: string;
  }
}

export const translations: Record<Language, Translation> = {
  en: {
    title: "Valhalla Organizer: Face Fusion",
    subtitle: "Compose your perfect avatar. Mix style, clothing, and identity.",
    assetLabels: {
      face: "YOUR FACE (Identity)",
      clothing: "Clothing",
      shoes: "Shoes / Footwear",
      accessories: "Accessories",
      hairstyle: "Hairstyle",
      style: "Style / Background"
    },
    systemStatus: "SYSTEM STATUS",
    statusIdle: "Upload your face and at least one asset to begin.",
    statusReadyToAnalyze: "Assets loaded. Click 'Analyze Inputs' to prepare the prompt.",
    statusReadyToRender: "Prompt ready. Click 'Generate Composition' to render.",
    statusAnalyzing: "Gemini is analyzing all your inputs to build a master prompt...",
    statusAnalyzed: "Analysis complete. You can tweak the prompt below.",
    statusRendering: "Gemini is fusing your identity into the composed scene...",
    statusSuccess: "Composition generated successfully!",
    errorAnalyze: "Failed to analyze assets.",
    errorRender: "Failed to generate composition.",
    analyzeBtn: "Analyze Inputs & Plan",
    renderBtn: "Generate Composition",
    promptLabel: "Master Scene Description (Generated from inputs):",
    resultTitle: "Final Composition",
    resultPlaceholder: "Your generated image will appear here.",
    download: "Download Result",
    uploader: {
      clickToChange: "Change",
      clickOrDrag: "Upload"
    }
  },
  ru: {
    title: "Valhalla Organizer: Face Fusion",
    subtitle: "Создайте идеальный аватар. Смешивайте стиль, одежду и личность.",
    assetLabels: {
      face: "ВАШЕ ЛИЦО (Обязательно)",
      clothing: "Одежда",
      shoes: "Обувь",
      accessories: "Аксессуары",
      hairstyle: "Прическа",
      style: "Стилистика / Фон"
    },
    systemStatus: "СТАТУС СИСТЕМЫ",
    statusIdle: "Загрузите фото лица и хотя бы один элемент стиля.",
    statusReadyToAnalyze: "Ресурсы загружены. Нажмите «Анализ», чтобы составить план.",
    statusReadyToRender: "План готов. Нажмите «Генерация», чтобы создать изображение.",
    statusAnalyzing: "Gemini анализирует все входные данные для составления промпта...",
    statusAnalyzed: "Анализ завершен. Вы можете поправить описание ниже.",
    statusRendering: "Gemini внедряет вашу личность в созданную сцену...",
    statusSuccess: "Композиция успешно создана!",
    errorAnalyze: "Ошибка анализа ресурсов.",
    errorRender: "Ошибка генерации изображения.",
    analyzeBtn: "Анализ Входных Данных",
    renderBtn: "Генерация",
    promptLabel: "Описание Сцены (На основе ваших фото):",
    resultTitle: "Результат",
    resultPlaceholder: "Здесь появится ваше изображение.",
    download: "Скачать результат",
    uploader: {
      clickToChange: "Заменить",
      clickOrDrag: "Загрузить"
    }
  }
};
